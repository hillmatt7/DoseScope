// GraphPlotter.js
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

const GraphPlotter = () => {
  const [protocols, setProtocols] = useState([]);
  const [drugs, setDrugs] = useState([]);

  useEffect(() => {
    const fetchProtocolsAndDrugs = async () => {
      const protocolResponse = await window.electronAPI.invoke('get-protocols');
      const drugResponse = await window.electronAPI.invoke('get-drugs');
      setProtocols(protocolResponse);
      setDrugs(drugResponse);
    };
    fetchProtocolsAndDrugs();
  }, []);

  const exportProtocol = (protocol) => {
    // Implement the logic to export protocol data
    const protocolDataStr = JSON.stringify(protocol, null, 2);
    window.electronAPI.send('export-protocol', protocolDataStr);
    alert('Protocol exported successfully!');
  };

  const generateData = (protocol) => {
    const data = [];
    const startDate = new Date(protocol.startDate);
    const lengthInDays =
      protocol.lengthUnit === 'weeks' ? protocol.length * 7 : protocol.length;
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + lengthInDays);

    const drug = drugs.find((d) => d.name === protocol.drugName);
    if (!drug) {
      return data;
    }

    const halfLifeInHours = convertHalfLifeToHours(drug.halfLife, drug.halfLifeUnit);
    const doseInMg = convertDoseToMg(protocol.dose, protocol.doseUnit);
    const frequencyInHours = convertFrequencyToHours(
      protocol.frequency,
      protocol.frequencyUnit
    );

    const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);

    for (let day = 0; day <= totalDays; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      const dateStr = currentDate.toISOString().slice(0, 10);

      const concentration = calculateConcentration(
        day,
        doseInMg,
        halfLifeInHours,
        frequencyInHours
      );
      data.push({ date: dateStr, concentration });
    }

    return data;
  };

  const calculateConcentration = (day, dose, halfLife, frequency) => {
    // Placeholder for pharmacokinetic calculation
    const time = day * 24; // Convert days to hours
    const k = 0.693 / halfLife; // Elimination rate constant
    const numDoses = Math.floor(time / frequency) + 1;

    let totalConcentration = 0;
    for (let n = 0; n < numDoses; n++) {
      const timeSinceDose = time - n * frequency;
      if (timeSinceDose >= 0) {
        const concentration = dose * Math.exp(-k * timeSinceDose);
        totalConcentration += concentration;
      }
    }
    return totalConcentration;
  };

  const convertHalfLifeToHours = (value, unit) => {
    const val = parseFloat(value);
    switch (unit) {
      case 'seconds':
        return val / 3600;
      case 'minutes':
        return val / 60;
      case 'hours':
        return val;
      case 'days':
        return val * 24;
      default:
        return val;
    }
  };

  const convertDoseToMg = (value, unit) => {
    const val = parseFloat(value);
    switch (unit) {
      case 'mcg':
        return val / 1000;
      case 'mg':
        return val;
      case 'g':
        return val * 1000;
      default:
        return val;
    }
  };

  const convertFrequencyToHours = (value, unit) => {
    const val = parseFloat(value);
    switch (unit) {
      case 'hours':
        return val;
      case 'days':
        return val * 24;
      case 'weeks':
        return val * 168;
      default:
        return val;
    }
  };

  return (
    <div>
      {protocols.map((protocol) => (
        <div key={protocol.protocolTitle}>
          <h2>{protocol.protocolTitle}</h2>
          <LineChart width={600} height={300} data={generateData(protocol)}>
            <XAxis dataKey="date" />
            <YAxis />
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="concentration" stroke="#8884d8" />
            <Tooltip />
            <Legend />
          </LineChart>
          <button onClick={() => exportProtocol(protocol)}>Export Protocol</button>
        </div>
      ))}
    </div>
  );
};

export default GraphPlotter;
