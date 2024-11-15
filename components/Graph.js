// components/Graph.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Graph = ({ protocol }) => {
  const graphRef = useRef(null);

  useEffect(() => {
    if (protocol) {
      renderGraph();
    }
  }, [protocol]);

  const renderGraph = () => {
    // Clear any existing SVG
    d3.select(graphRef.current).selectAll('*').remove();

    const data = generateData(protocol);

    // Set up SVG dimensions
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = graphRef.current.clientWidth - margin.left - margin.right;
    const height = graphRef.current.clientHeight - margin.top - margin.bottom;

    // Append SVG
    const svg = d3
      .select(graphRef.current)
      .append('svg')
      .attr('width', graphRef.current.clientWidth)
      .attr('height', graphRef.current.clientHeight)
      .call(
        d3.zoom().scaleExtent([0.5, 20]).on('zoom', zoomed)
      )
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define scales
    const xScale = d3.scaleLinear().range([0, width]);
    const xScaleOriginal = xScale.copy(); // Preserve original scale
    const yScale = d3.scaleLinear().range([height, 0]);
    const yScaleOriginal = yScale.copy(); // Preserve original scale

    // Set domains
    xScale.domain(d3.extent(data.totalConcentration, (d) => d.day));
    yScale.domain([0, d3.max(data.totalConcentration, (d) => d.concentration) * 1.1]);

    // Save the scales for use in zooming
    const xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d3.format('d'));
    const yAxis = d3.axisLeft(yScale);

    // Add axes
    const xAxisGroup = svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('fill', '#ffffff');

    const yAxisGroup = svg
      .append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('fill', '#ffffff');

    // Add gridlines
    svg
      .append('g')
      .attr('class', 'grid x-grid')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(10)
          .tickSize(-height)
          .tickFormat('')
      );

    svg
      .append('g')
      .attr('class', 'grid y-grid')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(10)
          .tickSize(-width)
          .tickFormat('')
      );

    // Line generator function
    const line = d3
      .line()
      .x((d) => xScale(d.day))
      .y((d) => yScale(d.concentration));

    // Add total concentration line
    const totalLine = svg
      .append('path')
      .datum(data.totalConcentration)
      .attr('class', 'line total-line')
      .attr('fill', 'none')
      .attr('stroke', '#1f77b4')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add circles and tooltips for total concentration
    const totalDots = svg
      .selectAll('.dot')
      .data(data.totalConcentration)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.day))
      .attr('cy', (d) => yScale(d.concentration))
      .attr('r', 3)
      .attr('fill', '#1f77b4')
      .on('mouseover', (event, d) => {
        // Show tooltip
        d3.select(graphRef.current)
          .append('div')
          .attr('class', 'tooltip')
          .style('left', `${event.pageX + 5}px`)
          .style('top', `${event.pageY - 28}px`)
          .html(`Day: ${d.day}<br/>Concentration: ${d.concentration.toFixed(2)} mg`);
      })
      .on('mouseout', () => {
        // Remove tooltip
        d3.select(graphRef.current).select('.tooltip').remove();
      });

    // Add individual compound lines if 'compare' is enabled
    data.compoundsData.forEach((compoundData, index) => {
      const color = d3.schemeCategory10[index % 10];

      // Draw line
      svg
        .append('path')
        .datum(compoundData.data)
        .attr('class', `line compound-line-${index}`)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 1.5)
        .attr('d', line);

      // Add circles and tooltips for compounds
      svg
        .selectAll(`.dot-${index}`)
        .data(compoundData.data)
        .enter()
        .append('circle')
        .attr('class', `dot-${index}`)
        .attr('cx', (d) => xScale(d.day))
        .attr('cy', (d) => yScale(d.concentration))
        .attr('r', 3)
        .attr('fill', color)
        .on('mouseover', (event, d) => {
          // Show tooltip
          d3.select(graphRef.current)
            .append('div')
            .attr('class', 'tooltip')
            .style('left', `${event.pageX + 5}px`)
            .style('top', `${event.pageY - 28}px`)
            .html(
              `Compound: ${compoundData.name}<br/>Day: ${d.day}<br/>Concentration: ${d.concentration.toFixed(
                2
              )} mg`
            );
        })
        .on('mouseout', () => {
          // Remove tooltip
          d3.select(graphRef.current).select('.tooltip').remove();
        });

      // Add legend
      svg
        .append('text')
        .attr('x', width - 150)
        .attr('y', 20 + index * 20)
        .attr('fill', color)
        .text(compoundData.name)
        .style('font-size', '12px');
    });

    // Add axis labels
    svg
      .append('text')
      .attr('transform', `translate(${width / 2},${height + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('fill', '#ffffff')
      .text('Time (days)');

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 20)
      .attr('x', -height / 2)
      .attr('dy', '-1em')
      .style('text-anchor', 'middle')
      .style('fill', '#ffffff')
      .text('Concentration (mg)');

    // Zoom function
    function zoomed(event) {
      const newXScale = event.transform.rescaleX(xScale);
      const newYScale = event.transform.rescaleY(yScale);

      // Update axes
      svg.select('.x-axis').call(d3.axisBottom(newXScale).ticks(10).tickFormat(d3.format('d')));
      svg.select('.y-axis').call(d3.axisLeft(newYScale));

      // Update gridlines
      svg
        .select('.x-grid')
        .call(
          d3
            .axisBottom(newXScale)
            .ticks(10)
            .tickSize(-height)
            .tickFormat('')
        );
      svg
        .select('.y-grid')
        .call(
          d3
            .axisLeft(newYScale)
            .ticks(10)
            .tickSize(-width)
            .tickFormat('')
        );

      // Update lines
      svg
        .selectAll('.line')
        .attr(
          'd',
          d3
            .line()
            .x((d) => newXScale(d.day))
            .y((d) => newYScale(d.concentration))
        );

      // Update dots
      svg
        .selectAll('.dot')
        .attr('cx', (d) => newXScale(d.day))
        .attr('cy', (d) => newYScale(d.concentration));

      data.compoundsData.forEach((compoundData, index) => {
        svg
          .selectAll(`.dot-${index}`)
          .attr('cx', (d) => newXScale(d.day))
          .attr('cy', (d) => newYScale(d.concentration));
      });
    }
  };

  const generateData = (protocol) => {
    const totalConcentrationData = [];
    const compoundsData = [];

    const totalDays =
      protocol.lengthUnit === 'weeks' ? protocol.length * 7 : protocol.length;

    for (let day = 0; day <= totalDays; day++) {
      let totalConcentration = 0;

      protocol.compounds.forEach((compound, index) => {
        const conc = calculateCompoundConcentration(compound, day, protocol);
        totalConcentration += conc;

        if (compound.compare) {
          if (!compoundsData[index]) {
            compoundsData[index] = {
              name: compound.name,
              data: [],
            };
          }
          compoundsData[index].data.push({ day, concentration: conc });
        }
      });

      totalConcentrationData.push({ day, concentration: totalConcentration });
    }

    return {
      totalConcentration: totalConcentrationData,
      compoundsData,
    };
  };

  const calculateCompoundConcentration = (compound, day, protocol) => {
    // Extract compound properties
    const {
      dose,
      doseUnit,
      halfLife,
      halfLifeUnit,
      durationFrom,
      durationTo,
      adjustLevels,
      offsetDays,
      dosingSchedule,
      accumulate,
    } = compound;

    const adjustedDose = parseFloat(dose) * (1 + adjustLevels / 100);

    const start =
      (parseInt(durationFrom) - 1) * (protocol.lengthUnit === 'weeks' ? 7 : 1) +
      parseInt(offsetDays || 0);
    const end =
      parseInt(durationTo) * (protocol.lengthUnit === 'weeks' ? 7 : 1) +
      parseInt(offsetDays || 0);

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
