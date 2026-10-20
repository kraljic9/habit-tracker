import express from 'express';
import cors from 'cors';
import type{ Habit, User} from './type.js';
import bcrypt from 'bcrypt';
import pool from './db.ts'

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Register user

app.post('/api/register/user', async (req, res) => {
    try{
    const {name, username, email, password,} = req.body;

    const hiddenPassword = await bcrypt.hash(password, 10);

    const queryText = `
        INSERT INTO users (name, username, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, username, email, totalstreak, createdat
    `

    const values = [name, username, email, hiddenPassword]
    const result = await pool.query(queryText, values);

    res.status(201).json(result.rows[0]);
} catch(err:any) {
    console.error(err.message);
    res.status(500).send('Server Error');
}
})

// Login user

app.post('/api/login/user', async (req, res) => {

    try{

    const {username, password} = req.body;
    
    const textQuery = `
        SELECT * FROM users
        WHERE username = $1
    `

    const result = await pool.query(textQuery, [username]);

    if (result.rows.length === 0) {
        res.status(401).json({ message: 'Invalid username or password' });
        return;
    }
    
    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        res.status(401).json({ message: 'Invalid username or password' });
        return;
    }

    const {password: _, ...userData} = user;

    res.status(200).json(userData);

   
} catch(err:any) {
    console.error(err.message);
    res.status(500).send('Server Error');
}
})


// GET habits

app.get('/api/habits', async (req, res) => {

    try{

       const todayObj = new Date();
       const today = todayObj.toISOString().split('T')[0];

       const yesterdayObj = new Date();
       yesterdayObj.setDate(todayObj.getDate() - 1);
       const yesterday = yesterdayObj.toISOString().split('T')[0];


        const userId = req.query.userId ? Number(req.query.userId) : undefined;

        if (userId) {
            const result = await pool.query('SELECT * FROM habits WHERE userid = $1', [userId]) 

            for (let i = 0; i < result.rows.length; i++) {
                let habit : Habit = result.rows[i];
                let needsUpdate = false;

                const lastReset = habit.last_reset_date;
                const lastCompleted = habit.last_completed_date;

                if (!lastReset || (today && lastReset < today)) {
                    habit.isComplete = false;
                    habit.last_reset_date = today;
                    needsUpdate = true;
                }

                if (lastCompleted && yesterday && lastCompleted < yesterday) {
                    habit.streak = 0;
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    await pool.query(
                        'UPDATE habits SET iscomplete = $1, last_reset_date = $2, streak = $3 WHERE id = $4',
                        [habit.isComplete, habit.last_reset_date, habit.streak, habit.id]
                    );
                }
            }

            res.status(200).json(result.rows);
            return;
    }

    const result = await pool.query('SELECT * FROM habits');
    res.status(200).json(result.rows);
} catch(err:any) {
        console.error(err.message);
    res.status(500).send('Server Error');
}
})

// PATCH habits streak

app.patch('/api/habit/:id', async(req, res) => {
    try{
       const habitId = req.params.id;
       const {isComplete} = req.body;

       const habitResult = await pool.query(`SELECT * FROM habits WHERE id = $1`, [habitId]);
    
        if (habitResult.rows.length === 0) {
            res.status(404).send('Habit not found');
            return;
        }
    
        const habit = habitResult.rows[0] as Habit;
        const today = new Date().toISOString().split('T')[0];

        let newStreak = habit.streak;
        let newLastCompleted = habit.last_completed_date;
        
        if (isComplete) {

            if (newLastCompleted !== today) {
                newStreak += 1;
                newLastCompleted = today;
            }

         } else {

            if (newLastCompleted === today) {
                newStreak = Math.max(0, newStreak - 1);
                newLastCompleted = null
            }
        }
        

        let updateResult = await pool.query(
            `UPDATE habits SET iscomplete = $1, streak = $2, last_completed_date = $3 WHERE id = $4 RETURNING *`,
            [isComplete, newStreak, newLastCompleted, habitId]
        )

        res.status(200).json(updateResult.rows[0]);

    }catch(err: any){
        console.error(err.message);
        res.status(500).send('Server Error')
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
