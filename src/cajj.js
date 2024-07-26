import React, { useState, useEffect } from 'react';
import './CalendarTable.css';

const daysInMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const CalendarTable = () => {
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1));
  const [endDate, setEndDate] = useState(new Date(new Date().getFullYear(), 11, 31));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost/fetch_events.php');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setEvents(data);
        setLoading(false);
      } catch (error) {
        setError('Error fetching data');
        setLoading(false);
        console.error('Fetch error:', error);
      }
    };

    fetchData(); // Initial fetch

    const interval = setInterval(fetchData, 5000); // Fetch every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const handleStartDateChange = (event) => {
    const newDate = new Date(event.target.value);
    setStartDate(newDate);
  };

  const handleEndDateChange = (event) => {
    const newDate = new Date(event.target.value);
    setEndDate(newDate);
  };

  const getWeekdayName = (weekdayIndex) => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return weekdays[weekdayIndex];
  };

  const getEventsForMonth = (year, month) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  };

  const isHoliday = (date, monthEvents) => {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return true;
    }

    return monthEvents.some(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month && eventDate.getDate() === day && event.holiday === 'yes';
    });
  };

  const months = [];
  const currentDate = new Date(startDate);
  currentDate.setDate(1);

  while (currentDate <= endDate) {
    months.push(new Date(currentDate));
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="calendar-container">
      <div className="date-selector">
        <label htmlFor="startDate">Start Date:</label>
        <input
          type="date"
          id="startDate"
          value={startDate.toISOString().split('T')[0]}
          onChange={handleStartDateChange}
        />
        <label htmlFor="endDate">End Date:</label>
        <input
          type="date"
          id="endDate"
          value={endDate.toISOString().split('T')[0]}
          onChange={handleEndDateChange}
        />
      </div>
      <div id="pdf-content">
        <table>
          <thead>
            <tr>
              <th className="month">Month</th>
              <th>Week No</th>
              <th>Days of the Week</th>
              <th>Working Days</th>
              <th>Events</th>
            </tr>
          </thead>
          <tbody>
            {months.map((monthDate, monthIndex) => {
              const month = monthDate.toLocaleString('default', { month: 'long' });
              const year = monthDate.getFullYear();
              const firstDayOfMonth = new Date(year, monthDate.getMonth(), 1).getDay();
              const daysInCurrentMonth = daysInMonth(new Date(year, monthDate.getMonth()));
              const monthEvents = getEventsForMonth(year, monthDate.getMonth());

              let rows = [];
              let cells = [];
              let weeklyWorkingDays = 0;
              let weekCount = 1;

              for (let i = 0; i < firstDayOfMonth; i++) {
                cells.push(<td key={`empty-${monthIndex}-${i}`}></td>);
              }

              for (let day = 1; day <= daysInCurrentMonth; day++) {
                const currentDate = new Date(year, monthDate.getMonth(), day);
                const dayOfWeek = currentDate.getDay();
                let className = '';
                let isWorkingDay = !isHoliday(currentDate, monthEvents);

                if (dayOfWeek === 0 || dayOfWeek === 6) {
                  className = 'weekend';
                }

                if (isWorkingDay) {
                  weeklyWorkingDays++;
                }

                cells.push(
                  <td key={`day-${monthIndex}-${day}`} className={`calendar-day ${className}`}>
                    <div className="day-number">{day}</div>
                  </td>
                );

                if (dayOfWeek === 6 || day === daysInCurrentMonth) {
                  rows.push(
                    <tr key={`row-${monthIndex}-${day}`}>
                      {cells}
                      <td>{weeklyWorkingDays}</td>
                    </tr>
                  );
                  cells = [];
                  weeklyWorkingDays = 0;
                  weekCount++;
                }
              }

              return (
                <tr key={`month-${monthIndex}`} className="month">
                  <td className="month">{`${month} ${year}`}</td>
                  <td>{weekCount - 1}</td>
                  <td>
                    <table>
                      <thead>
                        <tr>
                          {Array.from({ length: 7 }).map((_, i) => {
                            const weekdayName = getWeekdayName(i);
                            const className = (i === 0 || i === 6) ? 'weekend' : '';
                            return (
                              <th key={`weekday-inner-${i}`} className={className}>
                                {weekdayName}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>{rows}</tbody>
                    </table>
                  </td>
                  <td>
                    {Array.from({ length: weekCount - 1 }).map((_, weekIndex) => (
                      <div key={`working-days-${monthIndex}-${weekIndex}`}>
                        {rows[weekIndex].props.children[rows[weekIndex].props.children.length - 1].props.children}
                      </div>
                    ))}
                  </td>
                  <td>
                    {monthEvents.map((event, eventIndex) => (
                      <div key={`event-${monthIndex}-${eventIndex}`}>
                        {event.name} ({new Date(event.date).toLocaleDateString()})
                      </div>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CalendarTable;
