// App.js

import React, { useState, useEffect } from 'react';
import Header from '../src/components/Header';
import Sidebar from '../src/components/Sidebar';
import ContentArea from '../src/components/ContentArea';
import Footer from '../src/components/Footer';
import NewProtocolModal from '../src/components/NewProtocolModal';
import PropertiesModal from '../src/components/PropertiesModal';
import ScaleAdjustmentModal from '../src/components/ScaleAdjustmentModal';
import './styles.css';

function App() {
  const [protocols, setProtocols] = useState([]);
  const [currentProtocol, setCurrentProtocol] = useState(null);
  const [showNewProtocolModal, setShowNewProtocolModal] = useState(false);
  const [showPropertiesModal, setShowPropertiesModal] = useState(false);
  const [showScaleAdjustmentModal, setShowScaleAdjustmentModal] = useState(false);
  const [scaleSettings, setScaleSettings] = useState({
    timeUnit: 'weeks',
  });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen for 'new-protocol' from main process
    window.electronAPI.receive('new-protocol', () => {
      setShowNewProtocolModal(true);
    });

    // Listen for 'open-properties' from main process
    window.electronAPI.receive('open-properties', () => {
      if (currentProtocol) {
        setShowPropertiesModal(true);
      } else {
        alert('No protocol selected.');
      }
    });

    // Listen for 'open-scale-adjustment' from main process
    window.electronAPI.receive('open-scale-adjustment', () => {
      setShowScaleAdjustmentModal(true);
    });
  }, [currentProtocol]);

  const handleCreateProtocol = (protocolData) => {
    const newProtocol = {
      name: protocolData.name,
      length: parseInt(protocolData.length),
      lengthUnit: protocolData.lengthUnit,
      startDate: protocolData.startDate,
      compounds: [],
    };
    setProtocols([...protocols, newProtocol]);
    setCurrentProtocol(newProtocol);
    setShowNewProtocolModal(false);
  };

  const handleUpdateProtocol = (updatedProtocol) => {
    const updatedProtocols = protocols.map((protocol) =>
      protocol.name === updatedProtocol.name ? updatedProtocol : protocol
    );
    setProtocols(updatedProtocols);
    setCurrentProtocol(updatedProtocol);
    setShowPropertiesModal(false);
  };

  const handleScaleAdjustment = (newScaleSettings) => {
    setScaleSettings(newScaleSettings);
    setShowScaleAdjustmentModal(false);
  };

  const addNotification = (message) => {
    const newNotification = {
      message,
      time: new Date(),
    };
    setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
  };

  return (
    <div className="app">
      {showNewProtocolModal && (
        <NewProtocolModal
          onClose={() => setShowNewProtocolModal(false)}
          onCreate={handleCreateProtocol}
        />
      )}
      {showPropertiesModal && (
        <PropertiesModal
          protocol={currentProtocol}
          onClose={() => setShowPropertiesModal(false)}
          onUpdate={handleUpdateProtocol}
        />
      )}
      {showScaleAdjustmentModal && (
        <ScaleAdjustmentModal
          onClose={() => setShowScaleAdjustmentModal(false)}
          onSave={handleScaleAdjustment}
        />
      )}
      <Header
        protocols={protocols}
        setProtocols={setProtocols}
        currentProtocol={currentProtocol}
        setCurrentProtocol={setCurrentProtocol}
        setShowNewProtocolModal={setShowNewProtocolModal}
      />
      <div className="main-content">
        <Sidebar
          currentProtocol={currentProtocol}
          setShowPropertiesModal={setShowPropertiesModal}
          addNotification={addNotification}
        />
        <ContentArea
          currentProtocol={currentProtocol}
          setCurrentProtocol={setCurrentProtocol}
          scaleSettings={scaleSettings}
          notifications={notifications}
          setNotifications={setNotifications}
        />
      </div>
      <Footer />
    </div>
  );
}

export default App;
