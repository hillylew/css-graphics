(function () {
    /* ----------------------- Create Tooltip ------------------------ */
    const container = document.getElementById("us-cities-bar-chart2");

    const tooltipDiv = document.createElement("div");
    tooltipDiv.id = "tooltip";
    tooltipDiv.className = "tooltip";
    container.appendChild(tooltipDiv);

    const tooltip = d3.select(container).select("#tooltip");
  
    /* ----------------------- Dynamic dimensions ----------------------- */
    const aspectRatio = 0.7;
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;
  
    const dynamicMargin = {
      top: containerHeight * 0.02,
      right: containerWidth * 0.1,
      bottom: containerHeight * 0.05,
      left: containerWidth * 0.15,
    };
  
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;
  
    const svg = d3
      .select("#us-cities-bar-chart2")
      .append("svg")
      .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
      .attr("preserveAspectRatio", "xMinYMin meet")
      .append("g")
      .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);
  
    /* ----------------------- Scales, axes, and color ----------------------- */
    const yScale = d3.scaleBand().range([height, 0]).padding(0.1);
    const xScale = d3.scaleLinear().range([0, width]);
    const colorScale = d3.scaleOrdinal().domain(["2000", "2022"]).range(["#8FC8E5", "#3167A4"]);
    const formatDecimal = d3.format(".0f");
  
    const xAxis = (g) =>
      g.call(d3.axisBottom(xScale).tickFormat((d) => d));
    const yAxis = (g) => g.call(d3.axisLeft(yScale).tickSize(0).tickPadding(10));
  
    /* ----------------------- Loading and processing data ----------------------- */
    

    // Define csv file path if it's not already defined
    if (typeof csvFile === "undefined") {
        var csvFile = "../../data/built-environment/us-cities/us-cities4.csv";
    }

    d3.csv(csvFile, d3.autoType).then((data) => {
      const subgroups = ["2000", "2022"];
      const cities = data.map((d) => d.City);
  
      yScale.domain(cities);
  
      // Adjust the max x-axis value
      const maxXValue =
        Math.ceil(
          d3.max(data, (d) => d3.max(subgroups, (key) => d[key])) / 1000
        ) * 1000;
      xScale.domain([0, maxXValue]);
  
      svg
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)
        .attr("class", "chart-labels");
  
      svg
        .append("g")
        .call(yAxis)
        .attr("class", "chart-labels")
        .style("font-weight", "bold");
  
      const subgroupScale = d3
        .scaleBand()
        .domain(subgroups)
        .range([0, yScale.bandwidth()])
        .padding(0.05);
  
      const rows = svg
        .append("g")
        .selectAll("g")
        .data(data)
        .join("g")
        .attr("transform", (d) => `translate(0, ${yScale(d.City)})`);
  
      const formatNumber = d3.format(",");
      rows
        .selectAll("rect")
        .data((d) =>
          subgroups.map((key) => ({
            key: key,
            value: d[key],
            city: d.City,
            percentChange: d["Population Change"],
          }))
        )
        .join("rect")
        .attr("x", (d) => xScale(0))
        .attr("y", (d) => subgroupScale(d.key))
        .attr("width", (d) => xScale(d.value) - xScale(0))
        .attr("height", subgroupScale.bandwidth())
        .attr("fill", (d) => colorScale(d.key))
        .on("mouseover", (event, d) => {
          const percentChangeColor = d.percentChange >= 0 ? "#3167A4" : "#CE5845";
          const tooltipX = event.clientX + window.scrollX;
          const tooltipY = event.clientY + window.scrollY;
  
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(
              `
              <div class="tooltip-title">${d.city}</div>
              <table class="tooltip-content">
                <tr>
                  <td>Year</td>
                  <td class="value">${d.key}</td>
                </tr>
                <tr>
                  <td>Population</td>
                  <td class="value">${formatNumber(d.value)}</td>
                </tr>
              </table>
              <table class="tooltip-total">
              <tr>
                  <td>Population Change</td>
                  <td class="value" style="color: ${percentChangeColor};">
                    <strong>${d.percentChange}%</strong>
                  </td>
                </tr>
            </table>
            `
            )
            .style("left", `${tooltipX + dynamicMargin.left / 4}px`)
            .style("top", `${tooltipY}px`);
        })
        .on("mouseout", () => {
          tooltip.transition().duration(500).style("opacity", 0);
        });
  
      /* ----------------------- Add Legend ----------------------- */
      const legend = svg
        .append("g")
        .attr("transform", `translate(${width - dynamicMargin.right * 2}, ${height * 0.8})`);
  
      const legendData = [
        { label: "Population in 2000", color: "#8FC8E5" },
        { label: "Population in 2022", color: "#3167A4" },
      ];
  
      const legendItemSize = width * 0.04;
      const gap = width * 0.01;
  
      legendData.forEach((d, i) => {
        legend
          .append("rect")
          .attr("x", 0)
          .attr("y", i * (legendItemSize + gap))
          .attr("width", legendItemSize)
          .attr("height", legendItemSize)
          .style("fill", d.color)
          .attr("rx", 3)
          .attr("ry", 3)
          .attr("class", "legend-rect");
  
        legend
          .append("text")
          .attr("x", legendItemSize + gap)
          .attr("y", i * (legendItemSize + gap) + legendItemSize / 2)
          .attr("alignment-baseline", "middle")
          .text(d.label)
          .attr("class", "chart-labels");
      });
    });
  })();