// GraphPlotter.js
import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

const GraphPlotter = () => {
  const [protocols, setProtocols] = useState([]);
  const [drugs, setDrugs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const protocolResponse = await window.electronAPI.invoke('get-protocols');
      const drugResponse = await window.electronAPI.invoke('get-drugs');
      setProtocols(protocolResponse);
      setDrugs(drugResponse);
    };
    fetchData();
  }, []);

  const exportProtocol = (protocol) => {
    const protocolDataStr = JSON.stringify(protocol, null, 2);
    window.electronAPI.send('export-protocol', protocolDataStr);
    alert('Protocol exported successfully!');
  };

  const generateData = (protocol) => {
    const data = {
      dates: [],
      concentrations: [],
    };
    const startDate = new Date(protocol.startDate);
    const lengthInDays =
      protocol.cycleLengthUnit === 'weeks'
        ? protocol.cycleLength * 7
        : protocol.cycleLength;
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + lengthInDays);

    const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);

    for (let day = 0; day <= totalDays; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);
      const dateStr = currentDate.toISOString().slice(0, 10);

      let totalConcentration = 0;

      for (const compound of protocol.compounds) {
        const compoundStartDay =
          (compound.durationFrom - 1) *
            (protocol.cycleLengthUnit === 'weeks' ? 7 : 1) +
          parseInt(compound.offsetDays || 0);
        const compoundEndDay =
          compound.durationTo *
            (protocol.cycleLengthUnit === 'weeks' ? 7 : 1) +
          parseInt(compound.offsetDays || 0);

        if (day >= compoundStartDay && day <= compoundEndDay) {
          const drug = drugs.find((d) => d.name === compound.drugName);
          if (drug) {
            const halfLifeInHours = convertHalfLifeToHours(
              drug.halfLife,
              drug.halfLifeUnit
            );
            const doseInMg = convertDoseToMg(compound.dose, compound.doseUnit);
            const frequencyInHours = getFrequencyInHours(compound.dosingSchedule);

            const time = day * 24;
            const k = 0.693 / halfLifeInHours;
            const numDoses = Math.floor(time / frequencyInHours) + 1;

            let compoundConcentration = 0;
            for (let n = 0; n < numDoses; n++) {
              const timeSinceDose = time - n * frequencyInHours;
              if (timeSinceDose >= 0) {
                let concentration = doseInMg * Math.exp(-k * timeSinceDose);
                concentration +=
                  (concentration * compound.adjustLevels) / 100;
                compoundConcentration += concentration;
              }
            }

            totalConcentration += compoundConcentration;
          }
        }
      }

      data.dates.push(dateStr);
      data.concentrations.push(totalConcentration);
    }

    return data;
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

  const getFrequencyInHours = (dosingSchedule) => {
    switch (dosingSchedule) {
      case '4x a day':
        return 6;
      case '3x a day':
        return 8;
      case '2x a day':
        return 12;
      case 'Once a Day':
        return 24;
      case 'Every Other Day':
        return 48;
      case 'Three Times a Week':
        return 56;
      case 'Once Every 3 Days':
        return 72;
      case 'Once Every 3.5 Days':
        return 84;
      case 'Once Every 4 Days':
        return 96;
      case 'Once Every 5 Days':
        return 120;
      case 'Once Every 6 Days':
        return 144;
      case 'Once Every 7 Days':
        return 168;
      default:
        return 24;
    }
  };

  return (
    <div className="graph-container">
      {protocols.map((protocol) => {
        const data = generateData(protocol);
        return (
          <div key={protocol.protocolTitle}>
            <h2>{protocol.protocolTitle}</h2>
            <Plot
              data={[
                {
                  x: data.dates,
                  y: data.concentrations,
                  type: 'scatter',
                  mode: 'lines+markers',
                  marker: { color: '#8884d8' },
                  name: protocol.protocolTitle,
                },
              ]}
              layout={{
                title: 'Drug Concentration Over Time',
                xaxis: { title: 'Date', color: '#ffffff' },
                yaxis: { title: 'Concentration (mg)', color: '#ffffff' },
                plot_bgcolor: '#1e1e1e',
                paper_bgcolor: '#1e1e1e',
                font: { color: '#ffffff' },
              }}
              config={{
                responsive: true,
                displayModeBar: true,
                modeBarButtonsToRemove: ['sendDataToCloud'],
              }}
              style={{ width: '100%', height: '100%' }}
            />
            <button onClick={() => exportProtocol(protocol)}>
              Export Protocol
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default GraphPlotter;
