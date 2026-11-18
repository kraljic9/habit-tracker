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
       const result = await pool.query(
            `SELECT habit_logs.completed_date
            FROM habit_logs
            JOIN habits ON habit_logs.habit_id = habits.id
            WHERE habits.userid = $1 AND habit_logs.completed_date IS NOT NULL
            ORDER BY habit_logs.completed_date DESC`,
            [userId]
        );


        const dates : any = [
            ...new Set(
                result.rows.map(row =>
                    new Date(row.completed_date).toLocaleDateString('en-CA')
                )
            ),  
        ];

        if (dates.length === 0) return { streakCount: 0, largestStreak: 0 };

        let currentStreak = 0;
        let largestStreak = 0;
        let tempStreak = 0;

        const today = new Date().toLocaleDateString('en-CA');
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');

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
            const month = now.getMonth();

            const startDate = new Date(year, month, 1, 0, 0, 0, 0,)
            const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999)
            const daysInMonth = endDate.getDate();

            const [logsResult, habitsResult] = await Promise.all([
                pool.query(
                    `SELECT COUNT(*) FROM habit_logs
                     JOIN habits ON habit_logs.habit_id = habits.id
                     WHERE habit_logs.completed_date >= $1 AND
                     habit_logs.completed_date <= $2 AND
                     habits.userid = $3
                    `,
                    [startDate, endDate, userId]
                ),

                pool.query(
                    `SELECT COUNT(*) FROM habits
                    WHERE userid = $1
                    `,
                    [userId]
                )
            ])

            const completedCount = Number(logsResult.rows[0].count)
            const totalHabits = Number(habitsResult.rows[0].count)

            const totalPossible = totalHabits * daysInMonth;
            const monthlyRate = totalHabits === 0 ? 0 : Math.round((completedCount / totalPossible) * 100)

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
            startDate.setHours(0, 0, 0, 0)

            const logsResult = await pool.query(
                `SELECT COUNT(*) FROM habit_logs
                 JOIN habits ON habit_logs.habit_id = habits.id
                 WHERE habits.userid = $1 AND habit_logs.completed_date >= $2 AND habit_logs.completed_date  <= $3`,
                 [userId, startDate, endDate]
            )

            const habitsResult = await pool.query(
                `SELECT COUNT (*) from habits WHERE userid = $1`,
                [userId]
            )

            const completedCount = Number(logsResult.rows[0].count);
            const totalHabits = Number(habitsResult.rows[0].count);

            const weeklyScore = totalHabits === 0 
            ? 0 
            : Number((completedCount / totalHabits).toFixed(1));

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

        let today = new Date();
        let yesterday = new Date();

        yesterday.setDate(today.getDate() - 1)

        let todayStr = today.toLocaleDateString('en-CA');
        let yesterdayStr = yesterday.toLocaleDateString('en-CA');

        result.rows.forEach((habit) => {

            if (!habit.last_completed_date) return;

            let completedStr = new Date(habit.last_completed_date).toLocaleDateString('en-CA');

            const isActiveStreak = completedStr === todayStr || completedStr === yesterdayStr;
            const streak = isActiveStreak ? (habit.streak || 0) : 0;

            if (habit.category === 'Health') {
                healthStreak = Math.max(healthStreak, streak)
            } else if (habit.category === 'Coding') {
                codingStreak = Math.max(codingStreak, streak)
            } else if (habit.category === 'Fitness') {
                fitnessStreak = Math.max(fitnessStreak, streak)
            } else if (habit.category === 'Mindfulness') {
                mindfulnessStreak = Math.max(mindfulnessStreak, streak)
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

router.get('/:month', authenticateToken, async (req, res) => {
    try {
       const month : any = req.params.month;
       
       const userId = req.user?.userId;
      
       const [year, thisMonth] = month.split('-');

       const daysInMonth = new Date(Number(year), Number(thisMonth), 0).getDate();

        console.log(daysInMonth)

       const startDate = `${year}-${thisMonth}-01`;
       const endDate = `${year}-${thisMonth}-${daysInMonth}`

       const result = await pool.query(
            `SELECT habit_logs.*, habits.category
            FROM habit_logs
            JOIN habits ON habit_logs.habit_id = habits.id
            WHERE habit_logs.completed_date >= $1 
            AND habit_logs.completed_date <= $2
            AND habits.userid = $3`,
            [startDate, endDate, userId]
        );

        const totalHabit = await pool.query(
            `SELECT * FROM habits WHERE userid = $1`,
            [userId]
        );

       if (result.rows.length === 0 ) {
            console.error('Error results row for category moth status is empty')
        }

        let healthHabits = 0;
        let fitnessHabits = 0;
        let codingHabits = 0;
        let mindfulnessHabits = 0;

        totalHabit.rows.map((habit) => {
              if (habit.category === 'Health') {
                healthHabits++
            }

            if (habit.category === 'Coding') {
                codingHabits++
            }

            if (habit.category === 'Fitness') {
                fitnessHabits++
            }

            if (habit.category === 'Mindfulness') {
                mindfulnessHabits++
        }
    })

        let analyticsData : any= {}

        for (let i = 1; i <= daysInMonth; i++) {
            let dateString = `${year}-${thisMonth}-${String(i).padStart(2, '0')}`

            analyticsData[dateString] = {
                Health: 0,
                Fitness: 0,
                Coding: 0,
                Mindfulness: 0
            }

            
        }

       result.rows.forEach((habit) => {
            const rowDate = habit.completed_date.toLocaleDateString('en-CA');
            const category = habit.category;

            
            if (analyticsData[rowDate] && analyticsData[rowDate][category] !== undefined) {
                analyticsData[rowDate][category]++;
            }
        });

        Object.keys(analyticsData).forEach((date) => {

            if (healthHabits > 0) {
                analyticsData[date]['Health'] = Number(((analyticsData[date]['Health'] / healthHabits) * 100).toFixed(1));
            }
            if (codingHabits > 0) {
                analyticsData[date]['Coding'] = Number(((analyticsData[date]['Coding'] / codingHabits) * 100).toFixed(1));
            }
            if (fitnessHabits > 0) {
                analyticsData[date]['Fitness'] = Number(((analyticsData[date]['Fitness'] / fitnessHabits) * 100).toFixed(1));
            }
            if (mindfulnessHabits > 0) {
                analyticsData[date]['Mindfulness'] = Number(((analyticsData[date]['Mindfulness'] / mindfulnessHabits) * 100).toFixed(1));
            }

        });
    

        res.status(200).json(analyticsData)

    } catch (err: any) {
        console.error("Analytics Error:", err.message);
        res.status(500).send('Server Error');
    }
});



export default router