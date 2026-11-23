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
            joined_groups: joinedGroupIds.has(group.id),
        }))

        return res.status(200).json({groups});

    } catch (err) {
        res.status(500).json(err)
    }
})

export default router;
