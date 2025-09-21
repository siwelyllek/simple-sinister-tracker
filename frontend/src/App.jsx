import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Heatmap from './components/Heatmap';
import WorkoutList from './components/WorkoutList';
import CustomSelect from './components/CustomSelect';

// Dynamic API URL function that works from any device
const getApiUrl = () => {
  // If VITE_API_URL is set in environment, use it
  if (import.meta.env.VITE_API_URL) {
    console.log('Using environment VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Otherwise, dynamically construct based on current host
  const protocol = window.location.protocol; // http: or https:
  const hostname = window.location.hostname; // localhost, 192.168.1.175, etc.
  const apiPort = '8225'; // Backend port
  
  const apiUrl = `${protocol}//${hostname}:${apiPort}`;
  console.log('Dynamic API URL constructed:', apiUrl);
  console.log('Current window location:', window.location.href);
  
  return apiUrl;
};

function App() {
  const [workouts, setWorkouts] = useState([]);
  
  // Helper function to always get today's date in local timezone
  const getTodaysDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Weight conversion helpers
  const kgToLbs = (kg) => Math.round(kg * 2.20462);
  const lbsToKg = (lbs) => Math.round(lbs / 2.20462);
  const formatWeight = (kg) => useImperial ? `${kgToLbs(kg)}lbs` : `${kg}kg`;
  
  // Generate weight options
  const getWeightOptions = () => {
    const kgWeights = [8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48];
    if (useImperial) {
      return kgWeights.map(kg => ({
        value: kg,
        label: `${kgToLbs(kg)}lbs`
      }));
    }
    return kgWeights.map(kg => ({
      value: kg,
      label: `${kg}kg`
    }));
  };
  
  // Generate workout type options
  const getSwingWorkoutTypes = () => [
    { value: "Standard", label: "Standard" },
    { value: "EMOM", label: "EMOM" },
    { value: "Ladders", label: "Ladders" },
    { value: "Clusters", label: "Clusters" },
    { value: "Descending", label: "Descending" },
    { value: "Pyramid", label: "Pyramid" }
  ];
  
  const getGetupWorkoutTypes = () => [
    { value: "Standard", label: "Standard" },
    { value: "EMOM", label: "EMOM" },
    { value: "Complex", label: "Complex" },
    { value: "Heavy Single", label: "Heavy Single" },
    { value: "Alternating", label: "Alternating" }
  ];
  
  const [formData, setFormData] = useState({
    date: '', // Start empty, will be set in useEffect
    kettlebell_swings: '',
    turkish_get_ups: '',
    swing_weight_kg: '16',
    // Dual get-up weight system
    getup_weight_1_kg: '16',
    getup_reps_1: '',
    getup_weight_2_kg: '',
    getup_reps_2: '',
    swing_style: '2-handed',
    // Workout type tracking
    swing_workout_type: 'Standard',
    getup_workout_type: 'Standard'
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize useImperial from localStorage or default to false
  const [useImperial, setUseImperial] = useState(() => {
    const saved = localStorage.getItem('useImperial');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Initialize theme from localStorage or default to 'purple'
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('colorTheme');
    return saved !== null ? saved : 'purple';
  });

  // Color themes definition
  const themes = {
    purple: {
      name: 'Purple Galaxy',
      primary: 'from-purple-900 via-purple-800 to-indigo-900',
      accent: 'purple',
      text: 'purple-200',
      button: 'purple-600',
      glass: 'white/10',
      border: 'white/20'
    },
    ocean: {
      name: 'Ocean Depths',
      primary: 'from-blue-900 via-cyan-800 to-teal-900',
      accent: 'cyan',
      text: 'cyan-200',
      button: 'cyan-600',
      glass: 'white/10',
      border: 'white/20'
    },
    sunset: {
      name: 'Sunset Fire',
      primary: 'from-orange-900 via-red-800 to-pink-900',
      accent: 'orange',
      text: 'orange-200',
      button: 'orange-600',
      glass: 'white/10',
      border: 'white/20'
    },
    forest: {
      name: 'Forest Night',
      primary: 'from-green-900 via-emerald-800 to-teal-900',
      accent: 'emerald',
      text: 'emerald-200',
      button: 'emerald-600',
      glass: 'white/10',
      border: 'white/20'
    },
    cosmic: {
      name: 'Cosmic Void',
      primary: 'from-gray-900 via-slate-800 to-zinc-900',
      accent: 'slate',
      text: 'slate-200',
      button: 'slate-600',
      glass: 'white/10',
      border: 'white/20'
    },
    royal: {
      name: 'Royal Gold',
      primary: 'from-yellow-900 via-amber-800 to-orange-900',
      accent: 'amber',
      text: 'amber-200',
      button: 'amber-600',
      glass: 'white/10',
      border: 'white/20'
    }
  };

  const theme = themes[currentTheme];

  // Fetch workouts on component mount
  useEffect(() => {
    fetchWorkouts();
    // Also ensure we have today's date on mount
    setFormData(prev => ({ ...prev, date: getTodaysDate() }));
  }, []);

  // Save useImperial preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('useImperial', JSON.stringify(useImperial));
  }, [useImperial]);

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('colorTheme', currentTheme);
  }, [currentTheme]);

  // Auto-calculate total turkish_get_ups when individual reps change
  useEffect(() => {
    const totalReps = (parseInt(formData.getup_reps_1) || 0) + (parseInt(formData.getup_reps_2) || 0);
    if (totalReps !== (parseInt(formData.turkish_get_ups) || 0)) {
      setFormData(prev => ({ ...prev, turkish_get_ups: totalReps.toString() }));
    }
  }, [formData.getup_reps_1, formData.getup_reps_2]);

  const fetchWorkouts = async () => {
    try {
      const API_URL = getApiUrl();
      const response = await axios.get(`${API_URL}/workouts/`);
      setWorkouts(response.data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const workoutData = {
        date: formData.date,
        kettlebell_swings: parseInt(formData.kettlebell_swings) || 0,
        turkish_get_ups: parseInt(formData.turkish_get_ups) || 0,
        swing_weight_kg: parseFloat(formData.swing_weight_kg) || 16.0,
        // Dual get-up weight system
        getup_weight_1_kg: parseFloat(formData.getup_weight_1_kg) || 16.0,
        getup_reps_1: parseInt(formData.getup_reps_1) || 0,
        getup_weight_2_kg: formData.getup_weight_2_kg ? parseFloat(formData.getup_weight_2_kg) : null,
        getup_reps_2: parseInt(formData.getup_reps_2) || 0,
        swing_style: formData.swing_style,
        // Workout type tracking
        swing_workout_type: formData.swing_workout_type,
        getup_workout_type: formData.getup_workout_type
      };
      
      const API_URL = getApiUrl();
      await axios.post(`${API_URL}/workouts/`, workoutData);
      
      // Reset form and refresh workouts
      setFormData({
        date: getTodaysDate(),
        kettlebell_swings: '',
        turkish_get_ups: '',
        swing_weight_kg: '16',
        // Dual get-up weight system
        getup_weight_1_kg: '16',
        getup_reps_1: '',
        getup_weight_2_kg: '',
        getup_reps_2: '',
        swing_style: '2-handed',
        // Workout type tracking
        swing_workout_type: 'Standard',
        getup_workout_type: 'Standard'
      });
      
      await fetchWorkouts();
    } catch (error) {
      console.error('Error creating workout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWorkout = async (workoutId) => {
    try {
      const API_URL = getApiUrl();
      await axios.delete(`${API_URL}/workouts/${workoutId}`);
      await fetchWorkouts();
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.primary}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Simple & Sinister
          </h1>
          <p className={`text-xl text-${theme.text} max-w-2xl mx-auto`}>
            Track your kettlebell workouts. Master the fundamentals.
          </p>
        </div>

        {/* Workout Form */}
        <div className="max-w-md mx-auto mb-12">
          <div className={`bg-${theme.glass} backdrop-blur-lg rounded-2xl p-8 border border-${theme.border}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Log Workout</h2>
              
              {/* Controls Row */}
              <div className="flex items-center gap-4">
                {/* Theme Selector */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const themeKeys = Object.keys(themes);
                      const currentIndex = themeKeys.indexOf(currentTheme);
                      const nextIndex = (currentIndex + 1) % themeKeys.length;
                      setCurrentTheme(themeKeys[nextIndex]);
                    }}
                    className={`p-2 bg-${theme.button}/20 border border-${theme.accent}-400/30 rounded-lg text-${theme.text} hover:bg-${theme.button}/30 transition-colors`}
                    title={`Current: ${theme.name} - Click to change`}
                  >
                    🎨
                  </button>
                </div>
                
                {/* Units Toggle */}
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${!useImperial ? 'text-white' : `text-${theme.text}`}`}>kg</span>
                  <button
                    type="button"
                    onClick={() => setUseImperial(!useImperial)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      useImperial ? `bg-${theme.button}` : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        useImperial ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-sm ${useImperial ? 'text-white' : `text-${theme.text}`}`}>lbs</span>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="date" className={`block text-sm font-medium text-${theme.text} mb-2`}>
                  Date
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={`flex-1 px-4 py-3 bg-${theme.glass} border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-${theme.accent}-500 focus:border-transparent`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, date: getTodaysDate() }))}
                    className={`px-3 py-3 bg-${theme.button}/20 border border-${theme.accent}-400/30 rounded-xl text-${theme.text} hover:bg-${theme.button}/30 transition-colors text-sm`}
                  >
                    Today
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="kettlebell_swings" className={`block text-sm font-medium text-${theme.text} mb-2`}>
                  Kettlebell Swings
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    id="kettlebell_swings"
                    name="kettlebell_swings"
                    value={formData.kettlebell_swings}
                    onChange={handleInputChange}
                    placeholder="100"
                    className={`px-4 py-3 bg-${theme.glass} border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-${theme.accent}-500 focus:border-transparent`}
                    min="0"
                  />
                  <CustomSelect
                    name="swing_weight_kg"
                    value={formData.swing_weight_kg}
                    onChange={handleInputChange}
                    options={getWeightOptions()}
                    placeholder="Select weight"
                    theme={theme}
                  />
                  <CustomSelect
                    name="swing_style"
                    value={formData.swing_style}
                    onChange={handleInputChange}
                    options={[
                      { value: "2-handed", label: "2-handed" },
                      { value: "1-handed", label: "1-handed" }
                    ]}
                    placeholder="Select style"
                    theme={theme}
                  />
                  <CustomSelect
                    name="swing_workout_type"
                    value={formData.swing_workout_type}
                    onChange={handleInputChange}
                    options={getSwingWorkoutTypes()}
                    placeholder="Workout type"
                    theme={theme}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium text-${theme.text} mb-2`}>
                  Turkish Get-ups
                </label>
                
                {/* Total get-ups display */}
                <div className={`mb-3 p-3 bg-${theme.button}/20 rounded-lg border border-${theme.accent}-400/30`}>
                  <div className="text-center">
                    <span className={`text-2xl font-bold text-${theme.accent}-300`}>{formData.turkish_get_ups || 0}</span>
                    <span className={`text-sm text-${theme.text} block`}>Total Get-ups</span>
                  </div>
                </div>

                {/* First weight input */}
                <div className="mb-3">
                  <label className={`block text-xs font-medium text-${theme.accent}-300 mb-1`}>
                    Weight 1
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      name="getup_reps_1"
                      value={formData.getup_reps_1}
                      onChange={handleInputChange}
                      placeholder="Reps"
                      className={`px-3 py-2 bg-${theme.glass} border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-${theme.accent}-500 focus:border-transparent text-sm`}
                      min="0"
                    />
                    <CustomSelect
                      name="getup_weight_1_kg"
                      value={formData.getup_weight_1_kg}
                      onChange={handleInputChange}
                      options={getWeightOptions()}
                      placeholder="Weight"
                      className="text-sm"
                      theme={theme}
                    />
                  </div>
                </div>

                {/* Second weight input (optional) */}
                <div>
                  <label className={`block text-xs font-medium text-${theme.accent}-300 mb-1`}>
                    Weight 2 (optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      name="getup_reps_2"
                      value={formData.getup_reps_2}
                      onChange={handleInputChange}
                      placeholder="Reps"
                      className={`px-3 py-2 bg-${theme.glass} border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-${theme.accent}-500 focus:border-transparent text-sm`}
                      min="0"
                    />
                    <CustomSelect
                      name="getup_weight_2_kg"
                      value={formData.getup_weight_2_kg}
                      onChange={handleInputChange}
                      options={[
                        { value: "", label: "No second weight" },
                        ...getWeightOptions()
                      ]}
                      placeholder="Weight"
                      className="text-sm"
                      theme={theme}
                    />
                  </div>
                </div>

                {/* Get-up workout type */}
                <div>
                  <label className={`block text-xs font-medium text-${theme.accent}-300 mb-1`}>
                    Workout Type
                  </label>
                  <CustomSelect
                    name="getup_workout_type"
                    value={formData.getup_workout_type}
                    onChange={handleInputChange}
                    options={getGetupWorkoutTypes()}
                    placeholder="Workout type"
                    className="text-sm"
                    theme={theme}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-${theme.button} to-${theme.accent}-600 hover:from-${theme.button} hover:to-${theme.accent}-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-${theme.accent}-500 focus:ring-offset-2 focus:ring-offset-transparent`}
              >
                {isLoading ? 'Logging...' : 'Log Workout'}
              </button>
            </form>
          </div>
        </div>

        {/* Training Consistency Heatmap */}
        <div className="max-w-4xl mx-auto mb-12">
          <Heatmap workouts={workouts} isLoading={isLoading} useImperial={useImperial} theme={theme} />
        </div>

        {/* Enhanced Workout List */}
        {workouts.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <WorkoutList 
              workouts={workouts} 
              refresh={fetchWorkouts} 
              isLoading={isLoading}
              useImperial={useImperial}
              theme={theme}
            />
          </div>
        )}

        {workouts.length === 0 && (
          <div className="text-center">
            <p className={`text-${theme.text} text-lg`}>No workouts logged yet. Start your journey!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
