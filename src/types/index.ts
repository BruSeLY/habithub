// types.ts (новый файл для общих типов)
export interface Habit {
  id: number;
  title: string;
  period: 'daily' | 'weekly' | 'monthly';
  addDate: Date;
  lastPeriodEnd: Date | null;
  streak: number;
  category: string;
  type?: 'boolean' | 'quantitative';
  targetValue?: number;
  status?: habitStatusType;
}

export type habitStatusType = 'completed' | 'overdue' | 'default';

export interface Achievement {
  id: string;
  title: string;
  description?: string;
  date: string;
}

export interface Friend {
  id: number;
  email: string;
  name: string;
}

// Базовый интерфейс без чувствительных данных
export interface BaseUser {
  email: string;
  username?: string;
  avatar?: string;
  hp: number;
  level: number;
  habits: {
    active: Habit[];
    completed: Habit[];
    shared: Habit[];
  };
  achievements: Achievement[];
  friends: Friend[];
  exp: number;
  chocopieCoins: number;
}

// Полный интерфейс для внутреннего использования
export interface FullUser extends BaseUser {
  passwordHash: string;
}