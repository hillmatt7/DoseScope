import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

const GraphPlotter = () => {
  const [protocols, setProtocols] = useState([]);

  useEffect(() => {
    const fetchProtocols = async () => {
      const response = await window.electronAPI.invoke('get-protocols'); // Use the exposed API
      setProtocols(response);
    };
    fetchProtocols();
  }, []);

  const generateData = (protocol) => {
    const data = [];
    const startDate = new Date(protocol.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + protocol.lengthWeeks * 7);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const date = new Date(d).toISOString().slice(0, 10);
      const concentration = calculateConcentration(protocol, date);
      data.push({ date, concentration });
    }

    return data;
  };

  const calculateConcentration = (protocol, date) => {
    // Placeholder for concentration calculation logic
    return Math.random() * 100;
  };

  return (
    <div>
      {protocols.map((protocol) => (
        <div key={protocol.drugName}>
          <h2>{protocol.drugName}</h2>
          <LineChart width={600} height={300} data={generateData(protocol)}>
            <XAxis dataKey="date" />
            <YAxis />
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="concentration" stroke="#8884d8" />
            <Tooltip />
            <Legend />
          </LineChart>
        </div>
      ))}
    </div>
  );
};

export default GraphPlotter;
