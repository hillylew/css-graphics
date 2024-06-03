(async () => {
  // Load data from external sources
  const us = await d3.json("https://d3js.org/us-10m.v2.json");
  const nuclearData = await d3.csv("./data/graph-2-data.csv");

  // Maps of state FIPS to color and storage data
  const fipsToData = {};
  nuclearData.forEach((d) => {
    fipsToData[d.FIPS] = {
      color: d.Color,
      storage: d["Spent Fuel in Storage"],
    };
  });

  const states = topojson
    .feature(us, us.objects.states)
    .features.filter((d) => d.id !== "02" && d.id !== "15") // Exclude Alaska and Hawaii
    .map((d) => {
      const data = fipsToData[d.id] || {};
      d.properties = { ...d.properties, ...data };
      return d;
    });

  // Dimensions and margins of the graph
  const margin = { top: 20, right: 150, bottom: 50, left: 40 };
  const width = 850 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Define the scale factor for the map
  const scaleFactor = 0.7;

  // Create geoTransform function to scale down the map
  const transform = d3.geoTransform({
    point: function (x, y) {
      this.stream.point(x * scaleFactor, y * scaleFactor);
    },
  });
  const path = d3.geoPath().projection(transform);

  // Create SVG object for the map
  const svg = d3
    .select("#interactive-map")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const tooltip = d3.select("#tooltip1");

  // Highlight states based on the color
  const highlightStates = (color) => {
    svg
      .selectAll("path")
      .transition()
      .style("opacity", (d) => (d.properties.color === color ? 1 : 0.2));

    legendContainer
      .selectAll("rect")
      .style("opacity", (d) => (d === color ? 1 : 0.2));
  };

  // Reset highlighting to default
  const resetHighlight = () => {
    svg.selectAll("path").transition().style("opacity", 1);

    legendContainer.selectAll("rect").style("opacity", 1);
  };

  const formatNumber = d3.format(",");

  // Draw the map
  svg
    .append("g")
    .selectAll("path")
    .data(states)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", (d) => d.properties.color || "#fff") 
    .attr("stroke", "#000")
    .attr("stroke-width", 0.5)
    .on("mouseover", function (event, d) {
    
      tooltip
        .html(
          `<div class="tooltip-title">${d.properties.name}</div>
           <div class="tooltip-content">
           Spent fuel in storage: ${formatNumber(d.properties.storage)}
           </div>`
        )
        .style("opacity", 0.9)
        .style("left", `${d3.pointer(event)[0] + 10}px`)
        .style("top", `${d3.pointer(event)[1] - 28}px`);
    })
    .on("mouseout", function () {
      tooltip
        .style("opacity", 0);
    });

  const legendColors = ["#b34730", "#f16248", "#f88e70", "#e0e0e0"];
  const legendText = ["> 2500 t", "1000-2500 t", "< 1000 t", "0 t"];

  const legendData = legendColors.map((color, i) => ({
    color,
    text: legendText[i],
  }));

  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(20, ${height - legendData.length * 20 - 20})`);

  legend.selectAll('rect')
    .data(legendData)
    .enter()
    .append('rect')
    .attr('x', 0)
    .attr('y', (d, i) => i * 20)
    .attr('width', 18)
    .attr('height', 18)
    .style('fill', d => d.color)
    .attr("stroke", "#000")
    .attr("stroke-width", 0.5)
    .on('mouseover', (event, d) => highlightStates(d.color))
    .on('mouseout', resetHighlight);

  legend.selectAll('text')
    .data(legendData)
    .enter()
    .append('text')
    .attr('x', 24)
    .attr('y', (d, i) => i * 20 + 9)
    .attr('dy', '.35em')
    .text(d => d.text)
    .style('font-size', '12px')
    .on('mouseover', (event, d) => highlightStates(d.color))
    .on('mouseout', resetHighlight);
})();
