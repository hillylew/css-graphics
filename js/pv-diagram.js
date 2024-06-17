(function () {
  const aspectRatio = 0.7;
  const container = document.getElementById("pv-diagram");
  const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
  const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio

  // Calculate the dynamic margins
  const dynamicMargin = {
    top: containerHeight * 0.02, // 10% of the container height
    right: containerWidth * 0.07, // 10% of the container width
    bottom: containerHeight * 0.02, // 10% of the container height
    left: containerWidth * 0.02, // 10% of the container width
  };

  const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
  const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

  // Append SVG object
  const svg = d3
    .select("#pv-diagram")
    .append("svg")
    .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

  // Calculate the height for sky and grass portions
  const skyHeight = height * (2 / 3);
  const grassHeight = height * (1 / 3);

  // Append sky rectangle
  svg
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", skyHeight)
    .attr("fill", "#81c0eb"); // Replace with the hex or rgb value that you want for the sky

  // Append grass rectangle
  svg
    .append("rect")
    .attr("x", 0)
    .attr("y", skyHeight)
    .attr("width", width)
    .attr("height", grassHeight)
    .attr("fill", "#6da41d"); // Replace with the hex or rgb value that you want for the grass

  // Calculate dimensions as percentages of container width and height
  const cellPercentage = 2; // 2% of container height
  const cellSpacingPercentage = 0.1; // 10% of container width
  const cellToBorderGapPercentage = 0.5; // 0.5% of container width
  const moduleSpacingPercentage = 1.5; // 1.5% of container width
  const arraySpacingPercentage = 3.5; // 3% of container width

  const cellWidth = (height * cellPercentage) / 100;
  const cellHeight = (height * cellPercentage) / 100;
  const cellSpacing = (width * cellSpacingPercentage) / 100;
  const cellToBorderGap = (width * cellToBorderGapPercentage) / 100;
  const moduleSpacing = (width * moduleSpacingPercentage) / 100;
  const arraySpacing = (width * arraySpacingPercentage) / 100;

  const moduleRows = 8,
    moduleColumns = 4;
  const panelRows = 2,
    panelColumns = 3;
  const arrayRows = 1,
    arrayColumns = 2;

  const totalModuleWidth =
    moduleColumns * (cellWidth + cellSpacing) +
    cellToBorderGap * 2 -
    cellSpacing;
  const totalModuleHeight =
    moduleRows * (cellHeight + cellSpacing) + cellToBorderGap * 2 - cellSpacing;
  const totalPanelWidth =
    panelColumns * (totalModuleWidth + moduleSpacing) - moduleSpacing;
  const totalPanelHeight =
    panelRows * (totalModuleHeight + moduleSpacing) - moduleSpacing;

  /* ----------------------- Draw Sun ----------------------- */
  const sunGroup = svg.append("g");

  // Draw Sun Circle
  const sunCenterX = width * 0.12;
  const sunCenterY = height * 0.15;
  const sunRadius = width * 0.06;

  sunGroup
    .append("circle")
    .attr("cx", sunCenterX)
    .attr("cy", sunCenterY)
    .attr("r", sunRadius)
    .attr("fill", "#ffcb03");

  // Draw Sun Triangles
  const numberOfTriangles = 12; // Choose how many triangles you want around the sun
  const gap = sunRadius * 0.1; // Gap between the circle and the triangles
  const triangleLength = sunRadius * 0.3; // Reduced length of the triangles outside the sun circle
  const triangleWidth = sunRadius * 0.2; // Width of the base of the triangles' triangles

  for (let i = 0; i < numberOfTriangles; i++) {
    const angle = 2 * Math.PI * (i / numberOfTriangles);
    const triangleStartX = sunCenterX + (sunRadius + gap) * Math.cos(angle);
    const triangleStartY = sunCenterY + (sunRadius + gap) * Math.sin(angle);
    const triangleEndX =
      sunCenterX + (sunRadius + gap + triangleLength) * Math.cos(angle);
    const triangleEndY =
      sunCenterY + (sunRadius + gap + triangleLength) * Math.sin(angle);

    const triangle = [
      { x: triangleStartX, y: triangleStartY },
      {
        x: triangleStartX + triangleWidth * Math.cos(angle - Math.PI / 2),
        y: triangleStartY + triangleWidth * Math.sin(angle - Math.PI / 2),
      },
      { x: triangleEndX, y: triangleEndY },
      {
        x: triangleStartX + triangleWidth * Math.cos(angle + Math.PI / 2),
        y: triangleStartY + triangleWidth * Math.sin(angle + Math.PI / 2),
      },
    ];

    sunGroup
      .append("path")
      .attr(
        "d",
        `M${triangle[0].x},${triangle[0].y} L${triangle[1].x},${triangle[1].y} L${triangle[2].x},${triangle[2].y} L${triangle[3].x},${triangle[3].y} Z`
      )
      .attr("fill", "#ffcb03");
  }

  /* ----------------------- Draw PV System ----------------------- */
  const tooltip = d3.select("#diagram-tooltip");

  const drawBorder = (group, width, height, gap, className) => {
    group
      .append("rect")
      .attr("x", -gap)
      .attr("y", -gap)
      .attr("width", width + 2 * gap)
      .attr("height", height + 2 * gap)
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 3)
      .attr("class", className)
      .on("mouseover", function () {
        d3.select(this).attr("stroke", "#ff0000");
        tooltip.style("display", "block").text(className);
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke", "#ccc");
        tooltip.style("display", "none");
      });
  };

  const drawOctagonCell = (group, x, y, width, height) => {
    const cutSize = 1;
    const points = [
      { x: x + cutSize, y }, // Top-left
      { x: x + width - cutSize, y }, // Top-right
      { x: x + width, y: y + cutSize }, // Right-top
      { x: x + width, y: y + height - cutSize }, // Right-bottom
      { x: x + width - cutSize, y: y + height }, // Bottom-right
      { x: x + cutSize, y: y + height }, // Bottom-left
      { x, y: y + height - cutSize }, // Left-bottom
      { x, y: y + cutSize }, // Left-top
    ];

    let pathData = `M${points.map((p) => `${p.x},${p.y}`).join(" L")} Z`;
    group
      .append("path")
      .attr("d", pathData)
      .attr("fill", "#3167a4")
      .attr("class", "cell")
      .on("mouseover", function () {
        d3.select(this).attr("fill", "#ff0000");
        tooltip.style("display", "block").text("cell");
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "#3167a4");
        tooltip.style("display", "none");
      });
  };

  const drawPanel = (panelGroup) => {
    for (let r = 0; r < panelRows; r++) {
      for (let c = 0; c < panelColumns; c++) {
        const moduleX = c * (totalModuleWidth + moduleSpacing),
          moduleY = r * (totalModuleHeight + moduleSpacing);
        let moduleGroup = panelGroup
          .append("g")
          .attr("transform", `translate(${moduleX}, ${moduleY})`);
        drawBorder(
          moduleGroup,
          totalModuleWidth,
          totalModuleHeight,
          cellToBorderGap,
          "module"
        );

        for (let y = 0; y < moduleRows; y++) {
          for (let x = 0; x < moduleColumns; x++) {
            let cellX = x * (cellWidth + cellSpacing) + cellToBorderGap,
              cellY = y * (cellHeight + cellSpacing) + cellToBorderGap;
            drawOctagonCell(moduleGroup, cellX, cellY, cellWidth, cellHeight);
          }
        }
      }
    }
    drawBorder(
      panelGroup,
      totalPanelWidth,
      totalPanelHeight,
      moduleSpacing,
      "panel"
    );
  };

  // Calculate the total area occupied by the array
  const arrayWidth =
    arrayColumns * totalPanelWidth + (arrayColumns - 1) * arraySpacing;
  const arrayHeight =
    arrayRows * totalPanelHeight + (arrayRows - 1) * arraySpacing;

  const drawArray = (arrayGroup) => {
    // Draw a white rectangle as background for the array
    arrayGroup
      .insert("rect", ":first-child") // Insert the rectangle as the first child of the group
      .attr("x", -arraySpacing) // Position it considering the outer arraySpacing as well
      .attr("y", -arraySpacing)
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("opacity", 0.8)
      .attr("width", arrayWidth + arraySpacing * 2) // The total width including spacing
      .attr("height", arrayHeight + arraySpacing * 2) // The total height including spacing
      .attr("fill", "white");

    // Draw the panels of the array
    for (let arrRow = 0; arrRow < arrayRows; arrRow++) {
      for (let arrCol = 0; arrCol < arrayColumns; arrCol++) {
        const xOffset = arrCol * (totalPanelWidth + arraySpacing);
        const yOffset = arrRow * (totalPanelHeight + arraySpacing);
        let panelGroup = arrayGroup
          .append("g")
          .attr("transform", `translate(${xOffset}, ${yOffset})`);
        drawPanel(panelGroup);
      }
    }

    // array border
    drawBorder(arrayGroup, arrayWidth, arrayHeight, arraySpacing, "array");
  };

  // Calculate the center positions
  const arrayXCenter = (width - arrayWidth) / 2;
  const arrayYCenter = (height - arrayHeight) / 2;

  // Reposition the arrayGroup to the center of the SVG element
  const arrayGroup = svg
    .append("g")
    .attr(
      "transform",
      `translate(${arrayXCenter * 0.8},${arrayYCenter * 1.5})`
    );

  drawArray(arrayGroup);
  svg
    .attr("width", containerWidth)
    .attr("height", containerWidth * aspectRatio);

  /* ----------------------- Draw Sun Rays ----------------------- */

  const sunRayStartPoint1 = { x: sunCenterX - sunRadius, y: sunCenterY }; // Left end of the sun diameter
  const sunRayStartPoint2 = { x: sunCenterX + sunRadius, y: sunCenterY }; // Right end of the sun diameter

  const pvSystemBottomLeft = {x: arrayXCenter * 0.8, y: arrayYCenter * 1.5 + arrayHeight}; // Bottom left corner of the PV system array
  const pvSystemTopRight = { x: arrayXCenter * 0.8 + arrayWidth, y: arrayYCenter * 1.5}; // Top right corner of the PV system array

  // Draw sun ray area
  const sunRayArea = svg
    .append("path")
    .attr(
      "d",
      `M${sunRayStartPoint1.x},${sunRayStartPoint1.y} L${pvSystemBottomLeft.x},${pvSystemBottomLeft.y} L${pvSystemTopRight.x},${pvSystemTopRight.y} L${sunRayStartPoint2.x},${sunRayStartPoint2.y} Z`
    )
    .attr("fill", "yellow")
    .attr("fill-opacity", "0.2")
    .style("pointer-events", "none");

  /* ----------------------- Draw Conversion Efficiency (Light Bulb) ----------------------- */

   /* ----------------------- Texts for Diagram ----------------------- */
  svg
    .append("text")
    .attr("x", arrayXCenter - arraySpacing)
    .attr("y", arrayYCenter)
    .text("100%")
    .attr("class", "diagram-labels")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("fill", "white");

