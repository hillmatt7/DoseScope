// src/components/ContentArea.js

import React from 'react';
import ChartArea from './ChartArea';
import MedicationControls from './MedicationControls';
import Notifications from './Notifications';

const ContentArea = ({
  currentProtocol,
  setCurrentProtocol,
  scaleSettings,
  notifications,
  setNotifications,
}) => {
  return (
    <div className="content-area">
      <ChartArea protocol={currentProtocol} scaleSettings={scaleSettings} />
      <MedicationControls
        protocol={currentProtocol}
        setProtocol={setCurrentProtocol}
        setNotifications={setNotifications}
      />
      <Notifications notifications={notifications} />
    </div>
  );
};

export default ContentArea;
