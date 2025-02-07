import { Button } from '@mantine/core'
import styles from './StartPage.module.css'
import { IconRocket, IconArrowRight } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'

const StartPage = () => {
  const navigate = useNavigate()

  return (
    <div className={styles.hero__container}>
      <div className={styles.content__wrapper}>
        <div className={styles.badge}>
          <IconRocket size={18} />
          <span>Новый уровень самосовершенствования</span>
        </div>

        <h1 className={styles.title}>
          🚀 Строй свои привычки.
          <span className={styles.highlight}>Меняй жизнь.</span>
        </h1>

        <p className={styles.subtitle}>
          Отслеживайте прогресс, сохраняйте мотивацию и превращайте маленькие шаги 
          в большие победы. Просто добавляйте цели, а мы поможем не сбиться с пути.
        </p>

        <Button
          className={styles.cta__button}
          radius="xl"
          size="xl"
          leftSection='Начать бесплатно'
          rightSection={<IconArrowRight size={24} stroke={2.5} />}
          onClick={() => navigate('/main')}
        >
          
        </Button>

        <div className={styles.stats}>
          <div className={styles.stat__item}>500 000+ довольных пользователей</div>
          <div className={styles.divider}>•</div>
          <div className={styles.stat__item}>Доступность на всех </div>
        </div>

        <p className={styles.quote}>
          «Не идеалы, а системность меняют мир. Начни сегодня.»
        </p>
      </div>
    </div>
  )
}

export default StartPage