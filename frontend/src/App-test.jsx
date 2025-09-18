import { useState, useEffect } from "react"

export default function App() {
  const [test, setTest] = useState("Loading...")

  useEffect(() => {
    setTest("React is working!")
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center">{test}</h1>
      <p className="text-center mt-4">If you can see this, React is working properly.</p>
    </div>
  )
}