// components/Graph.js

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Graph = ({ protocol, scaleSettings }) => {
  const graphRef = useRef(null);

  useEffect(() => {
    renderGraph();
  }, [protocol, scaleSettings]);

  const renderGraph = () => {
    // Clear any existing SVG
    d3.select(graphRef.current).selectAll('*').remove();

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
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define scales
    const xScale = d3.scaleLinear().range([0, width]).clamp(true);
    const yScale = d3.scaleLinear().range([height, 0]);

    let data = { totalConcentration: [] };

    if (protocol && protocol.compounds && protocol.compounds.length > 0) {
      data = generateData(protocol);

      // Ensure concentrations are not negative
      data.totalConcentration = data.totalConcentration.map((d) => ({
        time: d.time,
        concentration: Math.max(0, d.concentration),
      }));

      // Set domains based on data
      xScale.domain([0, d3.max(data.totalConcentration, (d) => d.time)]);
      yScale.domain([0, d3.max(data.totalConcentration, (d) => d.concentration) * 1.1]);
    } else {
      // Set default domains when no data is present
      xScale.domain([0, 10]); // Default x-axis from 0 to 10 units
      yScale.domain([0, 10]); // Default y-axis from 0 to 10 units
    }

    // X-axis ticks based on time unit and scale settings
    const timeUnit = scaleSettings?.timeUnit || protocol?.lengthUnit || 'weeks'; // 'days' or 'weeks'
    let minorTickInterval, majorTickInterval, timeMultiplier;

    if (timeUnit === 'weeks') {
      minorTickInterval = 1; // 1 day
      majorTickInterval = 7; // 7 days in a week
      timeMultiplier = 24; // Convert days to hours
    } else if (timeUnit === 'days') {
      minorTickInterval = 1; // 1 hour
      majorTickInterval = 24; // 24 hours in a day
      timeMultiplier = 1; // Hours
    } else {
      // Default to days if timeUnit is not 'weeks' or 'days'
      minorTickInterval = 1; // 1 hour
      majorTickInterval = 24; // 24 hours in a day
      timeMultiplier = 1; // Hours
    }

    const xAxis = d3
      .axisBottom(xScale)
      .ticks((xScale.domain()[1] / timeMultiplier / minorTickInterval) + 1)
      .tickSize(-height)
      .tickFormat((d) => {
        const timeValue = d / timeMultiplier;
        if (timeValue % majorTickInterval === 0) {
          if (timeUnit === 'weeks') {
            return `Week ${timeValue / majorTickInterval}`;
          } else if (timeUnit === 'days') {
            return `Day ${timeValue}`;
          }
        }
        return '';
      });

    // Add axes
    svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('fill', '#ffffff')
      .attr('transform', 'rotate(45)')
      .style('text-anchor', 'start');

    svg
      .append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale))
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
          .ticks((xScale.domain()[1] / timeMultiplier / minorTickInterval) + 1)
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

    if (data.totalConcentration.length > 0) {
      // Line generator function
      const line = d3
        .line()
        .defined((d) => !isNaN(d.concentration) && d.concentration >= 0)
        .x((d) => xScale(d.time))
        .y((d) => yScale(d.concentration));

      // Add total concentration line
      svg
        .append('path')
        .datum(data.totalConcentration)
        .attr('class', 'line total-line')
        .attr('fill', 'none')
        .attr('stroke', '#1f77b4')
        .attr('stroke-width', 2)
        .attr('d', line);

      // Add circles and tooltips for total concentration
      svg
        .selectAll('.dot')
        .data(data.totalConcentration)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', (d) => xScale(d.time))
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
            .html(`Time: ${d.time} hours<br/>Concentration: ${d.concentration.toFixed(2)} ng/ml`);
        })
        .on('mouseout', () => {
          // Remove tooltip
          d3.select(graphRef.current).select('.tooltip').remove();
        });
    }

    // Add axis labels
    svg
      .append('text')
      .attr('transform', `translate(${width / 2},${height + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('fill', '#ffffff')
      .text('Time');

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 20)
      .attr('x', -height / 2)
      .attr('dy', '-1em')
      .style('text-anchor', 'middle')
      .style('fill', '#ffffff')
      .text('Concentration (ng/ml)');

    // Zoom function
    const zoom = d3.zoom()
      .scaleExtent([0.5, 20])
      .translateExtent([[0, 0], [width, height]])
      .on('zoom', zoomed);

    d3.select(graphRef.current).select('svg').call(zoom);

    function zoomed(event) {
      const newXScale = event.transform.rescaleX(xScale);
      const newYScale = event.transform.rescaleY(yScale);

      // Prevent negative time by clamping the domain
      const xDomain = newXScale.domain();
      if (xDomain[0] < 0) {
        newXScale.domain([0, xDomain[1] - xDomain[0]]);
      }

      // Update axes
      svg.select('.x-axis').call(xAxis.scale(newXScale));
      svg.select('.y-axis').call(d3.axisLeft(newYScale));

      // Update gridlines
      svg
        .select('.x-grid')
        .call(
          d3
            .axisBottom(newXScale)
            .ticks((newXScale.domain()[1] / timeMultiplier / minorTickInterval) + 1)
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

      // Update lines and dots if data exists
      if (data.totalConcentration.length > 0) {
        // Update lines
        svg
          .selectAll('.line')
          .attr(
            'd',
            d3
              .line()
              .defined((d) => !isNaN(d.concentration) && d.concentration >= 0)
              .x((d) => newXScale(d.time))
              .y((d) => newYScale(d.concentration))
          );

        // Update dots
        svg
          .selectAll('.dot')
          .attr('cx', (d) => newXScale(d.time))
          .attr('cy', (d) => newYScale(d.concentration));
      }
    }
  };

  const generateData = (protocol) => {
    const totalConcentrationData = [];
    const duration =
      protocol.lengthUnit === 'weeks'
        ? protocol.length * 7 * 24
        : protocol.length * 24;

    for (let time = 0; time <= duration; time += 1) {
      let totalConcentration = 0;

      protocol.compounds.forEach((compound) => {
        const concentration = calculateConcentration(compound, time);
        totalConcentration += concentration;
      });

      totalConcentrationData.push({ time, concentration: totalConcentration });
    }

    return {
      totalConcentration: totalConcentrationData,
    };
  };

  const calculateConcentration = (compound, time) => {
    const { halfLife, Cmax, bioavailability, Tmax } = compound;

    // Validate that all required values are numbers
    if (
      isNaN(halfLife) ||
      isNaN(Cmax) ||
      isNaN(bioavailability) ||
      isNaN(Tmax) ||
      halfLife <= 0 ||
      Tmax <= 0
    ) {
      return 0;
    }

    const clearanceRate = 0.693 / halfLife;
    const concentration =
      (Cmax * bioavailability) *
      (Math.exp(-clearanceRate * time) / (1 - Math.exp(-clearanceRate * Tmax)));

    return concentration > 0 ? concentration : 0;
  };

  return <div ref={graphRef} className="graph-area"></div>;
};

export default Graph;
