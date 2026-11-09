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

        console.log(result.rows) 

    const calculateStreak = async () => {
    try {
        const result = await pool.query(
            `SELECT DISTINCT last_completed_date::text 
             FROM habits 
             WHERE userid = $1 AND last_completed_date IS NOT NULL 
             ORDER BY last_completed_date DESC`,
            [userId]
        );


        const dates = result.rows.map(row => row.last_completed_date);
        if (dates.length === 0) return { streakCount: 0, largestStreak: 0 };

        let currentStreak = 0;
        let largestStreak = 0;
        let tempStreak = 0;

        const today = new Date().toLocaleDateString('en-CA');
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        const startsTodayOrYesterday = dates[0] === today || dates[0] === yesterday;

        for (let i = 0; i < dates.length; i++) {
            if (i === 0) {
                tempStreak = 1;
            } else {
                const prev = Number(new Date(dates[i - 1]));
                const curr = Number(new Date(dates[i]));
                const diffDays = Math.round((prev - curr) / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    tempStreak++;
                } else {
                    largestStreak = Math.max(largestStreak, tempStreak);
                    tempStreak = 1;
                }
            }
        }
        largestStreak = Math.max(largestStreak, tempStreak);

        if (!startsTodayOrYesterday) {
            currentStreak = 0;
        } else {
            currentStreak = 1;
            for (let i = 1; i < dates.length; i++) {
                const prev = Number(new Date(dates[i - 1]));
                const curr = Number(new Date(dates[i]));
                const diffDays = Math.round((prev - curr) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }
        return { streakCount: currentStreak, largestStreak };
    } catch (err) {
        console.error('Error calculating streak', err);
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
            let monthlyRate = totalPossible === 0 ? 0 : (isCompletedHabits.rows.length / totalPossible) * 100;

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

    const fetchHeatmapData = async () => { 
        try{
        const startDate = new Date();
        const endDate = new Date();

        startDate.setDate(endDate.getDate() - 90);

        const result = await pool.query(
            'SELECT last_completed_date, COUNT(*) as completion_count FROM habits WHERE userid = $1 AND last_completed_date >= $2 AND last_completed_date <= $3 GROUP BY last_completed_date', [userId, startDate, endDate]
        )

        const completeAmount = result.rows;

        return {completeAmount}
        } catch(err) {
            console.log('Error accured while fetching heatmap data', err)
            return {completeAmount: 0}
        } 
    }

        const habitBrakeDown = async () => {
    try {
        let healthStreak = 0;
        let codingStreak = 0;
        let fitnessStreak = 0;
        let mindfulnessStreak = 0;

        // Flags to ensure we only add +1 *once per category* per day   
        let healthCounted = false;
        let codingCounted = false;
        let fitnessCounted = false;
        let mindfulnessCounted = false;
        
        const today = new Date().toLocaleString('en-CA');

        result.rows.forEach((habit) => {
            
            if (!habit.last_completed_date) return

            const completedDateString = new Date(habit.last_completed_date).toLocaleString('en-CA');

            if (completedDateString === today) {
                if (habit.category === 'Health' && !healthCounted) {
                    healthStreak += 1;
                    healthCounted = true
                } else if (habit.category === 'Coding' && !codingCounted) {
                    codingStreak += 1;
                    codingCounted = true;
                } else if (habit.category === 'Fitness' && !fitnessCounted) {
                    fitnessStreak += 1;
                    fitnessCounted = true;
                } else if (habit.category === 'Mindfulness' && !mindfulnessCounted) {
                    mindfulnessStreak += 1;
                    mindfulnessCounted = true;
                }
            }
        })

        return { healthStreak, codingStreak, fitnessStreak, mindfulnessStreak };

    } catch (err) {
        console.log('Error occurred while calculating habit breakdown', err);
        return { healthStreak: 0, codingStreak: 0, fitnessStreak: 0, mindfulnessStreak: 0 };
    }
};
    
 
        const { streakCount, largestStreak } = await calculateStreak();
        const { monthlyRate } = await calculateOverallComplete();
        const { weeklyScore } = await calculateWeeklyAvarage();
        const { completeAmount } = await fetchHeatmapData();
        const { healthStreak, codingStreak, fitnessStreak, mindfulnessStreak } = await habitBrakeDown();

        res.json({
            success: true,
            habits: result.rows,
            currentStreak: streakCount,
            largestStreak: largestStreak,
            monthlyRate: monthlyRate,
            weeklyScore: weeklyScore,
            completeAmount: completeAmount,
            healthStreak: healthStreak,
            codingStreak: codingStreak,
            fitnessStreak: fitnessStreak,
            mindfulnessStreak: mindfulnessStreak
        });
       
    } catch(err) {
        console.log('Error accure at analytics route', err)
    }
});





export default router