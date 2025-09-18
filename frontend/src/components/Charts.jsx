import { useState, useEffect } from "react"

export default function Charts({ workouts, isLoading }) {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalSwings: 0,
    totalGetUps: 0,
    avgSwings: 0,
    avgGetUps: 0,
    thisWeekWorkouts: 0,
    streak: 0
  })

  useEffect(() => {
    if (workouts && workouts.length > 0) {
      calculateStats()
    }
  }, [workouts])

  const calculateStats = () => {
    const totalWorkouts = workouts.length
    const totalSwings = workouts.reduce((sum, w) => sum + w.kettlebell_swings, 0)
    const totalGetUps = workouts.reduce((sum, w) => sum + w.turkish_get_ups, 0)
    
    // Calculate this week's workouts
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const thisWeekWorkouts = workouts.filter(w => new Date(w.date) >= oneWeekAgo).length
    
    // Calculate current streak
    const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date))
    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    
    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.date)
      workoutDate.setHours(0, 0, 0, 0)
      
      const diffTime = currentDate - workoutDate
      const diffDays = diffTime / (1000 * 60 * 60 * 24)
      
      if (diffDays <= streak + 1) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    setStats({
      totalWorkouts,
      totalSwings,
      totalGetUps,
      avgSwings: totalWorkouts > 0 ? Math.round(totalSwings / totalWorkouts) : 0,
      avgGetUps: totalWorkouts > 0 ? Math.round(totalGetUps / totalWorkouts) : 0,
      thisWeekWorkouts,
      streak
    })
  }

  const getStreakEmoji = (streak) => {
    if (streak >= 30) return "🔥"
    if (streak >= 14) return "⚡"
    if (streak >= 7) return "💪"
    if (streak >= 3) return "🎯"
    return "🌟"
  }

  const statCards = [
    {
      title: "Total Workouts",
      value: stats.totalWorkouts,
      icon: "🏋️",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Current Streak",
      value: `${stats.streak} days`,
      icon: getStreakEmoji(stats.streak),
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    {
      title: "This Week",
      value: `${stats.thisWeekWorkouts} workouts`,
      icon: "📅",
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    {
      title: "Total Swings",
      value: stats.totalSwings.toLocaleString(),
      icon: "🔄",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      title: "Total Get-Ups",
      value: stats.totalGetUps.toLocaleString(),
      icon: "⬆️",
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50",
      textColor: "text-pink-600"
    },
    {
      title: "Avg Swings",
      value: stats.avgSwings,
      icon: "�",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600"
    }
  ]

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <span>📊</span>
          Your Progress
        </h2>
        <p className="text-slate-300 text-sm mt-1">
          Track your Simple & Sinister journey
        </p>
      </div>

      <div className="p-6">
        {workouts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Ready to start your journey?
            </h3>
            <p className="text-slate-500">
              Log your first workout to see your progress statistics here!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map((card, index) => (
              <div
                key={index}
                className={`${card.bgColor} rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl">{card.icon}</div>
                  <div className={`text-2xl font-bold ${card.textColor}`}>
                    {card.value}
                  </div>
                </div>
                <div className="text-sm font-medium text-slate-600">
                  {card.title}
                </div>
              </div>
            ))}
          </div>
        )}

        {stats.streak > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
            <div className="flex items-center gap-2 text-orange-800">
              <span className="text-2xl">{getStreakEmoji(stats.streak)}</span>
              <div>
                <div className="font-semibold">
                  {stats.streak === 1 ? "Great start!" : `${stats.streak} day streak!`}
                </div>
                <div className="text-sm text-orange-600">
                  {stats.streak >= 30 ? "You're on fire! Keep it up!" :
                   stats.streak >= 14 ? "Two weeks strong! Amazing consistency!" :
                   stats.streak >= 7 ? "One week down! Building a great habit!" :
                   "Keep the momentum going!"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}