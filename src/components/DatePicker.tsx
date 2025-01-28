import { useCallback, useEffect, useState } from "react"


export default function DatePicker({ currentDate, setCurrentDate } : { currentDate: Date, setCurrentDate: React.Dispatch<React.SetStateAction<Date>> }) {

  const Months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const MinYear = 2018

  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth()+1);
  const [currentDay, setCurrentDay] = useState(currentDate.getDate());

  useEffect(() => {
    setCurrentDate(new Date(`${currentYear}-${currentMonth}-${currentDay}`))
  }, [currentYear, currentMonth, currentDay])

  function maxDayBasedOnMonth() {
    let maxDay = 31;
    if (currentMonth === 2) {
      if (currentYear % 4 === 0 && currentYear % 100 !== 0) {
        maxDay = 29;
      }
      else {
        maxDay = 28;
      }
    }
    else if ([4, 6, 9, 11].includes(currentMonth)) {
      maxDay = 30;
    }
  
    return maxDay;
  }

  const updateYear = useCallback((newYear: number) => {
    if (newYear > 2025) newYear = MinYear;
    if (newYear < MinYear) newYear = 2025;

    setCurrentYear(newYear);
  }, [])
  const updateMonth = useCallback((newMonth: number) => {
    if (newMonth > 12) newMonth = 1;
    if (newMonth < 1) newMonth = 12;

    setCurrentMonth(newMonth);
  }, [])
  const updateDay = useCallback((newDay: number) => {
    let maxDay = maxDayBasedOnMonth()
    if (newDay > maxDay) newDay = 1;
    if (newDay < 1) newDay = maxDay;

    setCurrentDay(newDay);
  }, [maxDayBasedOnMonth])


  return (
    <div className="date-input">
      <div className="date-input__group">
        <button className="primary-button" onClick={() => updateYear(currentYear-1)}
        >-</button>
        <p id="date-input__year">{currentYear}</p>
        <button className="primary-button" onClick={() => updateYear(currentYear+1)}
        >+</button>
      </div>

      <div className="date-input__group date-input__group_month">
        <button className="primary-button" onClick={() => updateMonth(currentMonth-1)}
        >-</button>
        <p id="date-input__month">{Months[currentMonth-1]}</p>
        <button className="primary-button" onClick={() => updateMonth(currentMonth+1)}
        >+</button>
      </div>

      <div className="date-input__group">
        <button className="primary-button" onClick={() => updateDay(currentDay-1)}
        >-</button>
        <p id="date-input__day">{currentDay}</p>
        <button className="primary-button" onClick={() => updateDay(currentDay+1)}
        >+</button>
      </div>
    </div>
  )
}
