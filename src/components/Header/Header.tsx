import { useDisclosure } from '@mantine/hooks';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Avatar, 
  ActionIcon, 
  Group, 
  Modal, 
  TextInput, 
  PasswordInput, 
  Button, 
  SegmentedControl, 
  Stack,
  Menu,
  rem,
  LoadingOverlay
} from '@mantine/core';
import styles from './Header.module.css';
import { Link } from 'react-router-dom';
import { IconLogin2, IconSparkles, IconLogout } from '@tabler/icons-react';
import { useState } from 'react';
import StorageManager from '../../storage/storageManager';
import { useUserStore } from '../../store/UserStore/UserStore';
import { BaseUser } from '../../types';


// Схема валидации для формы авторизации/регистрации
const authSchema = z.object({
  email: z.string()
    .email("Некорректный email")
    .regex(/@[a-z0-9-]+(\.[a-z0-9-]+)+$/i, "Должен содержать домен (например, gmail.com)"),
  password: z.string()
    .min(6, "Пароль должен содержать минимум 6 символов"),
  username: z.string().min(3, "Имя пользователя должно содержать минимум 3 символа").optional()
}).superRefine((data, ctx) => {
  if (data.username && data.username.length < 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Имя пользователя должно содержать минимум 3 символа",
      path: ["username"]
    });
  }
});

type AuthFormData = z.infer<typeof authSchema>;

interface Props {
  activeTab: number;
}

const Header: React.FC<Props> = ({ activeTab }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const user = useUserStore<BaseUser | null>((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const [visible, { toggle }] = useDisclosure(false);

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset, 
    setError,
    clearErrors
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    mode: 'onChange'
  });

  const handleLogout = async() => {
    clearUser(); // Очищаем состояние в сторе
    close(); // Закрываем модальное окно (если оно открыто)
    await useUserStore.persist.rehydrate()

    if (visible) {
      toggle();
    }
  };



  const handleAuth = async (data: AuthFormData) => {
    try {
      clearErrors();
      let user;

      if (mode === 'register') {
        toggle();
        user = await StorageManager.saveUser({
          email: data.email,
          password: data.password,
          username: data.username,
        });
      } else {
        toggle();
        user = await StorageManager.validateUser(data.email, data.password);
      }

      if (visible) {
        toggle();
      }
      setUser(user)
      close();
      reset();
    } catch (error) {
      if (error instanceof Error) {
        setError('root', { message: error.message, type: 'manual' });
      }
    }
  };

  return (
    <>
      <header className={styles.header}>
        <Group justify="space-between" className={styles.header__content}>
          <Group gap="xl" className={styles.nav__group}>
            <Link to="/" className={styles.header__logo}>
              <IconSparkles size={28} />
              HabitHub
            </Link>
            <nav className={styles.nav__links}>
              <Link 
                to="/main" 
                className={`${styles.nav__link} ${activeTab === 1 ? styles.active : ''}`}
              >
                Главная
              </Link>
              <Link 
                to="/shop" 
                className={`${styles.nav__link} ${activeTab === 2 ? styles.active : ''}`}
              >
                Магазин
              </Link>
              <Link 
                to="/statistics" 
                className={`${styles.nav__link} ${activeTab === 3 ? styles.active : ''}`}
              >
                Статистика
              </Link>
            </nav>
          </Group>

          <Group gap="lg" className={styles.user__panel}>
            <Menu shadow="md" width={200} position="bottom-end" radius='sm' zIndex={1000}>
              {user && (
                <Menu.Target>
                  <Avatar 
                    size={44}
                    variant="gradient"
                    gradient={{ from: '#6a11cb', to: '#2575fc', deg: 135 }}
                    radius="xl"
                    className={styles.avatar}
                    style={{ cursor: 'pointer' }}
                  >
                    {user.username ? 
                      user.username[0] : 
                      user.email[0].toUpperCase()}
                  </Avatar>
                </Menu.Target>
              )}

              {user && (
                <Menu.Dropdown>
                  <Menu.Label>Аккаунт {user.email}</Menu.Label>
                  <Menu.Item
                    leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                    onClick={handleLogout}
                  >
                    Выйти
                  </Menu.Item>
                </Menu.Dropdown>
              )}
            </Menu>

            {!user && (
              <ActionIcon 
                onClick={open}
                size={44}
                variant="gradient"
                gradient={{ from: '#6a11cb', to: '#2575fc' }}
                radius="xl"
                className={styles.login__button}
                aria-label="login"
              >
                <IconLogin2 size={24} stroke={2.5} />
              </ActionIcon>
            )}
          </Group>
        </Group>
      </header>

      <Modal 
        opened={opened} 
        onClose={close} 
        title={mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
        centered
        radius="md"
        size="lg"
        withinPortal={false}
      >
      <LoadingOverlay visible={visible} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        <form onSubmit={handleSubmit(handleAuth)}>
          <Stack gap="lg">
            <SegmentedControl
              value={mode}
              onChange={(value) => {
                setMode(value as 'login' | 'register');
                reset();
                clearErrors();
              }}
              data={[
                { label: 'Вход', value: 'login' },
                { label: 'Регистрация', value: 'register' }
              ]}
              fullWidth
              radius="md"
            />

            {mode === 'register' && (
              <TextInput
                label="Имя пользователя"
                style={{color: "black"}}
                placeholder="Придумайте уникальное имя"
                {...register('username')}
                error={errors.username?.message}
                radius="md"
                size="md"
                required
              />
            )}

            <TextInput
              label="Email"
              style={{color: "black"}}
              placeholder="example@mail.com"
              {...register('email')}
              error={errors.email?.message}
              radius="md"
              size="md"
              required
            />

            <PasswordInput
              label="Пароль"
              style={{color: "black"}}
              placeholder="Не менее 6 символов"
              {...register('password')}
              error={errors.password?.message}
              radius="md"
              size="md"
              required
            />

            {errors.root && (
              <div className={styles.error}>
                {errors.root.message}
              </div>
            )}

            <Button 
              type="submit" 
              variant="gradient" 
              gradient={{ from: '#6a11cb', to: '#2575fc' }}
              fullWidth
              size="md"
              radius="md"
              mt="sm"
              loading={false}
            >
              {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
            </Button>
          </Stack>
        </form>
      </Modal>
    </>
  );
};

export default Header;
