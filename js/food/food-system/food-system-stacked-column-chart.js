d3.csv(foodSystem1).then(data => {
    data.forEach(d => {
        for (let key in d) {
            if (key !== "category") {
                d[key] = +d[key];
            }
        }
    });

    const mainCategories = ["Household Storage & Preparation", "Processing Industry", "Wholesale and Retail", "Agricultural Production", "Food Services", "Packaging Material", "Transportation"];
    const newCategories = ["Food Energy Available that is Consumed", "Food Energy Available"];

    const container = document.getElementById("food-system-stacked-column-chart");

    const tooltipDiv = document.createElement("div");
    tooltipDiv.id = "tooltip";
    tooltipDiv.className = "tooltip";
    container.appendChild(tooltipDiv);

    const tooltip = d3.select(container).select("#tooltip");

    const aspectRatio = 0.7;
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;

    const dynamicMargin = {
        top: containerHeight * 0.08,
        right: containerWidth * 0,  // Increased margin on the right for labels
        bottom: containerHeight * 0.15,
        left: containerWidth * 0.05,  // Decreased margin on the left
    };

    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    const svg = d3.select("#food-system-stacked-column-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    // Set xScale with no padding and use only part of the width for bars
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.category))
        .range([0, width * 0.75])  // Use only part of width to leave space for labels
        .padding(0);  // No padding here

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickSizeOuter(0).tickSizeInner(0).tickPadding(10))
        .selectAll(".tick text")
        .attr("class", "table-labels")
        .style("font-weight", "bold");

    const yScale = d3.scaleLinear()
        .domain([0, 16])
        .range([height, 0]);

    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(yScale).ticks(8))
        .selectAll(".tick text")
        .attr("class", "table-labels");

    const color = d3.scaleOrdinal()
        .domain(mainCategories.concat(newCategories))
        .range(["#1C476D", "#4084BC", "#73B9E0", "#AEDBED", "#386660", "#E2E27A", "#D8D8D8", "#ED974A", "#FFE07D"]);

    const stack = d3.stack()
        .keys(mainCategories.concat(newCategories))
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    const stackedData = stack(data);

    // Define the padding for the right side of each bar
    const rightPadding = width * 0.3;

    svg.selectAll(".layer")
        .data(stackedData)
        .enter()
        .append("g")
        .attr("class", "layer")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.data.category))  // Position the bar
        .attr("y", d => yScale(d[1]))
        .attr("height", d => yScale(d[0]) - yScale(d[1]))
        .attr("width", xScale.bandwidth() - rightPadding)  // Adjust the width by subtracting the right padding
        .on("mouseover", function (event, d) {
            const hoveredCategory = d3.select(this.parentNode).datum().key;
            d3.select(this).style("opacity", 0.5);

            const tooltipX = event.clientX;
            const tooltipY = event.clientY;

            const total = d3.sum(mainCategories.concat(newCategories), key => d.data[key] || 0);
            const relevantCategories = (hoveredCategory === "Food Energy Available that is Consumed" || hoveredCategory === "Food Energy Available") ? newCategories : mainCategories;

            const tooltipData = relevantCategories.slice().reverse().map(key => {
                const formatNumber = d3.format(",.1f");
                const isHovered = key === hoveredCategory;
                return `<tr style="opacity: ${isHovered ? 1 : 0.5}; font-weight: ${isHovered ? 'bold' : 'normal'};">
                    <td><span class="color-legend" style="width: 10px; height: 10px; background-color: ${color(key)}"></span>${key}</td>
                    <td class="value">${formatNumber(d.data[key] / total * 100)} %</td>
                </tr>`;
            }).join("");

            tooltip.style("opacity", 1)
                .html(`
                    <div class="tooltip-title">${d.data.category}</div>
                    <table class="tooltip-content">${tooltipData}</table>
                `)
                .style("left", `${tooltipX + dynamicMargin.left / 4}px`)
                .style("top", `${tooltipY}px`);
        })
        .on("mouseout", function () {
            d3.select(this).style("opacity", 1);
            tooltip.style("opacity", 0);
        });

    svg.append("text")
        .attr("class", "table-labels")
        .attr("text-anchor", "middle")
        .attr("transform", `translate(0, -${dynamicMargin.top * 0.7})`)
        .attr("x", 0)
        .style("fill", "#000")
        .text("Quads")
        .each(function () { wrapText(d3.select(this), dynamicMargin.left * 2); });

    function wrapText(text, width) {
        text.each(function () {
            const elem = d3.select(this);
            const words = elem.text().split(/\s+/).reverse();
            let word;
            let line = [];
            let lineNumber = 0;
            const lineHeight = 1.1;

            const y = elem.attr("y");
            const dy = parseFloat(elem.attr("dy")) || 0;

            let tspan = elem.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = elem.append("tspan").attr("x", 0).attr("y", y).attr("dy", `${++lineNumber * lineHeight + dy}em`).text(word);
                }
            }
        });
    }

    // Add labels only for stacked rectangles that have actual values
    stackedData.forEach((stack, i) => {
        stack.forEach((d, j) => {
            const value = d[1] - d[0];
            if (value > 0) {
                svg.append("text")
                    .attr("x", xScale(d.data.category) + xScale.bandwidth() - rightPadding + 5) // Position text to the right of the bar
                    .attr("y", (yScale(d[1]) + yScale(d[0])) / 2) // Center the text vertically within the bar
                    .attr("class", "table-labels")
                    .attr("dy", "0.35em")
                    .text(stack.key)
                    .style("font-size", "10px"); // Adjust font size if necessary
            }
        });
    });

    // Add arrow pointing to the right at the center of the graph
    const arrowHeadSize = 20;
    const arrow = svg.append("g")
        .attr("transform", `translate(${width * 0.3}, ${height / 2})`);

    // Line
    arrow.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", width * 0.05)  // Length of the arrow line
        .attr("y2", 0)
        .attr("stroke", "#CE5845")
        .attr("stroke-width", 5);

    // Arrowhead as a polygon
    arrow.append("polygon")
        .attr("points", `${width * 0.05},${-arrowHeadSize / 2} ${width * 0.05 + arrowHeadSize},0 ${width * 0.05},${arrowHeadSize / 2}`)
        .attr("fill", "#CE5845");
});