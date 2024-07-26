import React, { useState, useEffect } from 'react';
import DownloadPDFButton from './DownloadPDFButton'; // Adjust the path as needed
import './CalendarTable.css';

const CalendarTable = () => {
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1));
  const [endDate, setEndDate] = useState(new Date(new Date().getFullYear(), 11, 31));
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [instituteLevelEvents, setInstituteLevelEvents] = useState([]);
  const [departmentEvents, setDepartmentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost/fetch_events.php');
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setEvents(data.events || []);
        setHolidays(data.holidays || []);
        setInstituteLevelEvents(data.instituteLevelEvents || []);
        setDepartmentEvents(data.departmentEvents || []);
        setLoading(false);
      } catch (error) {
        setError(error.message);
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
    if (!events) return [];
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  };

  const getColorClass = (date) => {
    const dateString = date.toISOString().split('T')[0];
    console.log('Checking date:', dateString);
    console.log('Holidays:', holidays);
    console.log('Institute Level Events:', instituteLevelEvents);
    console.log('Department Events:', departmentEvents);
  
    // Convert dateString to a Date object
    let dateObj = new Date(dateString);
    dateObj.setDate(dateObj.getDate() +1); // Decrement the date by 1
    const prevDateString = dateObj.toISOString().split('T')[0]; // Convert back to string
  
    if (holidays.includes(prevDateString)) {
      console.log('Color class: red');
      return 'red';
    }
    if (instituteLevelEvents.includes(prevDateString)) {
      console.log('Color class: green');
      return 'green';
    }
    if (departmentEvents.includes(prevDateString)) {
      console.log('Color class: blue');
      return 'blue';
    }
    console.log('No color class');
    return '';
  };
  

  // const handleDayClick = async (dateString) => {
  //   let dateObj = new Date(dateString);
  //   dateObj.setDate(dateObj.getDate() +1); // Decrement the date by 1
  //   const prevDateString = dateObj.toISOString().split('T')[0];
  //   if (window.confirm(`Are you sure you want to delete the event on ${prevDateString}?`)) {
  //     try {
  //       const response = await fetch('http://localhost/delete_event.php', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({ date: dateString }),
  //       });

  //       if (!response.ok) {
  //         throw new Error('Failed to delete the event');
  //       }

  //       // Remove the event from the local state
  //       setEvents(events.filter(event => event.date !== dateString));
  //       setHolidays(holidays.filter(holiday => holiday !== dateString));
  //       setInstituteLevelEvents(instituteLevelEvents.filter(event => event !== dateString));
  //       setDepartmentEvents(departmentEvents.filter(event => event !== dateString));
  //     } catch (error) {
  //       setError(`Error deleting event: ${error.message}`);
  //     }
  //   }
  // };

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
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
              <th style={{ paddingLeft: '5px', paddingRight: '5px' }}>Week No</th>
              <th>Days of the Week</th>
              <th style={{ paddingLeft: '5px', paddingRight: '5px' }}>Working Days</th>
              <th style={{ paddingLeft: '5px', paddingRight: '5px' }}>Instructional Days</th>
              <th style={{ width: '400px' }}>Event Particulars</th>
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
              let workingDaysPerWeek = [];
              let weekdaysPerWeek = [];
              let weekWorkingDays = 0;
              let weekWeekdays = 0;

              for (let i = 0; i < firstDayOfMonth; i++) {
                cells.push(<td key={`empty-${monthIndex}-${i}`}></td>);
              }

              for (let day = 1; day <= daysInCurrentMonth; day++) {
                const currentDate = new Date(year, monthDate.getMonth(), day);
                const dayOfWeek = currentDate.getDay();
                // const dateString = currentDate.toISOString().split('T')[0];
                let className = '';

                if (dayOfWeek === 0 || dayOfWeek === 6) {
                  className = 'weekend';
                }

                const eventClass = getColorClass(currentDate);
                if (eventClass) {
                  className += ` ${eventClass}`;
                }

                if (!className.includes('red') && dayOfWeek !== 0 && dayOfWeek !== 6) {
                  weekWorkingDays++;
                }

                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                  weekWeekdays++;
                }

                cells.push(
                  <td
                    key={`day-${monthIndex}-${day}`}
                    className={`calendar-day ${className}`}
                    // onClick={() => handleDayClick(dateString)}
                  >
                    <div className="day-number">{day}</div>
                  </td>
                );

                if (dayOfWeek === 6 || day === daysInCurrentMonth) {
                  rows.push(
                    <tr key={`row-${monthIndex}-${day}`}>
                      {cells}
                    </tr>
                  );
                  workingDaysPerWeek.push(weekWorkingDays);
                  weekdaysPerWeek.push(weekWeekdays);
                  weekWorkingDays = 0;
                  weekWeekdays = 0;
                  cells = [];
                }
              }

              return (
                <tr key={`month-${monthIndex}`} className="month">
                  <td className="month">{`${month} ${year}`}</td>
                  <td>
                    {workingDaysPerWeek.map((days, weekIndex) => (
                      <div key={`week-${monthIndex}-${weekIndex}`} style={{ marginTop: '18px' }}>
                        {weekIndex + 1}
                      </div>
                    ))}
                  </td>
                  <td>
                    <table>
                      <thead>
                        <tr>
                          {Array.from({ length: 7 }).map((_, i) => {
                            const weekdayName = getWeekdayName(i);
                            const className = i === 0 || i === 6 ? 'weekend' : '';
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
                    {workingDaysPerWeek.map((days, weekIndex) => (
                      <div key={`working-days-${monthIndex}-${weekIndex}`} style={{ marginTop: '18px' }}>
                        {days}
                      </div>
                    ))}
                  </td>
                  <td>
                    {weekdaysPerWeek.map((weekdays, weekIndex) => (
                      <div key={`weekdays-${monthIndex}-${weekIndex}`} style={{ marginTop: '18px' }}>
                        {weekdays}
                      </div>
                    ))}
                  </td>
                  <td>
                    {monthEvents.map((event, eventIndex) => (
                      <div key={`event-${monthIndex}-${eventIndex}`} style={{ marginTop: '5px' }}>
                        {event.name} ({new Date(event.date).toLocaleDateString()})
                      </div>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '50px' }}>
          <DownloadPDFButton formContent={'pdf-content'} style={{ background: '#ff8800', border: 'none', borderRadius: '5px', color: 'white', fontSize: '16px', marginTop: '20px', width: '200px' }} />
          <button onClick={() => window.history.back()} style={{ background: '#ff8800', border: 'none', borderRadius: '5px', color: 'white', fontSize: '16px', marginTop: '20px', width: '200px' }}>Back</button>
        </div>
      </div>
    </div>
  );
};

export default CalendarTable;
