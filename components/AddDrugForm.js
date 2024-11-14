// AddDrugForm.js
import React, { useState } from 'react';

const AddDrugForm = () => {
  const [drugData, setDrugData] = useState({
    name: '',
    molecularWeight: '',
    esters: false,
    halfLife: '',
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
    window.electronAPI.send('add-drug', drugData); // Use the exposed API
    alert('Drug added successfully!');
    setDrugData({
      name: '',
      molecularWeight: '',
      esters: false,
      halfLife: '',
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
        type="text"
        name="molecularWeight"
        placeholder="Molecular Weight"
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
      <input
        type="text"
        name="halfLife"
        placeholder="Half-Life"
        value={drugData.halfLife}
        onChange={handleChange}
      />
      <button type="submit">Add Drug</button>
    </form>
  );
};

export default AddDrugForm;
