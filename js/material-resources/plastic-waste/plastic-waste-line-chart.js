(function () {
  const aspectRatio = 0.7; // Define an aspect ratio for the chart

  // Get the container and its dimensions
  const container = document.getElementById("plastic-waste-line-chart");
  const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
  const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio

  // Calculate the dynamic margins
  const dynamicMargin = {
    top: containerHeight * 0.1, // 10% of the container height
    right: containerWidth * 0.15, // 15% of the container width
    bottom: containerHeight * 0.1, // 10% of the container height
    left: containerWidth * 0.07, // 7% of the container width
  };

  // Calculate the width and height for the inner drawing area
  const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
  const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

  // Append SVG object
  const svg = d3
    .select("#plastic-waste-line-chart")
    .append("svg")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

  // X and Y scales
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  // Define the axes
  const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%Y"));
  const yAxis = d3.axisLeft(y).tickFormat((d) => d / 1000);

  const colorScale = d3
    .scaleOrdinal()
    .domain([
      "Generation",
      "Recycled",
      "Combustion with Energy Recovery",
      "Landfill",
    ])
    .range(["#3167A4", "#ED974A", "#CE5845", "#4084BC",]);

  const tooltip = d3.select("#tooltip");

  // Load and process the CSV data
  d3.csv(plasticWaste1).then((data) => {
    // Parse years and convert string values to numbers
    data.forEach((d) => {
      d.Year = new Date(+d.Year, 0, 1);
      for (let prop in d) {
        if (prop !== "Year") {
          if (d[prop] === "") {
            d[prop] = undefined;       // Set as undefined for missing values
          } else {
            d[prop] = +d[prop];        // Convert to number if the value exists
          }
        }
      }
    });

    // Update the scale domains with the processed data
    x.domain(d3.extent(data, (d) => d.Year));
    const maxYValue = Math.ceil(
      d3.max(data, (d) =>
        Math.max(
          d["Combustion with Energy Recovery"],
          d["Generation"],
          d["Recycled"],
          d["Landfill"]
        )
      ) / 10000
    ) * 10000;
    y.domain([0, maxYValue]);


  // Draw the X-axis
  const maxDataYear = d3.max(data, (d) => d.Year);
  const decadeTicks = d3.timeYears(x.domain()[0], x.domain()[1]).filter(d => d.getFullYear() % 10 === 0); // increment by decade

  // Ensure maxDataYear is included
  let xTickValues = decadeTicks;
  if (!xTickValues.some(d => d.getFullYear() === maxDataYear.getFullYear())) {
    xTickValues = xTickValues.concat(maxDataYear);
  }

  xAxis.tickValues(xTickValues);

const xAxisGroup = svg
  .append("g")
  .attr("transform", `translate(0,${height})`)
  .call(xAxis);

xAxisGroup.selectAll(".tick text").attr("class", "chart-labels");


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
      .attr("transform", `translate(0, -${dynamicMargin.top / 2})`)
      .style("fill", "#000")
      .text("Thousand Tons");

    // Define the line generator
    const lineGenerator = d3.line()
      .defined(d => !isNaN(d.value))   // Ignore data points that are NaN
      .x(d => x(d.Year))
      .y(d => y(d.value));

    // Transform the data into a format suitable for line charts
    const keys = [
      "Combustion with Energy Recovery",
      "Generation",
      "Recycled",
      "Landfill",
    ];
    const lineData = keys.map((key) => ({
      key,
      values: data.map((d) => ({ Year: d.Year, value: d[key] })),
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
      .style("stroke-width", 1.5);

    lines.each(function(lineData) {
      // Select the current line group
      const lineGroup = d3.select(this);
    
      // Append circles to the line group
      lineGroup
        .selectAll('.line-dot')
        .data(lineData.values.filter(d => d.value != null))  // Filter out missing data
        .enter()
        .append('circle')
        .attr('class', 'line-dot')
        .attr('cx', d => x(d.Year))
        .attr('cy', d => y(d.value))
        .attr('r', 2) // Set the radius of the circle
        .style('fill', colorScale(lineData.key));
      });


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
      const lastDatum = series.values[series.values.length - 1]; // Get the last data point
      const legendItem = d3.select(this);

      let fixLegend = series.key;
      if (series.key == "Combustion with Energy Recovery") {
         fixLegend= "Combustion";
      }

      legendItem
        .append("text")
        .datum(lastDatum)
        .attr("transform", function (d) {
          return `translate(${width},${y(d.value)})`; // Adjust these values as needed for correct positioning
        })
        .attr("class", "chart-labels")
        .attr("x", 5) // This sets the distance of the text from the end of the line
        .attr("dy", ".35em") // This aligns the text vertically
        // .style("fill", colorScale(series.key))
        .style("fill", "black")
        .text(fixLegend);
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
                        "Generation"
                      )};"></span>Generation</td>
                      <td class="value">${formatNumber(
                        hoverData["Generation"]
                      )} Tons</td>
                  </tr>
                  <td><span class="color-legend" style="background-color: ${colorScale(
                    "Landfill"
                    )};"></span>Landfill</td>
                    <td class="value">${formatNumber(
                      hoverData["Landfill"]
                    )} Tons</td>
                  <tr>
                      <td><span class="color-legend" style="background-color: ${colorScale(
                        "Combustion with Energy Recovery"
                      )};"></span>Combustion with Energy Recovery</td>
                      <td class="value">${formatNumber(
                        hoverData["Combustion with Energy Recovery"]
                      )} Tons</td>
                  </tr>
  
                  <tr>
                      <td><span class="color-legend" style="background-color: ${colorScale(
                        "Recycled"
                      )};"></span>Recycled</td>
                      <td class="value">${formatNumber(
                        hoverData["Recycled"]
                      )} Tons</td>
                  </tr>
                  <tr>
              </tr>
              </table>
            `);

          const hoverDataPoints = keys
            .map(key => ({ key, value: hoverData[key] }))
            .filter(d => d.value != null); // Filter out keys with missing data for the hovered year
          
          mouseG
            .selectAll("circle")
            .data(hoverDataPoints)
            .join("circle")
            .attr("cx", x(hoverData.Year))
            .attr("cy", d => y(d.value))
            .attr("r", 4)
            .style("fill", d => colorScale(d.key))
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