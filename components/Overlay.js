// components/Overlay.js
import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';

const Overlay = ({ type, closeOverlay, protocol, setProtocol }) => {
  const [compounds, setCompounds] = useState([]);
  const [compoundData, setCompoundData] = useState({
    name: '',
    molecularWeight: '',
    halfLife: '',
    halfLifeUnit: 'hours',
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
    accumulate: false,
    compare: false,
  });

  useEffect(() => {
    const fetchCompounds = async () => {
      const response = await window.electronAPI.invoke('get-compounds');
      setCompounds(response);
    };
    fetchCompounds();
  }, []);

  const handleAddCompound = () => {
    if (!protocol) {
      alert('No protocol selected.');
      return;
    }
    if (!selectedCompound) {
      alert('Please select a compound.');
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

  const handleNewCompound = () => {
    // Save new compound
    window.electronAPI.send('add-compound', compoundData);
    alert('Compound added successfully!');
    closeOverlay();
  };

  return (
    <Draggable handle=".overlay-header">
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
              <label>
                Compound Name:
                <input
                  type="text"
                  name="name"
                  value={compoundData.name}
                  onChange={(e) =>
                    setCompoundData({ ...compoundData, name: e.target.value })
                  }
                />
              </label>
              <label>
                Molecular Weight:
                <input
                  type="number"
                  name="molecularWeight"
                  value={compoundData.molecularWeight}
                  onChange={(e) =>
                    setCompoundData({
                      ...compoundData,
                      molecularWeight: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Half-Life:
                <input
                  type="number"
                  name="halfLife"
                  value={compoundData.halfLife}
                  onChange={(e) =>
                    setCompoundData({ ...compoundData, halfLife: e.target.value })
                  }
                />
                <select
                  name="halfLifeUnit"
                  value={compoundData.halfLifeUnit}
                  onChange={(e) =>
                    setCompoundData({
                      ...compoundData,
                      halfLifeUnit: e.target.value,
                    })
                  }
                >
                  <option value="seconds">Seconds</option>
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </label>
              <button onClick={handleNewCompound}>Save Compound</button>
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
                      onChange={(e) =>
                        setNewCompoundData({
                          ...newCompoundData,
                          dose: e.target.value,
                        })
                      }
                    />
                    <select
                      name="doseUnit"
                      value={newCompoundData.doseUnit}
                      onChange={(e) =>
                        setNewCompoundData({
                          ...newCompoundData,
                          doseUnit: e.target.value,
                        })
                      }
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
                      onChange={(e) =>
                        setNewCompoundData({
                          ...newCompoundData,
                          offsetDays: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Dosing Schedule:
                    <select
                      name="dosingSchedule"
                      value={newCompoundData.dosingSchedule}
                      onChange={(e) =>
                        setNewCompoundData({
                          ...newCompoundData,
                          dosingSchedule: e.target.value,
                        })
                      }
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
                        onChange={(e) =>
                          setNewCompoundData({
                            ...newCompoundData,
                            durationFrom: e.target.value,
                          })
                        }
                        min="1"
                        max={protocol.length}
                        style={{ marginLeft: '5px', marginRight: '15px' }}
                      />
                      Through Week:
                      <input
                        type="number"
                        name="durationTo"
                        value={newCompoundData.durationTo}
                        onChange={(e) =>
                          setNewCompoundData({
                            ...newCompoundData,
                            durationTo: e.target.value,
                          })
                        }
                        min={newCompoundData.durationFrom}
                        max={protocol.length}
                        style={{ marginLeft: '5px' }}
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
                      onChange={(e) =>
                        setNewCompoundData({
                          ...newCompoundData,
                          adjustLevels: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Accumulate:
                    <input
                      type="checkbox"
                      name="accumulate"
                      checked={newCompoundData.accumulate}
                      onChange={(e) =>
                        setNewCompoundData({
                          ...newCompoundData,
                          accumulate: e.target.checked,
                        })
                      }
                    />
                  </label>
                  <label>
                    Compare:
                    <input
                      type="checkbox"
                      name="compare"
                      checked={newCompoundData.compare}
                      onChange={(e) =>
                        setNewCompoundData({
                          ...newCompoundData,
                          compare: e.target.checked,
                        })
                      }
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
                  <p>Molecular Weight: {selectedCompound.molecularWeight}</p>
                  <p>
                    Half-Life: {selectedCompound.halfLife}{' '}
                    {selectedCompound.halfLifeUnit}
                  </p>
                  {/* Display other compound details as needed */}
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
