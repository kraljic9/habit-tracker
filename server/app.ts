import express from 'express';
import cors from 'cors';
import type{ Habit, User} from './type.js';
import bcrypt from 'bcrypt';
import pool from './db.ts'

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let habits: Habit[] = [];
let users: User[] = []

// Register user

app.post('/api/register/user', async (req, res) => {
    try{
    const {password, ...otherUserData} = req.body;

    const hiddenPassword = await bcrypt.hash(password, 10);

    const newUser: User = {
        ...otherUserData,
        password: hiddenPassword,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        totalStreak: 0,
        habits: []
    }

    const {password: _, ...displayUserData} = newUser;

    res.status(201).json(displayUserData);
} catch(err) {

}
})

// Login user

app.post('/api/login/user', async (req, res) => {

    try{

    const {username, password} = req.body;

    const curUser = users.find(user => user.username === username && user.password === password);
    
    if (!curUser) {
        res.status(401).json({ message: 'Invalid username or password' });
        return;
    }

    res.status(200).json(curUser)
} catch(err) {

}
})


// GET habits

app.get('/api/habits', async (req, res) => {

    try{

    const userId = req.query.userId ? Number(req.query.userId) : undefined;

    if (userId) {
        const result = await pool.query('SELECT * FROM habits WHERE userid = $1', [userId]) 
        res.status(200).json(result.rows);
        return;
    }

    const result = await pool.query('SELECT * FROM habits');
    res.status(200).json(result.rows);
} catch(err) {
    console.log(err);
}
})

// POST habits

app.post('/api/habits', async (req, res) => {
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

app.put('/api/habits/:id', async (req, res) => {
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

app.delete('/api/habits/:id', async (req, res) => {
    try{
    const habitId = Number(req.params.id);

    const index = habits.findIndex((habit) => habit.id === habitId);

    if (index === -1) {
        res.status(404).json({ message: 'Habit not found' });
        return;
    }

    habits.splice(index, 1);

    res.status(200).json({ message: `Habit ${habitId} deleted` });
} catch(err) {}
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