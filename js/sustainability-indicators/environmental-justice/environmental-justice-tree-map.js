(function () {
    /* ----------------------- Create Tooltip ------------------------ */
    const container = document.getElementById("environmental-justice-tree-map");
    
    const tooltipDiv = document.createElement("div");
    tooltipDiv.id = "tooltip";
    tooltipDiv.className = "tooltip";
    container.appendChild(tooltipDiv);

    const tooltip = d3.select(container).select("#tooltip");

    /* ----------------------- Dynamic dimensions ----------------------- */
    const aspectRatio = 0.6;

    const containerWidth = container.offsetWidth || 960; // Set a default width if offsetWidth is zero
    const containerHeight = containerWidth * aspectRatio;

    const dynamicMargin = {
        top: containerHeight * 0.1, 
        right: containerWidth * 0.15,
        bottom: containerHeight * 0.1,
        left: containerWidth * 0.07,
    };

    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    /* ----------------------- Color Scale ----------------------- */
    const barColor = "#ED974A"; // Single bar color

    /* ----------------------- Data ----------------------- */
    const data = [
        { "Continent": "Asia", "Metric Ton": 24.9 },
        { "Continent": "Americas", "Metric Ton": 13.1 },
        { "Continent": "Europe", "Metric Ton": 12.0 },
        { "Continent": "Africa", "Metric Ton": 2.9 },
        { "Continent": "Oceania", "Metric Ton": 0.7 }
    ];

    /* ----------------------- Calculate Total Metric Tons ----------------------- */
    const totalMetricTons = d3.sum(data, d => d['Metric Ton']);

    /* ----------------------- Scales ----------------------- */
    const x = d3.scaleBand().rangeRound([0, width]).padding(0.2);
    const y = d3.scaleLinear().rangeRound([height, 0]); // Invert y-axis to start from the bottom

    x.domain(data.map(d => d.Continent));
    y.domain([0, Math.ceil(d3.max(data, d => d['Metric Ton']) / 5) * 5]); // Max value logic

    /* ----------------------- SVG ----------------------- */
    const svg = d3
        .select("#environmental-justice-tree-map")
        .append("svg")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    /* ----------------------- Bars ----------------------- */
    svg.append("g")
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.Continent))
        .attr("y", d => y(d['Metric Ton']))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d['Metric Ton'])) // Adjust for vertical bars
        .attr("fill", barColor) // Single bar color
        .style("opacity", 1) // Default opacity
        .on("mouseover", function (event, d) {
            d3.select(this)
                .style("opacity", 0.5); // Reduce opacity on hover

            const percentage = ((d['Metric Ton'] / totalMetricTons) * 100).toFixed(0); // Calculate percentage

            tooltip.style("display", "block");
            tooltip.html(`
            <div class="tooltip-title">${d.Continent}</div>
            <table class="tooltip-content">
                <tr>
                    <td>E-Waste Generation </td>
                    <td class="value"><strong>${d['Metric Ton']}</strong> MT</td>
                </tr>
                <tr>
                    <td>Percent </td>
                    <td class="value"><strong>${percentage}</strong> %</td>
                </tr>
            </table>
            `);
        })
        .on("mousemove", function (event) {
            const tooltipX = event.clientX;
            const tooltipY = event.clientY;
            tooltip.style("left", `${tooltipX + dynamicMargin.left / 4}px`)
                .style("top", `${tooltipY}px`);
        })
        .on("mouseout", function () {
            d3.select(this)
                .style("opacity", 1); // Reset opacity on mouse out

            tooltip.style("display", "none");
        });

    /* ----------------------- X Axis ----------------------- */
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickSizeOuter(0).tickSizeInner(0).tickPadding(10))
        .selectAll(".tick text") // Select all x-axis tick texts
        .attr("class", "chart-labels");

    /* ----------------------- Y Axis ----------------------- */
    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y)
            .ticks(y.domain()[1] / 5) // Divide max value by 5 for ticks
            .tickFormat(d3.format(".0f"))) // Ignore decimal places
        .selectAll(".tick text") // Select all y-axis tick texts
        .attr("class", "chart-labels"); // Apply the class

    // Add label for y-axis
    svg.append("text")
        .attr("class", "chart-labels")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(0, -${dynamicMargin.top / 2})`)
        .style("fill", "#000")
        .text("Metric Tons");
})();