// src/components/ChartArea.js

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ChartArea = ({ protocol, scaleSettings }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    renderChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protocol, scaleSettings]);

  const renderChart = () => {
    // Clear existing chart
    d3.select(chartRef.current).selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = chartRef.current.clientHeight - margin.top - margin.bottom;

    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', chartRef.current.clientWidth)
      .attr('height', chartRef.current.clientHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear().range([0, width]).clamp(true);
    const yScale = d3.scaleLinear().range([height, 0]);

    let data = [];

    if (protocol && protocol.compounds && protocol.compounds.length > 0) {
      data = generateData(protocol);

      xScale.domain([0, d3.max(data, (d) => d.time)]);
      yScale.domain([0, d3.max(data, (d) => d.totalConcentration) * 1.1]);
    } else {
      xScale.domain([0, 10]);
      yScale.domain([0, 10]);
    }

    // Time Unit Adjustments
    const timeUnit = scaleSettings?.timeUnit || protocol?.lengthUnit || 'weeks';
    let minorTickInterval, majorTickInterval, timeMultiplier, timeFormat;

    if (timeUnit === 'weeks') {
      minorTickInterval = 1 * 24; // 1 day in hours
      majorTickInterval = 7 * 24; // 1 week in hours
      timeMultiplier = 24; // Convert days to hours
      timeFormat = (d) => {
        const dayNumber = Math.floor(d / 24) + 1;
        if (dayNumber % 7 === 0) {
          return `Week ${dayNumber / 7}`;
        }
        return null;
      };
    } else if (timeUnit === 'days') {
      minorTickInterval = 1; // 1 hour
      majorTickInterval = 24; // 24 hours in a day
      timeMultiplier = 1; // Hours
      timeFormat = (d) => {
        const dayNumber = Math.floor(d / 24) + 1;
        if (d % 24 === 0) {
          return `Day ${dayNumber}`;
        }
        return null;
      };
    } else {
      // Default to days if timeUnit is not 'weeks' or 'days'
      minorTickInterval = 1; // 1 hour
      majorTickInterval = 24; // 24 hours in a day
      timeMultiplier = 1; // Hours
      timeFormat = (d) => `Time ${d}`;
    }

    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.ceil(xScale.domain()[1] / minorTickInterval))
      .tickSize(-height)
      .tickFormat((d) => timeFormat(d));

    const yAxis = d3.axisLeft(yScale).ticks(10);

    svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('fill', '#333')
      .attr('transform', 'rotate(45)')
      .style('text-anchor', 'start');

    svg
      .append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('fill', '#333');

    // Gridlines
    svg
      .append('g')
      .attr('class', 'grid x-grid')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(Math.ceil(xScale.domain()[1] / minorTickInterval))
          .tickSize(-height)
          .tickFormat('')
      );

    svg
      .append('g')
      .attr('class', 'grid y-grid')
      .call(
        d3.axisLeft(yScale)
          .ticks(10)
          .tickSize(-width)
          .tickFormat('')
      );

    if (data.length > 0) {
      // Line generator
      const line = d3
        .line()
        .x((d) => xScale(d.time))
        .y((d) => yScale(d.totalConcentration));

      // Draw line
      svg
        .append('path')
        .datum(data)
        .attr('class', 'line total-line')
        .attr('fill', 'none')
        .attr('stroke', '#1f77b4')
        .attr('stroke-width', 2)
        .attr('d', line);

      // Dots
      svg
        .selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', (d) => xScale(d.time))
        .attr('cy', (d) => yScale(d.totalConcentration))
        .attr('r', 3)
        .attr('fill', '#1f77b4');
    }

    // Axis labels
    svg
      .append('text')
      .attr('transform', `translate(${width / 2},${height + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('fill', '#333')
      .text('Time');

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 20)
      .attr('x', -height / 2)
      .attr('dy', '-1em')
      .style('text-anchor', 'middle')
      .style('fill', '#333')
      .text('Concentration (ng/ml)');

    // Zoom and pan
    const zoom = d3.zoom().on('zoom', (event) => {
      const newXScale = event.transform.rescaleX(xScale);
      const newYScale = event.transform.rescaleY(yScale);

      svg.select('.x-axis').call(xAxis.scale(newXScale));
      svg.select('.y-axis').call(yAxis.scale(newYScale));

      svg
        .select('.x-grid')
        .call(
          d3.axisBottom(newXScale)
            .ticks(Math.ceil(newXScale.domain()[1] / minorTickInterval))
            .tickSize(-height)
            .tickFormat('')
        );
      svg
        .select('.y-grid')
        .call(
          d3.axisLeft(newYScale)
            .ticks(10)
            .tickSize(-width)
            .tickFormat('')
        );

      svg
        .selectAll('.line')
        .attr(
          'd',
          d3
            .line()
            .x((d) => newXScale(d.time))
            .y((d) => newYScale(d.totalConcentration))
        );

      svg
        .selectAll('.dot')
        .attr('cx', (d) => newXScale(d.time))
        .attr('cy', (d) => newYScale(d.totalConcentration));
    });

    d3.select(chartRef.current).select('svg').call(zoom);
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

      totalConcentrationData.push({ time, totalConcentration });
    }

    return totalConcentrationData;
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

  return <div className="chart-area" ref={chartRef}></div>;
};

export default ChartArea;
