// src/App.js

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ContentArea from './components/ContentArea';
import Footer from './components/Footer';
import NewProtocolModal from './components/NewProtocolModal';
import PropertiesModal from './components/PropertiesModal';
import ScaleAdjustmentModal from './components/ScaleAdjustmentModal';
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
    // IPC listeners
    window.electronAPI.receive('new-protocol', () => {
      setShowNewProtocolModal(true);
    });

    window.electronAPI.receive('open-properties', () => {
      if (currentProtocol) {
        setShowPropertiesModal(true);
      } else {
        alert('No protocol selected.');
      }
    });

    window.electronAPI.receive('open-scale-adjustment', () => {
      setShowScaleAdjustmentModal(true);
    });

    // Update notifications when compounds are added/removed
    window.electronAPI.receive('compound-added', (compoundName) => {
      addNotification(`Added medication: ${compoundName}`);
    });

    window.electronAPI.receive('compound-removed', (compoundName) => {
      addNotification(`Removed medication: ${compoundName}`);
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
        currentProtocol={currentProtocol}
        setCurrentProtocol={setCurrentProtocol}
        setShowNewProtocolModal={setShowNewProtocolModal}
      />
      <div className="main-content">
        <Sidebar
          currentProtocol={currentProtocol}
          setShowPropertiesModal={setShowPropertiesModal}
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
