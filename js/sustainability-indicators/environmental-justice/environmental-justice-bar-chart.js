(function () {
    /* ----------------------- Create Tooltip ------------------------ */
    const container = document.getElementById("environmental-justice-bar-chart");

    const tooltipDiv = document.createElement("div");
    tooltipDiv.id = "tooltip";
    tooltipDiv.className = "tooltip";
    container.appendChild(tooltipDiv);

    const tooltip = d3.select(container).select("#tooltip");

    /* ----------------------- Dynamic dimensions ----------------------- */
    const aspectRatio = 0.55;

    // Get the container and its dimensions
    const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
    const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio

    // Calculate the dynamic margins
    const dynamicMargin = {
        top: containerHeight * 0.02,
        right: containerWidth * 0.05, // Adjust right margin if labels are too long
        bottom: containerHeight * 0.1,
        left: containerWidth * 0.25, // Increase left margin to fit labels in horizontal orientation
    };

    // Calculate the width and height for the inner drawing area
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    // Append SVG object
    const svg = d3
        .select("#environmental-justice-bar-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    /* ----------------------- Scales, axes, and color ----------------------- */
    const yScale = d3.scaleBand().range([height, 0]).padding(0.1); // Scale for categories
    const xScale = d3.scaleLinear().range([0, width]);
    const colorScale = d3
        .scaleOrdinal()
        .range([
            "#ED974A",
            "#FFCB05",
            "#CE5845",
        ]); // Updated color range for categories
    const formatDecimal = d3.format(".0f"); // Formatter to round to one decimal place

    const xAxis = (g) =>
        g.call(d3.axisBottom(xScale)
            .tickValues(d3.range(0, 101, 10)) // Generate an array from 0 to 100 with step of 10
            .tickFormat(d => `${d}%`));
    const yAxis = (g) =>
        g.call(d3.axisLeft(yScale).tickSizeOuter(0).tickSizeInner(0).tickPadding(10));

    /* ----------------------- Loading and processing data ----------------------- */
    d3.csv(environmentalJustice3, (d) => ({
        category: d.Category,
        subcategory: d.Subcategory,
        percentage: +d.Percentage,
    })).then((data) => {
        // Get unique categories and subcategories
        const categories = [...new Set(data.map((d) => d.category))];

        // Find the maximum number of subcategories in any category
        const maxSubcategories = d3.max(categories.map(category => data.filter(d => d.category === category).length));

        // Update scales
        yScale.domain(categories);
        xScale.domain([0, Math.ceil(d3.max(data, (d) => d.percentage) / 10) * 10]); // Adjust domain to increment by 10%

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

        // Create groups for each category
        const categoryGroups = svg
            .selectAll(".category-group")
            .data(categories)
            .enter()
            .append("g")
            .attr("class", "category-group")
            .attr("transform", (d) => `translate(0, ${yScale(d)})`);

        // Calculate bar height based on maximum number of subcategories
        const barHeight = yScale.bandwidth() / maxSubcategories;
        const paddingBetweenBars = 2; // Adjust the padding between bars

        // Draw the bars for each category
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
            .attr("height", barHeight - paddingBetweenBars) // Adjust bar height to add padding
            .attr("width", (d) => xScale(d.percentage))
            .attr("fill", (d, i) => colorScale(d.category)) // Assign color based on category
            .on('mouseover', function(event, d) {
                // Highlight the active bar
                d3.select(this).attr("opacity", 0.7);

                const tooltipX = event.clientX;
                const tooltipY = event.clientY;

                // Show and populate the tooltip
                tooltip.html(`
                    <div class="tooltip-title">${d.subcategory}</div>
                    <table class="tooltip-content">
                        <tr>
                        <td>
                            Percent
                        </td>
                        <td class="value">${d.percentage}%</td>
                        </tr>
                    </table>
                `)
                .style('opacity', '0.9')
                .style("left", `${tooltipX + dynamicMargin.left / 4}px`)
                .style("top", `${tooltipY}px`);
            })
            .on("mousemove", function (event, d) {
                const tooltipX = event.clientX;
                const tooltipY = event.clientY;

                // Update tooltip position
                tooltip
                    .style("left", (tooltipX + dynamicMargin.left / 4) + "px")
                    .style("top", (tooltipY) + "px");
            })
            .on("mouseout", function () {
                // Reset bar opacity
                d3.select(this).attr("opacity", 1);
                // Hide the tooltip
                tooltip.style('opacity', '0');
            });

        /* ----------------------- Adding labels ----------------------- */
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

        /* ----------------------- Adding dashed vertical line ----------------------- */
        const allHouseholdsPercentage = 12.8; // Percentage where the vertical line should be placed

        svg.append("line")
            .attr("class", "vertical-line")
            .attr("x1", xScale(allHouseholdsPercentage)) // Position at the x coordinate based on the percentage
            .attr("y1", 0)
            .attr("x2", xScale(allHouseholdsPercentage))
            .attr("y2", height)
            .style("stroke", "red") // Color of the line (red)
            .style("stroke-width", 2) // Thickness of the line
            .style("stroke-dasharray", ("4, 4")); // Dashed line style

        // Add label for the vertical line
        svg.append("text")
            .attr("class", "chart-labels")
            .attr("x", xScale(allHouseholdsPercentage) + 10) // Adjust x position for label
            .attr("y", 10) // Adjust y position for label
            .text("All Households 12.8%")
            .attr("fill", "red"); // Label text color
    });
})();