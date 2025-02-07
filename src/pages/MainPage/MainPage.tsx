import { Flex, ScrollArea, TextInput, ActionIcon, Avatar, Menu, SegmentedControl, Loader, Text, Button, Modal, Group, NumberInput, Select, FileButton, Badge } from "@mantine/core";
import { IconSearch, IconUserPlus, IconTrash, IconShare, IconArrowBarLeft, IconArrowBarRight, IconPlus, IconCheck, IconDots, IconEdit } from "@tabler/icons-react";
import styles from './MainPage.module.css';
import { useEffect, useState } from "react";

import { z } from "zod";
import { useForm, zodResolver } from '@mantine/form';
import { useUserStore } from "../../store/UserStore/UserStore";
import { Habit, Friend as FriendType, BaseUser} from "../../types";
import { checkHabitPeriods, generateUniqueId } from "../../utils";

const MainPage: React.FC = () => {
  const user = useUserStore((state) => state.user);
  const updateUser = useUserStore((state) => state.updateUser);

  useEffect(() => {
    if (user) {
      // Устанавливаем интервал для проверки
      const intervalId = setInterval(() => {
        const updatedUser = checkHabitPeriods(user);
        updateUser(updatedUser);
    
        // Логика уведомлений
        const incompleteHabits = updatedUser.habits.active.filter(
          (habit) => habit.status !== 'completed'
        );
        if (incompleteHabits.length > 0) {
          console.log('У вас есть невыполненные привычки!', incompleteHabits);
        }
      }, 6000); // Каждую минуту
    
      return () => clearInterval(intervalId); // Очищаем интервал при размонтировании
    }    
  }, [user, updateUser]);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.contentWrapper}>
        <Friends friends={user?.friends || []} />
        <HabitSection />
      </div>
    </div>
  );
};

interface FriendsProps {
  friends: FriendType[];
}

export const Friends: React.FC<FriendsProps> = ({ friends }) => {
  const [opened, setOpened] = useState<boolean>(true);
  const [modalOpened, setModalOpened] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const removeFriend = useUserStore((state) => state.removeFriend);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const toggleFriendsList = () => setOpened((prev) => !prev);

  const NoFriendsPlaceholder = () => (
    <div className={styles.noFriends}>
      <img
        src="/images/wumpus.png"
        alt="Нет друзей"
        className={styles.noFriendsImage}
      />
      <p className={styles.noFriendsText}>
        Упс! Здесь пока никого нет. <br />
        Может, пригласим кого-то в компанию? 🦄
      </p>
    </div>
  );

  return (
    <div className={`${styles.friendsPanel} ${opened ? styles.friendsPanelOpen : styles.friendsPanelClosed}`}>
      <Flex gap="sm" justify="space-between" className={styles.friendsTitle}>
        {opened && <span className={styles.titleText}>Друзья</span>}
        <ActionIcon
          variant="transparent"
          size={40}
          role="togglefriendslist"
          onClick={toggleFriendsList}
          className={styles.toggleButton}
        >
          {opened ? <IconArrowBarLeft size={25} /> : <IconArrowBarRight size={25} />}
        </ActionIcon>
      </Flex>
      {opened && (
        <>
          <Flex gap="sm" className={styles.controls}>
            <TextInput
              placeholder="Поиск друзей..."
              rightSection={<IconSearch size={18} />}
              className={styles.search}
            />
            <ActionIcon 
              variant="subtle" size={36} 
              className={styles.addButton} 
              role='add-friend' 
              onClick={() => setModalOpened(true)}
            >
              <IconUserPlus size={20} />
            </ActionIcon>
          </Flex>
          <ScrollArea scrollbarSize={6} className={styles.scrollArea}>
            <div className={styles.list}>
              {isLoading ? ( 
                <div className={styles.loaderContainer}>
                  <Loader size="lg" color="blue" />
                </div>
              ) : friends.length > 0 ? (
                friends.map((friend) => (
                  <div key={friend.id} className={styles.friend__card}>
                    <span className={styles.friend__name}>{friend.name}</span>
                    <div className={styles.friendActionButtons}>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size={28}
                        onClick={() => removeFriend(friend.id)}
                        className={styles.friendActionIcon}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        size={28}
                        onClick={() => console.log("share")}
                        className={styles.friendActionIcon}
                      >
                        <IconShare size={18} />
                      </ActionIcon>
                    </div>
                  </div>
                ))
              ) : (
                <NoFriendsPlaceholder />
              )}
            </div>
          </ScrollArea>
        </>
      )}
      <AddFriendModal opened={modalOpened} setOpened={setModalOpened}/>
    </div>
  );
};

interface FriendProps {
  name: string;
  avatar?: string;
  onRemove: () => void;
  onShare: () => void;
}

