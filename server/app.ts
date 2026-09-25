import express from 'express';
import cors from 'cors';
import type{ Habit, User} from './type.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let habits: Habit[] = [];
let users: User[] = []

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
    
    const habitId = req.params.id;

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
    const habitId = req.params.id;

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