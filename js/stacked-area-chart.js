(function() {
  // Set the dimensions and margins of the graph
  const margin = { top: 20, right: 150, bottom: 50, left: 60 }; 
  const width = 850 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  // Append SVG object
  const svg = d3
    .select("#stacked-area-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // X and Y scales
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  // Define the axes
  const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")).tickPadding(5);
  const yAxis = d3
    .axisLeft(y)
    .tickPadding(5)
    .tickFormat((d) => d / 1000000);

  const colorScale = d3
    .scaleOrdinal()
    .domain(["Bus", "Heavy rail", "Other rail", "Other"])
    .range(["#e41a1c", "#377eb8", "#4daf4a", "#984ea3"]);

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip");

  // Load and process the CSV data
  d3.csv("./data/graph-1-data.csv").then((data) => {
    // Parse years and convert string values to numbers
    data.forEach((d) => {
      d.Year = new Date(+d.Year, 0, 1);
      for (let prop in d) {
        if (prop !== "Year") d[prop] = +d[prop];
      }
    });

    // Stack the data
    const stack = d3.stack().keys(["Bus", "Heavy rail", "Other rail", "Other"]);
    const stackedData = stack(data);

    // Update the scale domains with the processed data
    x.domain(d3.extent(data, (d) => d.Year));
    const maxYValue = Math.ceil(d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1])) / 1000000) * 1000000;
    y.domain([0, maxYValue]);

    // Draw the Y-axis
    const yAxisGroup = svg.append("g").call(yAxis).style("font-size", "12px");

    // Append "in millions" label
    yAxisGroup
      .append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(0, ${-margin.top / 2})`)
      .style("fill", "#000")
      .style("font-size", "12px")
      .text("in millions");

    // Draw the X-axis
    // Add 2023 as a Date object
    const xTickValues = x.ticks().concat(new Date(2023, 0, 1));
    xAxis.tickValues(xTickValues);

    const xAxisGroup = svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);

    xAxisGroup
      .selectAll(".tick text")
      .style("font-size", "12px")
      .style("text-anchor", (d) => {
        return d.getFullYear() === 1990
          ? "start"
          : d.getFullYear() === 2023
          ? "end"
          : "middle";
      });

    // Define the area generator
    const area = d3
      .area()
      .x((d) => x(d.data.Year))
      .y0((d) => y(d[0]))
      .y1((d) => y(d[1]));

    // Draw the areas
    // Define the line generator
    const lineGenerator = d3
      .line()
      .x((d) => x(d.data.Year))
      .y((d) => y(d[1])); // Using the top edge of the area for the line

    // Create a group for each stacked area layer
    const layers = svg.selectAll(".layer").data(stackedData).enter().append("g");

    // Add the stacked area paths to each group
    layers
      .append("path")
      .attr("d", area)
      .style("fill-opacity", "0.8")
      .style("fill", (d) => colorScale(d.key));
      

    // Add the line paths for each group
    layers
      .append("path")
      .attr("d", lineGenerator)
      .style("fill", "none")
      .style("stroke", (d) => colorScale(d.key))
      .style("stroke-width", 1);





    // Add legend
    const legend = svg
      .selectAll(".legend")
      .data(stackedData)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d) => {
        const lastPoint = d[d.length - 1];
        const yPosition =
          y(lastPoint[0]) + (y(lastPoint[1]) - y(lastPoint[0])) / 2;
        return `translate(${width + 5},${yPosition})`;
      });

    legend
      .append("text")
      .attr("x", 5)
      .attr("y", 0)
      .style("text-anchor", "start")
      .style("alignment-baseline", "middle")
      .style("fill", (d) => colorScale(d.key))
      .style("font-size", "12px")
      .text((d) => d.key);



// Define the pandemic arrow
svg.append("line")
  .attr("x1", x(new Date(2019, 0, 1)))
  .attr("y1", y(maxYValue) + 5) =
  .attr("x2", x(new Date(2019, 0, 1)))
  .attr("y2", y(maxYValue) + 20) 
  .attr("stroke", "red")
  .attr("stroke-width", 2)
  .attr("marker-end", "url(#arrow)");

// Define the text label for the pandemic arrow
svg.append("text")
  .attr("x", x(new Date(2019, 0, 1)))
  .attr("y", y(maxYValue)) 
  .attr("text-anchor", "middle")
  .style("fill", "red")
  .style("font-size", "12px")
  .text("Pandemic");

// Add arrow marker
svg.append("svg:defs").append("svg:marker")
  .attr("id", "arrow")
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", 0)
  .attr("refY", 0)
  .attr("markerWidth", 6)
  .attr("markerHeight", 6)
  .attr("orient", "auto")
  .append("path")
  .attr("d", "M0,-5L10,0L0,5")
  .style("fill", "red");

    


      function onMouseMove(event) {
          const [xPos, yPos] = d3.pointer(event, this);
          const date = x.invert(xPos);
          const hoverData = data.find(d => d.Year.getFullYear() === date.getFullYear());
      
          // Position tooltip
          tooltip
            .style("top", `${yPos + margin.top}px`)
            .style("left", `${xPos + margin.left}px`)
            .style("visibility", "visible");
      

          const formatNumber = d3.format(",");
          if (hoverData) {

            tooltip.html(`
              <div class="tooltip-title">${hoverData.Year.getFullYear()}</div>
              <table class="tooltip-content">
                  <tr>
                      <td><span class="color-legend" style="background-color: ${colorScale("Other")};"></span>Other</td>
                      <td class="value">${formatNumber(hoverData.Other)}</td>
                  </tr>
                  <tr>
                      <td><span class="color-legend" style="background-color: ${colorScale("Other rail")};"></span>Other rail</td>
                      <td class="value">${formatNumber(hoverData['Other rail'])}</td>
                  </tr>
                  <tr>
                      <td><span class="color-legend" style="background-color: ${colorScale("Heavy rail")};"></span>Heavy rail</td>
                      <td class="value">${formatNumber(hoverData['Heavy rail'])}</td>
                  </tr>
                  <tr>
                      <td><span class="color-legend" style="background-color: ${colorScale("Bus")};"></span>Bus</td>
                      <td class="value">${formatNumber(hoverData.Bus)}</td>
                  </tr>
              </table>
              <table class="tooltip-total">
                <tr>
                    <td><strong>Total</strong></td>
                    <td class="value">${formatNumber(hoverData.Other+hoverData['Other rail']+hoverData['Heavy rail']+hoverData.Bus)}</td>
                </tr>
              </table>
            `);
      
            // Positioning the circles
            const totalStack = [];
            let accumulatingStack = 0;
      
            // Calculate the top edge of each stack element
            ['Bus', 'Heavy rail', 'Other rail', 'Other'].forEach(cat => {
              accumulatingStack += hoverData[cat];
              totalStack.push(accumulatingStack);
            });
            
      
            mouseG.selectAll("circle")
              .data(totalStack)
              .join("circle")
              .attr("cx", x(hoverData.Year))
              .attr("cy", d => y(d))
              .attr("r", 4)
              .style("fill", (d, i) => colorScale(colorScale.domain()[i]))
              .style("stroke", "white")
              .style("opacity", "1");
      
            // Draw the vertical line
            mouseG.select(".mouse-line")
              .style("opacity", "1")
              .attr("d", () => `M${x(hoverData.Year)},0V${height}`);
          }
        }
      
        const mouseG = svg.append("g")
          .attr("class", "mouse-over-effects");
      
        // Append a line that will follow the mouse cursor
        mouseG.append("path")
          .attr("class", "mouse-line")
          .style("stroke", "#999")
          .style("stroke-width", "0.5px")
          .style("opacity", "0");
      
        // Create a rect for listening to mouse events
        svg.append('rect')
          .attr('class', 'listening-rect')
          .attr('width', width)
          .attr('height', height)
          .attr('fill', 'none')
          .attr('pointer-events', 'all')
          .on('mousemove', onMouseMove)
          .on('mouseout', () => {
            tooltip.style("visibility", "hidden");
            mouseG.selectAll("circle")
              .style("opacity", "0");
            mouseG.select(".mouse-line")
              .style("opacity", "0");
          });
      
  });
})();