export const Friend: React.FC<FriendProps> = ({ name, avatar, onRemove, onShare }) => {
  return (
    <div className={styles.friend__card}>
      <Flex align="center" gap="sm">
        <Avatar size={36} variant="light" color="violet" className={styles.avatar}>
          {avatar || name[0]}
        </Avatar>
        <span className={styles.friend__name}>{name}</span>
      </Flex>
      <Flex gap={8} className={styles.friendActionButtons}>
        <ActionIcon
          variant="transparent"
          color="red"
          onClick={onRemove}
          className={styles.friendActionIcon}
        >
          <IconTrash size={16} />
        </ActionIcon>
        <ActionIcon variant="subtle" color="green" onClick={onShare}>
          <IconShare size={16} />
        </ActionIcon>
      </Flex>
    </div>
  );
};

const NoHabitsPlaceholder: React.FC = () => {
  return (
    <div className={styles.noHabits}>
      <img
        src="/images/no-habits.png" // Картинка-заглушка
        alt="Нет привычек"
        className={styles.noHabitsImage}
      />
      <Text className={styles.noHabitsText}>
        У вас пока нет привычек. <br />
        Начните добавлять привычки и достигайте новых высот! 🚀
      </Text>
    </div>
  );
};

export const HabitSection: React.FC = () => {
  const user = useUserStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<string>("active");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [modalOpened, setModalOpened] = useState<boolean>(false);

  const getHabitsByTab = () => {
    if (!user) return [];
    switch (activeTab) {
      case "active":
        return user.habits.active;
      case "completed":
        return user.habits.completed;
      case "shared":
        return user.habits.shared;
      case "all":
        return [
          ...user.habits.active,
          ...user.habits.completed,
          ...user.habits.shared,
        ];
      default:
        return [];
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Увеличиваем время, чтобы имитировать загрузку
    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    { value: "active", label: "Актуальные" },
    { value: "completed", label: "Завершенные" },
    { value: "shared", label: "Общие" },
    { value: "all", label: "Все" },
  ];

  const habits = getHabitsByTab();

  return (
    <div className={styles.habitSection}>
      {isLoading ? (
        <div className={styles.loaderContainer}>
          <Loader size="lg" color="blue" />
        </div>
      ) : (
        <>
          <Flex gap="sm" className={styles.controls}>
            <TextInput
              placeholder="Поиск привычек..."
              rightSection={<IconSearch size={18} />}
              className={styles.search}
            />
            <ActionIcon variant="subtle" size={36} 
              className={styles.addButton} role="add-habit" 
              onClick={() => setModalOpened(!modalOpened)}
            >
              <IconPlus size={20} />
            </ActionIcon>
          </Flex>

          <div className={styles.tabs}>
            <SegmentedControl
              radius="md"
              fullWidth
              value={activeTab}
              onChange={(value: string) => setActiveTab(value)}
              data={tabs}
              color="violet"
            />
          </div>
          <ScrollArea scrollbarSize={6} className={styles.scrollArea}>
            <div className={styles.habitList}>
              {habits.length > 0 ? (
                habits.map((habit) => <HabitCard key={habit.id} habit={habit} />)
              ) : (
                <NoHabitsPlaceholder />
              )}
            </div>
          </ScrollArea>
        </>
      )}
      <AddHabitModal opened={modalOpened} setOpened={setModalOpened}/>
    </div>
  );
};

interface HabitCardProps {
  habit: Habit;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit }) => {
  const user = useUserStore((state) => state.user);
  const status = [
    ...(user?.habits.active ?? []),
    ...(user?.habits.completed ?? []),
    ...(user?.habits.shared ?? []),
  ].find((h) => h.id === habit.id)?.status;
  const changeHabitStatus = useUserStore((state) => state.changeHabitStatus);

  const handleStatusComplete = () => {
    changeHabitStatus(habit.id, 'completed');
  }

  const handleStatusDefault = () => {
    changeHabitStatus(habit.id, 'default')
  }

  const handleStatusOverdue = () => {
    changeHabitStatus(habit.id, 'overdue')
  }

  const getIndicatorColor = () => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'overdue':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <div className={styles.habitCard}>
      <div className={styles.ticketCutout}></div>
      <div className={styles.habitInfo}>
        <Flex justify="space-between" align="center">
          <span className={styles.habitName}>{habit.title}</span>
          <div
            className={styles.habitIndicator}
            style={{ backgroundColor: getIndicatorColor() }}
          />
        </Flex>
        {/* Отображение категории привычки */}
        <Badge color="grape" variant="White" className={styles.habitBadge}>
          {habit.category}
        </Badge>
        <Flex className={styles.flexRow}>
          <p className={styles.habitDate}>
            {habit.period === 'daily'
              ? 'Ежедневное'
              : habit.period === 'weekly'
              ? 'Еженедельное'
              : 'Ежемесячное'}
          </p>
          <div className={styles.decorativeLine}></div>
          <div className={styles.habitActions}>
            <ActionIcon
              size={28}
              onClick={handleStatusComplete}
              className={styles.habitCardActionIcon}
              title="Отметить выполненной"
            >
              <IconCheck size={18} />
            </ActionIcon>
            <Menu width={200} position="bottom-end" withinPortal>
              <Menu.Target>
                <ActionIcon size={28} className={styles.habitCardActionIcon} title="Действия">
                  <IconDots size={18} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  onClick={handleStatusDefault}
                  leftSection={<IconEdit size={14} />}
                >
                  Сбросить
                </Menu.Item>
                <Menu.Item
                  onClick={handleStatusOverdue}
                  leftSection={<IconTrash size={14} />}
                  color="red"
                >
                  Просрочить
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </Flex>
      </div>
    </div>
  );
};
interface AddFriendModalProps {
  opened: boolean,
  setOpened: (arg0: boolean) => void
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({ opened, setOpened }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { user, addFriend } = useUserStore();
  const friendSchema = z.string().email("Неверный формат email");

  const handleAddFriend = () => {
    if (!user) {
      setError('Вы не вошли в аккаунт.')
      return;
    }

    const habitHubUsers = JSON.parse(localStorage.getItem("habitHubUsers") || "[]");
    const validation = friendSchema.safeParse(email);
  
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      setSuccess(false);
      return;
    }
  
    const friendUser = habitHubUsers.find((user: { email: string }) => user.email === email);
  
    if (!friendUser) {
      setError("😢 Пользователь с таким email не найден.");
      setSuccess(false);
      return;
    }
  
    if (user?.email === email) {
      setError("😅 Вы не можете добавить себя в друзья.");
      setSuccess(false);
      return;
    }
  
    if (user?.friends.some((friend) => friend.email === email)) {
      setError("😅 Этот пользователь уже у вас в друзьях.");
      setSuccess(false);
      return;
    }
  
    const newFriend = {
      id: friendUser.id || Date.now(),
      email: friendUser.email,
      name: friendUser.username || friendUser.email.split('@')[0],
    };
  
    addFriend(newFriend);
  
    const updatedUsers = habitHubUsers.map((u: BaseUser) => {
      if (u.email === user?.email) {
        return { ...u, friends: [...u.friends, newFriend] };
      }
      return u;
    });
  
    localStorage.setItem("habitHubUsers", JSON.stringify(updatedUsers));
  
    setError(null);
    setSuccess(true);
  
    setTimeout(() => {
      setOpened(false);
      setEmail("");
      setSuccess(false);
    }, 2000);
  };

  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      title={
        <Flex align="center" gap="xs">
          🦄 <Text size="lg" style={{ color: "black" }}>Добавление в друзья</Text>
        </Flex>
      }
      centered
      size="lg"
      styles={{
        header: { borderBottom: "2px solid #f3f3f3", marginBottom: "1rem", color: "black" },
        body: { backgroundColor: "#f9f9f9", borderRadius: "15px" },
        root: { position: 'absolute', left: '0' }
      }}
    >
      <Flex direction="column" align="center" gap="sm">
        {!success ? (
          <>
            <Text size="sm" style={{ color: "black" }}>
              Введите email, чтобы найти своего друга. Давайте добавим кого-нибудь весёлого в компанию! 🎉
            </Text>
            <TextInput
              label="Email друга"
              placeholder="например: friend@example.com"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              error={error}
              radius="md"
              withAsterisk
              style={{ width: '100%' }}
              styles={{
                label: { fontWeight: 600, color: "black" },
                input: { color: "black", backgroundColor: "#fff", border: "1px solid #ddd" },
              }}
            />
            <Button
              fullWidth
              mt="md"
              size="md"
              radius="md"
              onClick={handleAddFriend}
              variant="gradient"
              gradient={{ from: 'indigo', to: 'cyan' }}
              leftSection={<IconUserPlus size={16} />}
              style={{ transition: 'transform 0.2s', ':hover': { transform: 'scale(1.05)' } }}
            >
              Добавить друга
            </Button>
          </>
        ) : (
          <Flex direction="column" align="center" gap="sm">
            <Text size="lg" style={{ color: "green" }}>
              🎉 Ура! Друг добавлен! 🎉
            </Text>
            <Button
              size="sm"
              color="green"
              radius="md"
              variant="outline"
              onClick={() => setOpened(false)}
              leftSection={<IconCheck size={16} />}
              style={{ transition: 'transform 0.2s', ':hover': { transform: 'scale(1.05)' } }}
            >
              Закрыть
            </Button>
          </Flex>
        )}
      </Flex>
    </Modal>
  );
};

