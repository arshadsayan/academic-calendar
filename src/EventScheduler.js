import React, { useState } from 'react';
import Calendar from 'react-calendar';
import Modal from 'react-modal';
import './EventScheduler.css';

const EventScheduler = ({ onEventCreate }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [otherEventName, setOtherEventName] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('teaching'); // Default to teaching
  const [instituteState, setInstituteState] = useState(true);
  const [holidayState, setHolidayState] = useState(false);
  const [departmentState, setDepartmentState] = useState(false);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setModalIsOpen(true);
  };

  const handleModalClose = () => {
    setModalIsOpen(false);
    setSelectedDate(null);
    setEventName('');
    setEventType('teaching');
    setInstituteState(true);
    setDepartmentState(false);
    setHolidayState(false);
    setOtherEventName('');
  };

  const handleEventCreate = () => {
    if (selectedDate && (eventName.trim() !== '' || otherEventName.trim() !== '')) {
      const formData = new FormData();
      const utcDate = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()));
      formData.append('date', utcDate.toISOString().split('T')[0]); // Format date as YYYY-MM-DD in UTC
      formData.append('name', eventName.trim() || otherEventName.trim()); // Use otherEventName if eventName is empty
      formData.append('type', eventType);
      formData.append('institute_level', instituteState ? 1 : 0);
      formData.append('department_level', departmentState ? 1 : 0);
      formData.append('holiday', holidayState ? 1 : 0);

      fetch('http://localhost/save_event.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.text())
      .then(data => {
        console.log(data); // Log response from PHP script
        onEventCreate(); // Optional: Trigger callback if needed
        handleModalClose(); // Close modal after successful submission
      })
      .catch(error => console.error('Error:', error));
    }
  };

  return (
    <div className="event-scheduler">
      <Calendar
        onChange={handleDateClick}
        value={selectedDate}
        showNeighboringMonth={false}
      />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleModalClose}
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Create New Event</h2>
        <form onSubmit={handleModalClose}>
          <div>
            <label>Select Your Event:</label>
            <select
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            >
              <option value="">Select</option>
              <option value="Start_For_SE/TE/BE">Start For SE/TE/BE</option>
              <option value="End_For_SE/TE/BE">End For SE/TE/BE</option>
              <option value="Start_For_FE">Start For FE</option>
              <option value="End_For_FE">End For FE</option>
              <option value="SE/TE/BE_IA1">SE/TE/BE IA 1</option>
              <option value="FR_IA1">FE IA1</option>
              <option value="SE/TE/BE_IA2">SE/TE/BE IA 2</option>
              <option value="FR_IA2">FE IA2</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <label>
              <input
                type="checkbox"
                name="institute"
                checked={instituteState}
                onChange={() => setInstituteState(!instituteState)}
              />
              Institute Level
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                name="Department"
                checked={departmentState}
                onChange={() => setDepartmentState(!departmentState)}
                style={{ marginLeft: '20px' }}
              />
              Department Level
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <label>Other Event:</label>
            <input
              style={{ height: '15px', marginTop: '10px' }}
              type="text"
              value={otherEventName}
              onChange={(e) => setOtherEventName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="eventType">Teaching / Non Teaching Day:</label>
            <select
              id="eventType"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              <option value="teaching">Teaching</option>
              <option value="non-teaching">Non-Teaching</option>
            </select>
            <label>
              <input
                type="checkbox"
                name="Holiday"
                checked={holidayState}
                onChange={() => setHolidayState(!holidayState)}
                style={{ marginLeft: '20px' }}
              />
              Holiday
            </label>
          </div>
          <div className="button-container">
            <button type="subbmit_button" onClick={handleEventCreate}>Create Event</button>
            <button type="button" onClick={handleModalClose}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EventScheduler;
