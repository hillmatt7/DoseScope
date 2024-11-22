// src/components/MedicationControls.js

import React, { useState, useEffect } from 'react';

const MedicationControls = ({ protocol, setProtocol, setNotifications }) => {
  const [medications, setMedications] = useState(protocol ? protocol.compounds : []);

  const addMedication = () => {
    if (protocol) {
      // Open add compound overlay
      window.electronAPI.send('open-add-compound');
    } else {
      alert('No protocol selected.');
    }
  };

  const removeMedication = (medication) => {
    const updatedCompounds = medications.filter((med) => med.name !== medication.name);
    setMedications(updatedCompounds);
    setProtocol({ ...protocol, compounds: updatedCompounds });

    // Add notification
    setNotifications((prevNotifications) => [
      {
        message: `Removed medication: ${medication.name}`,
        time: new Date(),
      },
      ...prevNotifications,
    ]);

    // Notify main process
    window.electronAPI.send('compound-removed', medication.name);
  };

  useEffect(() => {
    if (protocol) {
      setMedications(protocol.compounds);
    }
  }, [protocol]);

  return (
    <div className="medication-controls">
      <button id="addMedicationBtn" className="add-medication-btn" onClick={addMedication}>
        <i className="fas fa-plus"></i>
      </button>
      <div id="medicationTabs" className="medication-tabs">
        {medications.map((med) => (
          <div key={med.name} className="medication-tab">
            <span className="med-name">{med.name}</span>
            <span className="remove-med" onClick={() => removeMedication(med)}>
              &times;
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicationControls;
