(function () {
    /* ----------------------- Create Tooltip ------------------------ */
    const container = document.getElementById("municipal-solid-waste-stacked-bar-chart");

    const tooltipDiv = document.createElement("div");
    tooltipDiv.id = "tooltip";
    tooltipDiv.className = "tooltip";
    container.appendChild(tooltipDiv);

    const tooltip = d3.select(container).select("#tooltip");

    const aspectRatio = 0.65;
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;

    // Dynamic margins
    const dynamicMargin = {
        top: containerHeight * 0.05,
        right: containerWidth * 0.2,
        bottom: containerHeight * 0.05,
        left: containerWidth * 0.12,
    };

    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    // Append SVG object
    const svg = d3
        .select("#municipal-solid-waste-stacked-bar-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);


    // Define csv file path if it's not already defined
    if (typeof csvFile === "undefined") {
        var csvFile = "../../data/material-resources/municipal-solid-waste/municipal-solid-waste3.csv";
    }
    
    d3.csv(csvFile).then((data) => {
        // Parse the data
        data.forEach(d => {
            d.epaRegion = +d.epaRegion;
            d.Landfill = +d.Landfill;
            d.Recycling = +d.Recycling;
            d["Waste To Energy"] = +d["Waste To Energy"];
            d.Compost = +d.Compost;
        });

        // Define the categories directly
        const categories = ['Landfill', 'Recycling', 'Waste To Energy', 'Compost'];

        // Stack the data
        const stack = d3.stack().keys(categories);
        const stackedData = stack(data);

        // X scale and Axis
        const xScale = d3.scaleLinear()
            .domain([0, 100])
            .range([0, width]);
        svg.append('g')
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${d}%`));

        // Y scale and Axis
        const yScale = d3.scaleBand()
            .domain(data.map(d => `EPA Region ${d.epaRegion}`))
            .range([0, height])
            .padding(0.1);
        svg.append('g')
            .call(d3.axisLeft(yScale));

        // Color palette
        const color = d3.scaleOrdinal()
            .domain(categories)
            .range(["#1C476D","#4084BC", "#AEDBED", "#FFCB05"]);

        // Create bars
        const categoryGroups = svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .enter().append("g")
            .attr("class", "category-group")
            .attr("fill", d => color(d.key));

        categoryGroups.selectAll("rect")
            .data(d => d)
            .enter().append("rect")
            .attr("y", d => yScale(`EPA Region ${d.data.epaRegion}`))
            .attr("x", d => xScale(d[0]))
            .attr("height", yScale.bandwidth())
            .attr("width", d => xScale(d[1]) - xScale(d[0]))
            .on("mouseover", function (event, d) {
                const hoveredCategory = d3.select(this.parentNode).datum().key;
                d3.select(this).style("opacity", 0.5);

                const tooltipX = event.clientX + window.scrollX;
                const tooltipY = event.clientY + window.scrollY;

                const tooltipData = categories.map(key => {
                    const isHovered = key === hoveredCategory;
                    return `<tr style="opacity: ${isHovered ? 1 : 0.5}; font-weight: ${isHovered ? 'bold' : 'normal'};">
                        <td><span class="color-legend" style="background-color: ${color(key)};"></span>${key.replace(/([A-Z])/g, ' $1').toLowerCase()}</td>
                        <td style="text-align: right">${d.data[key]}%</td>
                    </tr>`;
                }).join("");

                tooltip.style("opacity", 0.9);
                tooltip.html(
                    `<div class="tooltip-title">${d.data.Region}</div>
                    <table class="tooltip-content">
                        ${tooltipData}
                    </table>`
                )
                .style("left", `${tooltipX + dynamicMargin.left / 4}px`)
                .style("top", `${tooltipY}px`);
            })
            .on("mouseout", function () {
                d3.select(this).style("opacity", 1);
                tooltip.style("opacity", 0);
            });

        // Add legends
        const legend = svg
            .append("g")
            .attr("transform", `translate(${width + dynamicMargin.right * 0.1}, ${dynamicMargin.top})`);

        const legendData = [
            { key: "Landfill", color: "#1C476D" },
            { key: "Recycling", color: "#4084BC" },
            { key: "Waste to Energy", color: "#AEDBED" },
            { key: "Compost", color: "#FFCB05" }
        ];

        // Calculate the dimensions for legend items
        const legendItemSize = width * 0.04; // Set the width and height to be 4% of the container width
        const gap = height * 0.02; // Gap between legend items

        const legendGroups = legend.selectAll(".legend-group")
            .data(legendData)
            .enter().append("g")
            .attr("class", "legend-group")
            .attr("transform", (d, i) => `translate(0, ${i * (legendItemSize + gap)})`)
            .on("mouseover", function (event, d) {
                // Highlight the corresponding bars
                svg.selectAll(".category-group")
                    .style("opacity", 0.2)
                    .filter(group => group.key === d.key)
                    .style("opacity", 1);
            })
            .on("mouseout", function () {
                // Reset the opacity of all bars
                svg.selectAll(".category-group").style("opacity", 1);
            });

        legendGroups.append("rect")
            .attr("width", legendItemSize)
            .attr("height", legendItemSize)
            .style("fill", d => d.color)
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("class", "legend-rect");

        legendGroups.append("text")
            .attr("x", legendItemSize + gap)
            .attr("y", legendItemSize / 2)
            .attr("alignment-baseline", "middle")
            .attr("class", "chart-labels")
            .text(d => d.key);
    });
})();