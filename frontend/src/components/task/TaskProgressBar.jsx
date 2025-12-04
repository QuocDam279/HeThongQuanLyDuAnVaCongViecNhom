import React, { useState, useEffect } from "react";

export default function TaskProgressBar({ progress, onChange, disabled = false }) {
  const [value, setValue] = useState(progress);
  const [isDragging, setIsDragging] = useState(false);

  // Sync với prop progress khi nó thay đổi từ bên ngoài
  useEffect(() => {
    setValue(progress);
  }, [progress]);

  const handleChange = (e) => {
    if (disabled) return;
    
    const newValue = Number(e.target.value);
    setValue(newValue); // chỉ cập nhật UI, KHÔNG gọi API
  };

  const handleCommit = () => {
    if (disabled) return;
    
    setIsDragging(false);

    // chỉ update API khi người dùng dừng kéo
    if (onChange) onChange(value);
  };

  const handleMouseDown = () => {
    if (disabled) return;
    setIsDragging(true);
  };

  return (
    <div className="w-full mt-3 select-none">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">Tiến độ</span>
        <span className={`font-semibold ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
          {value}%
        </span>
      </div>

      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          disabled={disabled}
          className={`w-full accent-blue-500 ${
            disabled 
              ? 'cursor-not-allowed opacity-50' 
              : 'cursor-pointer'
          }`}
          onChange={handleChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit} // mobile support
        />
        
        {/* Visual progress bar background */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-2 bg-gray-200 rounded-full -z-10 pointer-events-none">
          <div 
            className={`h-full rounded-full transition-all duration-200 ${
              disabled ? 'bg-gray-300' : 'bg-blue-500'
            }`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    </div>
  );
}