// ProtocolBuilder.js
import React, { useState, useEffect } from 'react';

const ProtocolBuilder = () => {
  const [protocolData, setProtocolData] = useState({
    protocolTitle: '',
    userName: '',
    cycleLength: 12,
    cycleLengthUnit: 'weeks',
    startDate: '',
    sharedURL: false,
    compounds: [],
  });

  const [compound, setCompound] = useState({
    drugName: '',
    dose: '',
    doseUnit: 'mg',
    offsetDays: 0,
    dosingSchedule: 'Once a Day',
    durationFrom: 1,
    durationTo: 12,
    adjustLevels: 0,
    accumulate: false,
    compare: false,
  });

  const [showDrugSearch, setShowDrugSearch] = useState(false);
  const [drugSearchTerm, setDrugSearchTerm] = useState('');
  const [drugResults, setDrugResults] = useState([]);
  const [allDrugs, setAllDrugs] = useState([]);

  useEffect(() => {
    const fetchDrugs = async () => {
      const response = await window.electronAPI.invoke('get-drugs');
      setAllDrugs(response);
    };
    fetchDrugs();
  }, []);

  useEffect(() => {
    const results = allDrugs.filter((drug) =>
      drug.name.toLowerCase().includes(drugSearchTerm.toLowerCase())
    );
    setDrugResults(results);
  }, [drugSearchTerm, allDrugs]);

  const handleProtocolChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProtocolData({
      ...protocolData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleCompoundChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCompound({
      ...compound,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const addCompound = () => {
    setProtocolData({
      ...protocolData,
      compounds: [...protocolData.compounds, compound],
    });
    // Reset compound form
    setCompound({
      drugName: '',
      dose: '',
      doseUnit: 'mg',
      offsetDays: 0,
      dosingSchedule: 'Once a Day',
      durationFrom: 1,
      durationTo: protocolData.cycleLength,
      adjustLevels: 0,
      accumulate: false,
      compare: false,
    });
  };

  const resetProtocol = () => {
    setProtocolData({
      protocolTitle: '',
      userName: '',
      cycleLength: 12,
      cycleLengthUnit: 'weeks',
      startDate: '',
      sharedURL: false,
      compounds: [],
    });
    setCompound({
      drugName: '',
      dose: '',
      doseUnit: 'mg',
      offsetDays: 0,
      dosingSchedule: 'Once a Day',
      durationFrom: 1,
      durationTo: 12,
      adjustLevels: 0,
      accumulate: false,
      compare: false,
    });
    setShowDrugSearch(false);
    setDrugSearchTerm('');
  };

  const handleSubmit = () => {
    // Validate input fields
    if (!protocolData.protocolTitle) {
      alert('Please enter a protocol title.');
      return;
    }
    if (!protocolData.startDate) {
      alert('Please select a start date.');
      return;
    }
    if (protocolData.compounds.length === 0) {
      alert('Please add at least one compound.');
      return;
    }

    window.electronAPI.send('add-protocol', protocolData);
    alert('Protocol saved successfully!');
    resetProtocol();
  };

  return (
    <div className="protocol-builder">
      <h2>Build Your Protocol</h2>
      <div>
        <input
          type="text"
          name="protocolTitle"
          placeholder="Name your cycle/protocol"
          value={protocolData.protocolTitle}
          onChange={handleProtocolChange}
        />
        <input
          type="text"
          name="userName"
          placeholder="Your Name"
          value={protocolData.userName}
          onChange={handleProtocolChange}
        />
      </div>
      <div>
        <label>
          Cycle Length:
          <input
            type="number"
            name="cycleLength"
            value={protocolData.cycleLength}
            onChange={handleProtocolChange}
            min="1"
          />
        </label>
        <select
          name="cycleLengthUnit"
          value={protocolData.cycleLengthUnit}
          onChange={handleProtocolChange}
        >
          <option value="weeks">Weeks</option>
          <option value="days">Days</option>
        </select>
        <label>
          Start Date:
          <input
            type="date"
            name="startDate"
            value={protocolData.startDate}
            onChange={handleProtocolChange}
          />
        </label>
        <label>
          <input
            type="checkbox"
            name="sharedURL"
            checked={protocolData.sharedURL}
            onChange={handleProtocolChange}
          />
          Shared URL always reflects user's current date
        </label>
      </div>
      <h3>Compound(s)</h3>
      <div>
        <button onClick={() => setShowDrugSearch(true)}>Add Drug</button>
        {showDrugSearch && (
          <div className="drug-search">
            <input
              type="text"
              placeholder="Search Drug..."
              value={drugSearchTerm}
              onChange={(e) => setDrugSearchTerm(e.target.value)}
            />
            <ul>
              {drugResults.map((drug) => (
                <li key={drug.name}>
                  <button
                    type="button"
                    onClick={() => {
                      setCompound({ ...compound, drugName: drug.name });
                      setDrugSearchTerm('');
                      setShowDrugSearch(false);
                    }}
                  >
                    {drug.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {compound.drugName && (
        <div className="compound-details">
          <h4>{compound.drugName}</h4>
          <div>
            <label>
              Dosage:
              <input
                type="number"
                name="dose"
                value={compound.dose}
                onChange={handleCompoundChange}
              />
              <select
                name="doseUnit"
                value={compound.doseUnit}
                onChange={handleCompoundChange}
              >
                <option value="mcg">mcg</option>
                <option value="mg">mg</option>
                <option value="g">g</option>
              </select>
            </label>
          </div>
          <div>
            <label>
              Offset (days):
              <input
                type="number"
                name="offsetDays"
                value={compound.offsetDays}
                onChange={handleCompoundChange}
              />
            </label>
          </div>
          <div>
            <label>
              Dosing Schedule:
              <select
                name="dosingSchedule"
                value={compound.dosingSchedule}
                onChange={handleCompoundChange}
              >
                <option value="4x a day">4 times a day</option>
                <option value="3x a day">3 times a day</option>
                <option value="2x a day">2 times a day</option>
                <option value="Once a Day">Once a day</option>
                <option value="Every Other Day">Every other day</option>
                <option value="Three Times a Week">Three times a week</option>
                <option value="Once Every 3 Days">Once every 3 days</option>
                <option value="Once Every 3.5 Days">Once every 3.5 days</option>
                <option value="Once Every 4 Days">Once every 4 days</option>
                <option value="Once Every 5 Days">Once every 5 days</option>
                <option value="Once Every 6 Days">Once every 6 days</option>
                <option value="Once Every 7 Days">Once every 7 days</option>
              </select>
            </label>
          </div>
          <div>
            <label>
              Duration From Week:
              <input
                type="number"
                name="durationFrom"
                value={compound.durationFrom}
                onChange={handleCompoundChange}
                min="1"
                max={protocolData.cycleLength}
              />
            </label>
            <label>
              Through Week:
              <input
                type="number"
                name="durationTo"
                value={compound.durationTo}
                onChange={handleCompoundChange}
                min={compound.durationFrom}
                max={protocolData.cycleLength}
              />
            </label>
          </div>
          <div>
            <label>
              Adjust Levels:
              <input
                type="range"
                name="adjustLevels"
                min="-100"
                max="100"
                value={compound.adjustLevels}
                onChange={handleCompoundChange}
              />
              {compound.adjustLevels}%
            </label>
          </div>
          <div>
            <label>
              Accumulate:
              <input
                type="checkbox"
                name="accumulate"
                checked={compound.accumulate}
                onChange={handleCompoundChange}
              />
            </label>
            <label>
              Compare:
              <input
                type="checkbox"
                name="compare"
                checked={compound.compare}
                onChange={handleCompoundChange}
              />
            </label>
          </div>
          <button onClick={addCompound}>Add</button>
        </div>
      )}
      <button onClick={resetProtocol}>Reset</button>
      <button onClick={handleSubmit}>Save Protocol</button>
    </div>
  );
};

export default ProtocolBuilder;
