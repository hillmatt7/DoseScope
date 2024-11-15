// GraphPlotter.js
import React, { useState, useEffect } from 'react';
import Graph from './components/Graph'; // Import the updated Graph component

const GraphPlotter = () => {
  const [protocols, setProtocols] = useState([]);

  useEffect(() => {
    const fetchProtocols = async () => {
      const response = await window.electronAPI.invoke('get-protocols');
      setProtocols(response);
    };
    fetchProtocols();
  }, []);

  return (
    <div className="graph-container">
      {protocols.map((protocol) => (
        <div key={protocol.protocolTitle}>
          <h2>{protocol.protocolTitle}</h2>
          <Graph protocol={protocol} />
        </div>
      ))}
    </div>
  );
};

export default GraphPlotter;
