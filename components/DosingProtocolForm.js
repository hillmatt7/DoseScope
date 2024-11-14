// DosingProtocolForm.js
import React, { useState } from 'react';

const DosingProtocolForm = () => {
  const [protocolData, setProtocolData] = useState({
    drugName: '',
    dose: '',
    frequency: '',
    offsetDays: '',
    lengthWeeks: '',
    startDate: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProtocolData({
      ...protocolData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    window.electronAPI.send('add-protocol', protocolData); // Use the exposed API
    alert('Protocol added successfully!');
    setProtocolData({
      drugName: '',
      dose: '',
      frequency: '',
      offsetDays: '',
      lengthWeeks: '',
      startDate: '',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="drugName"
        placeholder="Drug Name"
        value={protocolData.drugName}
        onChange={handleChange}
      />
      <input
        type="text"
        name="dose"
        placeholder="Dose"
        value={protocolData.dose}
        onChange={handleChange}
      />
      <input
        type="text"
        name="frequency"
        placeholder="Frequency"
        value={protocolData.frequency}
        onChange={handleChange}
      />
      <input
        type="text"
        name="offsetDays"
        placeholder="Offset Days"
        value={protocolData.offsetDays}
        onChange={handleChange}
      />
      <input
        type="text"
        name="lengthWeeks"
        placeholder="Length in Weeks"
        value={protocolData.lengthWeeks}
        onChange={handleChange}
      />
      <input
        type="date"
        name="startDate"
        value={protocolData.startDate}
        onChange={handleChange}
      />
      <button type="submit">Add Protocol</button>
    </form>
  );
};

export default DosingProtocolForm;
