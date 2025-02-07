import { checkHabitPeriods } from "../utils";


describe('checkHabitPeriods', () => {
  beforeAll(() => {
    // Мокаем текущее время
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('обрабатывает несколько периодов', () => {
    // 1. Создаем тестового пользователя
    const user = {
      hp: 10,
      email: 'test@example.com', // required property as per BaseUser
      level: 1, // required property as per BaseUser
      habits: {
        active: [{
          id: 1,
          title: 'test',
          category: 'здоровье',
          addDate: new Date(),
          period: 'daily',
          lastPeriodEnd: null,
          status: 'default',
        }],
        completed: [],
        shared: [],
      },
      achievements: [], // required property as per BaseUser
      friends: [],       // required property as per BaseUser
    };

    // 2. Первый вызов: инициализирует lastPeriodEnd (5 минут)
    let updatedUser = checkHabitPeriods(user, true); // Включаем тестовый режим
    expect(updatedUser.habits.active[0].lastPeriodEnd).toEqual(
      new Date('2024-01-01T00:05:00')
    );

    // 3. Перемещаем время на 16 минут вперед
    jest.setSystemTime(new Date('2024-01-01T00:16:00'));

    // 4. Второй вызов: должно пройти 3 периода (5*3=15 минут)
    updatedUser = checkHabitPeriods(updatedUser, true); // Включаем тестовый режим
    
    // Проверяем:
    // - HP уменьшился на 3 (каждый период не выполнен)
    expect(updatedUser.hp).toBe(7);
    
    // - lastPeriodEnd обновлен (+5 минут от предыдущего)
    expect(updatedUser.habits.active[0].lastPeriodEnd).toEqual(
      new Date('2024-01-01T00:20:00')
    );
  });
});