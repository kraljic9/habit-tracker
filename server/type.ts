export interface Habit {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
}

export interface User {
    id: string,
    name: string,
    username: string,
    email: string,
    password: string,
    createdAt: string,
    totalStreak: number,
    habits: Habit[];
}