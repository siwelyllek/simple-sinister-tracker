import { useState } from "react"
import axios from "axios"

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"

export default function WorkoutForm({ refresh }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [kettlebellSwings, setKettlebellSwings] = useState("")
  const [turkishGetUps, setTurkishGetUps] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await axios.post(`${API}/workouts/`, {
        date,
        kettlebell_swings: parseInt(kettlebellSwings),
        turkish_get_ups: parseInt(turkishGetUps)
      })
      
      // Reset form
      setDate(new Date().toISOString().split('T')[0])
      setKettlebellSwings("")
      setTurkishGetUps("")
      
      // Show success message
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      
      // Refresh workouts list
      refresh()
    } catch (error) {
      console.error("Error adding workout:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <span>💪</span>
          Log Today's Workout
        </h2>
        <p className="text-emerald-100 text-sm mt-1">
          Record your Simple & Sinister session
        </p>
      </div>

      <div className="p-6">
        {showSuccess && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-800">
              <span>✅</span>
              <span className="font-medium">Workout logged successfully!</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="date" className="block text-sm font-semibold text-slate-700 mb-2">
              📅 Workout Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-900"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="swings" className="block text-sm font-semibold text-slate-700 mb-2">
                🔄 Kettlebell Swings
              </label>
              <input
                type="number"
                id="swings"
                value={kettlebellSwings}
                onChange={(e) => setKettlebellSwings(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-900"
                min="0"
                max="1000"
                placeholder="e.g., 100"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Recommended: 100 swings</p>
            </div>
            
            <div>
              <label htmlFor="getups" className="block text-sm font-semibold text-slate-700 mb-2">
                🏋️ Turkish Get-Ups
              </label>
              <input
                type="number"
                id="getups"
                value={turkishGetUps}
                onChange={(e) => setTurkishGetUps(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-900"
                min="0"
                max="100"
                placeholder="e.g., 10"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Recommended: 10 get-ups</p>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Logging Workout...
              </>
            ) : (
              <>
                <span>🚀</span>
                Log Workout
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}