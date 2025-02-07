import { Header } from './components/index.ts'
import PWABadge from './PWABadge.tsx' 

function App() {
  return (
    <>
      <Header activeTab={1}/>
      <PWABadge />
    </>
  )
}

export default App
