// src/components/ContentArea.js

import React from 'react';
import ChartArea from './ChartArea';
import MedicationControls from './MedicationControls';

const ContentArea = ({
  currentProtocol,
  setCurrentProtocol,
  scaleSettings,
  notifications,
  setNotifications,
  setShowAddCompoundDrawer, // Receive as prop
}) => {
  return (
    <div className="content-area">
      <ChartArea protocol={currentProtocol} scaleSettings={scaleSettings} />
      <MedicationControls
        protocol={currentProtocol}
        setProtocol={setCurrentProtocol}
        setNotifications={setNotifications}
        setShowAddCompoundDrawer={setShowAddCompoundDrawer} // Pass it down
      />
    </div>
  );
};

export default ContentArea;
