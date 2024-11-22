// components/Overlay.js

import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';

const Overlay = ({ type, closeOverlay, protocol, setProtocol }) => {
  const [compounds, setCompounds] = useState([]);
  const [compoundData, setCompoundData] = useState({
    name: '',
    type: '',
    category: '',
    molecularWeight: '',
    halfLife: '',
    halfLifeUnit: 'hours',
    Cmax: '',
    Tmax: '',
    TmaxUnit: 'hours',
    bioavailability: '',
    model: '',
    notes: '',
  });
  const [selectedCompound, setSelectedCompound] = useState(null);
  const [newCompoundData, setNewCompoundData] = useState({
    dose: '',
    doseUnit: 'mg',
    offsetDays: 0,
    dosingSchedule: 'Once a day',
    durationFrom: 1,
    durationTo: protocol ? protocol.length : 1,
    adjustLevels: 0,
    accumulate: true,
    compare: false,
  });

  // Fetch compounds from local_library
  const fetchCompounds = async () => {
    try {
      const response = await window.electronAPI.invoke('get-compounds');
      setCompounds(response);
    } catch (error) {
      console.error('Error fetching compounds:', error);
      alert('Failed to load compounds.');
    }
  };

  useEffect(() => {
    fetchCompounds();
  }, [type]); // Re-fetch compounds when overlay type changes

  const handleAddCompound = () => {
    if (!protocol) {
      alert('No protocol selected.');
      return;
    }
    if (!selectedCompound) {
      alert('Please select a compound.');
      return;
    }
    if (!newCompoundData.dose || isNaN(newCompoundData.dose)) {
      alert('Please enter a valid dose.');
      return;
    }
    // Add compound to protocol
    const updatedProtocol = {
      ...protocol,
      compounds: [
        ...protocol.compounds,
        {
          ...selectedCompound,
          ...newCompoundData,
          startDay: newCompoundData.durationFrom,
          endDay: newCompoundData.durationTo,
        },
      ],
    };
    setProtocol(updatedProtocol);
    closeOverlay();
  };

  const handleSaveCompound = async () => {
    // Validate required fields
    const requiredFields = ['name', 'halfLife', 'Cmax', 'bioavailability'];
    for (const field of requiredFields) {
      if (!compoundData[field]) {
        alert(`Please fill out the required field: ${field}`);
        return;
      }
    }

    // Ensure numeric fields are numbers
    const numericFields = ['molecularWeight', 'halfLife', 'Cmax', 'Tmax', 'bioavailability'];
    for (const field of numericFields) {
      if (compoundData[field] && isNaN(parseFloat(compoundData[field]))) {
        alert(`Please enter a valid number for ${field}`);
        return;
      }
    }

    try {
      await window.electronAPI.invoke('add-compound', compoundData);
      alert('Compound saved successfully!');
      await fetchCompounds(); // Refresh compounds list
      setCompoundData({
        name: '',
        type: '',
        category: '',
        molecularWeight: '',
        halfLife: '',
        halfLifeUnit: 'hours',
        Cmax: '',
        Tmax: '',
        TmaxUnit: 'hours',
        bioavailability: '',
        model: '',
        notes: '',
      });
      closeOverlay();
    } catch (error) {
      console.error('Error saving compound:', error);
      alert('Failed to save compound.');
    }
  };

  const handleResetCompound = () => {
    setNewCompoundData({
      dose: '',
      doseUnit: 'mg',
      offsetDays: 0,
      dosingSchedule: 'Once a day',
      durationFrom: 1,
      durationTo: protocol ? protocol.length : 1,
      adjustLevels: 0,
      accumulate: false,
      compare: false,
    });
    setSelectedCompound(null);
  };

  const handleCompoundDataChange = (e) => {
    const { name, value } = e.target;
    setCompoundData({ ...compoundData, [name]: value });
  };

  const handleNewCompoundDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewCompoundData({
      ...newCompoundData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  return (
    <Draggable
      handle=".overlay-header"
      cancel=".overlay-content input, .overlay-content textarea, .overlay-content select"
    >
      <div className="overlay">
        <div className="overlay-header">
          <span>
            {type === 'newCompound'
              ? 'New Compound'
              : type === 'addCompound'
              ? 'Add Compound'
              : 'Compound Index'}
          </span>
          <button onClick={closeOverlay}>X</button>
        </div>
        <div className="overlay-content">
          {type === 'newCompound' && (
            <div>
              <h2>Add New Compound</h2>
              <label>
                Compound Name:
                <input
                  type="text"
                  name="name"
                  value={compoundData.name}
                  onChange={handleCompoundDataChange}
                  placeholder="Enter compound name"
                />
              </label>
              <label>
                Type:
                <input
                  type="text"
                  name="type"
                  value={compoundData.type}
                  onChange={handleCompoundDataChange}
                  placeholder="Enter type"
                />
              </label>
              <label>
                Category:
                <input
                  type="text"
                  name="category"
                  value={compoundData.category}
                  onChange={handleCompoundDataChange}
                  placeholder="Enter category"
                />
              </label>
              <label>
                Molecular Weight (g/mol):
                <input
                  type="number"
                  name="molecularWeight"
                  value={compoundData.molecularWeight}
                  onChange={handleCompoundDataChange}
                  placeholder="Enter molecular weight"
                />
              </label>
              <label>
                Half-Life:
                <input
                  type="number"
                  name="halfLife"
                  value={compoundData.halfLife}
                  onChange={handleCompoundDataChange}
                  placeholder="Enter half-life"
                />
                <select
                  name="halfLifeUnit"
                  value={compoundData.halfLifeUnit}
                  onChange={handleCompoundDataChange}
                >
                  <option value="seconds">Seconds</option>
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </label>
              <label>
                Cmax:
                <input
                  type="number"
                  name="Cmax"
                  value={compoundData.Cmax}
                  onChange={handleCompoundDataChange}
                  placeholder="Enter Cmax"
                />
                <span>ng/ml</span>
              </label>
              <label>
                Tmax:
                <input
                  type="number"
                  name="Tmax"
                  value={compoundData.Tmax}
                  onChange={handleCompoundDataChange}
                  placeholder="Enter Tmax"
                />
                <select
                  name="TmaxUnit"
                  value={compoundData.TmaxUnit}
                  onChange={handleCompoundDataChange}
                >
                  <option value="seconds">Seconds</option>
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </label>
              <label>
                Bioavailability:
                <input
                  type="number"
                  name="bioavailability"
                  value={compoundData.bioavailability}
                  onChange={handleCompoundDataChange}
                  placeholder="Enter value between 0 and 1"
                  min="0"
                  max="1"
                  step="0.01"
                />
              </label>
              <label>
                Model:
                <input
                  type="text"
                  name="model"
                  value={compoundData.model}
                  onChange={handleCompoundDataChange}
                  placeholder="Enter model"
                />
              </label>
              <label>
                Notes:
                <textarea
                  name="notes"
                  value={compoundData.notes}
                  onChange={handleCompoundDataChange}
                  placeholder="Enter any notes"
                ></textarea>
              </label>
              <button onClick={handleSaveCompound}>Save Compound</button>
            </div>
          )}
          {type === 'addCompound' && (
            <div>
              <label>
                Select Compound:
                <select
                  onChange={(e) => {
                    const compound = compounds.find(
                      (c) => c.name === e.target.value
                    );
                    setSelectedCompound(compound);
                  }}
                >
                  <option value="">Select Compound</option>
                  {compounds.map((compound) => (
                    <option key={compound.name} value={compound.name}>
                      {compound.name}
                    </option>
                  ))}
                </select>
              </label>
              {selectedCompound && (
                <div>
                  <label>
                    Dosage:
                    <input
                      type="number"
                      name="dose"
                      value={newCompoundData.dose}
                      onChange={handleNewCompoundDataChange}
                      placeholder="Enter dosage"
                    />
                    <select
                      name="doseUnit"
                      value={newCompoundData.doseUnit}
                      onChange={handleNewCompoundDataChange}
                    >
                      <option value="mcg">mcg</option>
                      <option value="mg">mg</option>
                      <option value="g">g</option>
                    </select>
                  </label>
                  <label>
                    Offset (days):
                    <input
                      type="number"
                      name="offsetDays"
                      value={newCompoundData.offsetDays}
                      onChange={handleNewCompoundDataChange}
                      placeholder="Enter offset in days"
                    />
                  </label>
                  <label>
                    Dosing Schedule:
                    <select
                      name="dosingSchedule"
                      value={newCompoundData.dosingSchedule}
                      onChange={handleNewCompoundDataChange}
                    >
                      <option value="4 times a day">4 times a day</option>
                      <option value="3 times a day">3 times a day</option>
                      <option value="2 times a day">2 times a day</option>
                      <option value="Once a day">Once a day</option>
                      <option value="Every other day">Every other day</option>
                      <option value="3 times a week">3 times a week</option>
                      <option value="Once every 3 days">
                        Once every 3 days
                      </option>
                      <option value="Once every 3.5 days">
                        Once every 3.5 days
                      </option>
                      <option value="Once every 4 days">
                        Once every 4 days
                      </option>
                      <option value="Once every 5 days">
                        Once every 5 days
                      </option>
                      <option value="Once every 6 days">
                        Once every 6 days
                      </option>
                      <option value="Once every 7 days">
                        Once every 7 days
                      </option>
                    </select>
                  </label>
                  <label>
                    Duration:
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      From Week:
                      <input
                        type="number"
                        name="durationFrom"
                        value={newCompoundData.durationFrom}
                        onChange={handleNewCompoundDataChange}
                        min="1"
                        max={protocol.length}
                        style={{ marginLeft: '5px', marginRight: '15px' }}
                        placeholder="Start week"
                      />
                      Through Week:
                      <input
                        type="number"
                        name="durationTo"
                        value={newCompoundData.durationTo}
                        onChange={handleNewCompoundDataChange}
                        min={newCompoundData.durationFrom}
                        max={protocol.length}
                        style={{ marginLeft: '5px' }}
                        placeholder="End week"
                      />
                    </div>
                  </label>
                  <label>
                    Adjust Levels ({newCompoundData.adjustLevels}%):
                    <input
                      type="range"
                      name="adjustLevels"
                      min="-100"
                      max="100"
                      value={newCompoundData.adjustLevels}
                      onChange={handleNewCompoundDataChange}
                    />
                  </label>
                  <label>
                    Accumulate:
                    <input
                      type="checkbox"
                      name="accumulate"
                      checked={newCompoundData.accumulate}
                      onChange={handleNewCompoundDataChange}
                    />
                  </label>
                  <label>
                    Compare:
                    <input
                      type="checkbox"
                      name="compare"
                      checked={newCompoundData.compare}
                      onChange={handleNewCompoundDataChange}
                    />
                  </label>
                  <div style={{ display: 'flex', marginTop: '10px' }}>
                    <button onClick={handleAddCompound}>Add</button>
                    <button
                      onClick={handleResetCompound}
                      style={{ backgroundColor: '#ff5c5c', marginLeft: '10px' }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {type === 'compoundIndex' && (
            <div>
              <label>
                Select Compound:
                <select
                  onChange={(e) => {
                    const compound = compounds.find(
                      (c) => c.name === e.target.value
                    );
                    setSelectedCompound(compound);
                  }}
                >
                  <option value="">Select Compound</option>
                  {compounds.map((compound) => (
                    <option key={compound.name} value={compound.name}>
                      {compound.name}
                    </option>
                  ))}
                </select>
              </label>
              {selectedCompound && (
                <div>
                  <h3>{selectedCompound.name}</h3>
                  <p>Type: {selectedCompound.type}</p>
                  <p>Category: {selectedCompound.category}</p>
                  <p>Molecular Weight: {selectedCompound.molecularWeight}</p>
                  <p>
                    Half-Life: {selectedCompound.halfLife}{' '}
                    {selectedCompound.halfLifeUnit}
                  </p>
                  <p>Cmax: {selectedCompound.Cmax} ng/ml</p>
                  <p>
                    Tmax: {selectedCompound.Tmax} {selectedCompound.TmaxUnit}
                  </p>
                  <p>Bioavailability: {selectedCompound.bioavailability}</p>
                  <p>Model: {selectedCompound.model}</p>
                  <p>Notes: {selectedCompound.notes}</p>
                </div>
              )}
              <button onClick={closeOverlay}>Close</button>
            </div>
          )}
        </div>
      </div>
    </Draggable>
  );
};

export default Overlay;
