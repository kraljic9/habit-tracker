import express from 'express';
import cors from 'cors';
import type{ Habit, User} from './type.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let habits: Habit[] = [];
let users: User[] = []

// Register user

app.post('/api/register/user', (req, res) => {
    const newUser: User = {
        ...req.body,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        totalStreak: 0,
        habits: []
    }

    users.push(newUser);

    res.status(201).json(newUser);
})

// Login user

app.post('/api/login/user', (req, res) => {

    const {username, password} = req.body;

    const curUser = users.find(user => user.username === username && user.password === password);
    
    if (!curUser) {
        res.status(401).json({ message: 'Invalid username or password' });
        return;
    }

    res.status(200).json(curUser)
})


// GET habits

app.get('/api/habits', (req, res) => {
    res.status(200).json(habits)
})

// POST habits

app.post('/api/habits', (req, res) => {
    
    const newHabit: Habit = {
        ...req.body,
        id: Date.now().toString()
    };

    habits.push(newHabit);
    
    res.status(201).json(newHabit);
})

// PUT habits

app.put('/api/habits/:id', (req, res) => {
    
    const habitId = Number(req.params.id);

    const index = habits.findIndex((habit) => habit.id === habitId);

    if (index === -1) {
        res.status(404).json({ message: 'Habit not found' });
        return;
    }

    habits[index] = {
        ...habits[index],
        ...req.body,
    }

    res.status(200).json(habits[index]);  
}) 

// DELETE habits

app.delete('/api/habits/:id', (req, res) => {
    const habitId = Number(req.params.id);

    const index = habits.findIndex((habit) => habit.id === habitId);

    if (index === -1) {
        res.status(404).json({ message: 'Habit not found' });
        return;
    }

    habits.splice(index, 1);

    res.status(200).json({ message: `Habit ${habitId} deleted` });
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});