(function () {
  // Dynamic dimensions
  const aspectRatio = 1; // Plate is typically round, so 1:1 ratio

  // Get the container and its dimensions
  const container = document.getElementById("carbon-footprint-pie-chart");
  const containerWidth = container.offsetWidth;
  const containerHeight = containerWidth * aspectRatio;

  // Calculate the dynamic margins to ensure a round plate look
  const dynamicMargin = {
    top: containerHeight * 0.1,
    right: containerWidth * 0.1,
    bottom: containerHeight * 0.1,
    left: containerWidth * 0.1,
  };

  // Calculate the width and height for the inner drawing area
  const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
  const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;
  const radius = Math.min(width * 0.6, height * 0.6) / 2;

  // Scaling factors for the rim and white border
  const outerRimFactor = 1.4;
  const whiteBorderFactor = 1.3;

  // Append SVG object
  const svg = d3
    .select("#carbon-footprint-pie-chart")
    .append("svg")
    .attr("width", containerWidth)
    .attr("height", containerHeight)
    .append("g")
    .attr("transform", "translate(" + containerWidth / 2 + "," + containerHeight / 2 + ")");

  // Draw the thicker light grey rim
  svg.append("circle")
    .attr("r", radius * outerRimFactor)  // Proportional size for the thicker light grey rim
    .attr("fill", "#d9d9d9");

  // Draw the thicker white border on the rim
  svg.append("circle")
    .attr("r", radius * whiteBorderFactor)  // Proportional size for the thicker white border
    .attr("fill", "white");

  // Load data from CSV
  d3.csv("carbon-footprint1.csv").then((data) => {
    // Process data
    data.forEach(d => {
      d.Percentage = +d.Percentage;
    });

    // Pie generator
    const pie = d3.pie()
      .sort(null)
      .value(d => d.Percentage);

    // Arc generator
    const arc = d3.arc()
      .outerRadius(radius)
      .innerRadius(0);

    // Define color scale
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.Food))
      .range(d3.schemeSet3);

    // Draw pie
    svg.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.Food))
      .attr('stroke', 'white')  // Set the outline color to white
      .style('stroke-width', '2px');

    // Add labels
    svg.selectAll('text')
      .data(pie(data))
      .enter()
      .append('text')
      .attr('transform', d => 'translate(' + arc.centroid(d) + ')')
      .attr('dy', '0.35em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(d => d.data.Food);

  }).catch(function (error) {
    console.log(error);
  });

  // Fork path data
  const forkPathData = `M -${radius * 1.3},${-radius * 0.8}
                          L -${radius * 1.3},${-radius * 0.6}
                          L -${radius * 1.25},${-radius * 0.6}
                          L -${radius * 1.25},${-radius * 0.8}
                          M -${radius * 1.2},${-radius * 0.8}
                          L -${radius * 1.2},${-radius * 0.6}
                          L -${radius * 1.15},${-radius * 0.6}
                          L -${radius * 1.15},${-radius * 0.8}
                          M -${radius * 1.1},${-radius * 0.8}
                          L -${radius * 1.1},${-radius * 0.6}
                          L -${radius * 1.05},${-radius * 0.6}
                          L -${radius * 1.05},${-radius * 0.8}
                          M -${radius * 1.0},${-radius * 0.8}
                          L -${radius * 1.0},${-radius * 0.6}
                          L -${radius * 0.95},${-radius * 0.6}
                          L -${radius * 0.95},${-radius * 0.8}
                          M -${radius * 1.3},${-radius * 0.6}
                          L -${radius * 0.95},${-radius * 0.6}
                          L -${radius * 0.95},${radius * 0.8}
                          L -${radius * 1.3},${radius * 0.8}
                          Z`;
  

  // Spoon path data
  const spoonPathData = `M ${radius * 1.25},${-radius * 0.5}
                         A ${radius * 0.15},${radius * 0.15} 0 1,1 ${radius * 1.55},${-radius * 0.5}
                         A ${radius * 0.15},${radius * 0.15} 0 1,1 ${radius * 1.25},${-radius * 0.5}
                         M ${radius * 1.35},${-radius * 0.5}
                         L ${radius * 1.45},${radius * 0.8}
                         L ${radius * 1.55},${radius * 0.8}
                         L ${radius * 1.45},${-radius * 0.5} Z`;

  // Draw fork
  svg.append("path")
    .attr("d", forkPathData)
    .attr("fill", "#333");

  // Draw spoon
  svg.append("path")
    .attr("d", spoonPathData)
    .attr("fill", "#333");

})();
