document.addEventListener('DOMContentLoaded', function() {
    const aspectRatio = 0.7; // Define an aspect ratio for the chart

    // Get the container and its dimensions
    const container = document.getElementById('pv-diagram');
    const containerWidth = container.offsetWidth; // Use offsetWidth for full element width
    const containerHeight = containerWidth * aspectRatio; // Calculate the height based on the width and aspect ratio

    // Calculate the dynamic margins
    const dynamicMargin = {
        top: containerHeight * 0.1, // 10% of the container height
        right: containerWidth * 0.02, // 2% of the container width
        bottom: containerHeight * 0.5, // 50% of the container height
        left: containerWidth * 0.02 // 2% of the container width
    };

    // Calculate the width and height for the inner drawing area
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

    // Adjust the size of your SVG according to your actual available space
    const svg = d3.select('#pv-diagram').append('svg')
                  .attr('width', width + dynamicMargin.left + dynamicMargin.right)
                  .attr('height', height + dynamicMargin.top + dynamicMargin.bottom)
                  .append('g')
                  .attr('transform', `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    // Constants for drawing
    const cellWidth = 10;
    const cellHeight = 10;
    const moduleRows = 6;
    const moduleColumns = 10;
    const moduleSpacing = 10; // spacing between modules
    const arrayRows = 2; // how many rows of modules in the array
    const arrayColumns = 3; // how many columns of modules in the array
    const cellSpacing = 0.5; // spacing between cells

    // Constants for border and gap around cells
    const moduleBorderThickness = 1; // Thickness of the module border
    const cellToBorderGap = 2; // Gap between cells and module border

    // Function to draw a border around a group, adjust for gap
    function drawBorder(group, width, height, gap, thickness) {
        group.append('rect')
            .attr('x', -gap)
            .attr('y', -gap)
            .attr('width', width + gap * 2)
            .attr('height', height + gap * 2)
            .attr('fill', 'none')
            .attr('stroke', '#000') // The border color
            .attr('stroke-width', thickness);
    }

    // Calculate total module width and height including the cell-to-border gap
    const totalModuleWidthWithGap = moduleColumns * (cellWidth + cellSpacing) - cellSpacing + cellToBorderGap * 2;
    const totalModuleHeightWithGap = moduleRows * (cellHeight + cellSpacing) - cellSpacing + cellToBorderGap * 2;

    // Function to draw an octagon-shaped cell with cut corners
    function drawOctagonCell(group, x, y, width, height, cutSize) {
        // Define the points for an octagon shape by cutting the corners
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

        // Move to the first point
        let pathData = `M ${points[0].x},${points[0].y} `;

        // Draw lines to subsequent points
        for (let i = 1; i < points.length; i++) {
            pathData += `L ${points[i].x},${points[i].y} `;
        }
        // Close the path
        pathData += 'Z';

        // Draw the path
        group.append('path')
            .attr('d', pathData)
            .attr('fill', '#808080'); // Specify the fill color or any other style as needed
    }

    // Constants for octagon cells
    const cutSize = 2; // Size of the cut corners

    // Modified code to draw each module with cells and borders
    for (let r = 0; r < arrayRows; r++) {
        for (let c = 0; c < arrayColumns; c++) {
            const moduleGroup = svg.append('g')
                .attr('transform', `translate(${c * (totalModuleWidthWithGap + moduleSpacing) + moduleSpacing / 2}, ${r * (totalModuleHeightWithGap + moduleSpacing) + moduleSpacing / 2})`);

            // Draw the module border with gap
            drawBorder(moduleGroup, totalModuleWidthWithGap, totalModuleHeightWithGap, cellToBorderGap, moduleBorderThickness);

            // Draw octagon cells within each module group, include the cellToBorderGap in the position
            for (let y = 0; y < moduleRows; y++) {
                for (let x = 0; x < moduleColumns; x++) {
                    drawOctagonCell(
                        moduleGroup,
                        x * (cellWidth + cellSpacing) + cellToBorderGap,
                        y * (cellHeight + cellSpacing) + cellToBorderGap,
                        cellWidth,
                        cellHeight,
                        cutSize
                    );
                }
            }
        }
    }

    // Calculate the total size of the array including module borders and gaps
    const totalArrayWidth = arrayColumns * (totalModuleWidthWithGap + moduleSpacing) - moduleSpacing + moduleSpacing;
    const totalArrayHeight = arrayRows * (totalModuleHeightWithGap + moduleSpacing) - moduleSpacing + moduleSpacing;

    // Draw the border around the entire array, without additional gap
    drawBorder(svg, totalArrayWidth, totalArrayHeight, moduleSpacing / 2, moduleBorderThickness);
});