svg
    .append("text")
    .attr("x", width * 0.8)
    .attr("y", height * 0.2)
    .text("Conversion Efficiency")
    .attr("class", "diagram-labels")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("fill", "white");

svg
    .append("text")
    .attr("x", width * 0.8)
    .attr("y", height * 0.25)
    .text("21%")
    .attr("class", "diagram-labels")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("fill", "white");



    /* ----------------------- Draw Light Bulb ----------------------- */
    function blinkLightBulb() {
        const lightBulb = d3.select("#light-bulb"); // Assign an ID to the light bulb circle in the SVG
      
        // Define the blink interval (e.g., 1000 milliseconds)
        const interval = 1000;
      
        setInterval(() => {
          const currentOpacity = lightBulb.style("opacity");
      
          // Change the opacity from 1 to 0 or from 0 to 1
          lightBulb.style("opacity", currentOpacity == 1 ? 0.7 : 1);
        }, interval);
      }

const chordLength = width * 0.1; // Replace with the actual desired length
const lightBulbCenterX = arrayXCenter + arrayWidth + chordLength;
const lightBulbCenterY = height * 0.4;
const lightBulbRadius = sunRadius * 0.5; // This can be adjusted to your liking

const bulbGradient = svg.append("defs")
  .append("radialGradient")
  .attr("id", "bulbGradient");

