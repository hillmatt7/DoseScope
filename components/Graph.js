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
    xScale.domain(d3.extent(data.totalConcentration, (d) => d.time));
    yScale.domain([0, d3.max(data.totalConcentration, (d) => d.concentration) * 1.1]);

    // Add axes
    const xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d3.format('d'));
    const yAxis = d3.axisLeft(yScale);

    // Add axes
    svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('fill', '#ffffff');

    svg
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

    // Add axis labels
    svg
      .append('text')
      .attr('transform', `translate(${width / 2},${height + margin.bottom - 10})`)
      .style('text-anchor', 'middle')
      .style('fill', '#ffffff')
      .text('Time (hours)');

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
            .x((d) => newXScale(d.time))
            .y((d) => newYScale(d.concentration))
        );

      // Update dots
      svg
        .selectAll('.dot')
        .attr('cx', (d) => newXScale(d.time))
        .attr('cy', (d) => newYScale(d.concentration));
    }
  };

  const generateData = (protocol) => {
    const totalConcentrationData = [];
    const duration = protocol.lengthUnit === 'weeks' ? protocol.length * 7 * 24 : protocol.length * 24;

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
    const { half_life, Cmax, bioavailability, Tmax } = compound;
    const clearanceRate = 0.693 / half_life;
    const concentration = (Cmax * bioavailability) * (Math.exp(-clearanceRate * time) / (1 - Math.exp(-clearanceRate * Tmax)));
    return concentration;
  };

  return <div ref={graphRef} className="graph-area"></div>;
};

export default Graph;