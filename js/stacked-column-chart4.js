(function () {
    const aspectRatio = 0.6;
    // Ensure the container has the id "stacked-column-chart4" in your HTML.
    const container = document.getElementById("stacked-column-chart4");
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;
    const dynamicMargin = { top: 50, right: 150, bottom: 100, left: 50 };
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    // Append the SVG to the container and apply a viewBox and aspect ratio.
    const svg = d3.select("#stacked-column-chart4")
        .append("svg")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    const x = d3.scaleBand().range([0, width]).padding(0.1);
    const y = d3.scaleLinear().range([height, 0]);

    // Make sure you have a div with id "tooltip" for the tooltip in your HTML.
    const tooltip = d3.select("#tooltip");

// Data
const data = [
    { Category: 'Animalia', Earth: 953434, Ocean: 171082 },
    { Category: 'Plantae', Earth: 215644, Ocean: 8600 },
    { Category: 'Fungi', Earth: 43271, Ocean: 1097 },
    { Category: 'Chromista', Earth: 13033, Ocean: 4859 },
    { Category: 'Bacteria', Earth: 10358, Ocean: 652 },
    { Category: 'Protozoa', Earth: 8118, Ocean: 8118 },
    { Category: 'Archaea', Earth: 502, Ocean: 1 }
  ];
  
  // Sum the data for Earth and Ocean
  const totalEarth = data.reduce((acc, d) => acc + d.Earth, 0);
  const totalOcean = data.reduce((acc, d) => acc + d.Ocean, 0);
  
  // Convert data to percentages
  const earthData = data.map(d => ({ Category: d.Category, Percentage: d.Earth / totalEarth }));
  const oceanData = data.map(d => ({ Category: d.Category, Percentage: d.Ocean / totalOcean }));
  
  const dataset = {
    Earth: earthData,
    Ocean: oceanData
  };

  
  // Scales
  const xScale = d3.scaleBand()
    .domain(["Earth", "Ocean"])
    .range([0, width])
    .padding(0.1);
  
  const yScale = d3.scaleLinear()
    .domain([0, 1])
    .range([height, 0]);
  
  const colorScale = d3.scaleOrdinal()
    .domain(data.map(d => d.Category))
    .range(d3.schemeCategory10);
  
  // Stack the data
  const stack = d3.stack()
    .keys(data.map(d => d.Category))
    .value((d, key) => d.find(item => item.Category === key).Percentage);
  
  const series = stack([dataset.Earth, dataset.Ocean]);
  
  // Draw bars
  svg.selectAll(".layer")
    .data(series)
    .enter().append("g")
    .attr("class", "layer")
    .attr("fill", d => colorScale(d.key))
    .selectAll("rect")
    .data(d => d)
    .enter().append("rect")
    .attr("x", (d, i) => xScale(i === 0 ? "Earth" : "Ocean"))
    .attr("y", d => yScale(d[1]))
    .attr("height", d => yScale(d[0]) - yScale(d[1]))
    .attr("width", xScale.bandwidth());
  
  // Adding Axes
  svg.append("g")
    .attr("class", "axis axis-x")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));
  
  svg.append("g")
    .attr("class", "axis axis-y")
    .call(d3.axisLeft(yScale).tickFormat(d3.format(".0%")));
  
  // Legends
  const legend = svg.selectAll(".legend")
    .data(colorScale.domain().slice())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(0,${i * 20})`);
  
  legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", colorScale);
  
  legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(d => d);
  
  // Tooltip
//   const tooltip = d3.select("body").append("div")
//     .attr("class", "tooltip")
//     .style("opacity", 0);
  
//   svg.selectAll("rect")
//     .on("mouseover", function(event, d) {
//       tooltip.transition()
//         .duration(200)
//         .style("opacity", .9);
//       tooltip.html(`Species: ${d.data.Species}<br>Earth: ${d.data.Earth}<br>Ocean: ${d.data.Ocean}`)
//         .style("left", (event.pageX + 5) + "px")
//         .style("top", (event.pageY - 28) + "px");
//     })
//     .on("mouseout", function() {
//       tooltip.transition()
//         .duration(500)
//         .style("opacity", 0);
//     });
  
})();