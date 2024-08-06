(function () {
    /* ----------------------- Create Tooltip ------------------------ */
    const container = document.getElementById("grid-energy-stacked-column-chart");

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
        bottom: containerHeight * 0.1,  // Increased margin for x-axis label
        left: containerWidth * 0.15,
    };

    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    const svg = d3
        .select("#grid-energy-stacked-column-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    /* ----------------------- Scales, axes, and color ----------------------- */
    const xScale = d3.scaleLinear().range([0, width]);
    const yScale = d3.scaleBand().range([height, 0]).padding(0.1);
    const colorScale = d3.scaleOrdinal().domain(["Non-PHS", "PHS"]).range(["#3167A4", "#8FC8E5"]);
    const formatNumber = d3.format(",");

    const xAxis = (g) =>
        g.call(d3.axisBottom(xScale)
            .tickValues(d3.range(0, xScale.domain()[1] + 1, 2000))
            .tickFormat((d) => formatNumber(d / 1000)))
        .call(g => g.select(".domain"))
        .call(g => g.selectAll(".tick text").attr("class", "chart-labels").attr("fill", "#000"));

    const yAxis = (g) =>
        g.call(d3.axisLeft(yScale).tickSizeOuter(0).tickSizeInner(0).tickPadding(10))
        .call(g => g.select(".domain").remove()) // Remove y-axis line
        .call(g => g.selectAll(".tick text").attr("class", "chart-labels").attr("fill", "#000").style("font-weight", "bold"));

    /* ----------------------- Loading and processing data ----------------------- */
    d3.csv("../../data/energy/grid-energy/grid-energy2.csv").then((data) => {
        data.forEach((d) => {
            for (let prop in d) {
                if (prop !== "State") d[prop] = +d[prop];
            }
        });

        const stack = d3.stack().keys(["Non-PHS", "PHS"]);
        const stackedData = stack(data);

        yScale.domain(data.map((d) => d.State).reverse());

        const maxXValue = Math.ceil(d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1])) / 2000) * 2000;
        xScale.domain([0, maxXValue]);

        svg
            .append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis)
            .attr("class", "chart-labels");

        // Add x-axis label
        svg.append("text")
            .attr("class", "chart-labels")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + dynamicMargin.bottom * 0.8)
            .text("Energy Storage Capacity (GW)");

        svg
            .append("g")
            .call(yAxis)
            .attr("class", "chart-labels")
            .style("font-weight", "bold");

        const categoryGroups = svg.selectAll(".category-group")
            .data(stackedData)
            .enter()
            .append("g")
            .attr("class", "category-group")
            .style("fill", (d) => colorScale(d.key));

        categoryGroups.selectAll("rect")
            .data((d) => d)
            .enter()
            .append("rect")
            .attr("x", (d) => xScale(d[0]))
            .attr("y", (d) => yScale(d.data.State))
            .attr("height", yScale.bandwidth())
            .attr("width", (d) => xScale(d[1]) - xScale(d[0]))
            .on("mouseover", function (event, d) {
                highlightCategory(d3.select(this.parentNode).datum().key);
            })
            .on("mouseout", resetCategoryHighlight);

        function highlightCategory(category) {
            svg.selectAll(".category-group").style("fill-opacity", 0.2);
            svg.selectAll(".category-group")
                .filter((d) => d.key === category)
                .style("fill-opacity", 1);
        }

        function resetCategoryHighlight() {
            svg.selectAll(".category-group").style("fill-opacity", 1);
        }

        const legend = svg.append("g")
            .attr("transform", `translate(${width - dynamicMargin.right * 2}, ${height * 0.8})`);

        const legendData = [
            { label: "Non-PHS", color: "#3167A4" },
            { label: "PHS", color: "#8FC8E5" },
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

        function onMouseMove(event) {
            const [xPos, yPos] = d3.pointer(event, this);
            const hoveredState = yScale.domain().find((state) => yScale(state) <= yPos && yPos < yScale(state) + yScale.bandwidth());
            const hoverData = data.find((d) => d.State === hoveredState);

            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.style("left", `${event.pageX + dynamicMargin.left / 4}px`)
                .style("top", `${event.pageY}px`);

            if (hoverData) {
                tooltip.html(`
                    <div class="tooltip-title">${hoverData.State}</div>
                    <table class="tooltip-content">
                        <tr>
                            <td><span class="color-legend" style="background-color: ${colorScale("Non-PHS")};"></span>Non-PHS</td>
                            <td class="value">${formatNumber(hoverData["Non-PHS"])}</td>
                        </tr>
                        <tr>
                            <td><span class="color-legend" style="background-color: ${colorScale("PHS")};"></span>PHS</td>
                            <td class="value">${formatNumber(hoverData["PHS"])}</td>
                        </tr>
                    </table>
                    <table class="tooltip-total">
                        <tr>
                            <td><strong>Total</strong></td>
                            <td class="value">${formatNumber(hoverData["Non-PHS"] + hoverData["PHS"])}</td>
                        </tr>
                    </table>
                `);
            }
        }

        svg.append("rect")
            .attr("class", "listening-rect")
            .attr("width", width + dynamicMargin.left / 4)
            .attr("height", height)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("mousemove", onMouseMove)
            .on("mouseover", () => {
                tooltip.style("opacity", 0.9);
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });
    });
})();