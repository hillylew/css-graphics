(function () {
    /* ----------------------- Create Tooltip ------------------------ */
    const container = document.getElementById("environmental-justice-bubble-chart");

    const tooltipDiv = document.createElement("div");
    tooltipDiv.id = "tooltip";
    tooltipDiv.className = "tooltip";
    container.appendChild(tooltipDiv);

    const tooltip = d3.select(container).select("#tooltip");

    // Dynamic dimensions
    const aspectRatio = 0.6;

    // Get the container and its dimensions
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;

    // Calculate the dynamic margins
    const dynamicMargin = {
        top: containerHeight * 0.02,
        right: containerWidth * 0.08,
        bottom: containerHeight * 0.12,
        left: containerWidth * 0.08,
    };

    // Calculate the width and height for the inner drawing area
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    // Append SVG object
    const svg = d3.select("#environmental-justice-bubble-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    // Load data from CSV
    d3.csv("../../data/sustainability-indicators/environmental-justice/environmental-justice5.csv")
        .then((data) => {
            // Scale functions
            const x = d3.scaleLinear().range([0, width]);
            const y = d3.scaleLinear().range([height, 0]);

            const maxEmissions = d3.max(data, (d) => +d["Cummulative emissions per capita (t)"]);
            const maxXDomain = Math.ceil(maxEmissions / 100) * 100; // round up to nearest 100 for x-axis domain
            x.domain([0, maxXDomain]);

            const maxVulnerability = d3.max(data, (d) => +d["Climate vulnability"]);
            const maxYDomain = Math.ceil(maxVulnerability / 10) * 10; // round up to nearest 10 for y-axis domain
            y.domain([0, maxYDomain]);

            // Add X axis
            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("class", "chart-labels");

            // Add Y axis
            svg.append("g")
                .call(d3.axisLeft(y))
                .selectAll("text")
                .attr("class", "chart-labels");

            // Updated color scale with GDP thresholds and corresponding colors
            const color = d3.scaleThreshold()
                .domain([5000, 20000, 45000])
                .range(["#d8d8d8", "#ffd579", "#ed974a", "#ce5845"]);

            // Fixed radius for all circles
            const fixedRadius = 5;

            const formatNumber = d3.format(",.0f");

            // Add circles
            svg.append("g")
                .selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("class", "bubble") // Add class for easier selection
                .attr("cx", (d) => x(+d["Cummulative emissions per capita (t)"]))
                .attr("cy", (d) => y(+d["Climate vulnability"]))
                .attr("r", fixedRadius) // Fixed radius for all circles
                .style("fill", (d) => color(+d["GDP per capita (current US$)"]))
                .style("opacity", 1)
                .attr("stroke", "white")
                // Add hover event listeners
                .on("mouseover", function (event, d) {
                    tooltip.transition().duration(200).style("opacity", 0.9);
                    tooltip.html(
                        `
                          <div class="tooltip-title"> ${d["Country/area"]}</div>
                          <table class="tooltip-content">
                              <tr>
                                  <td>GDP per capita (current US$)</td>
                                  <td class="value">${formatNumber(d["GDP per capita (current US$)"])}</td>
                              </tr>
                              <tr>
                                  <td>Cummulative emissions per capita (t):</td>
                                  <td class="value">${formatNumber(d["Cummulative emissions per capita (t)"])}</td>
                              </tr>
                              <tr>
                                  <td>Climate vulnability:</td>
                                  <td class="value">${formatNumber(d["Climate vulnability"])}</td>
                              </tr>
                          </table>`
                    )
                        .style("left", `${event.pageX + dynamicMargin.left / 4}px`)
                        .style("top", `${event.pageY}px`);

                    // Highlight corresponding circles
                    d3.selectAll(".bubble")
                        .style("opacity", 0.1)
                        .filter((circleData) => color(+circleData["GDP per capita (current US$)"]) === color(+d["GDP per capita (current US$)"]))
                        .style("opacity", 1);
                })
                .on("mousemove", function (event, d) {
                    tooltip.style("left", `${event.pageX + dynamicMargin.left / 4}px`)
                        .style("top", `${event.pageY}px`);
                })
                .on("mouseout", function (event, d) {
                    tooltip.transition().duration(500).style("opacity", 0);
                    d3.selectAll(".bubble").style("opacity", 1); // reset circle opacity
                });

            // Add text labels for specific countries
            const highlightedCountries = ["Canada", "China", "France", "India", "Japan", "Somalia", "U.S.", "UK", "Ukraine"];

            // Add lines and labels for highlighted countries
            const labelOffsetX = 10;
            const labelOffsetY = -10;

            highlightedCountries.forEach(country => {
                const countryData = data.find(d => d["Country/area"] === country);
                if (countryData) {
                    const cx = x(+countryData["Cummulative emissions per capita (t)"]);
                    const cy = y(+countryData["Climate vulnability"]);

                    // Add line
                    svg.append("line")
                        .attr("x1", cx)
                        .attr("y1", cy)
                        .attr("x2", cx + labelOffsetX)
                        .attr("y2", cy + labelOffsetY)
                        .attr("stroke", "black")
                        .attr("stroke-width", 1);

                    // Add text
                    svg.append("text")
                        .attr("x", cx + labelOffsetX + 5)
                        .attr("y", cy + labelOffsetY - 5)
                        .attr("text-anchor", "start")
                        .style("font-size", "10px")
                        .style("fill", "black")
                        .text(country);
                }
            });

            // Add x-axis label
            svg.append("text")
                .attr("class", "chart-labels")
                .attr("text-anchor", "end")
                .attr("x", width)
                .attr("y", height + dynamicMargin.bottom - 10)
                .text("Cummulative emissions per capita (t)");

            // Add y-axis label
            svg.append("text")
                .attr("class", "chart-labels")
                .attr("text-anchor", "end")
                .attr("transform", "rotate(-90)")
                .attr("y", -dynamicMargin.left / 2)
                .attr("x", -dynamicMargin.top)
                .text("Climate vulnerability");

            // Add legend
            const legend = svg.append("g")
                .attr("class", "chart-labels")
                .attr("transform", `translate(${width - dynamicMargin.right * 2}, 0)`);

            const legendData = [
                { color: "#d8d8d8", label: "<$5,000" },
                { color: "#ffd579", label: "$5,000-$20,000" },
                { color: "#ed974a", label: "$20,000-$45,000" },
                { color: "#ce5845", label: ">$45,000" },
            ];

            legend.selectAll("rect")
                .data(legendData)
                .enter()
                .append("rect")
                .attr("x", 0)
                .attr("y", (d, i) => i * 20)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", (d) => d.color)
                .attr("rx", 3) // Rounded corners
                .attr("ry", 3) // Rounded corners
                .on("mouseover", function (_, d) {
                    d3.selectAll(".bubble")
                        .style("opacity", 0.1)
                        .filter((circleData) => color(+circleData["GDP per capita (current US$)"]) === d.color)
                        .style("opacity", 1);
                })
                .on("mouseout", function () {
                    d3.selectAll(".bubble").style("opacity", 1); // Reset circles opacity
                });

            legend.selectAll("text")
                .data(legendData)
                .enter()
                .append("text")
                .attr("x", 24)
                .attr("y", (d, i) => i * 20 + 9)
                .attr("dy", "0.35em")
                .text((d) => d.label);
        })
        .catch((error) => {
            console.error("Error loading the data: ", error);
        });
})();