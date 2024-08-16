(async () => {
    // Load data from external sources
    const us = await d3.json("https://d3js.org/us-10m.v2.json");

    const projectData = await d3.csv(energySystem2);

    // Map of states to data
    const fipsToData = {};
    projectData.forEach((d) => {
        fipsToData[d.States] = {
            projects: d["State RPS"] === "Yes",
            goal: d["State Goal"] === "Yes",
            cleanStandard: d["Clean Energy Standard"] === "Yes",
            cleanGoal: d["Clean Energy Goal"] === "Yes",
        };
    });

    const states = topojson.feature(us, us.objects.states).features.map((d) => {
        const data = fipsToData[d.id] || {};
        d.properties = { ...d.properties, ...data };
        return d;
    });

    const container = document.getElementById("energy-system-interactive-map");
    const aspectRatio = 0.6;
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;

    const dynamicMargin = {
        top: containerHeight * 0.05,
        right: containerWidth * 0.3,
        bottom: containerHeight * 0.1,
        left: containerWidth * 0.05,
    };
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    // Create dropdown dynamically and append to container
    const dropdownContainer = d3.select(container)
        .append("div")
        .style("width", `${containerWidth * 0.25}px`)
        .style("margin-bottom", "5px"); // Add some space between dropdown and map

    const dropdown = dropdownContainer
        .append("select")
        .attr("id", "map-dropdown")
        .attr("class", "chart-labels") // Add class to the select element itself
        .style("width", "100%") // Take full width of the container div
        .on("change", function () {
            selectedMap = this.value; // Update selected map type
            updateMap();
        });

    // Options for the dropdown
    const mapOptions = {
        "Renewable Portfolio": "renewablePortfolio",
        "Clean Energy": "cleanEnergy"
    };

    dropdown
        .selectAll("option")
        .data(Object.keys(mapOptions)) // Use the keys of mapOptions
        .enter()
        .append("option")
        .attr("class", "chart-labels")
        .attr("value", d => mapOptions[d]) // Set value of the option
        .text((d) => d);

    const svg = d3
        .select(container)
        .append("svg")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
        .append("g")
        .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    const scaleFactor = width / 850;
    const transform = d3.geoTransform({
        point: function (x, y) {
            this.stream.point(x * scaleFactor, y * scaleFactor);
        },
    });
    const path = d3.geoPath().projection(transform);

    const tooltip = d3.select("#tooltip");

    const defs = svg.append("defs");

    defs
        .append("pattern")
        .attr("id", "diagonalHatch")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 8)
        .attr("height", 8)
        .append("path")
        .attr("d", "M0,8 l8,-8 M-2,2 l4,-4 M6,10 l4,-4")
        .attr("stroke", "#386660")
        .attr("stroke-width", 1.5);

    defs
        .append("pattern")
        .attr("id", "diagonalHatch2")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 8)
        .attr("height", 8)
        .append("path")
        .attr("d", "M0,8 l8,-8 M-2,2 l4,-4 M6,10 l4,-4")
        .attr("stroke", "#1C476D")
        .attr("stroke-width", 1.5);

    let selectedMap = "renewablePortfolio"; // Default selected map

    const updateMap = () => {
        svg.selectAll("g.state-group").remove();
        svg.selectAll("g.legend").remove();

        const stateGroups = svg
            .selectAll("g.state-group")
            .data(states)
            .enter()
            .append("g")
            .attr("class", "state-group");

        // Create a path for each feature that should have a visual representation on the map
        stateGroups.each(function (stateData) {
            const group = d3.select(this);

            // Always create the base layer for each state
            group
                .append("path")
                .attr("d", path(stateData))
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", 0.5);

            if (selectedMap === "renewablePortfolio") {
                if (stateData.properties.projects) {
                    group
                        .append("path")
                        .attr("d", path(stateData))
                        .attr("fill", "#8FC8E5");
                }

                if (stateData.properties.goal) {
                    group
                        .append("path")
                        .attr("d", path(stateData))
                        .attr("fill", "url(#diagonalHatch2)");
                }
            } else if (selectedMap === "cleanEnergy") {
                if (stateData.properties.cleanStandard) {
                    group
                        .append("path")
                        .attr("d", path(stateData))
                        .attr("fill", "#E2E27A");
                }

                if (stateData.properties.cleanGoal) {
                    group
                        .append("path")
                        .attr("d", path(stateData))
                        .attr("fill", "url(#diagonalHatch)");
                }
            }
        });

        // Add event handlers to groups instead of individual paths to prevent duplication
        stateGroups
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 0.9);

                let tooltipContent = `<div class="tooltip-title">${d.properties.name}</div><table class="tooltip-content">`;

                if (selectedMap === "renewablePortfolio") {
                    tooltipContent += `
                <tr>
                    <td><span class="color-legend" style="background-color: #8FC8E5"></span>Renewable portfolio standard: </td>
                    <td class="value">${d.properties.projects ? "Yes" : "No"}</td>
                </tr>
                <tr>
                    <td><span class="color-legend" style="background-color: #1C476D"></span>Renewable portfolio goal: </td>
                    <td class="value">${d.properties.goal ? "Yes" : "No"}</td>
                </tr>`;
                } else if (selectedMap === "cleanEnergy") {
                    tooltipContent += `
                <tr>
                    <td><span class="color-legend" style="background-color: #E2E27A"></span>Clean energy standard: </td>
                    <td class="value">${d.properties.cleanStandard ? "Yes" : "No"}</td>
                </tr>
                <tr>
                    <td><span class="color-legend" style="background-color: #386660"></span>Clean energy goal: </td>
                    <td class="value">${d.properties.cleanGoal ? "Yes" : "No"}</td>
                </tr>`;
                }

                tooltipContent += `</table>`;

                const tooltipX = event.clientX;
                const tooltipY = event.clientY;

                tooltip
                    .html(tooltipContent)
                    .style("left", `${tooltipX}px`)
                    .style("top", `${tooltipY}px`);
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });

        // Create the legend data based on the selected map
        let legendData = [];

        if (selectedMap === "renewablePortfolio") {
            legendData = [
                { color: "#8FC8E5", text: "Renewable portfolio standard" },
                { color: "url(#diagonalHatch2)", text: "Renewable portfolio goal" },
            ];
        } else if (selectedMap === "cleanEnergy") {
            legendData = [
                { color: "#E2E27A", text: "Clean energy standard" },
                { color: "url(#diagonalHatch)", text: "Clean energy goal" },
            ];
        }

        // Update the legend position based on selected map
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width}, ${height * 0.6})`);

        // Calculate the dimensions for legend items
        const legendItemSize = width * 0.03; // Set the width and height to be 3% of the container width
        const gap = width * 0.01; // Decrease the gap between legend items

        // Append legend items
        legendData.forEach((d, i) => {
            legend.append("rect")
                .attr("x", 0)
                .attr("y", i * (legendItemSize + gap)) // Adjust spacing between legend items
                .attr("width", legendItemSize)
                .attr("height", legendItemSize)
                .style("fill", d.color)
                .attr("stroke", "black")
                .attr("stroke-width", 0.5)
                .attr("rx", 3) // Rounded corners
                .attr("ry", 3) // Rounded corners
                .attr("class", "legend-rect");

            legend.append("text")
                .attr("x", legendItemSize + gap)
                .attr("y", i * (legendItemSize + gap) + legendItemSize / 2)
                .attr("alignment-baseline", "middle")
                .text(d.text)
                .attr("class", "chart-labels");
        });
    };

    updateMap();

    svg
        .append("g")
        .attr("class", "states-borders")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features) // get features for individual states
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "none") // No fill, only the stroke is needed
        .attr("stroke", "black") // Black stroke color
        .attr("stroke-width", 0.2);
})();