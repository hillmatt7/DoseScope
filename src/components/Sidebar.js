// src/components/Sidebar.js

import React from 'react';

const Sidebar = ({ currentProtocol, setShowPropertiesModal }) => {
  const handleAddCompound = () => {
    if (currentProtocol) {
      // Open add compound overlay
      window.electronAPI.send('open-add-compound');
    } else {
      alert('No protocol selected.');
    }
  };

  const handleOpenProperties = () => {
    if (currentProtocol) {
      setShowPropertiesModal(true);
    } else {
      alert('No protocol selected.');
    }
  };

  return (
    <div className="sidebar">
      <ul>
        <li onClick={handleAddCompound}>
          <i className="fas fa-plus-circle" title="Add Compound"></i>
        </li>
        <li onClick={handleOpenProperties}>
          <i className="fas fa-cog" title="Properties"></i>
        </li>
        {/* Additional buttons can be added here */}
      </ul>
    </div>
  );
};

export default Sidebar;
