import { useState, useEffect } from 'react'
import patientDataJson from './data/patient.demo.json'
import { PatientData } from './utils/types'
import Timeline from './components/Timeline'

function App() {
  const [patientData] = useState<PatientData>(patientDataJson as PatientData)

  useEffect(() => {
    console.log('Patient data loaded:', patientData)
  }, [patientData])

  return (
    <div className="timeline-container">
      <Timeline patientData={patientData} />
    </div>
  )
}

export default App
