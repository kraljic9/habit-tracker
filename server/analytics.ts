import express from 'express';
import pool from './db.js';
import { authenticateToken } from './auth.js';
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
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


    const calculateOverallComplete = async () => {
        try{
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');

            const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();

            const startDate = `${year}-${month}-01`;
            const endDate = `${year}-${month}-${daysInMonth}`;

            const isCompletedHabits = await pool.query(
                'SELECT * FROM habits WHERE userid = $1 AND last_completed_date >= $2 AND last_completed_date <= $3',
                [userId, startDate, endDate]
            )

            const totalPossible = result.rows.length * daysInMonth;
            const monthlyRate = totalPossible === 0 ? 0 : (isCompletedHabits.rows.length / totalPossible) * 100;

            return {monthlyRate}
        } catch (err) {
            console.log('Error occurred while calculating overall completion', err);
            return {monthlyRate: 0}
        }
    }

    const calculateWeeklyAvarage = async () => {
        try {
            const endDate = new Date();
            const startDate = new Date();

            startDate.setDate(endDate.getDate() - 6)

            const isCompletedHabits = await pool.query(
                'SELECT * FROM habits WHERE userid = $1 AND last_completed_date >= $2 AND last_completed_date <= $3',
                [userId, startDate, endDate]
            )

            const possibleComplete = result.rows.length * 7
            const weeklyScore = possibleComplete === 0 ? 0 : isCompletedHabits.rows.length / possibleComplete

            return {weeklyScore}
        } catch(err) {
            console.log('Error occurred while calculating weekly avarage', err);
            return {weeklyScore: 0}

        }
    }

        const { streakCount, largestStreak } = await calculateStreak();
        const { monthlyRate } = await calculateOverallComplete();
        const { weeklyScore } = await calculateWeeklyAvarage();

        res.json({
            success: true,
            habits: result.rows,
            currentStreak: streakCount,
            largestStreak: largestStreak,
            monthlyRate: monthlyRate,
            weeklyScore: weeklyScore,
        });
       
    } catch(err) {
        console.log('Error accure at analytics route', err)
    }
});





export default router