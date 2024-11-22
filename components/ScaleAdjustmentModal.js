// components/ScaleAdjustmentModal.js

import React, { useState } from 'react';

const ScaleAdjustmentModal = ({ onClose, onSave }) => {
  const [scaleSettings, setScaleSettings] = useState({
    timeUnit: 'weeks', // 'days' or 'weeks'
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
              <option value="weeks">Weeks</option>
              <option value="days">Days</option>
            </select>
          </label>
          <button type="submit">Save</button>
        </form>
      </div>
    </div>
  );
};

export default ScaleAdjustmentModal;