const habitSchema = z.object({
  title: z.string().min(1, 'Цель/название привычки обязательно'),
  category: z.string().min(1, 'Категория обязательна'),
  period: z.enum(['daily', 'weekly', 'monthly'], { required_error: 'Периодичность обязательна' }),
  target: z.number().min(1, 'Количество должно быть больше нуля').optional(),
});

export type HabitFormValues = z.infer<typeof habitSchema>;

const AddHabitModal: React.FC<{ opened: boolean; setOpened: (value: boolean) => void }> = ({ opened, setOpened }) => {
  const addHabit = useUserStore((state) => state.addHabit);
  const user = useUserStore((state) => state.user);
  const [error, setError] = useState<string>('');

  const form = useForm<HabitFormValues>({
    initialValues: {
      title: '',
      category: '',
      period: 'daily',
      target: undefined,
    },
    validate: zodResolver(habitSchema),
  });

  // Функция обновления привычек в habitHubUsers
  const updateHabitHubUsers = (newHabit: Habit) => {
    const habitHubUsersStr = localStorage.getItem('habitHubUsers');
    if (!habitHubUsersStr) return;
    let habitHubUsers = JSON.parse(habitHubUsersStr) as Array<any>;

    // Найдём пользователя по email
    const userIndex = habitHubUsers.findIndex((u) => u.email === user?.email);
    if (userIndex === -1) return;

    // Обновляем привычки текущего пользователя
    habitHubUsers[userIndex].habits.active = [
      ...habitHubUsers[userIndex].habits.active,
      newHabit,
    ];

    localStorage.setItem('habitHubUsers', JSON.stringify(habitHubUsers));
  };

  const handleJson = (file: File | null) => {
    if (!file) return;

    if (!user) {
      setError('Войдите в аккаунт, чтобы добавить привычки');
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);

        if (!json.habits || !Array.isArray(json.habits) || !json.actions || !Array.isArray(json.actions)) {
          alert('Неверный формат данных JSON.');
          return;
        }

        json.habits.forEach((habit: any) => {
          const newHabit: Habit = {
            id: habit.id ? habit.id : generateUniqueId(),
            title: habit.title,
            addDate: habit.addDate,
            lastPeriodEnd: null,
            category: habit.category,
            streak: 0,
            period: habit.period,
            type: habit.targetValue ? 'quantitative' : 'boolean',
            targetValue: habit.targetValue,
            status: 'default',
          };
          addHabit(newHabit);
          updateHabitHubUsers(newHabit);
        });

        // Если нужно обрабатывать actions
        console.log('Данные о действиях:', json.actions);
        alert('Данные успешно загружены!');
      } catch (error) {
        alert('Ошибка при чтении файла JSON.');
        console.error(error);
      }
    };

    reader.readAsText(file);
  };

  const handleSubmit = (values: HabitFormValues) => {
    if (!user) {
      setError('Войдите в аккаунт, чтобы добавить привычки');
      return;
    }

    const newHabit: Habit = {
      id: generateUniqueId(),
      title: values.title,
      category: values.category,
      lastPeriodEnd: null,
      addDate: new Date(),
      period: values.period,
      streak: 0,
      type: values.target ? 'quantitative' : 'boolean',
      targetValue: values.target,
      status: 'default',
    };

    addHabit(newHabit);
    updateHabitHubUsers(newHabit);
    setOpened(false);
    form.reset();
  };

  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      centered
      title="Добавить привычку"
      styles={{
        header: { borderBottom: '2px solid #f3f3f3', marginBottom: '1rem', color: 'black' },
        body: { backgroundColor: '#f9f9f9', borderRadius: '15px' },
        root: { position: 'absolute', left: '0' },
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Цель/Название привычки"
          placeholder="Например: Бегать каждое утро"
          {...form.getInputProps('title')}
        />

        <Select
          label="Категория"
          placeholder="Выберите категорию"
          data={['Здоровье', 'Спорт', 'Работа']}
          {...form.getInputProps('category')}
        />

        <Select
          label="Периодичность"
          placeholder="Выберите периодичность"
          data={[
            { value: 'daily', label: 'Ежедневно' },
            { value: 'weekly', label: 'Еженедельно' },
            { value: 'monthly', label: 'Ежемесячно' },
          ]}
          {...form.getInputProps('period')}
        />

        <NumberInput
          label="Количество (опционально)"
          placeholder="Например: 10 раз"
          {...form.getInputProps('target')}
        />

        <Group mt="md">
          <FileButton onChange={handleJson} accept=".json">
            {(props) => <Button {...props}>Загрузить JSON</Button>}
          </FileButton>
        </Group>

        <Group mt="md">
          <Button onClick={() => setOpened(false)} variant="default">
            Отмена
          </Button>
          <Button type="submit">Добавить</Button>
        </Group>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </Modal>
  );
};



export default MainPage;
