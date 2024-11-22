// src/App.js

import React, { useState, useEffect } from 'react';
import { Layout, notification } from 'antd';
import AppHeader from './components/Header';
import AppSidebar from './components/Sidebar';
import ContentArea from './components/ContentArea';
import AppFooter from './components/Footer';
import NewProtocolDrawer from './components/NewProtocolDrawer';
import PropertiesDrawer from './components/PropertiesDrawer';
import ScaleAdjustmentDrawer from './components/ScaleAdjustmentDrawer';
import AddCompoundModal from './components/AddCompoundModal';
import NewCompoundModal from './components/NewCompoundModal';
import './styles.css';

const { Content } = Layout;

const App = () => {
  const [protocols, setProtocols] = useState([]);
  const [currentProtocol, setCurrentProtocol] = useState(null);
  const [showNewProtocolDrawer, setShowNewProtocolDrawer] = useState(false);
  const [showPropertiesDrawer, setShowPropertiesDrawer] = useState(false);
  const [showScaleAdjustmentDrawer, setShowScaleAdjustmentDrawer] = useState(false);
  const [showAddCompoundModal, setShowAddCompoundModal] = useState(false);
  const [showNewCompoundModal, setShowNewCompoundModal] = useState(false);
  const [scaleSettings, setScaleSettings] = useState({
    timeUnit: 'weeks',
  });
  const [notifications, setNotifications] = useState([]);

  // Replace alert with Ant Design notification
  const openNotification = (message) => {
    notification.info({
      message,
      placement: 'topRight',
      duration: 3,
    });
  };

  useEffect(() => {
    // IPC listeners
    window.electronAPI.receive('new-protocol', () => {
      setShowNewProtocolDrawer(true);
    });

    window.electronAPI.receive('open-properties', () => {
      if (currentProtocol) {
        setShowPropertiesDrawer(true);
      } else {
        openNotification('No protocol selected.');
      }
    });

    window.electronAPI.receive('open-scale-adjustment', () => {
      setShowScaleAdjustmentDrawer(true);
    });

    window.electronAPI.receive('open-add-compound', () => {
      if (currentProtocol) {
        setShowAddCompoundModal(true);
      } else {
        openNotification('No protocol selected.');
      }
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
    setShowNewProtocolDrawer(false);
  };

  const handleUpdateProtocol = (updatedProtocol) => {
    const updatedProtocols = protocols.map((protocol) =>
      protocol.name === updatedProtocol.name ? updatedProtocol : protocol
    );
    setProtocols(updatedProtocols);
    setCurrentProtocol(updatedProtocol);
    setShowPropertiesDrawer(false);
  };

  const handleScaleAdjustment = (newScaleSettings) => {
    setScaleSettings(newScaleSettings);
    setShowScaleAdjustmentDrawer(false);
  };

  const addNotification = (message) => {
    const newNotification = {
      message,
      time: new Date(),
    };
    setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
  };

  return (
    <Layout className="app">
      <AppHeader
        protocols={protocols}
        currentProtocol={currentProtocol}
        setCurrentProtocol={setCurrentProtocol}
        setShowNewProtocolDrawer={setShowNewProtocolDrawer}
      />
      <Layout>
        <AppSidebar
          currentProtocol={currentProtocol}
          setShowPropertiesDrawer={setShowPropertiesDrawer}
          setShowNewCompoundModal={setShowNewCompoundModal}
        />
        <Content>
          <ContentArea
            currentProtocol={currentProtocol}
            setCurrentProtocol={setCurrentProtocol}
            scaleSettings={scaleSettings}
            notifications={notifications}
            setNotifications={setNotifications}
          />
        </Content>
      </Layout>
      <AppFooter />
      <NewProtocolDrawer
        visible={showNewProtocolDrawer}
        onClose={() => setShowNewProtocolDrawer(false)}
        onCreate={handleCreateProtocol}
      />
      {currentProtocol && (
        <>
          <PropertiesDrawer
            visible={showPropertiesDrawer}
            protocol={currentProtocol}
            onClose={() => setShowPropertiesDrawer(false)}
            onUpdate={handleUpdateProtocol}
          />
          <ScaleAdjustmentDrawer
            visible={showScaleAdjustmentDrawer}
            onClose={() => setShowScaleAdjustmentDrawer(false)}
            onSave={handleScaleAdjustment}
          />
        </>
      )}
      <AddCompoundModal
        visible={showAddCompoundModal}
        onClose={() => setShowAddCompoundModal(false)}
        protocol={currentProtocol}
        setProtocol={setCurrentProtocol}
      />
      <NewCompoundModal
        visible={showNewCompoundModal}
        onClose={() => setShowNewCompoundModal(false)}
      />
    </Layout>
  );
};

export default App;
