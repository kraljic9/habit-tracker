export interface Habit {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

export interface User {
    id: number,
    name: string,
    username: string,
    email: string,
    password: string,
    createdAt: string,
    totalStreak: number,
    habits: Habit[];
}