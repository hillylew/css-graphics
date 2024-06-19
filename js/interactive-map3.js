(async () => {
  // Load data from external sources
  const us = await d3.json("https://d3js.org/us-10m.v2.json");
  const projectData = await d3.csv("./data/graph-5-data.csv");

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

  const container = document.getElementById("interactive-map3");
  const aspectRatio = 0.75;
  const containerWidth = container.offsetWidth;
  const containerHeight = containerWidth * aspectRatio;

  const dynamicMargin = {
    top: containerHeight * 0.05, // 5% of the container height
    right: containerWidth * 0.15, // 15% of the container width
    bottom: containerHeight * 0.1, // 10% of the container height
    left: containerWidth * 0.08, // 5% of the container width
  };
  const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
  const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

  const svg = d3
    .select("#interactive-map3")
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
    .attr("width", 4)
    .attr("height", 4)
    .append("path")
    .attr("d", "M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2")
    .attr("stroke", "#333333")
    .attr("stroke-width", 1);

  defs
    .append("pattern")
    .attr("id", "circlePattern")
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", 10)
    .attr("height", 10)
    .append("circle")
    .attr("cx", 5)
    .attr("cy", 5)
    .attr("r", 3)
    .attr("fill", "red");

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
            .attr("fill", "#ffd579")
        }
      }

      if (selectedOption === "all" || selectedOption === "legislation") {
        if (stateData.properties.legislation) {
          group
            .append("path")
            .attr("d", path(stateData))
            .attr("fill", "url(#diagonalHatch)");
        }
      }

      if (selectedOption === "all" || selectedOption === "programs") {
        if (stateData.properties.programs) {
          group
            .append("path")
            .attr("d", path(stateData))
            .attr("fill", "url(#circlePattern)");
        }
      }
    });

    // Add event handlers to groups instead of individual paths to prevent duplication
    stateGroups
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 0.9);
        tooltip
          .html(
            `
            <div class="tooltip-title">${d.properties.name}</div>
            <table class="tooltip-content">
                <tr>
                    <td><span class="color-legend" style="background-color: #ffd579"
                    )};"></span>Projects: </td>
                    <td class="value">${
                      d.properties.projects ? "Yes" : "No"
                    }</td>
                </tr>
                <tr>
                    <td><span class="color-legend" style="background: url(#diagonalHatch)"
                    )};"></span>Legislation: </td>
                    <td class="value">${
                      d.properties.legislation ? "Yes" : "No"
                    }</td>
                </tr>
                <tr>
                    <td><span class="color-legend" style="background: url(#circlePattern)"
                    )};"></span>Programs: </td>
                    <td class="value">${
                      d.properties.programs ? "Yes" : "No"
                    }</td>
                </tr>
            </table>`
          )
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY}px`);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });
  };

  //   <tr>
  //   <td><span class="color-legend" style="background-color: #377eb8"
  //   )};"></span>Number of Programs: </td>
  //   <td class="value">${d.properties.numberOfPrograms}</td>
  // </tr>
  // <tr>
  //   <td><span class="color-legend" style="background-color: #377eb8"
  //   )};"></span>Program Names: </td>
  //   <td class="value">${d.properties.programNames}</td>
  // </tr>

  const dropdown = d3.select("#map-dropdown")
    .style('padding', '10px')
    .style('border-radius', '5px')
    // .style('background-color', '#f8f9fa')
    .style('border', '1px solid #ced4da')
    .style('font-size', '1rem')
    .style('color', '#495057')
    .style('cursor', 'pointer')
    .on("change", function () {
        selectedOption = this.value; // Update selected option
        updateMap();
    });

  dropdown
    .selectAll("option")
    .data(["All", "Projects", "Legislation", "Programs"])
    .enter()
    .append("option")
    .text((d) => d)
    .attr("value", (d) => d.toLowerCase());

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
    .attr("stroke-width", 0.5)
    .attr("stroke-linejoin", "round"); // for rounded corners if needed
})();
