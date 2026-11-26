import express from 'express';
import { authenticateToken } from './auth.js';
import pool from './db.js';

const router = express.Router();

const STREAK_MILESTONES = [3, 5, 10, 20, 30, 50, 75, 100];

router.get('/', authenticateToken, async (req, res) => {
    try{
        
        const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const groupResult = await pool.query(`
        SELECT
        community_groups.id,
        community_groups.slug,
        community_groups.group_title,
        community_groups.category,
        COUNT(group_members.user_id) AS members_count
        FROM community_groups
        LEFT OUTER JOIN group_members
        ON community_groups.id = group_members.group_id
        GROUP BY
        community_groups.id,
        community_groups.slug,
        community_groups.group_title,
        community_groups.category
        ORDER BY community_groups.id;
        `)

    const joinedResult = await pool.query(`
        SELECT group_id FROM group_members WHERE user_id = $1 
        `, [userId]
    )

    const joinedGroupIds = new Set(joinedResult.rows.map((row) => row.group_id))
    
    const groups = groupResult.rows.map((group) => ({
            ...group,
            members_count: Number(group.members_count),
            is_member: joinedGroupIds.has(group.id),
        }))

        return res.status(200).json({groups});

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch data' })
    }
})

router.post('/:groupId', authenticateToken, async (req, res) => {
    try{

        const userId = req.user?.userId;
        const groupId = req.params.groupId;

        const today = new Date();

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const isMember = await pool.query(`
            SELECT group_id FROM group_members WHERE user_id = $1 AND group_id = $2
            `, [userId, groupId])
    
        if (isMember.rows.length > 0) {
            res.status(200).json({message: 'User is already a member'});
            return
        }
        
            await pool.query(`
            INSERT INTO group_members (group_id, user_id, joined_at)
            VALUES ($1, $2, $3)    
            `, [groupId, userId, today])
        
        res.status(201).json({message: 'New member added'});
        }
    catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to join group' })
    }
})

router.delete('/:groupId', authenticateToken, async(req, res) => {
    try{
        const userId = req.user?.userId;
        const groupId = req.params.groupId;

        const result = await pool.query(`
            DELETE FROM group_members WHERE user_id = $1 AND group_id = $2 
            `, [userId, groupId]
        )

        if (result.rowCount === 0) {
            res.status(401).json({ error: 'Unauthorized' })
            return;
        }

        res.status(200).json({ message: 'Left group successfully' })
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to remove user' })
    }
})

router.get('/milestones', authenticateToken, async (req, res) => {
  try {
            const userId = req.user?.userId;

                if (!userId) {
                res.status(401).json('Error user not found');
                return;
                }

                const usersData = await pool.query(`
                SELECT id, username, totalstreak
                FROM users
                `);

                const groupsData = await pool.query(`
                SELECT * FROM community_groups
                JOIN group_members ON community_groups.id = group_members.group_id
                `);

                const getStreakMilestones = async () => {
                for (const user of usersData.rows) {
                    const usersStreaks: number[] = [];

                    for (const milestone of STREAK_MILESTONES) {
                    if (Number(user.totalstreak) >= milestone) {
                        usersStreaks.push(milestone);
                    }
                    }

                        if (usersStreaks.length > 0) {
                        const max = Math.max(...usersStreaks);

                        const queryTxt = `
                            INSERT INTO community_milestones (user_id, milestone_type, milestone_value, message)
                            VALUES ($1, $2, $3, $4)
                            ON CONFLICT (user_id, milestone_type, milestone_value) DO NOTHING
                            RETURNING *
                        `;

                        const values = [
                            user.id,
                            'streak',
                            max,
                            `${user.username} just hit a ${max} day streak`,
                        ];

                        await pool.query(queryTxt, values);
                        }
                  }
                };

                const getJoinedLog: any = async () => {
                const today = new Date().toLocaleDateString('en-CA');

                for (const data of groupsData.rows) {
                    if (
                    data.joined_at &&
                    new Date(data.joined_at).toLocaleDateString('en-CA') === today
                    ) {
                    const curUserId = data.user_id;

                    for (const user of usersData.rows) {
                        if (user.id === curUserId) {
                            const queryTxt = `
                                INSERT INTO community_milestones (user_id, milestone_type, milestone_value, message)
                                VALUES ($1, $2, $3, $4)
                                ON CONFLICT (user_id, milestone_type, milestone_value) DO NOTHING
                                RETURNING *
                            `;

                            const values = [
                                user.id,
                                'group_join',
                                data.group_title,
                                `${user.username} has joined ${data.group_title}`,
                            ];

                            await pool.query(queryTxt, values);
                            }
                        }
                    }
                }
                };

                await getStreakMilestones();
                await getJoinedLog();

                const REACTION_TYPE = 'clap';

                const milestonesRes = await pool.query(
                `SELECT * FROM community_milestones ORDER BY created_at DESC`
                );

                const reactionsRes = await pool.query(
                `SELECT milestone_id, user_id FROM milestone_reactions WHERE reaction_type = $1`,
                [REACTION_TYPE]
                );

                const countByMilestone = new Map<number, number>();
                const likedByCurrentUser = new Set<number>();

                for (const row of reactionsRes.rows) {
                const currentCount = countByMilestone.get(row.milestone_id) ?? 0;
                countByMilestone.set(row.milestone_id, currentCount + 1);

                if (Number(row.user_id) === Number(userId)) {
                    likedByCurrentUser.add(row.milestone_id);
                }
                }

                const milestonesWithReactions = milestonesRes.rows.map((milestone) => ({
                ...milestone,
                reaction_count: countByMilestone.get(milestone.id) ?? 0,
                liked_by_me: likedByCurrentUser.has(milestone.id),
                }));

                res.status(200).json({
                milestones: milestonesWithReactions,
                });

                } catch (err) {
                    console.error(err);
                    res.status(500).json({ error: 'Failed to fetch milestones' });
                }
});

router.post('/milestones/:id/reactions', authenticateToken, async (req, res) => {
    try{

        const milestoneId = req.params.id;
        const userId = req.user?.userId;
        

        if (!userId) {
            res.status(401).json('Error user not found')
            return
        }

        const queryTxt = 
        `
        INSERT INTO milestone_reactions (milestone_id, user_id, reaction_type)
        VALUES ($1, $2, 'clap')
        ON CONFLICT (milestone_id, user_id) DO NOTHING
        RETURNING *
        `

        const values = [milestoneId, userId];

        const result = await pool.query(queryTxt, values);

        // If reaction already exists
        if (result.rows.length === 0) {
        res.status(200).json({ message: 'Reaction already exists', added: false });
        return;
        }

        res.status(201).json({ reaction: result.rows[0], added: true });
    } catch(err) {
        console.log(err)
        res.status(500).json({error: 'Failed to add reaction'})
    }
})

    router.delete('/milestones/:id/reactions', authenticateToken, async (req, res) => {
        try {
            const milestoneId = req.params.id;
            const userId = req.user?.userId;
            

                    if (!userId) {
                        res.status(401).json('Error user not found')
                        return
                    }

            const queryTxt = `
            DELETE FROM milestone_reactions
            WHERE milestone_id = $1 AND user_id = $2 AND reaction_type = 'clap'
            `;

            const values = [milestoneId, userId];

            const result = await pool.query(queryTxt, values)

            if (result.rowCount === 0) {
                res.status(404).json({ message: 'Reaction not found' });
                return;
                }

                res.status(200).json({ message: 'Reaction removed' });

        } catch(err) {
            console.log(err)
            res.status(500).json({error: 'Failed to remove reaction'})
        }
    })

    router.get('/milestones')

export default router;


