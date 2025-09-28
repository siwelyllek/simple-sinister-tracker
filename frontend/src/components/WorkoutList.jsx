import React, { useState, useEffect } from "react"
import axios from "axios"

// Dynamic API URL function that works from any device
const getApiUrl = () => {
  // If VITE_API_URL is set in environment, use it
  if (import.meta.env.VITE_API_URL) {
    console.log('WorkoutList - Using environment VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Otherwise, dynamically construct based on current host
  const protocol = window.location.protocol; // http: or https:
  const hostname = window.location.hostname; // localhost, 192.168.1.175, etc.
  const apiPort = '8225'; // Backend port
  
  const apiUrl = `${protocol}//${hostname}:${apiPort}`;
  console.log('WorkoutList - Dynamic API URL constructed:', apiUrl);
  
  return apiUrl;
};

export default function WorkoutList({ workouts, refresh, isLoading, useImperial = false, theme }) {
  const [deletingId, setDeletingId] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  
  // Initialize history visibility from localStorage or default to true
  const [isHistoryVisible, setIsHistoryVisible] = useState(() => {
    const saved = localStorage.getItem('workoutHistoryVisible');
    return saved !== null ? JSON.parse(saved) : true;
  })
  
  const workoutsPerPage = 5
  
  // Default theme fallback
  const defaultTheme = {
    accent: 'purple',
    glass: 'white/10',
    border: 'white/20',
    text: 'purple-200',
    button: 'purple-600'
  }
  const currentTheme = theme || defaultTheme

  // Save history visibility preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('workoutHistoryVisible', JSON.stringify(isHistoryVisible));
  }, [isHistoryVisible]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this workout?")) return
    
    setDeletingId(id)
    try {
      const API = getApiUrl();
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

  // Pagination logic
  const totalPages = Math.ceil(workouts.length / workoutsPerPage)
  const startIndex = currentPage * workoutsPerPage
  const endIndex = startIndex + workoutsPerPage
  const currentWorkouts = workouts.slice(startIndex, endIndex)
  
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))
  }
  
  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0))
  }
  
  const formatWeight = (kg) => {
    if (useImperial) {
      return `${Math.round(kg * 2.20462)}lbs`
    }
    return `${kg}kg`
  }

  const calculateVolume = (workout) => {
    const swingVolume = workout.kettlebell_swings * (workout.swing_weight_kg || 16)
    
    // Calculate get-up volume using dual weight system
    const getUpVolume1 = (workout.getup_reps_1 || 0) * (workout.getup_weight_1_kg || 16)
    const getUpVolume2 = (workout.getup_reps_2 || 0) * (workout.getup_weight_2_kg || 0)
    const totalGetUpVolume = getUpVolume1 + getUpVolume2
    
    return {
      swing: swingVolume,
      getUp: totalGetUpVolume,
      total: swingVolume + totalGetUpVolume
    }
  }

  const formatVolume = (volumeKg) => {
    if (useImperial) {
      return Math.round(volumeKg * 2.20462).toLocaleString()
    }
    return volumeKg.toLocaleString()
  }

  const getWorkoutRating = (swings, getUps) => {
    const standardSwings = 100
    const standardGetUps = 10
    
    const swingPercent = (swings / standardSwings) * 100
    const getUpPercent = (getUps / standardGetUps) * 100
    const average = (swingPercent + getUpPercent) / 2
    
    if (average >= 100) return { emoji: "🔥", text: "Perfect!", color: "text-red-500", bgColor: "bg-red-50", borderColor: "border-red-200" }
    if (average >= 80) return { emoji: "💪", text: "Strong", color: "text-orange-500", bgColor: "bg-orange-50", borderColor: "border-orange-200" }
    if (average >= 60) return { emoji: "👍", text: "Good", color: "text-yellow-500", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" }
    if (average >= 40) return { emoji: "🎯", text: "Progress", color: "text-blue-500", bgColor: "bg-blue-50", borderColor: "border-blue-200" }
    return { emoji: "🌱", text: "Start", color: "text-green-500", bgColor: "bg-green-50", borderColor: "border-green-200" }
  }

  const getGetUpDisplay = (workout) => {
    const hasSecondWeight = workout.getup_reps_2 > 0 && workout.getup_weight_2_kg
    
    if (hasSecondWeight) {
      return {
        primary: `${workout.getup_reps_1} @ ${formatWeight(workout.getup_weight_1_kg)}`,
        secondary: `${workout.getup_reps_2} @ ${formatWeight(workout.getup_weight_2_kg)}`,
        isDual: true
      }
    } else {
      return {
        primary: `${workout.turkish_get_ups} @ ${formatWeight(workout.getup_weight_1_kg || 16)}`,
        secondary: null,
        isDual: false
      }
    }
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
    <div className={`bg-${currentTheme.glass} backdrop-blur-lg rounded-2xl border border-${currentTheme.border} overflow-hidden`}>
      <div className={`bg-gradient-to-r from-${currentTheme.accent}-500/80 to-${currentTheme.button}/80 px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span>📝</span>
              Workout History
            </h2>
            <p className={`text-${currentTheme.text} text-sm mt-1`}>
              {workouts.length > 0 ? `${workouts.length} workouts logged` : "Your workout journey starts here"}
            </p>
          </div>
          <button
            onClick={() => setIsHistoryVisible(!isHistoryVisible)}
            className={`flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors`}
          >
            <span>{isHistoryVisible ? '👁️' : '👁️‍🗨️'}</span>
            <span>{isHistoryVisible ? 'Hide' : 'Show'}</span>
            <svg 
              className={`w-4 h-4 transition-transform ${isHistoryVisible ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {isHistoryVisible && (
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
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mb-6 px-4 py-3 bg-white/5 rounded-xl">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 0}
                  className={`flex items-center gap-2 px-4 py-2 bg-${currentTheme.button}/20 rounded-lg text-white hover:bg-${currentTheme.button}/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <span className={`text-${currentTheme.text} text-xs`}>
                    ({startIndex + 1}-{Math.min(endIndex, workouts.length)} of {workouts.length})
                  </span>
                </div>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages - 1}
                  className={`flex items-center gap-2 px-4 py-2 bg-${currentTheme.button}/20 rounded-lg text-white hover:bg-${currentTheme.button}/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span>Next</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Enhanced Card View */}
            <div className="space-y-4">
              {currentWorkouts.map((workout) => {
                const rating = getWorkoutRating(workout.kettlebell_swings, workout.turkish_get_ups)
                const volume = calculateVolume(workout)
                const getUpDisplay = getGetUpDisplay(workout)
                
                return (
                  <div key={workout.id} className={`bg-white/10 backdrop-blur-lg rounded-2xl p-6 border-2 ${rating.borderColor} hover:bg-white/20 transition-all duration-300`}>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-bold text-lg text-white mb-1">
                          {formatDate(workout.date)}
                        </div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${rating.color} ${rating.bgColor}/20 border ${rating.borderColor}`}>
                          <span className="text-base">{rating.emoji}</span>
                          <span>{rating.text}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(workout.id)}
                        disabled={deletingId === workout.id}
                        className="text-red-400 hover:text-red-300 text-sm px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50 font-medium"
                      >
                        {deletingId === workout.id ? "Deleting..." : "🗑️ Delete"}
                      </button>
                    </div>

                    {/* Main Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      {/* Swings Section */}
                      <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-400/30">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-2xl">🔄</div>
                          <div>
                            <div className="font-semibold text-blue-200">Kettlebell Swings</div>
                            <div className="text-sm text-blue-300">
                              {workout.swing_style || "2-handed"} • {workout.swing_workout_type || "Standard"}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-2xl font-bold text-blue-100">{workout.kettlebell_swings}</div>
                            <div className="text-xs text-blue-300">Reps</div>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-blue-100">{formatWeight(workout.swing_weight_kg || 16)}</div>
                            <div className="text-xs text-blue-300">Weight</div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-blue-400/30">
                          <div className="text-sm text-blue-200">
                            <span className="font-medium">Volume: </span>
                            {formatVolume(volume.swing)}{useImperial ? "lbs" : "kg"}
                          </div>
                        </div>
                      </div>

                      {/* Get-Ups Section */}
                      <div className="bg-purple-500/20 backdrop-blur-sm rounded-xl p-4 border border-purple-400/30">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-2xl">⬆️</div>
                          <div>
                            <div className="font-semibold text-purple-200">Turkish Get-Ups</div>
                            <div className="text-sm text-purple-300">
                              {getUpDisplay.isDual ? "Mixed weights" : "Single weight"} • {workout.getup_workout_type || "Standard"}
                            </div>
                          </div>
                        </div>
                        
                        {getUpDisplay.isDual ? (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center bg-purple-400/20 rounded-lg px-3 py-2">
                              <span className="text-sm font-medium text-purple-100">{getUpDisplay.primary}</span>
                              <span className="text-xs text-purple-300">Weight 1</span>
                            </div>
                            <div className="flex justify-between items-center bg-purple-400/20 rounded-lg px-3 py-2">
                              <span className="text-sm font-medium text-purple-100">{getUpDisplay.secondary}</span>
                              <span className="text-xs text-purple-300">Weight 2</span>
                            </div>
                            <div className="text-center pt-2">
                              <div className="text-lg font-bold text-purple-100">{workout.turkish_get_ups} total</div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-2xl font-bold text-purple-100">{workout.turkish_get_ups}</div>
                              <div className="text-xs text-purple-300">Reps</div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-purple-100">{formatWeight(workout.getup_weight_1_kg || 16)}</div>
                              <div className="text-xs text-purple-300">Weight</div>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-3 pt-3 border-t border-purple-400/30">
                          <div className="text-sm text-purple-200">
                            <span className="font-medium">Volume: </span>
                            {formatVolume(volume.getUp)}{useImperial ? "lbs" : "kg"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Total Volume Summary */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-xl">📊</div>
                          <div>
                            <div className="font-semibold text-green-800">Total Session Volume</div>
                            <div className="text-sm text-green-600">Combined workout load</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-900">
                            {formatVolume(volume.total)}<span className="text-lg">{useImperial ? "lbs" : "kg"}</span>
                          </div>
                          <div className="text-xs text-green-700">Total Volume</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary Stats */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{workouts.length}</div>
                  <div className="text-sm text-white/70">Total Sessions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {workouts.reduce((sum, w) => sum + w.kettlebell_swings, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-white/70">Total Swings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {workouts.reduce((sum, w) => sum + w.turkish_get_ups, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-white/70">Total Get-Ups</div>
                </div>
              </div>
            </div>
          </>
        )}
        </div>
      )}
    </div>
  )
}