(function () {
    /* ----------------------- Dynamic dimensions ----------------------- */
    const aspectRatio = 0.7;
    const container = document.getElementById("us-cities-bar-chart");
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;

    const dynamicMargin = {
      top: containerHeight * 0.02,
      right: containerWidth * 0.2,
      bottom: containerHeight * 0.1,
      left: containerWidth * 0.18,
    };

    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    const svg = d3
      .select("#us-cities-bar-chart")
      .append("svg")
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    /* ----------------------- Scales, axes, and color ----------------------- */
    const yScale = d3.scaleBand().range([height, 0]).padding(0.05);
    const xScale = d3.scaleLinear().range([0, width]);
    const colorScale = d3.scaleOrdinal()
      .range(["#1d476d", "#3167a4", "#8fc8e5", "#386660", "#ffcb03", "#ce5845", "#ed974a"]);
    const formatDecimal = d3.format(".0f");

    // Updated xAxis to increment by 20% and show the '%' sign
    const xAxis = (g) => g.call(d3.axisBottom(xScale)
        .tickValues(d3.range(0, 101, 20))
        .tickFormat(d => `${d}%`));
    const yAxis = (g) => g.call(d3.axisLeft(yScale).tickSizeOuter(0).tickSizeInner(0).tickPadding(10));

    const tooltip = d3.select('#tooltip');

    /* ----------------------- Loading and processing data ----------------------- */
    d3.csv("../../data/built-environment/us-cities/us-cities3.csv", (d) => ({
      category: d.Category,
      subcategory: d.Subcategory,
      percentage: +d.Percentage,
    })).then((data) => {
      const categories = [...new Set(data.map((d) => d.category))];
      const maxSubcategories = d3.max(categories.map(category => data.filter(d => d.category === category).length));

      yScale.domain(categories);
      xScale.domain([0, 100]);

      svg
        .append("g")
        .call(yAxis)
        .selectAll(".tick text")
        .attr("class", "chart-labels");

      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .selectAll("text")
        .attr("class", "chart-labels");

      const categoryGroups = svg
        .selectAll(".category-group")
        .data(categories)
        .enter()
        .append("g")
        .attr("class", "category-group")
        .attr("transform", (d) => `translate(0, ${yScale(d)})`);

      const barHeight = yScale.bandwidth() / maxSubcategories;
      const paddingBetweenBars = 1;

      categoryGroups
        .selectAll(".bar")
        .data((d) => data.filter((item) => item.category === d))
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", (d, i, nodes) => {
          const numSubcategories = nodes.length;
          return i * barHeight + (yScale.bandwidth() - barHeight * numSubcategories) / 2;
        })
        .attr("x", 0)
        .attr("height", barHeight - paddingBetweenBars)
        .attr("width", (d) => xScale(d.percentage))
        .attr("fill", (d) => colorScale(d.category))
        .attr("stroke", "#000")  // Adding a border to the bars
        .attr("stroke-width", 0.5)  // Border width
        .on('mouseover', function(event, d) {
          d3.selectAll(".bar")
            .attr("stroke", "#000")
            .attr("stroke-width", 0.5);

          d3.select(this)
            .attr("opacity", 0.5);

          tooltip.html(`
            <div class="tooltip-title">${d.subcategory}</div>
            <table class="tooltip-content">
              <tr>
                <td>Percentage:</td>
                <td class="value"><strong>${formatDecimal(d.percentage)}</strong>%</td>
              </tr>
            </table>
          `)
          .style('opacity', '0.9')
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
        })
        .on("mousemove", function (event) {
          tooltip.style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
          d3.select(this)
            .attr("opacity", 1);

          tooltip.style('opacity', '0');
        });

      categoryGroups
        .selectAll(".label")
        .data((d) => data.filter((item) => item.category === d))
        .enter()
        .append("text")
        .attr("class", "chart-labels")
        .attr("x", (d) => xScale(d.percentage) + 5)
        .attr("y", (d, i, nodes) => {
          const numSubcategories = nodes.length;
          return i * barHeight + (yScale.bandwidth() - barHeight * numSubcategories) / 2 + barHeight / 2;
        })
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .text((d) => d.subcategory)
        .attr("fill", "#000");
    });
})();