(function () {
    /* ----------------------- Create Tooltip ------------------------ */
    const container = document.getElementById("grid-energy-range-chart");

    const tooltipDiv = document.createElement("div");
    tooltipDiv.id = "tooltip";
    tooltipDiv.className = "tooltip";
    container.appendChild(tooltipDiv);

    const tooltip = d3.select(container).select("#tooltip");

    /* ----------------------- Dynamic dimensions ----------------------- */
    const aspectRatio = 0.8;

    // Get the container and its dimensions
    const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
    const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio

    // Calculate the dynamic margins
    const dynamicMargin = {
        top: containerHeight * 0.05,
        right: containerWidth * 0.1,
        bottom: containerHeight * 0.2,
        left: containerWidth * 0.1,
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
    const x = d3.scaleBand().range([0, width]).padding(0.4);
    const y = d3.scaleLinear().range([height, 0]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y).ticks(width / 80).tickFormat(d => `${d}¢`);

    const colorScale = d3.scaleOrdinal().range(["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0"]);

    /* ----------------------- Create Gradient ----------------------- */
    const defs = svg.append("defs");
    const gradient = defs
        .append("linearGradient")
        .attr("id", "bar-gradient")
        .attr("gradientTransform", "rotate(90)");

    gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#CE5845")
        .attr("stop-opacity", 1);

    gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#FED679")
        .attr("stop-opacity", 1);

    /* ----------------------- Create Tooltip ----------------------- */
    function onMouseMove(event, d) {

        const tooltipX = event.clientX + window.scrollX;
        const tooltipY = event.clientY + window.scrollY;
        
        // Position tooltip
        tooltip
            .style("opacity", 0.9)
            .style("left", `${tooltipX + dynamicMargin.left / 4}px`)
            .style("top", `${tooltipY}px`)
            .html(`
                <div class="tooltip-title">${d.Technology}</div>
                <table class="tooltip-content">
                    <tr>
                        <td>Maximum:</td>
                        <td class="value"><strong>${d.val2}</strong>¢</td>
                    </tr>
                    <tr>
                        <td>Minimum:</td>
                        <td class="value"><strong>${d.val1}</strong>¢</td>
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
        const maxYValue = Math.ceil(d3.max(data, d => d.val2) / 10) * 10;
        x.domain(data.map(d => d.Technology));
        y.domain([0, maxYValue]);

        // Draw the X-axis
        svg
            .append("g")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis)
            .attr("class", "chart-labels")
            .selectAll("text")
            .style("text-anchor", "end")
            // .style("font-weight", "bold")
            .attr("transform", "rotate(-45)");

        // Draw the Y-axis
        svg
            .append("g")
            .call(yAxis)
            .attr("class", "chart-labels");

        // Add Y-axis label
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -dynamicMargin.left * 0.7)
            .attr("class", "chart-labels")
            .text("LCOS (cents/kWh)");

        /* ----------------------- Draw the ranges ----------------------- */
        svg
            .selectAll(".range")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "range")
            .attr("x", d => x(d.Technology))
            .attr("y", d => y(d.val2))
            .attr("width", x.bandwidth())
            .attr("height", d => y(d.val1) - y(d.val2))
            .style("fill", "url(#bar-gradient)")
            .style("opacity", 0.7)
            .on("mousemove", onMouseMove)
            .on("mouseout", onMouseOut);
    });
})();