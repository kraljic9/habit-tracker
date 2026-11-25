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
    
    try{
        const userId = req.user?.userId;
        
        if (!userId) {
            res.status(401).json('Error user not found')
            return
        }

        const usersData = await pool.query(`
            SELECT id, username, totalstreak 
            FROM users
            `)
            
        const groupsData = await pool.query(`
                SELECT * FROM community_groups
                JOIN group_members ON community_groups.id = group_members.group_id
                `)
                
                const getStreakMilestones : any = () => {
                    let streakMilestones : any = []
                    
                    for (const user of usersData.rows) { 
                        const usersStreaks : number[] = [];
                        for (const milestone of STREAK_MILESTONES) {
                            if (Number(user.totalstreak) >= milestone) {
                                usersStreaks.push(milestone);
                            }
                        }

                        if (usersStreaks.length > 0) {
                        const max = Math.max(...usersStreaks)
                        
                        let streakMilestoneMsg = {
                            "type": "milestone",
                            "milestone": max,
                            "message": `${user.username} just hit a ${max} day streak`
                        }
                        streakMilestones.push(streakMilestoneMsg)
                    }
                    }

                    return {streakMilestones}
                }

                const getJoinedLog: any = () => {
                    const today = new Date().toLocaleDateString('en-CA');
                    let joinedMilestone = []
                   
                    for (const data of groupsData.rows) {
                         if (data.joined_at && new Date(data.joined_at).toLocaleDateString('en-CA') === today) {
                            const curUserId = data.user_id;

                            for (const user of usersData.rows) {
                                if (user.id === curUserId) {
                                    const joinedMsg = {
                                        "type": "milestone",
                                        "groupName": `${data.group_title}`,
                                        "message": `${user.username} joined ${data.group_title}`,
                                    }

                                    joinedMilestone.push(joinedMsg)
                                }
                            }
                        } 
                    }

                    return {joinedMilestone}
                }

        const {streakMilestones} = await getStreakMilestones()
        const {joinedMilestone} = await getJoinedLog();
        
        res.status(200).json({
            milestones: streakMilestones,
            joinedMilestone: joinedMilestone
        })

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch milestones' })
    }
})

export default router;


