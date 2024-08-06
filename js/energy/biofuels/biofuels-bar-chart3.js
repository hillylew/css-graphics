(function () {
   /* ----------------------- Create Tooltip ------------------------ */
   const container = document.getElementById("biofuels-bar-chart3");

   const tooltipDiv = document.createElement("div");
   tooltipDiv.id = "tooltip";
   tooltipDiv.className = "tooltip";
   container.appendChild(tooltipDiv);
 
   const tooltip = d3.select(container).select("#tooltip");

  /* ----------------------- Dynamic dimensions ----------------------- */
  const aspectRatio = 0.7;

  const containerWidth = container.offsetWidth || 960; // Set a default width if offsetWidth is zero
  const containerHeight = containerWidth * aspectRatio;

  const dynamicMargin = {
    top: containerHeight * 0.02,
    right: containerWidth * 0.1,
    bottom: containerHeight * 0.1,
    left: containerWidth * 0.15,
  };

  const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
  const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

  const svg = d3
    .select("#biofuels-bar-chart3")
    .append("svg")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

  const y0 = d3.scaleBand().rangeRound([0, height]).paddingInner(0.1);
  const y1 = d3.scaleBand().padding(0.05);
  const x = d3.scaleLinear().rangeRound([0, width]);
  const color = d3.scaleOrdinal().range(["#FED679", "#ED974A", "#8FC8E5", "#3167A4"]);

  /* ----------------------- Loading and processing data ----------------------- */
  d3.csv("../../data/energy/biofuels/biofuels5.csv").then((data) => {
    // Manually set the desired order of subgroups
    const subgroups = ["Cropland Use in 2005", "Cropland Use in 2030", "Irrigation Water Use in 2005", "Irrigation Water Use in 2030"];
    const regions = data.map(d => d.Region);

    y0.domain(regions);
    y1.domain(subgroups).rangeRound([0, y0.bandwidth()]);
    x.domain([0, d3.max(data, d => d3.max(subgroups, key => +d[key]))]).nice();

    svg.append("g")
      .selectAll("g")
      .data(data)
      .enter().append("g")
      .attr("transform", d => `translate(0,${y0(d.Region)})`)
      .selectAll("rect")
      .data(d => subgroups.map(key => ({key: key, value: +d[key], region: d.Region})))
      .enter().append("rect")
      .attr("y", d => y1(d.key))
      .attr("x", 0)
      .attr("height", y1.bandwidth())
      .attr("width", d => x(d.value))
      .attr("fill", d => color(d.key))
      .style("opacity", 1)  // Default opacity
      .on("mouseover", function(event, d) {
        d3.select(this)
          .style("opacity", 0.5); // Reduce opacity on hover

        tooltip.style("display", "block");
        tooltip.html(`
          <div class="tooltip-title">${d.region}</div>
          <table class="tooltip-content">
            <tr>
              <td>${d.key}: </td>
              <td class="value">${d.value}%</td>
            </tr>
          </table>
        `);
      })
      .on("mousemove", function(event) {
        tooltip.style("left", `${event.pageX + dynamicMargin.left / 4}px`)
          .style("top", `${event.pageY}px`);
      })
      .on("mouseout", function() {
        d3.select(this)
          .style("opacity", 1); // Reset opacity on mouse out

        tooltip.style("display", "none");
      });

    // Append y-axis and apply class to tick texts
    svg.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y0).tickSizeOuter(0).tickSizeInner(0).tickPadding(10))
      .selectAll(".tick text")  // Select all y-axis tick texts
      .attr("class", "chart-labels")
      .style("font-weight", "bold");  // Apply the class

    // Append x-axis and apply class to tick texts
    svg.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .ticks(6)
        .tickFormat(d => d + "%")) // Format ticks as percentages
      .selectAll(".tick text")  // Select all x-axis tick texts
      .attr("class", "chart-labels");  // Apply the class

    // Update the legend position
    const legend = svg.append("g")
      .attr("transform", `translate(${width - dynamicMargin.right * 2.8}, ${dynamicMargin.top})`);

    // Calculate the dimensions for legend items
    const legendItemSize = width * 0.04; // Set the width and height to be 4% of the container width
    const gap = width * 0.01; // Decrease the gap between legend items

    // Append legend items
    subgroups.forEach((d, i) => {
      legend.append("rect")
        .attr("x", 0)
        .attr("y", i * (legendItemSize + gap)) // Adjust spacing between legend items
        .attr("width", legendItemSize)
        .attr("height", legendItemSize)
        .style("fill", color(d))
        .attr("rx", 3) // Rounded corners
        .attr("ry", 3) // Rounded corners
        .attr("class", "legend-rect");

      legend.append("text")
        .attr("x", legendItemSize + gap)
        .attr("y", i * (legendItemSize + gap) + legendItemSize / 2)
        .attr("alignment-baseline", "middle")
        .text(d)
        .attr("class", "chart-labels");
    });
  });
})();
