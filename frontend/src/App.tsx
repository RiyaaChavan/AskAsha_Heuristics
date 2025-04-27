import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Chatbot from './Components/Chatbot'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <Chatbot userId="12345" />
    </>
  )
}

export default App
