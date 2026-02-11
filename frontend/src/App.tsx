import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [healthStatus, setHealthstatus] = useState('checking...')

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    fetch(`${apiUrl}/health`)
    .then(response => response.ok ? setHealthstatus('Healthy') : setHealthstatus('Unhealthy'))
    .catch(() => setHealthstatus('Error'))
  }, [])

  return (
    <>
      <div>
        <h1>Transcendence</h1>
      </div>
      <div className="card">
        <p>API Health: {healthStatus}</p>
      </div>
    </>
  )
}

export default App
