import React, { useState } from 'react';

const AddDrugForm = () => {
  const [drugData, setDrugData] = useState({
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
    setDrugData({ ...drugData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!drugData.name || !drugData.halfLife || !drugData.Cmax || !drugData.bioavailability) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      await window.electronAPI.invoke('add-compound', drugData);
      alert('Drug saved successfully!');
      setDrugData({
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
      console.error('Error saving drug:', error);
      alert('Failed to save drug.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-drug-form">
      <h2>Add New Drug</h2>
      <input
        type="text"
        name="name"
        placeholder="Drug Name (required)"
        value={drugData.name}
        onChange={handleChange}
      />
      <input
        type="text"
        name="type"
        placeholder="Type (optional)"
        value={drugData.type}
        onChange={handleChange}
      />
      <input
        type="text"
        name="category"
        placeholder="Category (optional)"
        value={drugData.category}
        onChange={handleChange}
      />
      <input
        type="number"
        name="molecularWeight"
        placeholder="Molecular Weight (optional)"
        value={drugData.molecularWeight}
        onChange={handleChange}
      />
      <input
        type="number"
        name="halfLife"
        placeholder="Half-Life (hours, required)"
        value={drugData.halfLife}
        onChange={handleChange}
      />
      <select
        name="halfLifeUnit"
        value={drugData.halfLifeUnit}
        onChange={handleChange}
      >
        <option value="hours">Hours</option>
        <option value="days">Days</option>
      </select>
      <input
        type="number"
        name="Cmax"
        placeholder="Cmax (ng/ml, required)"
        value={drugData.Cmax}
        onChange={handleChange}
      />
      <input
        type="number"
        name="Tmax"
        placeholder="Tmax (hours, optional)"
        value={drugData.Tmax}
        onChange={handleChange}
      />
      <input
        type="number"
        name="bioavailability"
        placeholder="Bioavailability (0-1, required)"
        value={drugData.bioavailability}
        onChange={handleChange}
      />
      <input
        type="text"
        name="model"
        placeholder="Model (optional)"
        value={drugData.model}
        onChange={handleChange}
      />
      <textarea
        name="notes"
        placeholder="Notes (optional)"
        value={drugData.notes}
        onChange={handleChange}
      ></textarea>
      <button type="submit">Add Drug</button>
    </form>
  );
};

export default AddDrugForm;
