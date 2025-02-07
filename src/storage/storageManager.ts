// storageManager.ts

import { BaseUser, FullUser } from "../types";
import bcrypt from 'bcryptjs';

class StorageManager {
  static USERS_KEY = 'habitHubUsers';

  static getUsers(): FullUser[] {
    try {
      const data = localStorage.getItem(this.USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to parse users from localStorage:', error);
      return [];
    }
  }

  static async saveUser(userData: {
    email: string;
    password: string;
    username?: string;
    avatar?: string;
  }): Promise<BaseUser> {
    const users = this.getUsers();
    if (users.some((u) => u.email === userData.email)) {
      throw new Error('Пользователь с таким email уже существует');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    const newUser: FullUser = {
      ...userData,
      passwordHash,
      habits: { active: [], completed: [], shared: [] },
      friends: [],
      hp: 5,
      level: 1,
      achievements: [],
      exp: 0,
      chocopieCoins: 0
    };

    localStorage.setItem(this.USERS_KEY, JSON.stringify([...users, newUser]));
    const { passwordHash: _, ...safeUser } = newUser;
    return safeUser;
  }

  static async validateUser(email: string, password: string): Promise<BaseUser> {
    const users = this.getUsers();
    const user = users.find((u) => u.email === email);
    if (!user) throw new Error('Пользователь не найден');

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new Error('Неверный пароль');

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  static updateUserData(updatedUser: BaseUser): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.email === updatedUser.email);
    if (index === -1) throw new Error('Пользователь не найден');

    const existingUser = users[index];
    const mergedUser: FullUser = {
      ...updatedUser,
      passwordHash: existingUser.passwordHash,
    };

    users[index] = mergedUser;
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }
}

export default StorageManager;