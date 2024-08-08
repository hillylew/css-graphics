(function () {

  /* ----------------------- Create Tooltip ------------------------ */
  const container = document.getElementById("biofuels-bar-chart");

  const tooltipDiv = document.createElement("div");
  tooltipDiv.id = "tooltip";
  tooltipDiv.className = "tooltip";
  container.appendChild(tooltipDiv);

  const tooltip = d3.select(container).select("#tooltip");

  /* ----------------------- Dynamic dimensions ----------------------- */
  const aspectRatio = 0.6;

  // Get the container and its dimensions
  const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
  const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio

  // Calculate the dynamic margins
  const dynamicMargin = {
    top: containerHeight * 0.1,
    right: containerWidth * 0.1,
    bottom: containerHeight * 0.02,
    left: containerWidth * 0.25,
  };

  // Calculate the width and height for the inner drawing area
  const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
  const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

  // Append SVG object
  const svg = d3
    .select("#biofuels-bar-chart")
    .append("svg")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

  /* ----------------------- Scales, axes, and color ----------------------- */
  const xScale = d3.scaleLinear().range([0, width]);
  const yScale = d3.scaleBand().range([0, height]).padding(0.2);
  const colorScale = d3
    .scaleOrdinal()
    .range([
      "#ed974a",
      "#ed974a",
      "#ed974a",
      "#ed974a",
      "#ed974a",
      "#ce5845",
      "#ce5845",
      "#ce5845",
      "#ffcb03",
      "#1d476d",
      "#3167a4",
      "#8fc8e5",
    ]);
  const formatDecimal = d3.format(".1f"); // Formatter to round to one decimal place

  /* ----------------------- Icon mapping ----------------------- */

  const yAxis = (g) =>
    g.call(
      d3
        .axisLeft(yScale)
        .tickSizeOuter(0)
        .tickSizeInner(0)
        .tickPadding(5)
    );

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -dynamicMargin.top / 2) // Place below the chart
    .attr("class", "chart-labels")
    .attr("text-anchor", "middle") // Center the text
    .attr("fill", "#000") // Text color
    .text("Fossil Energy Ratio");

  /* ----------------------- Loading and processing data ----------------------- */

  // Define csv file path if it's not already defined
  if (typeof csvFile === "undefined") {
    var csvFile = "../../data/energy/biofuels/biofuels4.csv";
  }
    
  d3.csv(csvFile, (d) => ({
      feedstock: d.Feedstock,
      energyRatio: +d["Fossil Energy Ratio"],
      range: d.Range,
    })
  ).then((data) => {
    // Update scales and color domain
    xScale.domain([0, d3.max(data, (d) => d.energyRatio)]);
    yScale.domain(data.map((d) => d.feedstock));
    colorScale.domain(data.map((d) => d.feedstock));

    // Draw the y-axis
    svg
      .append("g")
      .call(yAxis)
      .selectAll(".tick text") // select all text elements within ticks
      .each(function (d) {
        // Split into parts before and inside parentheses
        const text = d3.select(this).text();
        const parts = text.match(/([^(]+)(\([^)]*\))?/);
        d3.select(this).text(null); // Clear existing text

        if (parts) {
          d3.select(this)
            .append("tspan")
            .attr("class", "chart-labels")
            .text(parts[1].trim())
            .style("font-weight", "bold");
          if (parts[2]) {
            d3.select(this)
              .append("tspan")
              .attr("class", "chart-labels")
              .text(` ${parts[2]}`);
          }
        }
      });

    /* ----------------------- Drawing bars ----------------------- */
    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", (d) => yScale(d.feedstock))
      .attr("width", (d) => xScale(d.energyRatio))
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => colorScale(d.feedstock)) // Use color scale for fill
      .on("mouseover", function (d, i) {
        d3.select(this).attr("opacity", 0.7);
      })
      .on("mouseout", function (d, i) {
        d3.select(this).attr("opacity", 1);
      });

    /* ----------------------- Adding labels ----------------------- */
    svg
      .selectAll(".label")
      .data(data.filter((d) => d.feedstock !== "Biodiesel (Seed Oil)")) // Don't include Biodiesel (Seed Oil)
      .enter()
      .append("text")
      .attr("class", "chart-labels")
      .attr("x", (d) => xScale(d.energyRatio) + 3) // Offset the label to the right of the bar
      .attr("y", (d) => yScale(d.feedstock) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em") // Vertically center
      .text((d) => formatDecimal(d.energyRatio)) // Round to one decimal place
      .attr("fill", "#000"); // Text color

    /* ----------------------- Range for Biodiesel (Seed Oil) ----------------------- */
    svg
      .selectAll(".label")
      .data(data.filter((d) => d.feedstock === "Biodiesel (Seed Oil)"))
      .enter()
      .append("text")
      .attr("class", "chart-labels")
      .attr("x", (d) => xScale(d.energyRatio) + 3) // Offset the label to the right of the bar
      .attr("y", (d) => yScale(d.feedstock) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em") // Vertically center
      .text((d) => d.range) // Show range
      .attr("fill", "#000"); // Text color
  });
})();
