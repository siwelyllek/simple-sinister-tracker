import React, { useState, useMemo } from "react";

export default function ProgressChart({ workouts, useImperial, theme }) {
  const [selectedMetrics, setSelectedMetrics] = useState({
    swingWeight: true,
    getupWeight: true
  });

  // Default theme fallback
  const defaultTheme = {
    accent: 'purple',
    glass: 'white/10',
    border: 'white/20',
    text: 'purple-200',
    button: 'purple-600'
  };
  const currentTheme = theme || defaultTheme;

  // Process workout data for the chart
  const chartData = useMemo(() => {
    if (!workouts || workouts.length === 0) return [];

    // Sort workouts by date
    const sortedWorkouts = [...workouts].sort((a, b) => new Date(a.date) - new Date(b.date));

    return sortedWorkouts.map((workout, index) => {
      // Calculate get-up weight (sum if combo weights used)
      let getupWeightKg = workout.getup_weight_1_kg || 16;
      if (workout.getup_weight_2_kg && workout.getup_reps_2 > 0) {
        // If using combo weights, calculate weighted average or sum based on reps
        const totalReps = (workout.getup_reps_1 || 0) + (workout.getup_reps_2 || 0);
        if (totalReps > 0) {
          const weight1Contribution = ((workout.getup_reps_1 || 0) / totalReps) * (workout.getup_weight_1_kg || 16);
          const weight2Contribution = ((workout.getup_reps_2 || 0) / totalReps) * (workout.getup_weight_2_kg || 0);
          getupWeightKg = weight1Contribution + weight2Contribution;
        }
      }

      // Convert to imperial if needed
      const swingWeight = useImperial ? Math.round((workout.swing_weight_kg || 16) * 2.20462) : (workout.swing_weight_kg || 16);
      const getupWeight = useImperial ? Math.round(getupWeightKg * 2.20462) : Math.round(getupWeightKg);

      return {
        date: workout.date,
        workoutNumber: index + 1,
        formattedDate: new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        swingWeight,
        getupWeight
      };
    });
  }, [workouts, useImperial]);

  // Calculate chart dimensions and scales
  const chartWidth = 800;
  const chartHeight = 400;
  const padding = { top: 40, right: 40, bottom: 60, left: 80 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Find min/max values for scaling
  const allValues = chartData.flatMap(d => [
    selectedMetrics.swingWeight ? d.swingWeight : null,
    selectedMetrics.getupWeight ? d.getupWeight : null
  ].filter(v => v !== null));

  const minValue = Math.min(...allValues) * 0.9;
  const maxValue = Math.max(...allValues) * 1.1;

  // Create scale functions
  const xScale = (index) => (index / Math.max(chartData.length - 1, 1)) * innerWidth;
  const yScale = (value) => innerHeight - ((value - minValue) / (maxValue - minValue)) * innerHeight;

  // Generate path data for each line
  const generatePath = (data, getValue) => {
    if (data.length === 0) return "";
    
    const points = data.map((d, i) => `${xScale(i)},${yScale(getValue(d))}`);
    return `M ${points.join(" L ")}`;
  };

  const lines = [
    {
      id: 'swingWeight',
      name: 'Swing Weight',
      color: '#3B82F6', // Blue
      path: selectedMetrics.swingWeight ? generatePath(chartData, d => d.swingWeight) : "",
      visible: selectedMetrics.swingWeight
    },
    {
      id: 'getupWeight',
      name: 'Get-up Weight',
      color: '#8B5CF6', // Purple
      path: selectedMetrics.getupWeight ? generatePath(chartData, d => d.getupWeight) : "",
      visible: selectedMetrics.getupWeight
    }
  ];

  const toggleMetric = (metricId) => {
    setSelectedMetrics(prev => ({
      ...prev,
      [metricId]: !prev[metricId]
    }));
  };

  if (!workouts || workouts.length === 0) {
    return (
      <div className={`bg-${currentTheme.glass} backdrop-blur-lg rounded-2xl border border-${currentTheme.border} p-8`}>
        <div className="text-center">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="text-lg font-semibold text-white mb-2">Progress Chart</h3>
          <p className={`text-${currentTheme.text}`}>
            Start logging workouts to see your progress over time!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-${currentTheme.glass} backdrop-blur-lg rounded-2xl border border-${currentTheme.border} overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-r from-${currentTheme.accent}-500/80 to-${currentTheme.button}/80 px-6 py-4`}>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <span>📈</span>
          Weight Progress Chart
        </h2>
        <p className={`text-${currentTheme.text} text-sm mt-1`}>
          Track your weight progression over time
        </p>
      </div>

      <div className="p-6">
        {/* Legend and Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          {lines.map(line => (
            <button
              key={line.id}
              onClick={() => toggleMetric(line.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                line.visible 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/5 text-white/50'
              }`}
            >
              <div 
                className="w-4 h-0.5 rounded-full"
                style={{ backgroundColor: line.visible ? line.color : '#666' }}
              />
              <span className="text-sm font-medium">{line.name}</span>
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="w-full overflow-x-auto">
          <svg width={chartWidth} height={chartHeight} className="bg-white/5 rounded-lg">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width={innerWidth} height={innerHeight} x={padding.left} y={padding.top} fill="url(#grid)" />

            {/* Y-axis */}
            <line 
              x1={padding.left} 
              y1={padding.top} 
              x2={padding.left} 
              y2={chartHeight - padding.bottom} 
              stroke="rgba(255,255,255,0.3)" 
              strokeWidth="2"
            />

            {/* X-axis */}
            <line 
              x1={padding.left} 
              y1={chartHeight - padding.bottom} 
              x2={chartWidth - padding.right} 
              y2={chartHeight - padding.bottom} 
              stroke="rgba(255,255,255,0.3)" 
              strokeWidth="2"
            />

            {/* Lines */}
            <g transform={`translate(${padding.left}, ${padding.top})`}>
              {lines.map(line => line.visible && line.path && (
                <g key={line.id}>
                  <path
                    d={line.path}
                    fill="none"
                    stroke={line.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-sm"
                  />
                  {/* Data points */}
                  {chartData.map((d, i) => (
                    <circle
                      key={i}
                      cx={xScale(i)}
                      cy={yScale(line.id === 'swingWeight' ? d.swingWeight : d.getupWeight)}
                      r="4"
                      fill={line.color}
                      className="drop-shadow-sm hover:r-6 transition-all cursor-pointer"
                    >
                      <title>
                        {d.formattedDate}: {
                          line.id === 'swingWeight' ? `${d.swingWeight}${useImperial ? 'lbs' : 'kg'}` :
                          `${d.getupWeight}${useImperial ? 'lbs' : 'kg'}`
                        }
                      </title>
                    </circle>
                  ))}
                </g>
              ))}
            </g>

            {/* X-axis labels */}
            {chartData.map((d, i) => (
              i % Math.ceil(chartData.length / 8) === 0 && (
                <text
                  key={i}
                  x={padding.left + xScale(i)}
                  y={chartHeight - padding.bottom + 20}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.7)"
                  fontSize="12"
                >
                  {d.formattedDate}
                </text>
              )
            ))}

            {/* Y-axis labels */}
            {[...Array(6)].map((_, i) => {
              const value = minValue + (maxValue - minValue) * (i / 5);
              return (
                <text
                  key={i}
                  x={padding.left - 10}
                  y={padding.top + innerHeight - (i / 5) * innerHeight}
                  textAnchor="end"
                  fill="rgba(255,255,255,0.7)"
                  fontSize="12"
                  dy="0.35em"
                >
                  {Math.round(value)}
                </text>
              );
            })}

            {/* Chart title */}
            <text
              x={chartWidth / 2}
              y={padding.top / 2}
              textAnchor="middle"
              fill="rgba(255,255,255,0.9)"
              fontSize="16"
              fontWeight="bold"
            >
              Weight Progression
            </text>
          </svg>
        </div>

        {/* Chart info */}
        <div className="mt-4 text-center">
          <p className={`text-${currentTheme.text} text-sm`}>
            Get-up weights shown as weighted average when using multiple weights
          </p>
        </div>
      </div>
    </div>
  );
}