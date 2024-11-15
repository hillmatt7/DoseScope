// App.js
import React, { useState, useEffect } from 'react';
import Graph from './components/Graph';
import Sidebar from './components/Sidebar';
import NewProtocolModal from './components/NewProtocolModal';
import PropertiesModal from './components/PropertiesModal';
import './styles.css';

function App() {
  const [protocols, setProtocols] = useState([]);
  const [currentProtocol, setCurrentProtocol] = useState(null);
  const [showNewProtocolModal, setShowNewProtocolModal] = useState(false);
  const [showPropertiesModal, setShowPropertiesModal] = useState(false);

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
      {currentProtocol ? (
        <>
          <Sidebar
            currentProtocol={currentProtocol}
            setCurrentProtocol={setCurrentProtocol}
            protocols={protocols}
            setProtocols={setProtocols}
          />
          <Graph protocol={currentProtocol} />
        </>
      ) : (
        <div className="empty-screen">
          <div className="create-protocol">
            <div
              className="plus-sign"
              onClick={() => setShowNewProtocolModal(true)}
            >
              +
            </div>
            <div className="create-text">Create New Protocol</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
