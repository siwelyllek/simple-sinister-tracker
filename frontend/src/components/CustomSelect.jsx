import React, { useState, useRef, useEffect } from "react"

export default function CustomSelect({ 
  name, 
  value, 
  onChange, 
  options, 
  className = "",
  placeholder = "Select..."
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState("")
  const dropdownRef = useRef(null)

  useEffect(() => {
    // Find the label for the current value
    const selectedOption = options.find(opt => opt.value === value)
    setSelectedLabel(selectedOption ? selectedOption.label : placeholder)
  }, [value, options, placeholder])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optionValue) => {
    onChange({
      target: {
        name,
        value: optionValue
      }
    })
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white text-left focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-filter backdrop-blur-lg flex items-center justify-between ${
          className.includes('text-sm') ? 'px-3 py-2 rounded-lg text-sm' : ''
        }`}
      >
        <span className="block truncate">{selectedLabel}</span>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div className={`absolute z-50 w-full mt-1 bg-slate-800/95 backdrop-filter backdrop-blur-lg border border-white/20 rounded-xl shadow-xl max-h-60 overflow-auto ${
          className.includes('text-sm') ? 'rounded-lg' : ''
        }`}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full px-4 py-3 text-left hover:bg-purple-600/30 focus:bg-purple-600/30 focus:outline-none transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl ${
                className.includes('text-sm') ? 'px-3 py-2 text-sm first:rounded-t-lg last:rounded-b-lg' : ''
              } ${
                value === option.value 
                  ? 'bg-purple-600/20 text-purple-200' 
                  : 'text-white hover:text-purple-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}