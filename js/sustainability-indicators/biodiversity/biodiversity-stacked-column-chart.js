(function () {
  /* ----------------------- Create Tooltip ------------------------ */
  const container = document.getElementById(
    "biodiversity-stacked-column-chart"
  );

  const tooltipDiv = document.createElement("div");
  tooltipDiv.id = "tooltip";
  tooltipDiv.className = "tooltip";
  container.appendChild(tooltipDiv);

  const tooltip = d3.select(container).select("#tooltip");

  // Dynamic dimensions
  const aspectRatio = 0.6;

  // Get the container and its dimensions
  const containerWidth = container.offsetWidth;
  const containerHeight = containerWidth * aspectRatio;

  // Calculate the dynamic margins
  const dynamicMargin = {
    top: containerHeight * 0.05,
    right: containerWidth * 0.4,
    bottom: containerHeight * 0.05,
    left: containerWidth * 0.08,
  };

  // Calculate the width and height for the inner drawing area
  const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
  const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

  // Append SVG object
  const svg = d3
    .select("#biodiversity-stacked-column-chart")
    .append("svg")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

  // Load data from CSV - replace with the correct path to your CSV file

  // Define csv file path if it's not already defined
  if (typeof csvFile === "undefined") {
    var csvFile =
      "../../data/sustainability-indicators/biodiversity/biodiversity1.csv";
  }

  d3.csv(csvFile).then((data) => {
    // Process data and calculate percentages
    const categories = data.columns.slice(1); // assuming the first column is 'Location'

    // Normalize data to percentages
    data.forEach((d) => {
      let total = 0;
      categories.forEach((category) => {
        d[category] = +d[category];
        total += d[category];
      });

      // Store original values and calculate percentages
      categories.forEach((category) => {
        d[category + "_original"] = d[category]; // Store original value in a new property
        d[category] = (d[category] / total) * 100; // Convert to percentage
      });
    });

    // Define scales
    const yScale = d3.scaleLinear().range([height, 0]).domain([0, 100]);
    const xScale = d3
      .scaleBand()
      .range([0, width])
      .domain(data.map((d) => d.Location))
      .padding(0.1);

    // Define the colors for the stack
    const colorScale = d3
      .scaleOrdinal()
      // .range([
      //   "#ae416c",
      //   "#e16674",
      //   "#c1824b",
      //   "#c36043",
      //   "#799a6c",
      //   "#7088b0",
      //   "#d8d8d8",
      // ]);
      .range([
        // "#1d476d",
        "#3167a4",
        "#8fc8e5",
        "#386660",
        "#e2e27a",
        "#ffcb03",
        "#ce5845",
        "#ed974a",
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
      .attr("x", (d) => xScale(d.data.Location))
      .attr("y", (d) => yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => yScale(d[0]) - yScale(d[1]));

    // Define a variable to store the selected category for highlighting
    let highlightedCategory = null;

    const legend = svg
      .append("g")
      .attr("class", "chart-labels")
      .attr("transform", `translate(${width + dynamicMargin.left / 2}, 0)`);

    const legendItemHeight = containerHeight * 0.05;
    const highlightOpacity = 0.8;
    const dimmedOpacity = 0.2;

    categories
      .slice()
      .reverse()
      .forEach((category, i) => {
        // Define each legend item
        const legendRow = legend
          .append("g")
          .attr("transform", `translate(0, ${i * legendItemHeight})`)
          .classed("legend-item", true)
          .on("mouseover", function () {
            // Highlight all rect of this category (i.e., same color) across all groups
            highlightedCategory = category;
            svg
              .selectAll(".layer")
              .style("opacity", (d) =>
                d.key === category ? highlightOpacity : dimmedOpacity
              );
          })
          .on("mouseout", function () {
            // Reset the opacity and clear the highlighted category
            highlightedCategory = null;
            svg.selectAll(".layer").style("opacity", 1); // Reset all layers opacity to full on mouseout
          });

        // Legend color block
        legendRow
          .append("rect")
          .attr("width", 18)
          .attr("height", 18)
          .attr("fill", colorScale(category));

        // Legend label text
        legendRow
          .append("text")
          .attr("x", 24)
          .attr("y", 9)
          .attr("dy", "0.35em")
          .text(category);
      });

    const formatNumber = d3.format(",");

    // Update mouseover behavior for rects
    groups
      .selectAll("rect")
      .on("mouseover", function (event, d) {
        // Make the tooltip visible
        tooltip.style("opacity", 1);

        // Highlight the hovered bar and mute others
        d3.select(this)
          .style("opacity", 1)
          .style("stroke-width", 3) // Optional: Add a border to highlight the rect
          .style("stroke", "white"); // Optional: Border color

        groups
          .selectAll("rect")
          .filter((rect) => rect.data.Location !== d.data.Location)
          .style("opacity", 0.5);
      })
      .on("mousemove", function (event, d) {
        const mousePosition = d3.pointer(event);
        const category = d3.select(this.parentNode).datum().key;

        const tooltipX = event.clientX + window.scrollX;
        const tooltipY = event.clientY + window.scrollY;

        tooltip
          .html(
            `
        <div class="tooltip-title"><span class="color-legend" style="background-color: ${colorScale(
          category
        )};"></span>${category}</div>

        <table class="tooltip-content">
            <tr>
            <td>
                Amount
            </td>
            <td class="value">${formatNumber(
              d.data[category + "_original"]
            )}</td> 
            </tr>
            <tr>
            <td>
                Percent
            </td>
            <td class="value">${formatNumber(d.data[category].toFixed(0))}%</td>
            </tr>
        </table>`
          )
          .style("opacity", 0.9)
          .style("left", `${tooltipX + dynamicMargin.left / 4}px`)
          .style("top", `${tooltipY}px`);
      })
      .on("mouseout", function () {
        // Hide the tooltip
        tooltip.style("opacity", 0);

        // Restore opacity and remove the border
        d3.select(this).style("opacity", 1).style("stroke-width", 0);

        groups.selectAll("rect").style("opacity", 1);
      });

    // Create custom tick values
    const tickValues = d3.range(0, 101, 20); // Generates an array [0, 20, 40, 60, 80, 100]

    // Add an axis to show the percentage
    const yAxis = d3
      .axisLeft(yScale)
      .tickValues(tickValues) // Set custom tick values
      .tickFormat((d) => d + "%");

    // Append yAxis to svg
    const yAxisGroup = svg
      .append("g")
      .attr("class", "chart-labels")
      .call(yAxis);

    // Optional: Add an xAxis
    const xAxis = d3
      .axisBottom(xScale)
      .tickSizeOuter(0)
      .tickSizeInner(0)
      .tickPadding(5);
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .attr("class", "chart-labels")
      .call(xAxis);
  });
})();