bulbGradient.append("stop")
  .attr("offset", "0%")
  .attr("stop-color", "#ffffff");

bulbGradient.append("stop")
  .attr("offset", "100%")
  .attr("stop-color", "#f5ee33");

svg.append("circle") // Bulb part
  .attr("cx", lightBulbCenterX)
  .attr("cy", lightBulbCenterY)
  .attr("r", lightBulbRadius)
  .attr("fill", "url(#bulbGradient)")
  .attr("id", "light-bulb");

  blinkLightBulb();

// Add an ellipse for the screw thread base
svg.append("ellipse")
  .attr("cx", lightBulbCenterX)
  .attr("cy", lightBulbCenterY + lightBulbRadius)
  .attr("rx", lightBulbRadius / 2)
  .attr("ry", lightBulbRadius * 0.25)
  .attr("fill", "#777");

// Draw the threaded base
svg.append("rect") // Threaded base part
  .attr("x", lightBulbCenterX - lightBulbRadius / 2)
  .attr("y", lightBulbCenterY + lightBulbRadius)
  .attr("width", lightBulbRadius)
  .attr("height", lightBulbRadius * 0.8)
  .attr("fill", "#ccc")
  .attr("rx", 4)  // Adjust the value as needed
  .attr("ry", 4); // Adjust the value as needed


