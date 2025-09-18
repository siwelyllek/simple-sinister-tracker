import React, { useState, useEffect } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { Tooltip } from "react-tooltip";

export default function Heatmap({ workouts, isLoading, useImperial }) {
  const [values, setValues] = useState([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const formatVolume = (volumeKg) => {
    if (useImperial) {
      return Math.round(volumeKg * 2.20462).toLocaleString();
    }
    return volumeKg.toLocaleString();
  };

  const getAvailableYears = () => {
    if (!workouts || workouts.length === 0) return [new Date().getFullYear()];
    const years = workouts.map(w => new Date(w.date).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a);
  };

  const getYearStats = () => {
    const yearWorkouts = workouts.filter(w => 
      new Date(w.date).getFullYear() === currentYear
    );
    
    const totalDays = new Set(yearWorkouts.map(w => w.date)).size;
    const totalSwings = yearWorkouts.reduce((sum, w) => sum + w.kettlebell_swings, 0);
    const totalGetUps = yearWorkouts.reduce((sum, w) => sum + w.turkish_get_ups, 0);
    
    const totalSwingVolume = yearWorkouts.reduce((sum, w) => {
      return sum + (w.kettlebell_swings * (w.swing_weight_kg || 16));
    }, 0);
    
    const totalGetUpVolume = yearWorkouts.reduce((sum, w) => {
      return sum + (w.turkish_get_ups * (w.getup_weight_kg || 16));
    }, 0);
    
    return { totalDays, totalSwings, totalGetUps, totalSwingVolume, totalGetUpVolume };
  };

  const tooltipDataAttrs = (value) => {
    if (!value || !value.date) return {};
    
    const date = new Date(value.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    
    if (value.workouts && value.details) {
      // Create detailed tooltip content
      let tooltipContent = `${date}\n`;
      
      if (value.workouts === 1) {
        const detail = value.details[0];
        const kgToLbs = (kg) => Math.round(kg * 2.20462);
        const swingWeightDisplay = useImperial ? `${kgToLbs(detail.swingWeight)}lbs` : `${detail.swingWeight}kg`;
        const getUpWeightDisplay = useImperial ? `${kgToLbs(detail.getUpWeight)}lbs` : `${detail.getUpWeight}kg`;
        
        tooltipContent += `${detail.swings} ${detail.swingStyle} swings @ ${swingWeightDisplay}\n`;
        tooltipContent += `${detail.getUps} get-ups @ ${getUpWeightDisplay}`;
      } else {
        tooltipContent += `${value.workouts} workouts - ${value.swings} total swings, ${value.getUps} total get-ups`;
      }
      
      return {
        'data-tooltip-id': 'heatmap-tooltip',
        'data-tooltip-content': tooltipContent,
        'data-tooltip-events': ['hover', 'click'],
        'data-tooltip-variant': 'info'
      };
    }
    
    return { 
      'data-tooltip-id': 'heatmap-tooltip',
      'data-tooltip-content': `${date} - No workout`,
      'data-tooltip-events': ['hover', 'click'],
      'data-tooltip-variant': 'info'
    };
  };

  useEffect(() => {
    if (workouts && workouts.length > 0) {
      const workoutMap = new Map();
      
      workouts
        .filter(workout => new Date(workout.date).getFullYear() === currentYear)
        .forEach(workout => {
        const date = workout.date;
        
        if (!workoutMap.has(date)) {
          workoutMap.set(date, {
            date: date,
            count: 0,
            totalSwings: 0,
            totalGetUps: 0,
            workoutDetails: []
          });
        }
        
        const existing = workoutMap.get(date);
        existing.count += 1;
        existing.totalSwings += workout.kettlebell_swings;
        existing.totalGetUps += workout.turkish_get_ups;
        existing.workoutDetails.push({
          swings: workout.kettlebell_swings,
          getUps: workout.turkish_get_ups,
          swingWeight: workout.swing_weight_kg || 16,
          getUpWeight: workout.getup_weight_kg || 16,
          swingStyle: workout.swing_style || "2-handed"
        });
      });

      const heatmapValues = Array.from(workoutMap.values()).map(item => {
        const swingRatio = item.totalSwings / 100;
        const getUpRatio = item.totalGetUps / 10;
        const avgRatio = (swingRatio + getUpRatio) / 2;
        
        let intensity = 1;
        if (avgRatio >= 1.5) intensity = 4;
        else if (avgRatio >= 1.2) intensity = 3;
        else if (avgRatio >= 0.8) intensity = 2;
        else intensity = 1;
        
        return {
          date: item.date,
          count: intensity,
          workouts: item.count,
          swings: item.totalSwings,
          getUps: item.totalGetUps,
          details: item.workoutDetails
        };
      });

      setValues(heatmapValues);
    }
  }, [workouts, currentYear]);

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded w-1/3 mb-6"></div>
          <div className="h-32 bg-white/10 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const yearStats = getYearStats();
  const availableYears = getAvailableYears();

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
      <div className="bg-gradient-to-r from-green-500/80 to-emerald-600/80 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span>🗓️</span>
              Training Consistency
            </h2>
            <p className="text-green-100 text-sm mt-1">
              Your workout activity throughout the year
            </p>
          </div>
          
          {availableYears.length > 1 && (
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(parseInt(e.target.value))}
              className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {availableYears.map(year => (
                <option key={year} value={year} className="text-slate-900">
                  {year}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="p-6">
        {workouts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4"></div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Start your consistency journey
            </h3>
            <p className="text-purple-200">
              Log workouts to see your training pattern visualized here!
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-green-500/20 rounded-xl p-4 text-center border border-green-400/30">
                <div className="text-2xl font-bold text-green-300">{yearStats.totalDays}</div>
                <div className="text-sm text-green-200">Workout Days</div>
              </div>
              <div className="bg-blue-500/20 rounded-xl p-4 text-center border border-blue-400/30">
                <div className="text-2xl font-bold text-blue-300">{yearStats.totalSwings.toLocaleString()}</div>
                <div className="text-sm text-blue-200">Total Swings</div>
              </div>
              <div className="bg-purple-500/20 rounded-xl p-4 text-center border border-purple-400/30">
                <div className="text-2xl font-bold text-purple-300">{yearStats.totalGetUps}</div>
                <div className="text-sm text-purple-200">Total Get-Ups</div>
              </div>
              <div className="bg-orange-500/20 rounded-xl p-4 text-center border border-orange-400/30">
                <div className="text-2xl font-bold text-orange-300">{formatVolume(yearStats.totalSwingVolume)}</div>
                <div className="text-sm text-orange-200">Swing Volume ({useImperial ? "lbs" : "kg"})</div>
              </div>
              <div className="bg-pink-500/20 rounded-xl p-4 text-center border border-pink-400/30">
                <div className="text-2xl font-bold text-pink-300">{formatVolume(yearStats.totalGetUpVolume)}</div>
                <div className="text-sm text-pink-200">Get-Up Volume ({useImperial ? "lbs" : "kg"})</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                <CalendarHeatmap
                  startDate={new Date(`${currentYear}-01-01`)}
                  endDate={new Date(`${currentYear}-12-31`)}
                  values={values}
                  classForValue={(value) => {
                    if (!value || value.count === 0) {
                      return "color-empty";
                    }
                    return `color-scale-${value.count}`;
                  }}
                  tooltipDataAttrs={tooltipDataAttrs}
                  showWeekdayLabels={true}
                />
              </div>
            </div>

            <Tooltip
              id="heatmap-tooltip"
              place="top"
              variant="info"
              border="1px solid rgba(255, 255, 255, 0.2)"
              className="!bg-slate-800 !text-white !rounded-lg !px-3 !py-2 !text-sm !max-w-xs !whitespace-pre-line"
              style={{
                backgroundColor: '#1e293b',
                color: '#ffffff',
                borderRadius: '8px',
                whiteSpace: 'pre-line'
              }}
            />

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-white/60">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-white/10"></div>
                <div className="w-3 h-3 rounded-sm bg-green-300/40"></div>
                <div className="w-3 h-3 rounded-sm bg-green-400/60"></div>
                <div className="w-3 h-3 rounded-sm bg-green-500/80"></div>
                <div className="w-3 h-3 rounded-sm bg-green-600"></div>
              </div>
              <span>More</span>
            </div>
          </>
        )}
      </div>

      <style jsx="true">{`
        .react-calendar-heatmap .color-empty {
          fill: rgba(255, 255, 255, 0.3);
          stroke: rgba(255, 255, 255, 0.1);
          stroke-width: 0.5;
        }
        .react-calendar-heatmap .color-scale-1 {
          fill: rgba(134, 239, 172, 0.4);
          stroke: rgba(255, 255, 255, 0.1);
          stroke-width: 0.5;
        }
        .react-calendar-heatmap .color-scale-2 {
          fill: rgba(134, 239, 172, 0.6);
          stroke: rgba(255, 255, 255, 0.1);
          stroke-width: 0.5;
        }
        .react-calendar-heatmap .color-scale-3 {
          fill: rgba(134, 239, 172, 0.8);
          stroke: rgba(255, 255, 255, 0.1);
          stroke-width: 0.5;
        }
        .react-calendar-heatmap .color-scale-4 {
          fill: rgba(34, 197, 94, 1);
          stroke: rgba(255, 255, 255, 0.1);
          stroke-width: 0.5;
        }
        .react-calendar-heatmap text {
          fill: rgba(255, 255, 255, 0.7);
          font-size: 11px;
        }
        .react-calendar-heatmap .react-calendar-heatmap-month-label {
          fill: rgba(255, 255, 255, 0.8);
        }
        .react-calendar-heatmap .react-calendar-heatmap-weekday-label {
          fill: rgba(255, 255, 255, 0.6);
        }
      `}</style>
    </div>
  );
}
