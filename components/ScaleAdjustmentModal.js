// components/ScaleAdjustmentModal.js

import React, { useState } from 'react';

const ScaleAdjustmentModal = ({ onClose, onSave }) => {
  const [scaleSettings, setScaleSettings] = useState({
    timeUnit: 'hours', // 'hours', 'days', or 'weeks'
    minorTickInterval: 1,
    majorTickInterval: 24,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setScaleSettings({ ...scaleSettings, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(scaleSettings);
  };

  return (
    <div className="overlay">
      <div className="overlay-header">
        <span>Adjust Graph Scales</span>
        <button onClick={onClose}>X</button>
      </div>
      <div className="overlay-content">
        <form onSubmit={handleSubmit}>
          <label>
            Time Unit:
            <select
              name="timeUnit"
              value={scaleSettings.timeUnit}
              onChange={handleChange}
            >
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
            </select>
          </label>
          <label>
            Minor Tick Interval:
            <input
              type="number"
              name="minorTickInterval"
              value={scaleSettings.minorTickInterval}
              onChange={handleChange}
            />
          </label>
          <label>
            Major Tick Interval:
            <input
              type="number"
              name="majorTickInterval"
              value={scaleSettings.majorTickInterval}
              onChange={handleChange}
            />
          </label>
          <button type="submit">Save</button>
        </form>
      </div>
    </div>
  );
};

export default ScaleAdjustmentModal;
