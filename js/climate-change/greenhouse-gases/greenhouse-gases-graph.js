(function () {
    /* ----------------------- Create Tooltip ------------------------ */
    const container = document.getElementById("greenhouse-gases-graph");

    const tooltipDiv = document.createElement("div");
    tooltipDiv.id = "tooltip";
    tooltipDiv.className = "tooltip";
    container.appendChild(tooltipDiv);

    const tooltip = d3.select(container).select("#tooltip");

    const aspectRatio = 0.8;
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;

    // Adjust the left margin here
    const dynamicMargin = {
        top: containerHeight * 0.02, // Increased top margin to accommodate wrapped text
        right: containerWidth * 0.1,
        bottom: containerHeight * 0.15, // Increased bottom margin to accommodate footnote
        left: containerWidth * 0.01, // Reduced left margin to shift table left
    };

    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    const svg = d3
        .select("#greenhouse-gases-graph")
        .append("svg")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    // Define the data as a constant variable
    const data = [
        { "Compound": "Carbon dioxide (CO<sub>2</sub>)", "Pre-industry Concentration": "278 ppm", "Concentration in 2022": "417.9 ppm", "Atmospheric Lifetime (years)": "Variable", "Main Human Activity Source": "Fossil fuels, cement production, land use change", "GWP": 1 },
        { "Compound": "Methane (CH<sub>4</sub>)", "Pre-industry Concentration": "729 ppb", "Concentration in 2022": "1,923 ppb", "Atmospheric Lifetime (years)": 12, "Main Human Activity Source": "Fossil fuels, Rice paddies, waste dumps, livestock", "GWP": "30 (fossil fuel), 27 (non fossil fuel)" },
        { "Compound": "Nitrous Oxide (N<sub>2</sub>O)", "Pre-industry Concentration": "270 ppb", "Concentration in 2022": "335.8 ppb", "Atmospheric Lifetime (years)": 109, "Main Human Activity Source": "Fertilizers, combustion industrial processes", "GWP": 273 },
        { "Compound": "HFC-134a (CF<sub>3</sub>CH<sub>2</sub>F)", "Pre-industry Concentration": "0 ppt", "Concentration in 2022": "108 ppt", "Atmospheric Lifetime (years)": 14, "Main Human Activity Source": "Refrigerant", "GWP": 1526 },
        { "Compound": "HFC-32 (CH<sub>2</sub>F<sub>2</sub>)", "Pre-industry Concentration": "0 ppt", "Concentration in 2022": "20 ppt", "Atmospheric Lifetime (years)": 5, "Main Human Activity Source": "Refrigerant", "GWP": 771 },
        { "Compound": "CFC-11 (CCl<sub>3</sub>F)", "Pre-industry Concentration": "0 ppt", "Concentration in 2022": "226 ppt", "Atmospheric Lifetime (years)": 52, "Main Human Activity Source": "Refrigerant", "GWP": 6226 },
        { "Compound": "PFC-14 (CF<sub>4</sub>)", "Pre-industry Concentration": "34 ppt", "Concentration in 2022": "86 ppt", "Atmospheric Lifetime (years)": 50000, "Main Human Activity Source": "Aluminum production", "GWP": 7380 },
        { "Compound": "SF<sub>6</sub>", "Pre-industry Concentration": "0 ppt", "Concentration in 2022": "9.95 ppt", "Atmospheric Lifetime (years)": 3200, "Main Human Activity Source": "Electrical insulation", "GWP": 25200 }
    ];

    const columns = ["Compound", "Pre-industry Concentration", "Concentration in 2022", "Atmospheric Lifetime (years)", "Main Human Activity Source", "GWP"];

    const columnWidths = columns.map((d, i) => {
        if (i === 0) return width * 0.2; // Wider column for the Compound name
        return (width * 0.8) / (columns.length - 1); // Spread other columns equally
    });

    const rowHeight = height * 0.12; // Dynamic row height
    const headerHeight = height * 0.15; // Increased header height for wrapping text

    // Create table header
    const headerGroup = svg.append("g").attr("class", "chart-labels");

    // Add background color to header cells
    columns.forEach((col, i) => {
        headerGroup.append("rect")
            .attr("x", columnWidths.slice(0, i).reduce((a, b) => a + b, 0))
            .attr("y", 0)
            .attr("width", columnWidths[i])
            .attr("height", headerHeight)
            .attr("fill", "#1C476D"); // Light grey background for header cells
    });

    const headerTexts = headerGroup.selectAll("text")
        .data(columns)
        .enter()
        .append("text")
        .attr("x", (d, i) => columnWidths.slice(0, i).reduce((a, b) => a + b, 0) + columnWidths[i] / 2)
        .attr("y", headerHeight / 2) // Center align the text vertically
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .attr("fill", "#ffffff") // Black text color for header
        .attr("class", "chart-labels")
        .text(d => d);

    // Handle text wrapping
    function wrap(text, width) {
        text.each(function () {
            const text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                lineHeight = 1.1, // ems
                x = text.attr("x"),
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy") || 0);
            let word,
                line = [],
                lineNumber = 0,
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }

    // Wrap text in headers
    columns.forEach((col, i) => {
        headerTexts.filter(d => d === col).call(wrap, columnWidths[i]);
    });

    // Create table rows
    svg.selectAll(".row")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "row")
        .attr("transform", (d, i) => `translate(0, ${headerHeight + i * rowHeight})`)
        .each(function (d, i) {
            const rowGroup = d3.select(this);

            // Add background color for row (alternating colors)
            rowGroup.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", width)
                .attr("height", rowHeight)
                .attr("fill", i % 2 === 0 ? "#8FC8E5" : "#ffffff"); // Alternate between light grey and white

            columns.forEach((col, colIndex) => {
                const cellX = columnWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
                const cellWidth = columnWidths[colIndex];

                rowGroup.append("foreignObject")
                    .attr("x", cellX)
                    .attr("y", 0)
                    .attr("width", cellWidth)
                    .attr("height", rowHeight)
                    .style("font-family", "Arial, sans-serif")      
                    .append("xhtml:div")
                    .attr("class", "chart-labels") // Add class to the div
                    .style("text-align", "center")
                    .style("margin", 0)
                    .style("line-height", "1.1em")
                    .style("display", "flex")
                    .style("align-items", "center")
                    .style("justify-content", "center")
                    .style("height", "100%") // Ensure the div takes full height of the foreignObject
                    .html(function() {
                        const content = d[col];
                        // Use sub tag with specific style to lower the text
                        return `<div style="display: inline-flex; align-items: flex-end;" class="chart-labels">${content}</div>`;
                    });
            });
        });

    // Adjust the position and size of text labels
    d3.selectAll(".chart-labels text")
        .attr("dy", ".35em"); // Adjust the vertical offset

    // Add footnote at the bottom of the SVG
    svg.append("text")
        .attr("x", 0) 
        .attr("y", height + dynamicMargin.bottom * 0.7) // Position below the last row
        .attr("dy", ".3em")
        .attr("class", "footnote")
        .style("font-family", "Arial, sans-serif")
        .style("font-size", "0.8em")
        .text("*Concentration in 2022, **GWP = 100-year global warming potential.");

})();