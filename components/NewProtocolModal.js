// components/NewProtocolModal.js
import React, { useState } from 'react';

const NewProtocolModal = ({ onClose, onCreate }) => {
  const [protocolData, setProtocolData] = useState({
    name: '',
    length: '',
    lengthUnit: 'weeks',
    startDate: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!protocolData.name) {
      alert('Please enter a protocol name.');
      return;
    }
    if (!protocolData.length || isNaN(protocolData.length)) {
      alert('Please enter a valid protocol length.');
      return;
    }
    onCreate(protocolData);
  };

  return (
    <div className="overlay">
      <div className="overlay-header">
        <span>New Protocol</span>
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
          <button type="submit">Create Protocol</button>
        </form>
      </div>
    </div>
  );
};

export default NewProtocolModal;
