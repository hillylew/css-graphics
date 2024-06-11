(function () {

    const aspectRatio = 0.7;
    const cellWidth = 10, cellHeight = 10, cellSpacing = 0.5, cellToBorderGap = 2;
    const moduleRows = 8, moduleColumns = 4, moduleSpacing = 10, moduleBorderThickness = 4;
    const panelRows = 2, panelColumns = 3;
    const arrayRows = 1, arrayColumns = 2, arraySpacing = 25;
    const cutSize = 2;
  
    const container = document.getElementById("pv-diagram");
    const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
    const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio
  
    // Calculate the dynamic margins
    const dynamicMargin = {
      top: containerHeight * 0.1, // 10% of the container height
      right: containerWidth * 0.1, // 10% of the container width
      bottom: containerHeight * 0.1, // 10% of the container height
      left: containerWidth * 0.07, // 10% of the container width
    };

    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    const svg = d3.select("#pv-diagram").append("svg")
    .attr("width", containerWidth)
    .attr("height", containerWidth * aspectRatio)
    .append("g")
    .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    const totalModuleWidth = moduleColumns * (cellWidth + cellSpacing) + cellToBorderGap * 2 - cellSpacing;
    const totalModuleHeight = moduleRows * (cellHeight + cellSpacing) + cellToBorderGap * 2 - cellSpacing;
    const totalPanelWidth = panelColumns * (totalModuleWidth + moduleSpacing) - moduleSpacing;
    const totalPanelHeight = panelRows * (totalModuleHeight + moduleSpacing) - moduleSpacing;

     /* ----------------------- Draw Sun ----------------------- */
     const sunGroup = svg.append("g");

     const sunX = dynamicMargin.left; // Updated the sun position to top-left corner
    const sunY = dynamicMargin.top; // Updated the sun position to top-left corner
    const sunRadius = containerWidth * 0.1; // Example sun radius
 
     // Draw the sun
     sunGroup.append("circle")
         .attr("cx", sunX)
         .attr("cy", sunY)
         .attr("r", sunRadius)
         .attr("fill", "yellow")

    sunGroup.append("text")
        .attr("x", sunX)
        .attr("y", sunY)
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .text("100%")
        .attr("font-size", "16px")  // resonsive
        .attr("fill", "black");
 
     // Draw sun rays
     const numRays = 12; // Number of rays we want to draw
     const rayLength = sunRadius * 1.5; // Length of the rays
     const rayWidth = 2; // How thick the rays are
 
     for (let i = 0; i < numRays; i++) {
         const angle = (i / numRays) * (2 * Math.PI); // angle in radians
         const rayX = sunX + Math.cos(angle) * sunRadius;
         const rayY = sunY + Math.sin(angle) * sunRadius;
         const rayEndX = sunX + Math.cos(angle) * (sunRadius + rayLength);
         const rayEndY = sunY + Math.sin(angle) * (sunRadius + rayLength);
         
         sunGroup.append("line")
             .attr("x1", rayX)
             .attr("y1", rayY)
             .attr("x2", rayEndX)
             .attr("y2", rayEndY)
             .attr("stroke", "yellow")
             .attr("stroke-width", rayWidth);
     }
  

     /* ----------------------- Draw PV System ----------------------- */
    const drawBorder = (group, width, height, gap, thickness, className) => {
        group.append("rect")
            .attr("x", -gap).attr("y", -gap)
            .attr("width", width + 2 * gap).attr("height", height + 2 * gap)
            .attr("rx", 8) // Adjust the rx and ry values for rounded corners
            .attr("ry", 8)
            .attr("fill", "none").attr("stroke", "#ccc")
            .attr("stroke-width", thickness)
            .attr("class", className)
            .on("mouseover", function () {
                d3.select(this).attr("stroke", "#ff0000"); // Change the border color on mouseover
                d3.select("#tooltip7").style("display", "block").text(className);
            })
            .on("mouseout", function () {
                d3.select(this).attr("stroke", "#ccc"); // Restore the original border color on mouseout
                d3.select("#tooltip7").style("display", "none");
            });
    };
  
    const drawOctagonCell = (group, x, y, width, height, cutSize) => {
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
  
        let pathData = `M${points.map(p => `${p.x},${p.y}`).join(' L')} Z`;
        group.append("path").attr("d", pathData).attr("fill", "#808080")
            .attr("class", "cell")
            .on("mouseover", function () {
                d3.select(this).attr("fill", "#ff0000"); // Change the fill color to red on mouseover
                d3.select("#tooltip7").style("display", "block").text("cell");
            })
            .on("mouseout", function () {
                d3.select(this).attr("fill", "#808080"); // Restore the original fill color on mouseout
                d3.select("#tooltip7").style("display", "none");
            });
    };
  
    const drawPanel = (panelGroup) => {
        for (let r = 0; r < panelRows; r++) {
            for (let c = 0; c < panelColumns; c++) {
                const moduleX = c * (totalModuleWidth + moduleSpacing), moduleY = r * (totalModuleHeight + moduleSpacing);
                let moduleGroup = panelGroup.append("g").attr("transform", `translate(${moduleX}, ${moduleY})`);
                drawBorder(moduleGroup, totalModuleWidth, totalModuleHeight, cellToBorderGap, moduleBorderThickness, "module");
  
                for (let y = 0; y < moduleRows; y++) {
                    for (let x = 0; x < moduleColumns; x++) {
                        let cellX = x * (cellWidth + cellSpacing) + cellToBorderGap,
                            cellY = y * (cellHeight + cellSpacing) + cellToBorderGap;
                        drawOctagonCell(moduleGroup, cellX, cellY, cellWidth, cellHeight, cutSize);
                    }
                }
            }
        }
        drawBorder(panelGroup, totalPanelWidth, totalPanelHeight, moduleSpacing, moduleBorderThickness, "panel");
    };
  


    const arrayGroup = svg.append("g")
  .attr("transform", `translate(${width / 5},${ height / 4})`);
    for (let arrRow = 0; arrRow < arrayRows; arrRow++) {
        for (let arrCol = 0; arrCol < arrayColumns; arrCol++) {
            const xOffset = arrCol * (totalPanelWidth + arraySpacing), yOffset = arrRow * (totalPanelHeight + arraySpacing);
            let panelGroup = arrayGroup.append("g").attr("transform", `translate(${xOffset},${yOffset})`);
            drawPanel(panelGroup);
        }
    }
  
    // array border
    drawBorder(arrayGroup, arrayColumns * totalPanelWidth + (arrayColumns - 1) * arraySpacing,
        arrayRows * totalPanelHeight + (arrayRows - 1) * arraySpacing, arraySpacing, moduleBorderThickness, "array");
  
    svg.attr("width", containerWidth).attr("height", containerWidth * aspectRatio);



    /* ----------------------- Draw Conversion Efficiency ----------------------- */
    const efficiencyGroup = svg.append("g")
    .attr("transform", `translate(${containerWidth * 0.8},${containerHeight * 0.5})`); // Adjust position as needed

efficiencyGroup.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .attr("dy", "-1.5em") // Move text up
    .text("Conversion Efficiency")
    .attr("font-size", "16px")
    .attr("fill", "black");

// Draw the efficiency bar
const efficiencyBarWidth = 100; // Adjust width as needed
const efficiencyBarHeight = 10; // Adjust height as needed
const efficiencyBarX = -efficiencyBarWidth / 2;
const efficiencyBarY = 0;

efficiencyGroup.append("rect")
    .attr("x", efficiencyBarX)
    .attr("y", efficiencyBarY)
    .attr("width", efficiencyBarWidth)
    .attr("height", efficiencyBarHeight)
    .attr("fill", "lightgreen");

efficiencyGroup.append("text")
    .attr("x", efficiencyBarX + efficiencyBarWidth / 2)
    .attr("y", efficiencyBarY - 5) // Adjust text position above the bar
    .attr("text-anchor", "middle")
    .attr("dy", "-0.3em")
    .text("17-20%")
    .attr("font-size", "12px")
    .attr("fill", "black");

    
})();

  

  // Update the tooltip position based on mouse movement
  document.addEventListener("mousemove", function (event) {
    d3.select("#tooltip7")
      .style("left", `${event.pageX + 10}px`)
      .style("top", `${event.pageY + 10}px`);
  });
  