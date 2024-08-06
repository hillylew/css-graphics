(function () {
    /* ----------------------- Create Tooltip ------------------------ */
    const container = document.getElementById("grid-energy-range-chart");

   const tooltipDiv = document.createElement("div");
   tooltipDiv.id = "tooltip";
   tooltipDiv.className = "tooltip";
   container.appendChild(tooltipDiv);
   
   const tooltip = d3.select(container).select("#tooltip");

    /* ----------------------- Dynamic dimensions ----------------------- */
    const aspectRatio = 0.7;

    // Get the container and its dimensions
    const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
    const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio

    // Calculate the dynamic margins
    const dynamicMargin = {
        top: containerHeight * 0.05,
        right: containerWidth * 0.1,
        bottom: containerHeight * 0.1,
        left: containerWidth * 0.2,
    };

    // Calculate the width and height for the inner drawing area
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    // Append SVG object
    const svg = d3
        .select("#grid-energy-range-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    /* ----------------------- X and Y Scales ----------------------- */
    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleBand().range([0, height]).padding(0.1);

    // Update the xAxis to increment by 10
    const xAxis = d3.axisBottom(x).ticks(width / 80).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(y);

    const colorScale = d3.scaleOrdinal().range(["#1f77b4"]);

    /* ----------------------- Create Tooltip ----------------------- */
    function onMouseMove(event, d) {
        // Position tooltip
        tooltip
            .style("opacity", 0.9)
            .style("left", `${event.pageX + dynamicMargin.left / 4}px`)
            .style("top", `${event.pageY}px`)
            .html(`
                <div class="tooltip-title">${d.Technology}</div>
                <table class="tooltip-content">  
                <tr>
                    <td>Value 1:</td>
                    <td class="value">${d.val1}</td>
                </tr>
                <tr>
                    <td>Value 2:</td>
                    <td class="value">${d.val2}</td>
                </tr>
                </table>
            `);
    }

    function onMouseOut() {
        tooltip.style("opacity", 0);
    }

    // Load and process the CSV data
    d3.csv("../../data/energy/grid-energy/grid-energy5.csv").then((data) => {
        // Parse the data
        data.forEach((d) => {
            d.val1 = +d.val1;
            d.val2 = +d.val2;
        });

        // Update the scales' domains
        const maxXValue = Math.ceil(d3.max(data, d => d.val2) / 10) * 10;
        x.domain([0, maxXValue]);
        y.domain(data.map((d) => d.Technology));
        

        // Draw the X-axis
        svg
            .append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .attr("class", "chart-labels");

        // Draw the Y-axis
        svg
            .append("g")
            .call(yAxis)
            .attr("class", "chart-labels");

        /* ----------------------- Draw the ranges ----------------------- */
        svg
            .selectAll(".range")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "range")
            .attr("x", (d) => x(d.val1))
            .attr("y", (d) => y(d.Technology))
            .attr("width", (d) => x(d.val2) - x(d.val1))
            .attr("height", y.bandwidth() * 0.7)
            .style("fill", (d) => colorScale(d.Technology))
            .style("opacity", 0.7)
            .on("mousemove", onMouseMove)
            .on("mouseout", onMouseOut);
    });
})();