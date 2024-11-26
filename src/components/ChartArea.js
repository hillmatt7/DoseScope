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
    const timeUnit = scaleSettings?.timeUnit || protocol?.lengthUnit || 'hours';
    let minorTickInterval = 1; // Default to 1 hour
    let timeFormat = (d) => `${d} h`;

    // Modify timeFormat and minorTickInterval based on timeUnit if needed

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
      .text('Time (hours)');

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
    const dataMap = new Map();
    let maxTime = 0;

    protocol.compounds.forEach((compound) => {
      if (compound.calculationResult && compound.calculationResult.length > 0) {
        compound.calculationResult.forEach((point) => {
          const time = point.time;
          const concentration = point.concentration;
          if (!dataMap.has(time)) {
            dataMap.set(time, 0);
          }
          dataMap.set(time, dataMap.get(time) + concentration);
          if (time > maxTime) maxTime = time;
        });
      }
    });

    const data = [];
    for (let time = 0; time <= maxTime; time += 0.5) {
      const totalConcentration = dataMap.get(time) || 0;
      data.push({ time, totalConcentration });
    }

    return data;
  };

  return <div className="chart-area" ref={chartRef}></div>;
};

export default ChartArea;
