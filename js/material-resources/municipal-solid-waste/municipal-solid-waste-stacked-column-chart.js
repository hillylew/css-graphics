(function () {
    /* ----------------------- Create Tooltip ------------------------ */
    const container = document.getElementById("municipal-solid-waste-stacked-column-chart");

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
        right: containerWidth * 0.12,
        bottom: containerHeight * 0.05,
        left: containerWidth * 0.07,
    };

    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    // Append SVG object
    const svg = d3
        .select("#municipal-solid-waste-stacked-column-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);


    const categories = ['Landfill', 'Recycled', 'Combustion', 'Composted', 'Other'];

    const color = d3.scaleOrdinal()
        .domain(categories)
        .range(["#1D476D", "#3167A4", "#8FC8E5", "#386660", "#E2E27A"]);

    // Load the CSV file and process it
    d3.csv("../../data/material-resources/municipal-solid-waste/municipal-solid-waste2.csv").then((data) => {
        data.forEach(d => {
            d.year = +d.Year;
            d.Recycled = +d.Recycled;
            d.Composted = +d.Composted;
            d.Other = +d.Other;
            d.Combustion = +d.Combustion;
            d.Landfill = +d.Landfill;
        });

        const x = d3.scaleBand()
            .domain(data.map(d => d.year))
            .rangeRound([0, width])
            .paddingInner(0.1);

        const y = d3.scaleLinear()
            .domain([0, 100])
            .nice()
            .range([height, 0]);

        const stack = d3.stack()
            .keys(categories)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);

        const series = stack(data);

        const categoryGroups = svg.append("g")
            .selectAll("g")
            .data(series)
            .enter().append("g")
            .attr("class", "category-group")
            .attr("fill", d => color(d.key))
            
        categoryGroups.selectAll("rect")
            .data(d => d)
            .enter().append("rect")
            .attr("x", (d, i) => x(data[i].year))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth())
            .on("mouseover", function (event, d) {
                const hoveredCategory = d3.select(this.parentNode).datum().key;
                // d3.select(this).attr('data-original-color', d3.select(this).style("fill"));
                // d3.select(this).style("fill", "orange");
                d3.select(this).style("opacity", 0.5);

                const tooltipX = event.clientX + window.scrollX;
                const tooltipY = event.clientY + window.scrollY;

                const tooltipData = categories.slice().reverse().map(key => {
                    const formatNumber = d3.format(",.1f");
                    const isHovered = key === hoveredCategory;
                    return `<tr style="opacity: ${isHovered ? 1 : 0.5}; font-weight: ${isHovered ? 'bold' : 'normal'};">
                        <td><div style="width:10px; height:10px; background-color:${color(key)};};"></div></td>
                        <td>${key}</td>
                        <td style="text-align: right">${formatNumber(d.data[key])}%</td>
                    </tr>`;
                }).join("");

                tooltip.style("opacity", 1);
                tooltip.html(
                    `<div style="font-weight: bold; border-radius: 5px 5px 0 0; background-color: #f1eded;padding: 5px;">${d.data.year}</div>
                    <table>
                        ${tooltipData}
                    </table>`
                )
                .style("left", `${tooltipX + dynamicMargin.left / 4}px`)
                .style("top", `${tooltipY}px`);
            })
            .on("mouseout", function () {
                // d3.select(this).style("fill", d3.select(this).attr('data-original-color'));
                d3.select(this).style("opacity", 1);
                tooltip.style("opacity", 0);
            });

        // Draw the X-axis
        const xAxisGroup = svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickSize(0));

        xAxisGroup.selectAll("text").attr("class", "chart-labels");

        // Draw the Y-axis
        const yAxisGroup = svg.append("g")
            .attr("class", "axis y-axis")
            .call(d3.axisLeft(y).tickFormat(d => d + "%").ticks(5));

        yAxisGroup.selectAll("text").attr("class", "chart-labels");

        // Create legends
        const legend = svg.selectAll(".legend")
            .data(series)
            .enter().append("g")
            .attr("transform", (d) => {
                const lastPoint = d[d.length - 1];
                const yPosition = y(lastPoint[0]) + (y(lastPoint[1]) - y(lastPoint[0])) / 2;
                return `translate(${width},${yPosition})`;
            });

        legend.append("text")
            .attr("class", "chart-labels")
            .attr("x", 5)
            .attr("y", 0)
            .style("text-anchor", "start")
            .style("alignment-baseline", "middle")
            .style("fill", d => color(d.key))
            .text(d => d.key);

        // Bind the legend to the highlight logic
        legend.on("mouseover", function (event, d) {
            highlightCategory(d.key);
        }).on("mouseout", resetCategoryHighlight);

        // Highlighting logic
        function highlightCategory(category) {
            svg.selectAll(".category-group").style("opacity", 0.2);
            svg.selectAll(".category-group")
                .filter(d => d.key === category)
                .style("opacity", 1);
        }

        function resetCategoryHighlight() {
            svg.selectAll(".category-group").style("opacity", 1);
        }

        // Resize Event Handler
        window.addEventListener('resize', function () {
            const fullWidth = container.offsetWidth;
            const fullHeight = fullWidth * aspectRatio;

            const newWidth = fullWidth - dynamicMargin.left - dynamicMargin.right;
            const newHeight = fullHeight - dynamicMargin.top - dynamicMargin.bottom;

            d3.select("svg")
                .attr("width", fullWidth)
                .attr("height", fullHeight);

            x.rangeRound([0, newWidth]);
            y.range([newHeight, 0]);

            svg.selectAll("rect")
                .attr("x", (d, i) => x(data[i].year))
                .attr("width", x.bandwidth())
                .attr("y", d => y(d[1]))
                .attr("height", d => y(d[0]) - y(d[1]));

            xAxisGroup.call(d3.axisBottom(x).tickSize(0));
            yAxisGroup.call(d3.axisLeft(y).tickFormat(d => d + "%").ticks(5));

            // Adjust the position of legends on resize
            legend.attr("transform", (d) => {
                const lastPoint = d[d.length - 1];
                const yPosition = y(lastPoint[0]) + (y(lastPoint[1]) - y(lastPoint[0])) / 2;
                return `translate(${newWidth},${yPosition})`;
            });
        });
    });
})();