import express from 'express';
import cors from 'cors';
import type{ Habit, User} from './type.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config'
import pool from './db.ts'
import { authenticateToken } from './auth.js';
import analyticsRouter from './analytics.ts'

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/api/analytics', analyticsRouter)


if (!process.env.JWT_SECRET) {
    throw new Error("FATAL: JWT_SECRET is not defined in environment variables.");
}

const JWT_SECRET = process.env.JWT_SECRET;

// Register user

// Register user
app.post('/api/register/user', async (req, res) => {
    console.log(req.body);
    try {
        const { name, username, email, password } = req.body;

        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (existingUser.rows.length > 0) {
            res.status(400).json({ error: 'Email already in use' });
            return;
        }

        const hiddenPassword = await bcrypt.hash(password, 10);

        const queryText = `
            INSERT INTO users (name, username, email, password)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, username, email, totalstreak, createdat
        `;

        const values = [name, username, email, hiddenPassword];
        const result = await pool.query(queryText, values);
        const newUser = result.rows[0];

        // Generate JWT token upon registration
        const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({ token, user: newUser });
    } catch (err: any) {
        console.error("Registration Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// Login user
app.post('/api/login/user', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const textQuery = `
            SELECT * FROM users
            WHERE username = $1
        `;

        const result = await pool.query(textQuery, [username]);

        if (result.rows.length === 0) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }
        
        const user = result.rows[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

        // Strip password before sending user object to frontend
        const { password: _, ...userWithoutPassword } = user;

        res.json({ token, user: userWithoutPassword });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET habits

app.get('/api/habits', authenticateToken, async (req, res) => {

        try {
        const todayObj = new Date();
        const today = todayObj.toISOString().split('T')[0] || '';

        const yesterdayObj = new Date();
        yesterdayObj.setDate(todayObj.getDate() - 1);
        const yesterday = yesterdayObj.toISOString().split('T')[0] || '';

        const userId = req.query.userId ? Number(req.query.userId) : undefined;

        if (!userId) {
            res.status(200).json([]);
            return;
        }

        const result = await pool.query('SELECT * FROM habits WHERE userid = $1', [userId]);

        for (let i = 0; i < result.rows.length; i++) {
            let habit = result.rows[i];
            let needsUpdate = false;

            const lastReset = habit.last_reset_date;

            const lastCompletedStr = habit.last_completed_date 
                ? new Date(habit.last_completed_date).toISOString().split('T')[0] 
                : null;

            const isCompletedToday = lastCompletedStr === today;

            if (!lastReset || lastReset < today) {
                if (isCompletedToday) {
                    habit.last_reset_date = today;
                    if (habit.metric && habit.metric.kind === 'boolean') {
                        habit.metric.completed = true;
                    }
                    needsUpdate = true;
                } else {
                    habit.iscomplete = false;
                    habit.last_reset_date = today;
                    
                    if (habit.metric && habit.metric.kind === 'boolean') {
                        habit.metric.completed = false;
                    } else if (habit.metric && habit.metric.kind === 'numeric') {
                        habit.metric.current = 0; 
                    } else if (habit.metric && habit.metric.kind === 'timer') {
                        habit.metric.durationSeconds = 0; 
                    }
                    
                    needsUpdate = true;
                }
            }


            if (lastCompletedStr && lastCompletedStr < yesterday) {
                habit.streak = 0;
                needsUpdate = true;
            }

            if (needsUpdate) {
                await pool.query(
                    'UPDATE habits SET iscomplete = $1, last_reset_date = $2, streak = $3, metric = $4 WHERE id = $5',
                    [habit.iscomplete, habit.last_reset_date, habit.streak, JSON.stringify(habit.metric), habit.id]
                );
            }

            habit.isComplete = habit.iscomplete;
        }

        res.status(200).json(result.rows);
 
  
} catch(err:any) {
        console.error(err.message);
        res.status(500).send('Server Error');
}
})

// PATCH habits streak

app.patch('/api/habits/:id', authenticateToken, async (req, res) => {
    try {
        const habitId = req.params.id;        
        const habitResult = await pool.query(`SELECT * FROM habits WHERE id = $1`, [habitId]);
    
        if (habitResult.rows.length === 0) {
            res.status(404).send('Habit not found');
            return;
        }
    
        const habit = habitResult.rows[0] as Habit;
        const today = new Date().toISOString().split('T')[0];

        let newStreak = Number(habit.streak);
        let newLastCompleted = habit.last_completed_date;

        const wasCompleted = (habit as any).iscomplete === true || (habit as any).iscomplete === 'true' || (habit as any).iscomplete === 1;

        let finalIsComplete = false;
        let updatedMetric: any = habit.metric;

        if (habit.metric.kind === 'boolean') {
                
            const { isComplete: incomingIsComplete } = req.body; // boolean from frontend
            finalIsComplete = incomingIsComplete 

        if (finalIsComplete && !wasCompleted) {
            newStreak += 1;
            newLastCompleted = today;
        } else if (!finalIsComplete && wasCompleted) {
            newStreak = Math.max(0, newStreak - 1);
            newLastCompleted = null;
        }
        
        updatedMetric = {
            kind: 'boolean',
            completed: finalIsComplete
        };

    } else if (habit.metric.kind === 'numeric') {

        const {increment} = req.body;
        const currentCount = Number(habit.metric.current || 0);
        const targetCount = Number(habit.metric.target || 1);

        const newCurrent = Math.max(0, currentCount + (increment || 0));
        finalIsComplete = newCurrent >= targetCount;

        if (finalIsComplete && !wasCompleted) {
            newStreak += 1;
            newLastCompleted = today
        } else if (!finalIsComplete && wasCompleted) {
            newStreak = Math.max(0, newStreak - 1);
            newLastCompleted = null;
        }

        updatedMetric = {
                kind: 'numeric',
                current: newCurrent,
                target: targetCount
            };
    } else if (habit.metric.kind === 'timer') {

        const {durationSeconds} = req.body;
        const currentSeconds = Number(habit.metric.durationSeconds || 0);
        const targetMinutes= Number(habit.metric.targetMinutes || 1);
        const targetSeconds = targetMinutes* 60;

        let newCurrentTime = currentSeconds + (durationSeconds || 0);
        finalIsComplete = newCurrentTime >= targetSeconds;


        if (finalIsComplete && !wasCompleted) {
            newStreak += 1;
            newLastCompleted = today;
        } else if (!finalIsComplete && wasCompleted) {
            newStreak = Math.max(0, newStreak - 1);
            newLastCompleted = null;
        }
    
        updatedMetric = {
            kind: 'timer',
            durationSeconds: newCurrentTime,
            targetMinutes: targetMinutes 
        }
    }

    let updateResult = await pool.query(
    'UPDATE habits SET iscomplete = $1, streak = $2, last_completed_date = $3, last_reset_date = $4, metric = $5 WHERE id = $6 RETURNING *',
    [finalIsComplete, newStreak, newLastCompleted, today, JSON.stringify(updatedMetric), habitId]
    );

    res.status(201).json(updateResult.rows[0])

    } catch (err: any) {
        console.error("PATCH Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// POST habits

app.post('/api/habits', authenticateToken, async (req, res) => {
    try{

    const queryText = `
    INSERT INTO habits ( userid, title, category, metric, streak, iscomplete)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `;

    const values = [ req.body.userId, req.body.title, req.body.category, req.body.metric, req.body.streak, req.body.isComplete];
    const result = await pool.query(queryText, values);

    res.status(201).json(result.rows[0])
} catch(err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
}
})

// PUT habits

app.put('/api/habits/:id', authenticateToken, async (req, res) => {
    try {
        const habitId = Number(req.params.id);
        const {title, category, streak, isComplete, metric} = req.body;

        const queryText = `
            UPDATE habits
            SET title = $1, category = $2, streak = $3, iscomplete = $4, metric = $5
            WHERE id = $6
            RETURNING *
        `

        const value = [title, category, streak, isComplete, JSON.stringify(metric), habitId];

        const result = await pool.query(queryText, value);

        if (result.rowCount === 0) {
            res.status(404).json({ message: 'Habit not found' });
            return;
        }

        res.status(200).json(result.rows[0]);

    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }  
});

// DELETE habits

app.delete('/api/habits/:id', authenticateToken, async (req, res) => {
    try{
    const habitId = Number(req.params.id);
    
    const queryText = `
        DELETE FROM habits
        WHERE id = $1
        RETURNING *
    ` ;

    const value = [habitId]
    const result = await pool.query(queryText, value);
    
    if (result.rowCount === 0) {
    res.status(404).json({ message: 'Habit not found' });
    return;
}

    res.status(200).json(result.rows);
} catch(err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
}
})

// Connection check

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.get('/api/test-db', async (req, res) => {
   try{
    const result = await pool.query('SELECT NOW()')
    res.json({ message: 'Database connected successfully!', time: result.rows[0] });
   } catch(err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
   }
})
