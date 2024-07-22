(async () => {
  // Load data from external sources
  const us = await d3.json("https://d3js.org/us-10m.v2.json");
  const projectData = await d3.csv("./data/photovoltaic-energy/photovoltaic-energy2.csv");

  // Map of states to data
  const fipsToData = {};
  projectData.forEach((d) => {
    fipsToData[d.States] = {
      projects: d["Community Solar Projects"] === "Yes",
      legislation: d["Community Solar Legislation"] === "Yes",
      programs: d["Community Solar Programs"] === "Yes",
      numberOfPrograms: +d["Number of Programs"],
      programNames: d["Program Names"],
    };
  });

  const states = topojson.feature(us, us.objects.states).features.map((d) => {
    const data = fipsToData[d.id] || {};
    d.properties = { ...d.properties, ...data };
    return d;
  });

  const container = document.getElementById("photovoltaic-energy-interactive-map");
  const aspectRatio = 0.65;
  const containerWidth = container.offsetWidth;
  const containerHeight = containerWidth * aspectRatio;

  const dynamicMargin = {
    top: containerHeight * 0.05, // 5% of the container height
    right: containerWidth * 0.15, // 15% of the container width
    bottom: containerHeight * 0.1, // 10% of the container height
    left: containerWidth * 0.05, // 5% of the container width
  };
  const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
  const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

  const svg = d3
    .select("#photovoltaic-energy-interactive-map")
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
    .attr("stroke", "#be2624")
    .attr("stroke-width", 1.5);

  let selectedOption = "all"; // Default selected option

  const updateMap = () => {
    svg.selectAll("g.state-group").remove();

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

      // If showing "all" or if the current state has the specific feature, append a path for it
      if (selectedOption === "all" || selectedOption === "projects") {
        if (stateData.properties.projects) {
          group
            .append("path")
            .attr("d", path(stateData))
            .attr("fill", "#ffffb4");
        }
      }

      if (selectedOption === "all" || selectedOption === "legislation") {
        if (stateData.properties.legislation) {
          group
            .append("path")
            .attr("d", path(stateData))
            .attr("fill", "#f99f4f");
        }
      }

      if (selectedOption === "all" || selectedOption === "programs") {
        if (stateData.properties.programs) {
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

        let tooltipContent = `
          <div class="tooltip-title">${d.properties.name}</div>
          <table class="tooltip-content">
              <tr>
                  <td><span class="color-legend" style="background-color: #ffffb4"></span>Projects: </td>
                  <td class="value">${d.properties.projects ? "Yes" : "No"}</td>
              </tr>
              <tr>
                  <td><span class="color-legend" style="background-color: #f99f4f"></span>Legislation: </td>
                  <td class="value">${d.properties.legislation ? "Yes" : "No"}</td>
              </tr>
              <tr>
                  <td><span class="color-legend" style="background-color: #be2624"></span>Programs: </td>
                  <td class="value">${d.properties.programs ? "Yes" : "No"}</td>
              </tr>`;

        // Only add Number of Programs and Program Names if programs exist
        if (d.properties.programs) {
          tooltipContent += `
              <tr>
                  <td><span class="color-legend" style="background: url(#diagonalHatch)"></span>Number of Programs: </td>
                  <td class="value">${d.properties.numberOfPrograms}</td>
              </tr>
              <tr>
                  <td><span class="color-legend" style="background: url(#diagonalHatch)"></span>Program Names: </td>
                  <td class="value">${formatProgramNames(d.properties.programNames)}</td>
              </tr>`;
        }

        tooltipContent += `</table>`;

        tooltip
          .html(tooltipContent)
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY}px`);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });
  };

  const dropdown = d3
  .select("#map-dropdown")
  .style("width", `${containerWidth * 0.2}px`) // Adjust width dynamically based on container size
  .on("change", function () {
    selectedOption = this.value.toLowerCase(); // Update selected option
    updateMap();
  });

  dropdown
    .selectAll("option")
    .data(["All", "Projects", "Legislation", "Programs"])
    .enter()
    .append("option")
    .text((d) => d)
    .attr("value", (d) => d.toLowerCase())
    .attr("class", "chart-labels");

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

// Create the legend data
const legendData = [
  { color: "#ffffb4", text: "Projects" },
  { color: "#f99f4f", text: "Legislation" },
  { color: "url(#diagonalHatch)", text: "Programs" },
];

// Adjust legend position to the right of the map.
const legend = svg
  .append("g")
  .attr("class", "legend")
  .attr("transform", `translate(${width + dynamicMargin.left / 2}, ${height / 2})`);

// Calculate the legend rectangle dimensions based on container size
const legendRectWidth = containerWidth * 0.02; // 2% of container width
const legendRectHeight = containerHeight * 0.02; // 2% of container height

// Add rectangles for each item in legendData
legend.selectAll("rect")
  .data(legendData)
  .enter()
  .append("rect")
  .attr("x", 0)
  .attr("y", (d, i) => i * (legendRectHeight + 5)) // Add some spacing between rectangles
  .attr("width", legendRectWidth)
  .attr("height", legendRectHeight)
  .style("fill", d => d.color)
  .attr("stroke", "#000")
  .attr("stroke-width", 0.5);

// Add text labels for each item in legendData
legend.selectAll("text")
  .data(legendData)
  .enter()
  .append("text")
  .attr("x", legendRectWidth + 5) // Position text to the right of the rectangle
  .attr("y", (d, i) => i * (legendRectHeight + 5) + legendRectHeight) // Center text vertically
  .text(d => d.text)
  .attr("class", "chart-labels");


  

  function formatProgramNames(programNames) {
    if (!programNames) return "";

    const names = programNames.split(';').map(name => name.trim());
    let formattedNames = "";
    names.forEach(name => {
      formattedNames += `${name}<br>`;
    });
    return formattedNames;
  }
})();
