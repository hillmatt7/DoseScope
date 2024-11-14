// AddDrugForm.js
import React, { useState } from 'react';

const AddDrugForm = () => {
  const [drugData, setDrugData] = useState({
    name: '',
    molecularWeight: '',
    esters: false,
    halfLife: '',
    halfLifeUnit: 'hours', // Added unit
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDrugData({
      ...drugData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Input validation
    if (!drugData.name) {
      alert('Please enter the drug name.');
      return;
    }
    if (isNaN(parseFloat(drugData.molecularWeight))) {
      alert('Please enter a valid molecular weight.');
      return;
    }
    if (isNaN(parseFloat(drugData.halfLife))) {
      alert('Please enter a valid half-life.');
      return;
    }

    // Save the drug data
    window.electronAPI.send('add-drug', drugData);
    alert('Drug added successfully!');
    setDrugData({
      name: '',
      molecularWeight: '',
      esters: false,
      halfLife: '',
      halfLifeUnit: 'hours',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Drug Name"
        value={drugData.name}
        onChange={handleChange}
      />
      <input
        type="number"
        name="molecularWeight"
        placeholder="Molecular Weight (g/mol)"
        value={drugData.molecularWeight}
        onChange={handleChange}
      />
      <label>
        Esters
        <input
          type="checkbox"
          name="esters"
          checked={drugData.esters}
          onChange={handleChange}
        />
      </label>
      <div>
        <input
          type="number"
          name="halfLife"
          placeholder="Half-Life"
          value={drugData.halfLife}
          onChange={handleChange}
        />
        <select
          name="halfLifeUnit"
          value={drugData.halfLifeUnit}
          onChange={handleChange}
        >
          <option value="seconds">Seconds</option>
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
          <option value="days">Days</option>
        </select>
      </div>
      <button type="submit">Add Drug</button>
    </form>
  );
};

export default AddDrugForm;
