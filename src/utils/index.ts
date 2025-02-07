import { endOfDay, endOfWeek, endOfMonth } from 'date-fns';
import { BaseUser } from '../types';

export const getPeriodEnd = (
  date: Date,
  period: 'daily' | 'weekly' | 'monthly',
  isTesting = false
): Date => {
  if (isTesting) {
    // Укорачиваем периоды для тестов
    const testPeriods = {
      daily: 1 * 60 * 1000, 
      weekly: 2 * 60 * 1000,  
      monthly: 3 * 60 * 1000  
    };
    return new Date(date.getTime() + testPeriods[period]);
  }

  // Реальная логика для продакшена
  switch (period) {
    case 'daily':
      return endOfDay(date);
    case 'weekly':
      return endOfWeek(date, { weekStartsOn: 1 });
    case 'monthly':
      return endOfMonth(date);
    default:
      return endOfDay(date);
  }
};

export const checkHabitPeriods = (user: BaseUser, isTesting: boolean = true): BaseUser => {
  const now = new Date();
  let hp = user.hp;
  const updatedHabits = user.habits.active.map((habit) => {
    let currentHabit = { ...habit };

    if (typeof currentHabit.lastPeriodEnd === 'string') {
      currentHabit.lastPeriodEnd = new Date(currentHabit.lastPeriodEnd);
    }

    if (currentHabit.lastPeriodEnd === null) {
      currentHabit.lastPeriodEnd = getPeriodEnd(now, currentHabit.period, isTesting);
    }

    while (now > currentHabit.lastPeriodEnd!) {
      if (currentHabit.status !== 'completed') {
        hp -= 1;
        habit.streak = 0
      } else {
        currentHabit.status = 'default';
        currentHabit.streak += 1;
        user.exp += Math.floor((10 * currentHabit.streak * user.level) / (2 * user.level))
        user.chocopieCoins += getRandomIntInclusive(0, 15);
        if (user.exp >= 100) {
          user.level += 1
          user.exp = 0
        } 
      }
      // Переход к следующему периоду
      const nextPeriodStart = new Date(currentHabit.lastPeriodEnd!.getTime() + 1);
      currentHabit = {
        ...currentHabit,
        status: 'default',
        lastPeriodEnd: getPeriodEnd(nextPeriodStart, currentHabit.period, isTesting),
      };
    }

    return currentHabit;
  });

  console.log(user)
  return {
    ...user,
    hp: Math.max(hp, 0),
    habits: {
      ...user.habits,
      active: updatedHabits,
    },
  };
}

function getRandomIntInclusive(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}


let habitCounter = 234234;

export const generateUniqueId = (): number => {
  return ++habitCounter;
};