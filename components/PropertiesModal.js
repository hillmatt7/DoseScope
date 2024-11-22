// components/PropertiesModal.js

import React, { useState } from 'react';

const PropertiesModal = ({ protocol, onClose, onUpdate }) => {
  const [protocolData, setProtocolData] = useState({ ...protocol });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!protocolData.name) {
      alert('Protocol name cannot be empty.');
      return;
    }
    if (!protocolData.length || isNaN(protocolData.length)) {
      alert('Please enter a valid protocol length.');
      return;
    }
    onUpdate(protocolData);
  };

  return (
    <div className="overlay">
      <div className="overlay-header">
        <span>Properties</span>
        <button onClick={onClose}>X</button>
      </div>
      <div className="overlay-content">
        <form onSubmit={handleSubmit}>
          <label>
            Protocol Name:
            <input
              type="text"
              name="name"
              value={protocolData.name}
              onChange={(e) =>
                setProtocolData({ ...protocolData, name: e.target.value })
              }
            />
          </label>
          <label>
            Protocol Length:
            <input
              type="number"
              name="length"
              value={protocolData.length}
              onChange={(e) =>
                setProtocolData({ ...protocolData, length: e.target.value })
              }
            />
            <select
              name="lengthUnit"
              value={protocolData.lengthUnit}
              onChange={(e) =>
                setProtocolData({ ...protocolData, lengthUnit: e.target.value })
              }
            >
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
            </select>
          </label>
          <label>
            Start Date (Optional):
            <input
              type="date"
              name="startDate"
              value={protocolData.startDate}
              onChange={(e) =>
                setProtocolData({ ...protocolData, startDate: e.target.value })
              }
            />
          </label>
          {/* Add other properties as needed */}
          <button type="submit">Update Protocol</button>
        </form>
      </div>
    </div>
  );
};

export default PropertiesModal;

