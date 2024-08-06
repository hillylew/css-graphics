(function () {
    /* ----------------------- Create Tooltip ------------------------ */
    const container = document.getElementById("personal-transportation-line-chart");
  
    const tooltipDiv = document.createElement("div");
    tooltipDiv.id = "tooltip";
    tooltipDiv.className = "tooltip";
    container.appendChild(tooltipDiv);
  
    const tooltip = d3.select(container).select("#tooltip");
  
    const aspectRatio = 0.7; // Define an aspect ratio for the chart
  
    // Get the container and its dimensions
    const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
    const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio
  
    // Calculate the dynamic margins
    const dynamicMargin = {
      top: containerHeight * 0.1, // 20% of the container height
      right: containerWidth * 0.2, // 20% of the container width
      bottom: containerHeight * 0.1, // 10% of the container height
      left: containerWidth * 0.07, // 7% of the container width
    };
  
    // Calculate the width and height for the inner drawing area
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;
  
    // Append SVG object
    const svg = d3
      .select("#personal-transportation-line-chart")
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
    const yAxis = d3.axisLeft(y).tickFormat(d3.format(",")).ticks(6);
  
    const colorScale = d3
      .scaleOrdinal()
      .domain([
        "Trucks",
        "Cars",
        "Weighted Average"
      ])
      .range([
        "#1d476d", // Trucks
        "#3167a4", // Cars
        "#8fc8e5"  // Weighted Average
      ]);
  
    // Load and process the CSV data
    d3.csv("../../data/mobility/personal-transportation/personal-transportation1.csv").then((data) => {
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
      const maxYValue =
        Math.ceil(
          d3.max(data, (d) =>
            Math.max(
              d["Trucks"],
              d["Cars"],
              d["Weighted Average"]
            )
          ) / 5
        ) * 5;
      y.domain([0, maxYValue]);
  
      // Draw X-axis
    //  const endYear = d3.max(data, (d) => d.Year.getFullYear());
  
     // Filter xTickValues to exclude filteredYears
     const xTickValues = x.ticks(d3.timeYear.every(5))
       .filter(year => year.getFullYear());
  
    //  if (!xTickValues.includes(endYear)) {
    //    xTickValues.push(new Date(endYear, 0, 1));
    //  }
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
  
      xAxisGroup
        .selectAll(".tick text")
        .attr("class", "chart-labels");
  
      // Draw the Y-axis
      const yAxisGroup = svg
        .append("g")
        .call(yAxis)
        .attr("class", "chart-labels");
  
      // Define the y-axis label with the desired text and formatting
      const yAxisLabel = yAxisGroup.append("text")
        .attr("class", "chart-labels")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(0, -${dynamicMargin.top / 2})`)
        .style("fill", "#000");
  
      yAxisLabel.append("tspan").text("MPG");
  
  
      // Define the line generator
      const lineGenerator = d3
        .line()
        .defined((d) => !isNaN(d.value)) // Ignore data points that are NaN
        .x((d) => x(d.Year))
        .y((d) => y(d.value));
  
      // Transform the data into a format suitable for line charts
      const keys = [
        "Trucks",
        "Cars",
        "Weighted Average"
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
      legend.each(function (series) {
        const lastDatum = series.values[series.values.length - 1]; // Get the last data point
        const legendItem = d3.select(this);
  
        legendItem
          .append("text")
          .datum(lastDatum)
          .attr("transform", function (d) {
            return `translate(${width},${y(d.value)})`; // Adjust these values as needed for correct positioning
          })
          .attr("class", "chart-labels")
          .attr("x", 5) // This sets the distance of the text from the end of the line
          .attr("dy", ".35em") // This aligns the text vertically
          .style("fill", colorScale(series.key))
          .text(series.key);
      });
  
      const formatNumber = d3.format(".1f"); // Format with one decimal place
  
      function onMouseMove(event) {
        const [xPos, yPos] = d3.pointer(event, this);
        const date = x.invert(xPos);
        const hoverData = data.find(
          (d) => d.Year.getFullYear() === date.getFullYear()
        );
  
        // Position tooltip
        tooltip
          .style("opacity", 0.9)
          .style("left", `${event.pageX + dynamicMargin.left / 4}px`)
          .style("top", `${event.pageY}px`);
  
        if (hoverData) {
          tooltip.html(`
              <div class="tooltip-title">${hoverData.Year.getFullYear()}</div>
              <table class="tooltip-content">
                <tr>
                  <td><span class="color-legend" style="background-color: ${colorScale("Trucks")};"></span>Trucks</td>
                  <td class="value">${formatNumber(hoverData["Trucks"])}</td>
                </tr>
                <tr>
                  <td><span class="color-legend" style="background-color: ${colorScale("Cars")};"></span>Cars</td>
                  <td class="value">${formatNumber(hoverData["Cars"])}</td>
                </tr>
                <tr>
                  <td><span class="color-legend" style="background-color: ${colorScale("Weighted Average")};"></span>Weighted Average</td>
                  <td class="value">${formatNumber(hoverData["Weighted Average"])}</td>
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