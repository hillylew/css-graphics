(function () {
    // Dynamic dimensions
    const aspectRatio = 0.6;

    // Get the container and its dimensions
    const container = document.getElementById("environmental-justice-tree-map");
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;

    // Calculate the dynamic margins
    const dynamicMargin = {
        top: containerHeight * 0.02,
        right: containerWidth * 0.02,
        bottom: containerHeight * 0.05,
        left: containerWidth * 0.02,
    };

    // Calculate the width and height for the inner drawing area
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    // Color scale for continents
    const colorScale = d3.scaleOrdinal()
        .domain(["Asia", "Americas", "Europe", "Africa", "Oceania"])
        // .range(["#eb5250", "#6298c6", "#75bf70", "#ae71b6", "#f38f53"]);
        // .range(["#00274c", "#1d476d", "#3167a4", "#8fc8e5", "#d8d8d8"]);
        // .range(["#1d476d", "#3167a4", "#8fc8e5", "#386660", "#e2e27a"]);
        .range(["#1d476d", "#3167a4", "#8fc8e5", "#ffcb03", "#ffd579"]);

    // Append SVG object
    const svg = d3
        .select("#environmental-justice-tree-map")
        .append("svg")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    // Load data from CSV
    d3.csv("./data/environmental-justice/environmental-justice2.csv").then((data) => {
        // Convert data types if necessary
        data.forEach(d => {
            d['Metric Ton'] = +d['Metric Ton']; // Convert Metric Ton to numeric
        });

        // Create treemap layout
        const root = d3.hierarchy({ children: data })
            .sum(d => d['Metric Ton']);

        d3.treemap()
            .size([width, height])
            .padding(5)
            (root);

        const formatNumber = d3.format(",.1f");

        // Create rectangles for each data node
        svg.selectAll("rect")
            .data(root.leaves())
            .enter()
            .append("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => colorScale(d.data.Continent));

        // Add text labels
        svg.selectAll(".node-label")
            .data(root.leaves())
            .enter()
            .append("text")
            .attr("class", "node-label")
            .attr("x", d => d.x0 + 5) // Slightly offset from the top left corner
            .attr("y", function (d) {
                // Calculate font size based on rectangle area, with a min and max
                const area = (d.x1 - d.x0) * (d.y1 - d.y0);
                const minFontSize = 8;
                const maxFontSize = 20;
                const scale = d3.scaleSqrt()
                    .domain([100, 10000]) // Adjust this domain depending on your dataset values
                    .range([minFontSize, maxFontSize]);
                const fontSize = Math.min(scale(area), (d.y1 - d.y0) / 3);
                return d.y0 + fontSize + 2; // Offset y by font size plus a small margin
            })
            .attr("fill", "white") // Text color set to white
            .attr("font-size", function (d) {
                // Calculate font size based on rectangle area, with a min and max
                const area = (d.x1 - d.x0) * (d.y1 - d.y0);
                const minFontSize = 8;
                const maxFontSize = 20;
                const scale = d3.scaleSqrt()
                    .domain([100, 10000]) // Adjust this domain depending on your dataset values
                    .range([minFontSize, maxFontSize]);
                return `${Math.min(scale(area), (d.y1 - d.y0) / 3)}px`;
            })
            .text(d => d.data.Continent) // Display continent names
            .call(wrapText, d => d.x1 - d.x0); // Wrap text to fit within the rect

        // Append tspan for the metric tons value
        svg.selectAll(".node-label")
            .append("tspan")
            .attr("x", d => d.x0 + 5) // Aligned with the title
            .attr("dy", "1.2em") // Offset on the next line under the title
            .text(d => `${formatNumber(d.data['Metric Ton'])} MT`); // Display the metric tons value

        // Wrap text function
        function wrapText(text, width) {
            text.each(function () {
                const text = d3.select(this);
                const words = text.text().split(/\s+/).reverse();
                let word;
                let line = [];
                let lineNumber = 0;
                const lineHeight = 1.1; // ems
                const y = text.attr("y");
                const x = text.attr("x");
                const dy = parseFloat(text.attr("dy") || 0);
                let tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", `${dy}em`);
                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", `${++lineNumber * lineHeight + dy}em`).text(word);
                    }
                }
            });
        }
    }).catch(error => {
        console.error("Error loading the data: ", error);
    });
})();
