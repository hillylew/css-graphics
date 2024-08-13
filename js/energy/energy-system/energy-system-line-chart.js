(function() {
  /* ----------------------- Create Tooltip ------------------------ */
  const container = document.getElementById("energy-system-line-chart");

  const tooltipDiv = document.createElement("div");
  tooltipDiv.id = "tooltip";
  tooltipDiv.className = "tooltip";
  container.appendChild(tooltipDiv);

  const tooltip = d3.select(container).select("#tooltip");

  /* ----------------------- Dynamic dimensions ----------------------- */
  const aspectRatio = 0.6; // Define an aspect ratio for the chart

  // Get the container and its dimensions
  const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
  const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio

  // Calculate the dynamic margins
  const dynamicMargin = {
    top: containerHeight * 0.1, // 5% of the container height
    right: containerWidth * 0.3, // 30% of the container width
    bottom: containerHeight * 0.05, // 10% of the container height
    left: containerWidth * 0.05, // 7% of the container width
  };

  // Calculate the width and height for the inner drawing area
  const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
  const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

  // Append SVG object
  const svg = d3
    .select("#energy-system-line-chart")
    .append("svg")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

  // X and Y scales
  const x = d3.scaleTime().range([0, width]);
  const yLeft = d3.scaleLinear().range([height, 0]).domain([0, 100]);
  const yRight = d3.scaleLinear().range([height, 0]).domain([0, 360]);

  // Define the axes
  const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%Y"));
  const yAxisLeft = d3.axisLeft(yLeft).tickFormat(d3.format(",")).ticks(4);
  const yAxisRight = d3.axisRight(yRight).tickFormat(d3.format(",")).tickValues([60, 120, 180, 240, 300, 360, 420]);

  const colorScale = d3
    .scaleOrdinal()
    .domain([
      "Total Energy Consumption",
      "Renewable Energy Consumption",
      "Energy Consumption Per Capita"
    ])
    .range([
      "#3167A4", // Total Energy Consumption
      "#3167A4", // Renewable Energy Consumption
      "#CE5845"  // Energy Consumption Per Capita
    ]);

  // Load and process the CSV data
  d3.csv(energySystem1).then(data => {
      // Parse years and convert string values to numbers
      data.forEach(d => {
          d.Year = new Date(+d.Year, 0, 1);
          for (let prop in d) {
              if (prop !== "Year") {
                  if (d[prop] === "") {
                      d[prop] = undefined; // Set as undefined for missing values
                  } else {
                      d[prop] = +d[prop]; // Convert to number if the value exists
                  }
              }
          }
      });

      // Update the scale domains with the processed data
      x.domain(d3.extent(data, d => d.Year));

      // Draw X-axis
      const xTickValues = x
          .ticks(d3.timeYear.every(10))
          .filter(year => year.getFullYear());

      xAxis.tickValues(xTickValues);

      const xAxisGroup = svg
          .append("g")
          .attr("transform", `translate(0,${height})`)
          .call(xAxis);

      xAxisGroup.selectAll(".tick text")
          .attr("class", "chart-labels")
          .style("text-anchor", d => {
              return d.getFullYear();
          });

      xAxisGroup.selectAll(".tick text").attr("class", "chart-labels");

      // Draw Y-axes
      const yAxisLeftGroup = svg.append("g")
      .call(yAxisLeft)
      .attr("class", "chart-labels")
      .style("color", "#3167A4"); // Change the color of the left y-axis

    const yAxisRightGroup = svg.append("g")
      .attr("transform", `translate(${width},0)`)
      .call(yAxisRight)
      .attr("class", "chart-labels")
      .style("color", "#CE5845"); // Change the color of the right y-axis

    // Add y-axis labels
    yAxisLeftGroup.append("text")
      .attr("class", "chart-labels")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(0, ${-dynamicMargin.top / 2})`)
      .style("fill", "#3167A4") // Ensure the label color matches the axis color
      .text("Quads");

    yAxisRightGroup.append("text")
      .attr("class", "chart-labels")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(0, ${-dynamicMargin.top / 2})`)
      .style("fill", "#CE5845") // Ensure the label color matches the axis color
      .text("Quadrillion BTU");


      // Define the line generator
      const lineGenerator = (scale) => d3.line()
          .defined(d => !isNaN(d.value)) // Ignore data points that are NaN
          .x(d => x(d.Year))
          .y(d => scale(d.value));

      // Transform the data into a format suitable for line charts
      const keys = [
          "Total Energy Consumption",
          "Renewable Energy Consumption",
          "Energy Consumption Per Capita"
      ];

      const lineData = keys.map(key => ({
          key,
          values: data.map(d => ({ Year: d.Year, value: d[key] }))
      }));

      // Create a group for each line
      const lines = svg
          .selectAll(".line")
          .data(lineData)
          .enter()
          .append("g")
          .attr("class", "line");

      // Draw the lines
      lines.append("path")
          .attr("class", "line-path")
          .attr("d", d => lineGenerator(d.key === "Energy Consumption Per Capita" ? yRight : yLeft)(d.values))
          .style("fill", "none")
          .style("stroke", d => colorScale(d.key))
          .style("stroke-width", 2);

      // Add legend
      const legend = svg.selectAll(".legend")
          .data(lineData)
          .enter()
          .append("g")
          .attr("class", "legend")
          .on("mouseover", (event, d) => {
              // Highlight the hovered line
              svg.selectAll(".line-path")
                  .style("opacity", lineData => lineData.key === d.key ? 1 : 0.2)
                  .style("stroke-width", lineData => lineData.key === d.key ? 3 : 2); // Adjust stroke width on hover
          })
          .on("mouseout", () => {
              // Reset style for all lines on mouseout
              svg.selectAll(".line-path")
                  .style("opacity", 1)
                  .style("stroke-width", 2); // Reset stroke width
          });

      // Append legend text
      legend.each(function (series) {
          const lastDatum = series.values[series.values.length - 1]; // Get the last data point
          const legendItem = d3.select(this);

          legendItem.append("text")
              .datum(lastDatum)
              .attr("transform", function (d) {
                  return `translate(${width},${series.key === "Energy Consumption Per Capita" ? yRight(d.value) : yLeft(d.value)})`; // Adjust these values as needed for correct positioning
              })
              .attr("class", "chart-labels")
              .attr("x", 5) // This sets the distance of the text from the end of the line
              .attr("dy", ".35em") // This aligns the text vertically
              // .style("fill", colorScale(series.key))
              .style("fill", "black")
              .text(series.key);
      });

      const formatNumber = d3.format(".1f"); // Format with one decimal place

      function onMouseMove(event) {
          const [xPos, yPos] = d3.pointer(event, this);
          const date = x.invert(xPos);
          const hoverData = data.find(d => d.Year.getFullYear() === date.getFullYear());

          const tooltipX = event.clientX;
          const tooltipY = event.clientY;

          tooltip.style("opacity", 0.9)
              .style("left", `${tooltipX + dynamicMargin.left / 4}px`)
              .style("top", `${tooltipY}px`);

          if (hoverData) {
              tooltip.html(`
                  <div class="tooltip-title">${hoverData.Year.getFullYear()}</div>
                  <table class="tooltip-content">
                    <tr>
                      <td><span class="color-legend" style="background-color: ${colorScale("Total Energy Consumption")};"></span>Total Energy Consumption</td>
                      <td class="value"><strong>${hoverData["Total Energy Consumption"].toFixed(1)}</strong> Quads</td>
                    </tr>
                    <tr>
                      <td><span class="color-legend" style="background-color: ${colorScale("Renewable Energy Consumption")};"></span>Renewable Energy Consumption</td>
                      <td class="value"><strong>${hoverData["Renewable Energy Consumption"].toFixed(1)}</strong> Quads</td>
                    </tr>
                    <tr>
                      <td><span class="color-legend" style="background-color: ${colorScale("Energy Consumption Per Capita")};"></span>Energy Consumption Per Capita</td>
                      <td class="value"><strong>${hoverData["Energy Consumption Per Capita"]}</strong> Quadrillion BTU</td>
                    </tr>
                  </table>
                `);

              // Remove existing circles to avoid duplicates
              mouseG.selectAll("circle").remove();

              // Append new circles
              mouseG.selectAll("circle")
                  .data(keys)
                  .enter()
                  .append("circle")
                  .attr("cx", x(hoverData.Year))
                  .attr("cy", d => d === "Energy Consumption Per Capita" ? yRight(hoverData[d]) : yLeft(hoverData[d]))
                  .attr("r", 4)
                  .style("fill", d => colorScale(d))
                  .style("stroke", "white");

              mouseG.select(".mouse-line")
                  .style("opacity", 1)
                  .attr("d", `M${x(hoverData.Year)},0V${height}`);
          }
      }

      const mouseG = svg.append("g").attr("class", "mouse-over-effects");

      // Append a line that will follow the mouse cursor
      mouseG.append("path")
          .attr("class", "mouse-line")
          .style("stroke", "#999")
          .style("stroke-width", "0.5px")
          .style("opacity", "0");

      // Create a rect for listening to mouse events
      svg.append("rect")
          .attr("class", "listening-rect")
          .attr("width", width + dynamicMargin.left / 4)
          .attr("height", height)
          .attr("fill", "none")
          .attr("pointer-events", "all")
          .on("mousemove", onMouseMove)
          .on("mouseout", () => {
              tooltip.style("opacity", 0);
              mouseG.selectAll("circle").remove();
              mouseG.select(".mouse-line").style("opacity", "0");
          });
  });
})();