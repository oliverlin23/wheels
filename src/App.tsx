import { Stage } from './components/Stage'
import { Debug } from './dev/Debug'

function App() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Stage />
      </div>
      <div style={{ width: '400px', borderLeft: '1px solid #0F172A', flexShrink: 0 }}>
        <Debug />
      </div>
    </div>
  )
}

export default App
