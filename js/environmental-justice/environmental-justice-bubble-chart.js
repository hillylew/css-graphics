(function () {
    // Dynamic dimensions
    const aspectRatio = 0.5;

    // Get the container and its dimensions
    const container = document.getElementById("environmental-justice-bubble-chart");
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

    const tooltip = d3.select("#tooltip");

    // Load data from CSV
    d3.csv("./data/environmental-justice/environmental-justice5.csv")
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

            // Correctly bind the range of bubbles sizes to GDP values
            const radius = d3.scaleSqrt()
                .domain([0, d3.max(data, (d) => +d["GDP per capita (current US$)"])])
                .range([1, 15]);

            const formatNumber = d3.format(",.0f");

            // Add circles
            svg.append("g")
                .selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
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
                        .style("left", event.pageX + "px")
                        .style("top", event.pageY - 28 + "px");
                })
                .on("mousemove", function (event, d) {
                    tooltip.style("left", event.pageX + "px").style("top", event.pageY - 28 + "px");
                })
                .on("mouseout", function (event, d) {
                    tooltip.transition().duration(500).style("opacity", 0);
                });

            // Add text labels for specific countries
            const highlightedCountries = ["Australia", "Belgium", "Canada", "China", "France", "Germany", "India", "Japan", "Niger", "UAE", "U.S.", "UK"];

            // Add red circles around highlighted countries
            svg.append("g")
                .selectAll("circle.highlight")
                .data(data.filter(d => highlightedCountries.includes(d["Country/area"])))
                .enter()
                .append("circle")
                .attr("class", "highlight")
                .attr("cx", (d) => x(+d["Cummulative emissions per capita (t)"]))
                .attr("cy", (d) => y(+d["Climate vulnability"]))
                .attr("r", fixedRadius + 3) // Adjust the radius to ensure the red circle surrounds the original circle
                .style("fill", "none")
                .style("stroke", "red")
                .style("stroke-width", 2);

            svg.append("g")
                .selectAll("text")
                .data(data.filter(d => highlightedCountries.includes(d["Country/area"])))
                .enter()
                .append("text")
                .attr("x", (d) => x(+d["Cummulative emissions per capita (t)"]))
                .attr("y", (d) => y(+d["Climate vulnability"]) - 10) // Adjust the y position to place the label above the circle
                .attr("text-anchor", "middle")
                .style("font-size", "10px")
                .style("fill", "black")
                .style("pointer-events", "none")
                .text(d => d["Country/area"]);

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
                .style("fill", (d) => d.color);

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

