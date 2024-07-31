(function () {
    /* ----------------------- Dynamic dimensions ----------------------- */
    const aspectRatio = 0.7;
  
    // Get the container and its dimensions
    const container = document.getElementById("carbon-footprint-bar-chart");
    const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
    const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio
  
    // Calculate the dynamic margins
    const dynamicMargin = {
      top: containerHeight * 0.05,
      right: containerWidth * 0.1, // Adjust right margin if labels are too long
      bottom: containerHeight * 0.05,
      left: containerWidth * 0.1, // Increase left margin to fit labels
    };
  
    // Calculate the width and height for the inner drawing area
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;
  
    // Append SVG object
    const svg = d3
      .select("#carbon-footprint-bar-chart")
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
        "#1d476d", "#4084bc", "#73b9e0", "#aedbed",
        "#386660", "#e2e27a",
        "#CE5845", "#ED974A", "#ffcb03", "#ffe07d",
        "#d8d8d8",
      ]);
    const formatDecimal = d3.format(".2f"); // Formatter to round to two decimal places
  
    /* ----------------------- Icon mapping ----------------------- */
  
    const yAxis = (g) => g.call(d3.axisLeft(yScale).tickSizeOuter(0).tickSizeInner(0).tickPadding(5));
  
  
    /* ----------------------- Loading and processing data ----------------------- */
    d3.csv("../../data/sustainability-indicators/carbon-footprint/carbon-footprint2.csv", (d) => ({
      food: d.Food,
      pounds: +d.Pounds,
    })).then((data) => {
      // Update scales and color domain
      xScale.domain([0, d3.max(data, (d) => d.pounds)]);
      yScale.domain(data.map((d) => d.food));
      colorScale.domain(data.map((d) => d.food));
  
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
        .attr("y", (d) => yScale(d.food))
        .attr("width", (d) => xScale(d.pounds))
        .attr("height", yScale.bandwidth())
        .attr("fill", (d) => colorScale(d.food)); // Use color scale for fill
  
      /* ----------------------- Adding labels ----------------------- */
      svg
        .selectAll(".label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "chart-labels")
        .attr("x", (d) => xScale(d.pounds) + 3) // Offset the label to the right of the bar
        .attr("y", (d) => yScale(d.food) + yScale.bandwidth() / 2)
        .attr("dy", "0.35em") // Vertically center
        .text((d) => formatDecimal(d.pounds)) // Round to two decimal places
        .attr("fill", "#000"); // Text color
    });
  })();
  