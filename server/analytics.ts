import express from 'express';
import pool from './db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const userId = req.user?.userId;
      
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const result = await pool.query(
            'SELECT * FROM habits WHERE userid = $1',
            [userId]
        );

    const calculateStreak = async () => {
            try {
                let currentDate = new Date().toISOString().split('T')[0];
                let streakCount = 0;  

                while (true) {
                    const streakResult = await pool.query(
                        'SELECT * FROM habits WHERE userid = $1 AND last_completed_date = $2', 
                        [userId, currentDate]
                    );

                    if (streakResult.rows.length > 0) {
                        streakCount += 1;

                        let dateObj = new Date(currentDate ?? new Date());
                        dateObj.setDate(dateObj.getDate() - 1);
                        currentDate = dateObj.toISOString().split('T')[0];
                    } else {
                        break;
                    }
                }

                return { streakCount, largestStreak: streakCount };
            } catch(err) {
                console.log('Error occurred while calculating total streak', err);
                return { streakCount: 0, largestStreak: 0 };
            }
        };

        const { streakCount, largestStreak } = await calculateStreak();

        res.json({
            success: true,
            habits: result.rows,
            currentStreak: streakCount,
            largestStreak: largestStreak,
        });
       
    } catch(err) {
        console.log('Error accure at analytics route', err)
    }
});





export default router