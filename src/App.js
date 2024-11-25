// src/App.js

import React, { useState, useEffect } from 'react';
import { Layout, notification, Button } from 'antd';
import AppHeader from './components/Header';
import AppSidebar from './components/Sidebar';
import ContentArea from './components/ContentArea';
import AppFooter from './components/Footer';
import NewProtocolDrawer from './components/NewProtocolDrawer';
import PropertiesDrawer from './components/PropertiesDrawer';
import ScaleAdjustmentDrawer from './components/ScaleAdjustmentDrawer';
import AddCompoundDrawer from './components/AddCompoundDrawer';
import NewCompoundDrawer from './components/NewCompoundDrawer';
import './styles.css';

const { Content } = Layout;

const App = () => {
  const [protocols, setProtocols] = useState([]);
  const [currentProtocol, setCurrentProtocol] = useState(null);
  const [showNewProtocolDrawer, setShowNewProtocolDrawer] = useState(false);
  const [showPropertiesDrawer, setShowPropertiesDrawer] = useState(false);
  const [showScaleAdjustmentDrawer, setShowScaleAdjustmentDrawer] = useState(false);
  const [showAddCompoundDrawer, setShowAddCompoundDrawer] = useState(false);
  const [showNewCompoundDrawer, setShowNewCompoundDrawer] = useState(false);
  const [scaleSettings, setScaleSettings] = useState({
    timeUnit: 'weeks',
  });
  const [notifications, setNotifications] = useState([]);

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

    // Remove IPC listener for 'open-add-compound' as we're opening the drawer directly
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
          setShowNewCompoundDrawer={setShowNewCompoundDrawer}
        />
        <Content>
          {currentProtocol ? (
            <ContentArea
              currentProtocol={currentProtocol}
              setCurrentProtocol={setCurrentProtocol}
              scaleSettings={scaleSettings}
              notifications={notifications}
              setNotifications={setNotifications}
              setShowAddCompoundDrawer={setShowAddCompoundDrawer}
            />
          ) : (
            <div className="empty-screen">
              <div className="create-protocol">
                <Button
                  type="primary"
                  onClick={() => setShowNewProtocolDrawer(true)}
                  style={{
                    backgroundColor: '#ff4d4f',
                    borderColor: '#ff4d4f',
                    height: '60px',
                    width: '200px',
                    fontSize: '18px',
                  }}
                >
                  Create New Protocol
                </Button>
              </div>
            </div>
          )}
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
      <AddCompoundDrawer
        visible={showAddCompoundDrawer}
        onClose={() => setShowAddCompoundDrawer(false)}
        protocol={currentProtocol}
        setProtocol={setCurrentProtocol}
      />
      <NewCompoundDrawer
        visible={showNewCompoundDrawer}
        onClose={() => setShowNewCompoundDrawer(false)}
      />
    </Layout>
  );
};

export default App;
