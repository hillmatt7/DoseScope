// src/components/Header.js

import React from 'react';

const Header = ({
  protocols,
  currentProtocol,
  setCurrentProtocol,
  setShowNewProtocolModal,
}) => {
  return (
    <div className="header">
      <div className="logo">HealthChart</div>
      {/* Tabs for Multiple Projects */}
      <div className="tabs">
        {protocols.map((protocol) => (
          <div
            key={protocol.name}
            className={`tab ${currentProtocol?.name === protocol.name ? 'active' : ''}`}
            onClick={() => setCurrentProtocol(protocol)}
          >
            {protocol.name}
          </div>
        ))}
        <button className="add-tab" onClick={() => setShowNewProtocolModal(true)}>
          <i className="fas fa-plus"></i>
        </button>
      </div>
      <div className="toolbar">
        {/* Toolbar buttons can be added here */}
      </div>
    </div>
  );
};

export default Header;
