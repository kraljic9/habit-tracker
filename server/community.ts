import express from 'express';
import { authenticateToken } from './auth.js';
import pool from './db.js';

const router = express.Router();

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

        return res.status(200).json(groups);

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

export default router;
