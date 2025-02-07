import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Habit, habitStatusType, Achievement, Friend, BaseUser } from '../../types';
import StorageManager from '../../storage/storageManager';
import { checkHabitPeriods } from '../../utils';

interface UserStoreState {
  user: BaseUser | null;
  setUser: (user: BaseUser) => void;
  updateUser: (newUser: BaseUser) => void;
  clearUser: () => void;
  addHabit: (habit: Habit) => void;
  stopTrackingHabit: (habitId: number) => void;
  changeHabitStatus: (habitId: number, status: habitStatusType) => void;
  addAchievement: (achievement: Achievement) => void;
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: number) => void;
}

const syncWithStorage = (user: BaseUser | null) => {
  if (user) {
    StorageManager.updateUserData(user);
  }
};

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      user: null,

      // Общий метод для обновления пользователя
      updateUser: (newUser: BaseUser) => {
        const checkedUser = checkHabitPeriods(newUser);
        set({ user: checkedUser });
        syncWithStorage(checkedUser);
      },

      setUser: (user) => {
        get().updateUser(user);
      },

      clearUser: () => {
        set({ user: null });
        syncWithStorage(null);
      },

      addHabit: (habit) => {
        const user = get().user;
        if (user) {
          const newHabitWithPeriod = {
            ...habit,
            lastPeriodEnd: habit.lastPeriodEnd
          };
          const newUser = {
            ...user,
            habits: {
              ...user.habits,
              active: [...user.habits.active, newHabitWithPeriod],
            },
          };
          get().updateUser(newUser);
        }
      },

      stopTrackingHabit: (habitId: number) => {
        const user = get().user;
        if (user) {
          const habit = user.habits.active.find((h) => h.id === habitId);
          if (habit) {
            const newUser = {
              ...user,
              habits: {
                active: user.habits.active.filter((h) => h.id !== habitId),
                completed: [...user.habits.completed, habit],
                shared: user.habits.shared,
              },
            };
            get().updateUser(newUser);
          }
        }
      },

      changeHabitStatus: (habitId: number, status: habitStatusType) => {
        const user = get().user;
        if (user) {
          const newUser = {
            ...user,
            habits: {
              ...user.habits,
              active: user.habits.active.map((habit) =>
                habit.id === habitId ? { ...habit, status } : habit
              ),
            },
          };
          get().updateUser(newUser);
        }
      },

      addAchievement: (achievement: Achievement) => {
        const user = get().user;
        if (user) {
          const newUser = {
            ...user,
            achievements: [...user.achievements, achievement],
          };
          get().updateUser(newUser);
        }
      },

      addFriend: (friend: Friend) => {
        const user = get().user;
        if (user) {
          const newUser = {
            ...user,
            friends: [...user.friends, friend],
          };
          get().updateUser(newUser);
        }
      },

      removeFriend: (friendId: number) => {
        const user = get().user;
        if (user) {
          const newUser = {
            ...user,
            friends: user.friends.filter((f) => f.id !== friendId),
          };
          get().updateUser(newUser);
        }
      },
    }),
    {
      name: 'user-storage',
      onRehydrateStorage: () => (state, error) => {
        if (state?.user) {
          syncWithStorage(state.user);
        }
        if (error) {
          console.error('Error during rehydration:', error);
        }
      },
    }
  )
);
