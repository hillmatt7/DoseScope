// components/DosingProtocolForm.js

import React, { useState, useEffect } from 'react';

const DosingProtocolForm = () => {
  const [protocolData, setProtocolData] = useState({
    protocolTitle: '',
    compoundName: '',
    dose: '',
    doseUnit: 'mg',
    frequency: '',
    frequencyUnit: 'days',
    offsetDays: '',
    length: '',
    lengthUnit: 'weeks',
    startDate: '',
  });

  const [compoundSearchTerm, setCompoundSearchTerm] = useState('');
  const [compoundResults, setCompoundResults] = useState([]);
  const [allCompounds, setAllCompounds] = useState([]);

  useEffect(() => {
    const fetchCompounds = async () => {
      const response = await window.electronAPI.invoke('get-compounds');
      setAllCompounds(response);
    };
    fetchCompounds();
  }, []);

  useEffect(() => {
    const results = allCompounds.filter((compound) =>
      compound.name.toLowerCase().includes(compoundSearchTerm.toLowerCase())
    );
    setCompoundResults(results);
  }, [compoundSearchTerm, allCompounds]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProtocolData({
      ...protocolData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Input validation
    if (!protocolData.protocolTitle) {
      alert('Please enter the protocol title.');
      return;
    }
    if (!protocolData.compoundName) {
      alert('Please select a compound.');
      return;
    }
    if (isNaN(parseFloat(protocolData.dose))) {
      alert('Please enter a valid dose.');
      return;
    }
    if (isNaN(parseFloat(protocolData.frequency))) {
      alert('Please enter a valid frequency.');
      return;
    }
    if (isNaN(parseFloat(protocolData.offsetDays))) {
      alert('Please enter a valid offset.');
      return;
    }
    if (isNaN(parseFloat(protocolData.length))) {
      alert('Please enter a valid length.');
      return;
    }
    if (!protocolData.startDate) {
      alert('Please select a start date.');
      return;
    }

    // Save the protocol data
    window.electronAPI.send('add-protocol', protocolData);
    alert('Protocol added successfully!');
    setProtocolData({
      protocolTitle: '',
      compoundName: '',
      dose: '',
      doseUnit: 'mg',
      frequency: '',
      frequencyUnit: 'days',
      offsetDays: '',
      length: '',
      lengthUnit: 'weeks',
      startDate: '',
    });
    setCompoundSearchTerm('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="protocolTitle"
        placeholder="Protocol Title"
        value={protocolData.protocolTitle}
        onChange={handleChange}
      />
      {/* Compound Search */}
      <input
        type="text"
        placeholder="Search Compound..."
        value={compoundSearchTerm}
        onChange={(e) => setCompoundSearchTerm(e.target.value)}
      />
      <ul>
        {compoundResults.map((compound) => (
          <li key={compound.name}>
            <button
              type="button"
              onClick={() => {
                setProtocolData({ ...protocolData, compoundName: compound.name });
                setCompoundSearchTerm(compound.name);
                setCompoundResults([]);
              }}
            >
              {compound.name}
            </button>
          </li>
        ))}
      </ul>
      <input
        type="number"
        name="dose"
        placeholder="Dose"
        value={protocolData.dose}
        onChange={handleChange}
      />
      <select
        name="doseUnit"
        value={protocolData.doseUnit}
        onChange={handleChange}
      >
        <option value="mcg">mcg</option>
        <option value="mg">mg</option>
        <option value="g">g</option>
      </select>
      <input
        type="number"
        name="frequency"
        placeholder="Frequency"
        value={protocolData.frequency}
        onChange={handleChange}
      />
      <select
        name="frequencyUnit"
        value={protocolData.frequencyUnit}
        onChange={handleChange}
      >
        <option value="hours">Hours</option>
        <option value="days">Days</option>
        <option value="weeks">Weeks</option>
      </select>
      <input
        type="number"
        name="offsetDays"
        placeholder="Offset"
        value={protocolData.offsetDays}
        onChange={handleChange}
      />
      <input
        type="number"
        name="length"
        placeholder="Length"
        value={protocolData.length}
        onChange={handleChange}
      />
      <select
        name="lengthUnit"
        value={protocolData.lengthUnit}
        onChange={handleChange}
      >
        <option value="days">Days</option>
        <option value="weeks">Weeks</option>
      </select>
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
