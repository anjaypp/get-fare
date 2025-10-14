
import { useState, useEffect } from 'react';
import { IoIosArrowDown } from "react-icons/io";

// Utility to get days in a month
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

// Utility to get three-letter day name
const getDayName = (year, month, day) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // Predefined three-letter abbreviations
  return days[new Date(year, month, day).getDay()];
};

// Generate years for dropdown (current year ± 5 years)
const generateYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
};

const DepartDate = ({ label = 'Depart', selectedDate: initialDate, onDateSelect, minDate, maxDate }) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(initialDate || {
    id: today.toISOString().split('T')[0],
    date: `${today.getDate()} ${today.toLocaleString('default', { month: 'short' })} ${today.getFullYear() % 100}`,
    day: getDayName(today.getFullYear(), today.getMonth(), today.getDate()),
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  useEffect(() => {
    if (initialDate) setSelectedDate(initialDate);
  }, [initialDate]);

  // Generate calendar days
  const calendarDays = Array.from({ length: getDaysInMonth(currentYear, currentMonth) }, (_, i) => {
    const day = i + 1;
    const dateId = `${currentYear}-${currentMonth}-${day}`;
    const isDisabled = (minDate && new Date(dateId) < new Date(minDate)) || (maxDate && new Date(dateId) > new Date(maxDate));
    return {
      id: dateId,
      date: `${day} ${new Date(currentYear, currentMonth, day).toLocaleString('default', { month: 'short' })} ${currentYear % 100}`,
      day: getDayName(currentYear, currentMonth, day),
      disabled: isDisabled,
    };
  });

  const handleToggleCalendar = () => setShowCalendar(!showCalendar);

  const handleDateSelect = (dayObj) => {
    if (!dayObj.disabled) {
      setSelectedDate(dayObj);
      setShowCalendar(false);
      if (onDateSelect) onDateSelect(dayObj);
    }
  };

  const handleMonthChange = (e) => setCurrentMonth(parseInt(e.target.value));
  const handleYearChange = (e) => setCurrentYear(parseInt(e.target.value));

  // Get first day of the month for calendar alignment
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  return (
    <div className="input-list px-4 text-[#15144E] flex flex-col justify-center">
      <div className="flex items-center">
        <span className="block text-sm uppercase">{label}</span>
        <IoIosArrowDown onClick={handleToggleCalendar} className="cursor-pointer ml-2" />
      </div>
      <div className="date_select relative">
        <span className="font-semibold text-base md:text-lg" onClick={handleToggleCalendar}>{selectedDate.date}</span>
        <span id={`${label.toLowerCase()}_day`}>, {selectedDate.day}</span>
          
        {showCalendar && (
          <div className="absolute z-10 w-64 text-sm bg-white border border-gray-300 rounded-lg p-2 mt-1">
            <div className="flex justify-between mb-2">
              <select
                value={currentMonth}
                onChange={handleMonthChange}
                className="px-2 py-1 bg-gray-200 rounded"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={currentYear}
                onChange={handleYearChange}
                className="px-2 py-1 bg-gray-200 rounded"
              >
                {generateYears().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="font-bold">{day}</div>
              ))}
              {Array(firstDayOfMonth).fill(null).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {calendarDays.map((dayObj) => (
                <div
                  key={dayObj.id}
                  onClick={() => handleDateSelect(dayObj)}
                  className={`p-1 cursor-pointer hover:bg-gray-100 ${dayObj.disabled ? 'text-gray-400 cursor-not-allowed' : ''} ${dayObj.id === selectedDate.id ? 'bg-indigo-100' : ''}`}
                >
                  {dayObj.date.split(' ')[0]}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default DepartDate;
