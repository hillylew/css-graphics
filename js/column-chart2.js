(function () {
  /* ----------------------- Dynamic dimensions ----------------------- */
  const aspectRatio = 0.7;

  // Get the container and its dimensions
  const container = document.getElementById("column-chart2");
  const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
  const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio

  // Calculate the dynamic margins
  const dynamicMargin = {
    top: containerHeight * 0.08,
    right: containerWidth * 0.05, // Adjust right margin if labels are too long
    bottom: containerHeight * 0.1,
    left: containerWidth * 0.22, // Increase left margin to fit labels
  };

  // Calculate the width and height for the inner drawing area
  const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
  const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

  // Append SVG object
  const svg = d3
    .select("#column-chart2")
    .append("svg")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

  /* ----------------------- Scales, axes, and color ----------------------- */
  const xScale = d3.scaleLinear().range([0, width]);
  const yScale = d3.scaleBand().range([0, height]).padding(0.1);
  const colorScale = d3
    .scaleOrdinal()
    .range([
      "#ae416c",
      "#ae416c",
      "#ae416c",
      "#e16674",
      "#e16674",
      "#e16674",
      "#c1824b",
      "#c36043",
      "#799a6c",
    ]); // Updated color range
  const formatDecimal = d3.format(".1f"); // Formatter to round to one decimal place

  /* ----------------------- Icon mapping ----------------------- */

const feedstockIconMap = {
    'Jatropha': './svg/biofuels.svg',
    'Cellulosic (Various)': './svg/biofuels.svg',
    'Cellulosic (Poplar)': './svg/biofuels.svg',
    'Cellulosic (Corn Stover)': './svg/biofuels.svg',
    'Palm Oil': './svg/biofuels.svg',
    'Biodiesel (Soybean)': './svg/biofuels.svg',
    'Microalgae': './svg/biofuels.svg',
    'Waste Loquat Seed Oil': './svg/biofuels.svg',
    'Waste Date Seed Oil': './svg/biofuels.svg',
    'Corn': './svg/biofuels.svg',
  };
  
  // Function to retrieve icons, expects the category to get the appropriate icon URL
  function getFeedstockIconUrl(category) {
    return feedstockIconMap[category];
  }

  const yAxis = (g) => g.call(d3.axisLeft(yScale).tickSizeOuter(0).tickSizeInner(0).tickPadding(5));


  svg.append("text")
  .attr("x", width / 2)
  .attr("y", -dynamicMargin.top/2) // Place below the chart
  .attr("class", "chart-labels")
  .attr("text-anchor", "middle") // Center the text
  .attr("fill", "#000") // Text color
  .text("Fossil Energy Ratio (FER)"); 

  /* ----------------------- Loading and processing data ----------------------- */
  d3.csv("data/graph-16-data.csv", (d) => ({
    feedstock: d.Feedstock,
    energyRatio: +d["Fossil Energy Ratio"],
  })).then((data) => {
    // Update scales and color domain
    xScale.domain([0, d3.max(data, (d) => d.energyRatio)]);
    yScale.domain(data.map((d) => d.feedstock));
    colorScale.domain(data.map((d) => d.feedstock));

    // Draw the y-axis
    svg
      .append("g")
      .call(yAxis)
      .selectAll(".tick text") // select all text elements within ticks
      .attr("class", "chart-labels"); // Set the class to 'chart-labels'

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
      .attr("fill", (d) => colorScale(d.feedstock)); // Use color scale for fill

    /* ----------------------- Adding labels ----------------------- */
    svg
      .selectAll(".label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "chart-labels")
      .attr("x", (d) => xScale(d.energyRatio) + 3) // Offset the label to the right of the bar
      .attr("y", (d) => yScale(d.feedstock) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em") // Vertically center
      .text((d) => formatDecimal(d.energyRatio)) // Round to one decimal place
      .attr("font-size", "10px") // Adjust font size if needed
      .attr("fill", "#000"); // Text color
  });
})();