// Filament
svg.append("path")
  .attr("d", `M${lightBulbCenterX - (lightBulbRadius / 4)} ${lightBulbCenterY} Q${lightBulbCenterX} ${lightBulbCenterY - lightBulbRadius / 2}, ${lightBulbCenterX + (lightBulbRadius / 4)} ${lightBulbCenterY}`)
  .attr("stroke", "#FFED22")
  .attr("stroke-width", 2)
  .attr("fill", "none");

// Reflection effect
svg.append("circle")
  .attr("cx", lightBulbCenterX - (lightBulbRadius / 4))
  .attr("cy", lightBulbCenterY - (lightBulbRadius / 4))
  .attr("r", lightBulbRadius * 0.1)
  .attr("fill", "white")
  .attr("opacity", 0.6);



 /* ----------------------- Draw Chord ----------------------- */
  const pvArrayAttachX = arrayXCenter * 0.8 + arrayWidth + arraySpacing;
  const pvArrayAttachY = arrayYCenter * 1.5 + arrayHeight / 2;

  
  // Define the start of the chord (attached to the bottom of the light bulb)
  const chordStartX = lightBulbCenterX;
  const chordStartY = lightBulbCenterY + lightBulbRadius * 1.6;
  
  const chordStrokeColor = "#ccc"; // Chord color
  const chordStrokeWidth = arrayWidth * 0.015; // Chord thickness
  
  // Define the path for the chord using multiple Bezier curves to create three swirly loops
  const chordPath = d3.path();
  chordPath.moveTo(chordStartX, chordStartY); // Start at the light bulb
  // Bezier curve for first curve (leftward arc)
  chordPath.bezierCurveTo(
    chordStartX, chordStartY + 20,
    chordStartX - 30, chordStartY + 40,
    chordStartX, chordStartY + 60
  );
  // Bezier curve for second curve (rightward arc)
  chordPath.bezierCurveTo(
    chordStartX + 15, chordStartY + 80,
    chordStartX + 30, chordStartY + 100,
    chordStartX, chordStartY + 120
  );
  // Bezier curve for third curve (leftward arc) leading into the attachment point
  chordPath.bezierCurveTo(
    chordStartX - 30, chordStartY + 140,
    pvArrayAttachX - 50, pvArrayAttachY - 20,
    pvArrayAttachX, pvArrayAttachY
  );
  
  // Draw the chord on the SVG
  svg.append("path")
    .attr("d", chordPath.toString())
    .attr("stroke", chordStrokeColor)
    .attr("stroke-width", chordStrokeWidth)
    .attr("fill", "none");
  


})();

// Update the tooltip position based on mouse movement
document.addEventListener("mousemove", function (event) {
  d3.select("#diagram-tooltip")
    .style("left", `${event.pageX + 10}px`)
    .style("top", `${event.pageY + 10}px`);
});
