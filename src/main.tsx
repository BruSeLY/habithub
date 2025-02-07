import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Header } from './components/index.ts'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { createTheme, MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css';
import '@mantine/hooks';
import StartPage from './pages/StartPage/StartPage.tsx'
import MainPage from './pages/MainPage/MainPage.tsx'

const theme = createTheme({
  primaryColor: 'violet'
})


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <BrowserRouter>
        <Header activeTab={0} />
        <Routes>
          <Route path='/' element={<StartPage />}></Route>
          <Route path='/main' element={<MainPage />}></Route>
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>,
)
