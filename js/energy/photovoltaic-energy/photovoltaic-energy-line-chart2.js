(function () {
  /* ----------------------- Create Tooltip ------------------------ */
  const container = document.getElementById("photovoltaic-energy-line-chart2");

  const tooltipDiv = document.createElement("div");
  tooltipDiv.id = "tooltip";
  tooltipDiv.className = "tooltip";
  container.appendChild(tooltipDiv);
  
  const tooltip = d3.select(container).select("#tooltip");

  const aspectRatio = 0.65; // Define an aspect ratio for the chart
  // Get the container and its dimensions
  const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
  const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio

  // Calculate the dynamic margins
  const dynamicMargin = {
    top: containerHeight * 0.1, // 5% of the container height
    right: containerWidth * 0.3, // 10% of the container width
    bottom: containerHeight * 0.1, // 10% of the container height
    left: containerWidth * 0.05, // 7% of the container width
  };

  const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
  const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;
  // Append SVG object
  const svg = d3
    .select("#photovoltaic-energy-line-chart2")
    .append("svg")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);
  // X and Y scales
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%Y"));
  const yAxis = d3.axisLeft(y); // Format as dollars with two decimal places

  const colorScale = d3
    .scaleOrdinal()
    .domain([
      "22 Panel System Residential PV",
      "200 kW Commercial PV",
      "100 MW Utility-Scale PV, Fixed Tilt",
      "100 MW Utility-Scale PV, One Axis Tracker",
    ])
    .range(["#1d476d", "#4084bc", "#ED974A", "#CE5845"]);

  
  d3.csv(photovoltaic3).then((data) => {
    // Parse years and convert string values to numbers
    data.forEach((d) => {
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
    x.domain(d3.extent(data, (d) => d.Year));

    const maxYValue = Math.ceil(
      d3.max(data, (d) =>
        Math.max(
          d["22 Panel System Residential PV"],
          d["200 kW Commercial PV"],
          d["100 MW Utility-Scale PV, Fixed Tilt"],
          d["100 MW Utility-Scale PV, One Axis Tracker"]
        )
      )
    );

    y.domain([0, maxYValue]);

    // Draw the Y-axis
    const yAxisGroup = svg
      .append("g")
      .call(yAxis)
      .attr("class", "chart-labels");

    // Append y-axis label
    yAxisGroup
      .append("text")
      .attr("class", "chart-labels")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${dynamicMargin.left / 2}, -${dynamicMargin.top / 2})`)
      .style("fill", "#000")
      .text("2023 USD / Watt");

    // Draw X-axis
    const endYear = d3.max(data, (d) => d.Year.getFullYear());

    // Filter xTickValues to exclude filteredYears
    const xTickValues = x.ticks(d3.timeYear.every(2))
      .filter(year => year.getFullYear());

    if (!xTickValues.includes(endYear)) {
      xTickValues.push(new Date(endYear, 0, 1));
    }
    xAxis.tickValues(xTickValues);

    const xAxisGroup = svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);

    xAxisGroup
      .selectAll(".tick text")
      .attr("class", "chart-labels")
      .style("text-anchor", (d) => {
        return d.getFullYear()
      });

    // Define the line generator
    const lineGenerator = d3
      .line()
      .x((d) => x(d.Year))
      .y((d) => y(d.value));

    // Transform the data into a format suitable for line charts
    const keys = [
      "22 Panel System Residential PV",
      "200 kW Commercial PV",
      "100 MW Utility-Scale PV, Fixed Tilt",
      "100 MW Utility-Scale PV, One Axis Tracker",
    ];

    const lineData = keys.map((key) => ({
      key,
      values: data
        .map((d) => ({ Year: d.Year, value: d[key] }))
        .filter((d) => d.value !== undefined),

    }));
    // Create a group for each line
    const lines = svg
      .selectAll(".line")
      .data(lineData)
      .enter()
      .append("g")
      .attr("class", "line");
    // Draw the lines
    lines
      .append("path")
      .attr("class", "line-path")
      .attr("d", (d) => lineGenerator(d.values))
      .style("fill", "none")
      .style("stroke", (d) => colorScale(d.key))
      .style("stroke-width", 1);

    // Add legend
    const legend = svg
      .selectAll(".legend")
      .data(lineData)
      .enter()
      .append("g")
      .attr("class", "legend")
      .on("mouseover", (event, d) => {
        // Highlight the hovered line
        svg
          .selectAll(".line-path")
          .style("opacity", (lineData) => (lineData.key === d.key ? 1 : 0.2))
          .style("stroke-width", (lineData) =>
            lineData.key === d.key ? 2 : 1
          ); // Adjust stroke width on hover
      })
      .on("mouseout", () => {
        // Reset style for all lines on mouseout
        svg
          .selectAll(".line-path")
          .style("opacity", 1)
          .style("stroke-width", 1); // Reset stroke width
      });
    // Append legend text
    legend.each(function (series, index) {
      const lastDatum = series.values[series.values.length - 1];
      const legendItem = d3.select(this);
      const legendNames = {
        "22 Panel System Residential PV": ["Residential PV"],
        "200 kW Commercial PV": ["Commercial PV"],
        "100 MW Utility-Scale PV, Fixed Tilt": ["Utility-Scale PV, Fixed Tilt"],
        "100 MW Utility-Scale PV, One Axis Tracker": [
          "Utility-Scale PV, One Axis Tracker",
        ],
      };

      const lines = legendNames[series.key];

      lines.forEach((line, i) => {
        legendItem
          .append("text")
          .datum(lastDatum)
          .attr("transform", function (d) {
            return `translate(${width},${y(d.value) + i * 12})`; // Adjust these values as needed for correct positioning
          })
          .attr("class", "table-labels")
          .attr("x", 5) // This sets the distance of the text from the end of the line
          .attr("dy", ".35em") // This aligns the text vertically
          // .style("fill", colorScale(series.key))
          .style("fill", "black")
          .text(line);
      });
    });

    function onMouseMove(event) {
      const [xPos, yPos] = d3.pointer(event, this);
      const date = x.invert(xPos);
      const hoverData = data.find(
        (d) => d.Year.getFullYear() === date.getFullYear()
      );

      const tooltipX = event.clientX;
      const tooltipY = event.clientY;

      // Position tooltip
      tooltip
        .style("opacity", 0.9)
        .style("left", `${tooltipX + dynamicMargin.left / 4}px`)
        .style("top", `${tooltipY}px`);
      const formatNumber = d3.format(",");
      if (hoverData) {
        tooltip.html(`
          <div class="tooltip-title">${hoverData.Year.getFullYear()}</div>
          <table class="tooltip-content">
          <tr>
                      <td><span class="color-legend" style="background-color: ${colorScale(
                        "22 Panel System Residential PV"
                      )};"></span>22 Panel System Residential PV</td>
                      <td class="value">$${formatNumber(
                        hoverData["22 Panel System Residential PV"]
                      )}</td>
                      </tr>
                      <tr>
                      <td><span class="color-legend" style="background-color: ${colorScale(
                        "200 kW Commercial PV"
                      )};"></span>200 kW Commercial PV</td>
                      <td class="value">$${formatNumber(
                        hoverData["200 kW Commercial PV"]
                      )}</td>
                       </tr>
                       <tr>
                      <td><span class="color-legend" style="background-color: ${colorScale(
                        "100 MW Utility-Scale PV, One Axis Tracker"
                      )};"></span>100 MW Utility-Scale PV, One Axis Tracker</td>
                      <td class="value">$${formatNumber(
                        hoverData["100 MW Utility-Scale PV, One Axis Tracker"]
                      )}</td>
                      </tr>
                  <tr>
                  <td><span class="color-legend" style="background-color: ${colorScale(
                    "100 MW Utility-Scale PV, Fixed Tilt"
                  )};"></span>100 MW Utility-Scale PV, Fixed Tilt</td>
                  <td class="value">$${formatNumber(
                    hoverData["100 MW Utility-Scale PV, Fixed Tilt"]
                  )}</td>
              </tr>
              </table>
            `);

        mouseG
          .selectAll("circle")
          .data(keys)
          .join("circle")
          .attr("cx", x(hoverData.Year))
          .attr("cy", (d) => y(hoverData[d]))
          .attr("r", 4)
          .style("fill", (d) => colorScale(d))
          .style("stroke", "white")
          .style("opacity", "1");

        // Draw the vertical line
        mouseG
          .select(".mouse-line")
          .style("opacity", "1")
          .attr("d", () => `M${x(hoverData.Year)},0V${height}`);
      }
    }

    const mouseG = svg.append("g").attr("class", "mouse-over-effects");

    // Append a line that will follow the mouse cursor
    mouseG
      .append("path")
      .attr("class", "mouse-line")
      .style("stroke", "#999")
      .style("stroke-width", "0.5px")
      .style("opacity", "0");

    // Create a rect for listening to mouse events
    svg
      .append("rect")
      .attr("class", "listening-rect")
      .attr("width", width + dynamicMargin.left / 4)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mousemove", onMouseMove)
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
        mouseG.selectAll("circle").style("opacity", "0");
        mouseG.select(".mouse-line").style("opacity", "0");
      });
  });
})();
