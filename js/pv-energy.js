(function () {
  const aspectRatio = 0.7; // Define an aspect ratio for the chart

  // Get the container and its dimensions
  const container = document.getElementById("pv-chart");
  const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
  const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio

  // Calculate the dynamic margins
  const dynamicMargin = {
      top: containerHeight * 0.1, // 10% of the container height
      right: containerWidth * 0.15, // 15% of the container width
      bottom: containerHeight * 0.1, // 10% of the container height
      left: containerWidth * 0.07, // 7% of the container width
  };

  // Calculate the width and height for the inner drawing area
  const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
  const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

  // Append SVG object
  const svg = d3
      .select("#pv-chart")
      .append("svg")
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

  // Load the data
  d3.csv('./data/graph-6-data.csv').then(function(data) {
      // Parse the data
      data.forEach(function(d) {
          d['Cell Conversion Efficiency'] = +d['Cell Conversion Efficiency'].replace('%', '');
      });

      // Group data by Category
      const groupedData = d3.groups(data, d => d.Category);

      // Set up the x and y scales
      const x0 = d3.scaleBand()
          .rangeRound([0, width])
          .paddingInner(0.1) // Adjust space between main categories
          .domain(groupedData.map(d => d[0]));

      const x1 = d3.scaleBand()
          .padding(0.05) // Adjust this value to create gaps between subcategories within a main category

      const y = d3.scaleLinear()
          .rangeRound([height, 0])
          .domain([0, 50]); // Adjusted to reflect the percentage range

      // Define color scale
      const color = d3.scaleOrdinal()
          .domain(data.map(d => d.Category))
          .range(["#a6ba3d", "#f6cce0", "#ec922c"]);

      // Add axes
      svg.append('g')
          .attr('transform', `translate(0,${height})`)
          .call(d3.axisBottom(x0))
          .selectAll('text')
          .style('text-anchor', 'middle');

      svg.append('g')
          .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + '%')); // Change to tick every 10%

      // Add bars
      groupedData.forEach(([category, subcategories], index) => {
          x1.domain(subcategories.map(d => d.Subcategory))
            .rangeRound([0, x0.bandwidth()]);

          const categoryGroup = svg.append('g')
              .attr('transform', `translate(${x0(category)},0)`);

          categoryGroup.selectAll(`.bar-${category}`)
              .data(subcategories)
              .enter().append('rect')
              .attr('class', `bar bar-${category}`)
              .attr('x', d => x1(d.Subcategory))
              .attr('y', d => y(d['Cell Conversion Efficiency']))
              .attr('width', x1.bandwidth()) // Use subcategory bandwith here
              .attr('height', d => height - y(d['Cell Conversion Efficiency']))
              .attr('fill', color(category));
      });
  });
})();
