(function () {
  /* ----------------------- Dynamic dimensions ----------------------- */
  const aspectRatio = 0.7;

  // Get the container and its dimensions
  const container = document.getElementById("biofuels-energy-bar-chart2");
  const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
  const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio

  // Calculate the dynamic margins
  const dynamicMargin = {
    top: containerHeight * 0.02,
    right: containerWidth * 0.05, // Adjust right margin if labels are too long
    bottom: containerHeight * 0.1,
    left: containerWidth * 0.12, // Increase left margin to fit labels in horizontal orientation
  };

  // Calculate the width and height for the inner drawing area
  const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
  const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

  // Append SVG object
  const svg = d3
    .select("#biofuels-energy-bar-chart2")
    .append("svg")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

  /* ----------------------- Scales, axes, and color ----------------------- */
  const yScale = d3.scaleBand().range([height, 0]).padding(0.1); // Scale for feedstocks
  const xScale = d3.scaleLinear().range([0, width]);
  const colorScale = d3
    .scaleOrdinal()
    // .range([
    //   "#ae416c",
    //   "#c36043",
    //   "#799a6c",
    //   "#75bf70",
    //   "#f38f53",
    //   "#e16674",
    //   "#c1824b",
    // ]); 
    .range(["#1d476d", 
      "#3167a4", 
      "#8fc8e5", 
      "#386660", 
      "#ffcb03",
      "#ce5845",
      "#ed974a",]);
  const formatDecimal = d3.format(".0f"); // Formatter to round to one decimal place

  const xAxis = (g) =>
    g.call(d3.axisBottom(xScale));
  const yAxis = (g) =>
    g.call(d3.axisLeft(yScale).tickSizeOuter(0).tickSizeInner(0).tickPadding(10));

  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + dynamicMargin.bottom) 
    .attr("class", "chart-labels")
    .attr("text-anchor", "middle") // Center the text
    .attr("fill", "#000") // Text color
    .text("Biofuel Yield (GJ/ha)");

    const tooltip = d3.select('#tooltip');

  /* ----------------------- Loading and processing data ----------------------- */
  d3.csv("./data/biofuels-energy/biofuels-energy3.csv", (d) => ({
    feedstock: d.Feedstock,
    region: d.Region,
    biofuelYield: +d["Biofuel Yield"],
  })).then((data) => {
    // Get unique feedstocks and regions
    const feedstocks = [...new Set(data.map((d) => d.feedstock))];

    // Find the maximum number of regions in any feedstock
    const maxRegions = d3.max(feedstocks.map(feedstock => data.filter(d => d.feedstock === feedstock).length));

    // Update scales
    yScale.domain(feedstocks);
    xScale.domain([0, Math.ceil(d3.max(data, (d) => d.biofuelYield) / 20) * 20]); 


    // Draw the y-axis
    svg
      .append("g")
      .call(yAxis)
      .selectAll(".tick text")
      .attr("class", "chart-labels");

    // Draw the x-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .selectAll("text")
      .attr("class", "chart-labels");

    // Create groups for each feedstock
    const feedstockGroups = svg
      .selectAll(".feedstock-group")
      .data(feedstocks)
      .enter()
      .append("g")
      .attr("class", "feedstock-group")
      .attr("transform", (d) => `translate(0, ${yScale(d)})`);

    // Calculate bar height based on maximum number of regions
    const barHeight = yScale.bandwidth() / maxRegions;
    const paddingBetweenBars = 2; // Adjust the padding between bars

    // Draw the bars for each feedstock
    feedstockGroups
      .selectAll(".bar")
      .data((d) => data.filter((item) => item.feedstock === d))
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", (d, i, nodes) => {
        const numRegions = nodes.length;
        return i * barHeight + (yScale.bandwidth() - barHeight * numRegions) / 2;
      })
      .attr("x", 0)
      .attr("height", barHeight - paddingBetweenBars) // Adjust bar height to add padding
      .attr("width", (d) => xScale(d.biofuelYield))
      .attr("fill", (d, i) => colorScale(d.feedstock)) // Assign color based on feedstock
      .on('mouseover', function(event, d) {
        // Highlight the active bar
        d3.select(this).attr("class", "bar active");

        // Reduce the opacity of the other bars
        // svg.selectAll(".bar").filter(e => e !== d).style("opacity", 0.1);

        // Show and populate the tooltip
        tooltip.html(`
            <div class="tooltip-title">${d.region}</div>
            <table class="tooltip-content">
                <tr>
                <td>
                    Biofuel Yield:
                </td>
                <td class="value"><strong>${d.biofuelYield}</strong> GJ/ha</td>
                </tr>
            </table>
        `)
        .style('opacity', '0.9')
        .style("left", `${event.pageX + dynamicMargin.left / 4}px`)
        .style("top", `${event.pageY}px`);
    })
    .on("mousemove", function (event, d) {
        // Update tooltip position
        tooltip.style("left", (event.pageX + dynamicMargin.left / 4) + "px")
            .style("top", (event.pageY) + "px");
    })
    .on("mouseout", function () {
        // Hide tooltip
        d3.select(this).attr("class", "bar");

        // Reset the opacity of the other bars
        // svg.selectAll(".bar").style("opacity", 1);

        // Hide the tooltip
        tooltip.style('opacity', '0');
    });

    /* ----------------------- Adding labels ----------------------- */
    feedstockGroups
      .selectAll(".label")
      .data((d) => data.filter((item) => item.feedstock === d))
      .enter()
      .append("text")
      .attr("class", "chart-labels")
      .attr("x", (d) => xScale(d.biofuelYield) + 5)
      .attr("y", (d, i, nodes) => {
        const numRegions = nodes.length;
        return i * barHeight + (yScale.bandwidth() - barHeight * numRegions) / 2 + barHeight / 2;
      })
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .text((d) => d.region)
      .attr("fill", "#000");
  });
})();
