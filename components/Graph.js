// components/Graph.js
import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist';

const Graph = ({ protocol }) => {
  const graphRef = useRef(null);

  useEffect(() => {
    if (protocol) {
      renderGraph();
    }
  }, [protocol]);

  const renderGraph = () => {
    const data = generateData(protocol);

    const layout = {
      title: protocol.name,
      xaxis: { title: 'Time (days)', color: '#ffffff' },
      yaxis: { title: 'Concentration (mg)', color: '#ffffff' },
      plot_bgcolor: '#252526',
      paper_bgcolor: '#252526',
      font: { color: '#ffffff' },
      dragmode: 'pan',
    };

    Plotly.react(graphRef.current, data, layout, {
      responsive: true,
    });
  };

  const generateData = (protocol) => {
    // Generate data based on protocol and compounds
    const time = [];
    const concentration = [];
    const compoundsData = {};

    const totalDays =
      protocol.lengthUnit === 'weeks'
        ? protocol.length * 7
        : protocol.length;

    for (let day = 0; day <= totalDays; day++) {
      time.push(day);
      let totalConcentration = 0;

      protocol.compounds.forEach((compound) => {
        const conc = calculateCompoundConcentration(compound, day, protocol);
        totalConcentration += conc;

        if (compound.compare) {
          if (!compoundsData[compound.name]) {
            compoundsData[compound.name] = {
              x: [],
              y: [],
              type: 'scatter',
              mode: 'lines',
              name: compound.name,
            };
          }
          compoundsData[compound.name].x.push(day);
          compoundsData[compound.name].y.push(conc);
        }
      });

      concentration.push(totalConcentration);
    }

    const data = [
      {
        x: time,
        y: concentration,
        type: 'scatter',
        mode: 'lines',
        line: { color: '#1f77b4' },
        name: 'Total Concentration',
      },
    ];

    // Add individual compound data if compare is enabled
    Object.values(compoundsData).forEach((compoundData) => {
      data.push(compoundData);
    });

    return data;
  };

  const calculateCompoundConcentration = (compound, day, protocol) => {
    const {
      dose,
      doseUnit,
      halfLife,
      halfLifeUnit,
      startDay,
      endDay,
      adjustLevels,
      offsetDays,
      dosingSchedule,
      accumulate,
    } = compound;

    const adjustedDose = parseFloat(dose) * (1 + adjustLevels / 100);

    const start = parseInt(startDay) + parseInt(offsetDays || 0);
    const end = parseInt(endDay) + parseInt(offsetDays || 0);

    if (day < start || day > end) return 0;

    const halfLifeInHours = convertHalfLifeToHours(halfLife, halfLifeUnit);
    const doseInMg = convertDoseToMg(adjustedDose, doseUnit);
    const frequencyInHours = getFrequencyInHours(dosingSchedule);

    const time = day * 24;
    const k = 0.693 / halfLifeInHours;
    const numDoses = Math.floor(time / frequencyInHours) + 1;

    let concentration = 0;
    for (let n = 0; n < numDoses; n++) {
      const timeSinceDose = time - n * frequencyInHours;
      if (timeSinceDose >= 0) {
        let conc = doseInMg * Math.exp(-k * timeSinceDose);
        if (accumulate) {
          concentration += conc;
        } else {
          concentration = conc;
        }
      }
    }

    return concentration;
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
      case '4 times a day':
        return 6;
      case '3 times a day':
        return 8;
      case '2 times a day':
        return 12;
      case 'Once a day':
        return 24;
      case 'Every other day':
        return 48;
      case '3 times a week':
        return 56;
      case 'Once every 3 days':
        return 72;
      case 'Once every 3.5 days':
        return 84;
      case 'Once every 4 days':
        return 96;
      case 'Once every 5 days':
        return 120;
      case 'Once every 6 days':
        return 144;
      case 'Once every 7 days':
        return 168;
      default:
        return 24;
    }
  };

  return <div ref={graphRef} className="graph-area"></div>;
};

export default Graph;
