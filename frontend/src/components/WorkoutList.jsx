import { useState } from "react"
import axios from "axios"

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"

export default function WorkoutList({ workouts, refresh, isLoading }) {
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this workout?")) return
    
    setDeletingId(id)
    try {
      await axios.delete(`${API}/workouts/${id}`)
      refresh()
    } catch (error) {
      console.error("Error deleting workout:", error)
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getWorkoutRating = (swings, getUps) => {
    const standardSwings = 100
    const standardGetUps = 10
    
    const swingPercent = (swings / standardSwings) * 100
    const getUpPercent = (getUps / standardGetUps) * 100
    const average = (swingPercent + getUpPercent) / 2
    
    if (average >= 100) return { emoji: "🔥", text: "Perfect!", color: "text-red-500" }
    if (average >= 80) return { emoji: "💪", text: "Strong", color: "text-orange-500" }
    if (average >= 60) return { emoji: "👍", text: "Good", color: "text-yellow-500" }
    if (average >= 40) return { emoji: "🎯", text: "Progress", color: "text-blue-500" }
    return { emoji: "🌱", text: "Start", color: "text-green-500" }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <span>📝</span>
          Workout History
        </h2>
        <p className="text-indigo-100 text-sm mt-1">
          {workouts.length > 0 ? `${workouts.length} workouts logged` : "Your workout journey starts here"}
        </p>
      </div>

      <div className="p-6">
        {workouts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              No workouts yet
            </h3>
            <p className="text-slate-500">
              Start logging your Simple & Sinister workouts to build your history!
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-2 font-semibold text-slate-700">Date</th>
                    <th className="text-left py-3 px-2 font-semibold text-slate-700">Swings</th>
                    <th className="text-left py-3 px-2 font-semibold text-slate-700">Get-Ups</th>
                    <th className="text-left py-3 px-2 font-semibold text-slate-700">Rating</th>
                    <th className="text-right py-3 px-2 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workouts.map((workout) => {
                    const rating = getWorkoutRating(workout.kettlebell_swings, workout.turkish_get_ups)
                    return (
                      <tr key={workout.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-2 text-slate-900">
                          {formatDate(workout.date)}
                        </td>
                        <td className="py-4 px-2">
                          <span className="inline-flex items-center gap-1">
                            <span>🔄</span>
                            <span className="font-medium text-slate-900">{workout.kettlebell_swings}</span>
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <span className="inline-flex items-center gap-1">
                            <span>⬆️</span>
                            <span className="font-medium text-slate-900">{workout.turkish_get_ups}</span>
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <span className={`inline-flex items-center gap-1 font-medium ${rating.color}`}>
                            <span>{rating.emoji}</span>
                            <span>{rating.text}</span>
                          </span>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <button
                            onClick={() => handleDelete(workout.id)}
                            disabled={deletingId === workout.id}
                            className="text-red-500 hover:text-red-700 font-medium text-sm px-3 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {deletingId === workout.id ? "..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {workouts.map((workout) => {
                const rating = getWorkoutRating(workout.kettlebell_swings, workout.turkish_get_ups)
                return (
                  <div key={workout.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-slate-900">
                          {formatDate(workout.date)}
                        </div>
                        <div className={`text-sm font-medium ${rating.color} flex items-center gap-1 mt-1`}>
                          <span>{rating.emoji}</span>
                          <span>{rating.text}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(workout.id)}
                        disabled={deletingId === workout.id}
                        className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {deletingId === workout.id ? "..." : "Delete"}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <span>🔄</span>
                        <div>
                          <div className="text-lg font-bold text-slate-900">{workout.kettlebell_swings}</div>
                          <div className="text-xs text-slate-500">Swings</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>⬆️</span>
                        <div>
                          <div className="text-lg font-bold text-slate-900">{workout.turkish_get_ups}</div>
                          <div className="text-xs text-slate-500">Get-Ups</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary Stats */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-slate-900">{workouts.length}</div>
                  <div className="text-sm text-slate-500">Total Sessions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {workouts.reduce((sum, w) => sum + w.kettlebell_swings, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-500">Total Swings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {workouts.reduce((sum, w) => sum + w.turkish_get_ups, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-500">Total Get-Ups</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}