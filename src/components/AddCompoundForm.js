// components/AddCompoundForm.js

import React, { useState } from 'react';

const AddCompoundForm = () => {
  const [compoundData, setCompoundData] = useState({
    name: '',
    type: '',
    category: '',
    molecularWeight: '',
    halfLife: '',
    halfLifeUnit: 'hours',
    Cmax: '',
    Tmax: '',
    bioavailability: '',
    model: '',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompoundData({ ...compoundData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!compoundData.name || !compoundData.halfLife || !compoundData.Cmax || !compoundData.bioavailability) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      await window.electronAPI.invoke('add-compound', compoundData);
      alert('Compound saved successfully!');
      setCompoundData({
        name: '',
        type: '',
        category: '',
        molecularWeight: '',
        halfLife: '',
        halfLifeUnit: 'hours',
        Cmax: '',
        Tmax: '',
        bioavailability: '',
        model: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error saving compound:', error);
      alert('Failed to save compound.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-compound-form">
      <h2>Add New Compound</h2>
      <input
        type="text"
        name="name"
        placeholder="Compound Name (required)"
        value={compoundData.name}
        onChange={handleChange}
      />
      <input
        type="text"
        name="type"
        placeholder="Type (optional)"
        value={compoundData.type}
        onChange={handleChange}
      />
      <input
        type="text"
        name="category"
        placeholder="Category (optional)"
        value={compoundData.category}
        onChange={handleChange}
      />
      <input
        type="number"
        name="molecularWeight"
        placeholder="Molecular Weight (optional)"
        value={compoundData.molecularWeight}
        onChange={handleChange}
      />
      <input
        type="number"
        name="halfLife"
        placeholder="Half-Life (hours, required)"
        value={compoundData.halfLife}
        onChange={handleChange}
      />
      <select
        name="halfLifeUnit"
        value={compoundData.halfLifeUnit}
        onChange={handleChange}
      >
        <option value="hours">Hours</option>
        <option value="days">Days</option>
      </select>
      <input
        type="number"
        name="Cmax"
        placeholder="Cmax (ng/ml, required)"
        value={compoundData.Cmax}
        onChange={handleChange}
      />
      <input
        type="number"
        name="Tmax"
        placeholder="Tmax (hours, optional)"
        value={compoundData.Tmax}
        onChange={handleChange}
      />
      <input
        type="number"
        name="bioavailability"
        placeholder="Bioavailability (0-1, required)"
        value={compoundData.bioavailability}
        onChange={handleChange}
      />
      <input
        type="text"
        name="model"
        placeholder="Model (optional)"
        value={compoundData.model}
        onChange={handleChange}
      />
      <textarea
        name="notes"
        placeholder="Notes (optional)"
        value={compoundData.notes}
        onChange={handleChange}
      ></textarea>
      <button type="submit">Add Compound</button>
    </form>
  );
};

export default AddCompoundForm;
