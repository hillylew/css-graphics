(async () => {
  // Load data from external sources
  const us = await d3.json("https://d3js.org/us-10m.v2.json");
  const releaseData = await d3.csv(environmentalJustice1);

  // Maps of state states to color and storage data
  const fipsToData = {};
  
  releaseData.forEach((d) => {
    let color;
    // const release = parseFloat(d.amount);
    // if (release > 150) color = "#205b95";
    // else if (release >= 35 && release <= 150) color = "#4585c6";
    // else if (release >= 0.5 && release <= 35) color = "#8ab4e0";
    // else if (release < 0.5) color = "#c0c0c0";

    const release = parseFloat(d.amount);
    if (release > 150) color = "#1d476d";
    else if (release >= 35 && release <= 150) color = "#2f65a7";
    else if (release >= 0.5 && release <= 35) color = "#8fc8e5";
    else if (release < 0.5) color = "#d8d8d8";

    fipsToData[d.States] = {
      color: color,
      release: d.amount,
    };
  });


  const states = topojson.feature(us, us.objects.states).features.map((d) => {
    const data = fipsToData[d.id] || {};
    d.properties = { ...d.properties, ...data };
    return d;
  });
  

  const aspectRatio = 0.6; // Define an aspect ratio for the chart

  // Get the container and its dimensions
  const container = document.getElementById("environmental-justice-interactive-map");
  const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
  const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio

  // Calculate the dynamic margins
  const dynamicMargin = {
    top: containerHeight * 0.05, // 5% of the container height
    right: containerWidth * 0.15, // 15% of the container width
    bottom: containerHeight * 0.05, // 10% of the container height
    left: containerWidth * 0.08, // 5% of the container width
  };

  // Calculate the width and height for the inner drawing area
  const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
  const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

  // Append SVG object
  const svg = d3
    .select("#environmental-justice-interactive-map")
    .append("svg")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);


  // Define the scale factor for the map
  const scaleFactor = width / 850; // Adjust this scaling factor as needed

  // Create geoTransform function to scale down the map
  const transform = d3.geoTransform({
    point: function (x, y) {
      this.stream.point(x * scaleFactor, y * scaleFactor);
    },
  });
  const path = d3.geoPath().projection(transform);

  const tooltip = d3.select("#tooltip");

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
      d3.select(this).style("fill-opacity", 0.7);

      const tooltipX = event.clientX;
      const tooltipY = event.clientY;

      tooltip
        .html(
          `<div class="tooltip-title">${d.properties.name}</div>
          <div class="tooltip-content">
          Toxic release: <strong>${d.properties.release || 0}</strong> million lb
          </div>`
        )
        .style("opacity", 0.9)
        .style("left", `${tooltipX}px`)
        .style("top", `${tooltipY}px`);
    })
    .on("mouseout", function () {
      d3.select(this).style("fill-opacity", 1);
      tooltip.style("opacity", 0);
    });

  // Create the legend
  // const legendColors = ["#205b95", "#4585c6", "#8ab4e0", "#c0c0c0"];
  const legendColors = ["#1d476d", "#2f65a7", "#8fc8e5", "#d8d8d8"];
  const legendText = [
    "> 150",
    "35 - 150",
    "0.5 - 35",
    "< 0.5",
  ];

  const legendData = legendColors.map((color, i) => ({
    color,
    text: legendText[i],
  }));

  // Adjust legend position to the right of the map.
  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width + dynamicMargin.left/2}, ${height / 2})`); // Adjust this line for legend positioning

  // Calculate the dimensions for legend items
  const legendItemSize = containerWidth * 0.02; // Set the width and height to be 3% of the container width
  const gap = containerHeight * 0.01; // Set the gap between legend items

  // Update the legend position
  // const legend = svg.append("g")
  //   .attr("transform", `translate(${width}, ${height * 0.6})`);

  // Append legend items
  legendData.forEach((d, i) => {
    legend.append("rect")
      .attr("x", 0)
      .attr("y", i * (legendItemSize + gap)) // Adjust spacing between legend items
      .attr("width", legendItemSize)
      .attr("height", legendItemSize)
      .style("fill", d.color)
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .attr("rx", 2) // Rounded corners
      .attr("ry", 2) // Rounded corners
      .attr("class", "legend-rect")
      .on("mouseover", (event, data) => highlightStates(d.color))
      .on("mouseout", resetHighlight);

    legend.append("text")
      .attr("x", legendItemSize + gap)
      .attr("y", i * (legendItemSize + gap) + legendItemSize / 2)
      .attr("alignment-baseline", "middle")
      .text(d.text)
      .attr("class", "chart-labels")
      .on("mouseover", (event, data) => highlightStates(d.color))
      .on("mouseout", resetHighlight);
  });
})();
