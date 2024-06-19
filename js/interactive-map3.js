(async () => {
  // Load data from external sources
  const us = await d3.json("https://d3js.org/us-10m.v2.json");
  const projectData = await d3.csv("./data/graph-5-data.csv");

  // Maps of state states to color and storage data
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

  const aspectRatio = 0.75; // Define an aspect ratio for the chart

  // Get the container and its dimensions
  const container = document.getElementById("interactive-map3");
  const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
  const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio

  // Calculate the dynamic margins
  const dynamicMargin = {
    top: containerHeight * 0.05, // 5% of the container height
    right: containerWidth * 0.15, // 15% of the container width
    bottom: containerHeight * 0.1, // 10% of the container height
    left: containerWidth * 0.08, // 8% of the container width
  };

  // Calculate the width and height for the inner drawing area
  const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
  const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

  // Append SVG object
  const svg = d3
    .select("#interactive-map3")
    .append("svg")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

  // Define the scale factor for the map
  const scaleFactor = width / 850; // Adjust this scaling factor as needed

  // Create geoTransform function to scale down the map
  const transform = d3.geoTransform({
    point: function (x, y) {
      this.stream.point(x * scaleFactor, y * scaleFactor);
    },
  });
  const path = d3.geoPath().projection(transform);

  const tooltip = d3.select("#tooltip");

  const formatNumber = d3.format(",");

  const updateMap = (filter) => {
    svg
      .selectAll("path")
      .data(states)
      .join("path")
      .attr("d", path)
      .attr("fill", (d) => {
        if (filter === "all") {
          if (d.properties.projects) return "orange";
          if (d.properties.legislation) return "url(#legislationPattern)";
          if (d.properties.programs) return "url(#programIcon)";
          return "white"; // Default fill color for states that don't match any criteria
        }
        if (filter === "projects" && d.properties.projects) return "orange";
        if (filter === "legislation" && d.properties.legislation)
          return "url(#legislationPattern)";
        if (filter === "programs" && d.properties.programs)
          return "url(#programIcon)";
        return "white";
      })
      .attr("stroke", "#000")
      .attr("stroke-width", 0.5)
      .on("mouseover", function (event, d) {
        tooltip
          .html(
            `<div class="tooltip-title">${d.properties.name}</div>
                   <div class="tooltip-content">
                   Projects: ${d.properties.projects ? "Yes" : "No"}<br>
                   Legislation: ${d.properties.legislation ? "Yes" : "No"}<br>
                   Programs: ${d.properties.programs ? "Yes" : "No"}<br>
                   Number of Programs: ${d.properties.numberOfPrograms}<br>
                   Program Names: ${d.properties.programNames}
                   </div>`
          )
          .style("opacity", 0.9)
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY}px`);
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      });
  };

  // Initial map update
  updateMap("all");

  // Create the dropdown menu
  const dropdown = d3
    .select("#interactive-map3")
    .insert("select", ":first-child")
    .attr("id", "layer-dropdown")
    .on("change", function () {
      const selectedLayer = d3.select(this).property("value");
      updateMap(selectedLayer);
    });

  dropdown
    .selectAll("option")
    .data([
      { value: "all", text: "All Layers" },
      { value: "projects", text: "Community Solar Projects" },
      { value: "legislation", text: "Community Solar Legislation" },
      { value: "programs", text: "Community Solar Programs" },
    ])
    .enter()
    .append("option")
    .attr("value", (d) => d.value)
    .text((d) => d.text);

  // Define patterns and icons
  svg
    .append("defs")
    .append("pattern")
    .attr("id", "legislationPattern")
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", 10)
    .attr("height", 10)
    .append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", "yellow");

  svg
    .append("defs")
    .append("pattern")
    .attr("id", "programIcon")
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", 10)
    .attr("height", 10)
    .append("circle")
    .attr("cx", 5)
    .attr("cy", 5)
    .attr("r", 3)
    .attr("fill", "green");
})();
