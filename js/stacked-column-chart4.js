(function () {
  // Dynamic dimensions
  const aspectRatio = 0.6;

  // Get the container and its dimensions
  const container = document.getElementById("stacked-column-chart4");
  const containerWidth = container.offsetWidth;
  const containerHeight = containerWidth * aspectRatio;

  // Calculate the dynamic margins
  const dynamicMargin = {
    top: containerHeight * 0.15,
    right: containerWidth * 0.05,
    bottom: containerHeight * 0.1,
    left: containerWidth * 0.08,
  };

  // Calculate the width and height for the inner drawing area
  const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
  const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

  // Append SVG object
  const svg = d3
    .select("#stacked-column-chart4")
    .append("svg")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

  // Load data from CSV - replace with the correct path to your CSV file
  d3.csv("./data/graph-17-data.csv").then((data) => {
    // Process data and calculate percentages
    const categories = data.columns.slice(1); // assuming first column is 'Location'

    // Normalize data to percentages
    data.forEach((d) => {
      var total = 0;
      categories.forEach((category) => {
        d[category] = +d[category];
        total += d[category];
      });
      categories.forEach((category) => {
        d[category] = (d[category] / total) * 100; // convert to percentage
      });
    });

    // Define scales
    const xScale = d3.scaleLinear().range([0, width]).domain([0, 100]);
    const yScale = d3
      .scaleBand()
      .range([0, height])
      .domain(data.map((d) => d.Location))
      .padding(0.1);

    // Define the colors for the stack
    const colorScale = d3
      .scaleOrdinal()
      .range([
        "#ae416c",
        "#e16674",
        "#c1824b",
        "#c36043",
        "#799a6c",
        "#7088b0",
        "#d8d8d8",
      ]);

    const tooltip = d3.select("#tooltip");

    // Add one group for each row of data
    const groups = svg
      .selectAll("g.layer")
      .data(d3.stack().keys(categories)(data))
      .enter()
      .append("g")
      .classed("layer", true)
      .style("fill", (d) => colorScale(d.key));

    // Draw the bars
    groups
      .selectAll("rect")
      .data((d) => d)
      .enter()
      .append("rect")
      .attr("y", (d) => yScale(d.data.Location))
      .attr("x", (d) => xScale(d[0]))
      .attr("height", yScale.bandwidth())
      .attr("width", (d) => xScale(d[1]) - xScale(d[0]));

      

    groups
      .selectAll("rect")
      .on("mouseover", (event, d) => {
        // Make the tooltip visible
        tooltip
          .style("opacity", 1)
      })
      .on("mousemove", (event, d) => {
        const mousePosition = d3.pointer(event);
        const category = d3.select(event.target.parentNode).datum().key; // This gets the key for the category of this element

        tooltip
          .html(
            `
            <div class="tooltip-title">${d.data.Location}</div>
            <table class="tooltip-content">  
            <tr>
                <td><span class="color-legend" style="background-color: ${colorScale(category)};"></span>${category}: </td>
                <td class="value">${(d[1] - d[0]).toFixed(0)}%</td>
            </tr>
            </table>`
          )
          .style("opacity", 0.9)
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        // Hide the tooltip
        tooltip
          .style("opacity", 0)
      });

    // Create custom tick values
    const tickValues = d3.range(0, 101, 20); // Generates an array [0, 20, 40, 60, 80, 100]

    // Add an axis to show the percentage
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(tickValues) // Set custom tick values
      .tickFormat((d) => d + "%")
      .tickSizeOuter(0)
      .tickSizeInner(0);

    // Append xAxis to svg (this part remains unchanged)
    const xAxisGroup = svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .attr("class", "chart-labels")
      .call(xAxis);

    // Remove the path for the x-axis line
    xAxisGroup.select(".domain").remove();

    // Conditionally style the tick text based on their data value
    xAxisGroup.selectAll(".tick text").style("text-anchor", (d) => {
      return d === 0 ? "start" : d === 100 ? "end" : "middle";
    });

    // Optional: Add a yAxis
    const yAxis = d3
      .axisLeft(yScale)
      .tickSizeOuter(0)
      .tickSizeInner(0)
      .tickPadding(5);
    svg.append("g").attr("class", "chart-labels").call(yAxis);

    // Append a g element for each category to serve as a legend on top of the chart
    const legend = svg
      .selectAll(".legend")
      .data(categories)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => {
        const legendX = i * (width / categories.length); // Spacing out legends
        const legendY = -dynamicMargin.top / 2; // Positioning above the bars
        return `translate(${legendX}, ${legendY})`;
      });

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", (d) => colorScale(d));

    legend
      .append("text")
      .attr("class", "chart-labels")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .text((d) => d);
  });
})();
