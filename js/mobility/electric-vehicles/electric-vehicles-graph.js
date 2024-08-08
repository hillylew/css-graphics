(function () {
    const aspectRatio = 1.0; // Adjusted for a more square layout
    const data = {
        "ICEV": {
            Pickup: { efficiency: 100, ghg: "543-573" },
            SUV: { efficiency: 82, ghg: "435-485" },
            Sedan: { efficiency: 71, ghg: "373-420" }
        },
        "HEV": {
            Pickup: { efficiency: 72, ghg: "388-410" },
            SUV: { efficiency: 59, ghg: "317-345" },
            Sedan: { efficiency: 49, ghg: "262-287" }
        },
        "BEV": {
            Pickup: { efficiency: 35, ghg: "182-207" },
            SUV: { efficiency: 31, ghg: "162-170" },
            Sedan: { efficiency: 24, ghg: "129-136" }
        }
    };

    let selections = {
        car1: { type: null, ev: null },
        car2: { type: null, ev: null }
    };

    const container = d3.select("#electric-vehicles-graph");

    function renderDiagram() {
        // Clear existing content
        container.selectAll('*').remove();

        // Get dimensions
        const containerWidth = container.node().offsetWidth;
        const containerHeight = containerWidth * aspectRatio;

        // Calculate the dynamic margins
        const dynamicMargin = {
            top: containerHeight * 0.05,
            right: containerWidth * 0.05,
            bottom: containerHeight * 0.10, // Space for the reset button
            left: containerWidth * 0.05,
        };

        // Calculate the width and height for the inner drawing area
        const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
        const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

        // Append SVG object
        const svg = container.append("svg")
            .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .append("g")
            .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

        // Add title texts
        svg.append("text")
            .attr("x", width / 2 - width * 0.3) // Center of the first column
            .attr("y", height * 0.1)
            .attr("text-anchor", "middle")
            .attr("class", "chart-labels")
            .text("Vehicle 1");

        svg.append("text")
            .attr("x", width / 2 + width * 0.3) // Center of the second column
            .attr("y", height * 0.1)
            .attr("text-anchor", "middle")
            .attr("class", "chart-labels")
            .text("Vehicle 2");

        // Group for options, results, and ranges
        const groupContainer = svg.append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const carTypes = ["Pickup", "SUV", "Sedan"];
        const carEvs = ["ICEV", "HEV", "BEV"];

        appendOptions(groupContainer, carTypes, carEvs, 1);
        appendResult(groupContainer);
        appendOptions(groupContainer, carTypes, carEvs, 2);
        appendRangeData(groupContainer);
        appendResetButton(groupContainer);

        // Add event listeners
        d3.selectAll('.grid-item').on("click", function () {
            const item = d3.select(this);
            const car = item.attr("data-car");
            const category = item.attr("data-category");
            const value = item.attr("data-value");

            selections[`car${car}`][category] = value;

            // Remove the selected class from other items in the same category and car
            d3.selectAll(`.grid-item[data-car="${car}"][data-category="${category}"]`)
                .classed('selected', false)
                .style("stroke", "white");  // Reset stroke for non-selected items

            // Add the selected class to the clicked item and update its border
            item.classed('selected', true)
                .style("stroke", "#3167A4")
                .style("stroke-width", 2);

            // Update button colors based on selections
            updateButtonColors();

            // Update results
            compareResults();
        });


        function appendOptions(parent, types, evs, carId) {
            const boxWidth = width * 0.20; // Adjust button width
            const boxHeight = height * 0.15; // Adjust button height
            const spacing = boxHeight * 1.2;
            const columnGap = width * 0.05; // Gap between columns

            let offsetX;
            if (carId === 1) {
                offsetX = -width * 0.3 - boxWidth / 2 - columnGap / 2; // Adjusted to fit in the left half and add gap
            } else {
                offsetX = width * 0.3 - boxWidth / 2 - columnGap / 2; // Adjusted to fit in the right half and add gap
            }

            // Append option labels
            ["select vehicle", "select battery"].forEach((label, index) => {
                let colX;
                if (index === 0) {
                    colX = offsetX - boxWidth / 2;
                } else {
                    colX = offsetX + boxWidth + columnGap - boxWidth / 2;
                }

                parent.append("text")
                    .attr("class", "chart-labels")
                    .attr("x", colX + boxWidth / 2)
                    .attr("y", -height * 0.35)
                    .attr("text-anchor", "middle")
                    .attr("pointer-events", "none")
                    .text(label);
            });

            // Append car type options
            types.forEach((type, index) => {
                const row = spacing * (index + 1) - height * 0.5;
                parent.append("rect")
                    .attr("class", "grid-item")
                    .attr("x", offsetX - boxWidth / 2)
                    .attr("y", row)
                    .attr("width", boxWidth)
                    .attr("height", boxHeight)
                    .attr("data-car", carId)
                    .attr("data-category", "type")
                    .attr("data-value", type)
                    .style("fill", "#F2F2F2")
                    .style("stroke", "white")
                    .attr("rx", 5) // Rounded corners
                    .attr("ry", 5); // Rounded corners

                parent.append("text")
                    .attr("class", "chart-labels")
                    .attr("x", offsetX - boxWidth / 2 + boxWidth / 2)
                    .attr("y", row + boxHeight / 2 + 4)
                    .attr("text-anchor", "middle")
                    .attr("pointer-events", "none")
                    .text(type);
            });

            // Adjust offsetX for the EV options with a gap
            offsetX += boxWidth + columnGap;

            // Append EV options
            evs.forEach((ev, index) => {
                const row = spacing * (index + 1) - height * 0.5;

                parent.append("rect")
                    .attr("class", "grid-item")
                    .attr("x", offsetX - boxWidth / 2)
                    .attr("y", row)
                    .attr("width", boxWidth)
                    .attr("height", boxHeight)
                    .attr("data-car", carId)
                    .attr("data-category", "ev")
                    .attr("data-value", ev)
                    .style("fill", "#F2F2F2")
                    .style("stroke", "white")
                    .attr("rx", 5) // Rounded corners
                    .attr("ry", 5); // Rounded corners

                parent.append("text")
                    .attr("class", "chart-labels")
                    .attr("x", offsetX - boxWidth / 2 + boxWidth / 2)
                    .attr("y", row + boxHeight / 2 + 4)
                    .attr("text-anchor", "middle")
                    .attr("pointer-events", "none")
                    .text(ev);
            });
        }

        function appendResult(parent) {
            parent.append("text")
                .attr("id", "result")
                .attr("x", 0)
                .attr("y", -height * 0.5)
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .attr("class", "diagram-labels")
                .text("Select Options to Compare");
        }

        function appendRangeData(parent) {
            const boxWidth = width * 0.20;
            const columnGap = width * 0.05; // Gap between columns
            const totalWidth = boxWidth * 2 + columnGap; // Total width for both columns

            const rectHeight = height * 0.1; // Height of the rectangle

            // Group for Car 1 range data
            const groupCar1 = parent.append("g")
                .attr("class", "range-group")
                .attr("transform", `translate(${-width * 0.3}, ${height * 0.3})`); // Positioned and centered

            groupCar1.append("rect")
                .attr("class", "range-data-rect")
                .attr("id", "range-rect-car1")
                .attr("x", -totalWidth / 2)
                .attr("y", -rectHeight / 2)
                .attr("width", totalWidth)
                .attr("height", rectHeight)
                .style("fill", "#F2F2F2")
                .style("stroke", "white")
                .attr("rx", 5) // Rounded corners
                .attr("ry", 5); // Rounded corners;

            groupCar1.append("text")
                .attr("class", "chart-labels")
                .attr("id", "range-data-car1")
                .attr("x", 0)
                .attr("y", 0) // Centered within the rectangle
                .attr("text-anchor", "middle")
                .attr("dy", ".35em")
                .text("Car 1 Range");

            // Group for Car 2 range data
            const groupCar2 = parent.append("g")
                .attr("class", "range-group")
                .attr("transform", `translate(${width * 0.3}, ${height * 0.3})`); // Positioned and centered

            groupCar2.append("rect")
                .attr("class", "range-data-rect")
                .attr("id", "range-rect-car2")
                .attr("x", -totalWidth / 2)
                .attr("y", -rectHeight / 2)
                .attr("width", totalWidth)
                .attr("height", rectHeight)
                .style("fill", "#F2F2F2")
                .style("stroke", "white")
                .attr("rx", 5) // Rounded corners
                .attr("ry", 5); // Rounded corners;

            groupCar2.append("text")
                .attr("class", "chart-labels")
                .attr("id", "range-data-car2")
                .attr("x", 0)
                .attr("y", 0) // Centered within the rectangle
                .attr("text-anchor", "middle")
                .attr("dy", ".35em")
                .text("Car 2 Range");
        }

        function appendResetButton(parent) {
            const buttonWidth = width * 0.2;
            const buttonHeight = height * 0.08;
            const buttonX = -buttonWidth / 2;
            const buttonY = height * 0.4;

            parent.append("rect")
                .attr("id", "reset-button")
                .attr("x", buttonX)
                .attr("y", buttonY)
                .attr("width", buttonWidth)
                .attr("height", buttonHeight)
                .style("fill", "#F2F2F2")
                .style("stroke", "white")
                .style("cursor", "pointer")
                .attr("rx", 5) // Rounded corners
                .attr("ry", 5); // Rounded corners;

            parent.append("text")
                .attr("id", "reset-button-text")
                .attr("class", "chart-labels")
                .attr("x", 0)
                .attr("y", buttonY + buttonHeight / 2)
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .style("pointer-events", "none")
                .text("Reset");

            // Add click event to reset button
            d3.select("#reset-button").on("click", resetSelections);
        }

        function resetSelections() {
            selections = {
                car1: { type: null, ev: null },
                car2: { type: null, ev: null }
            };

            d3.selectAll('.grid-item').classed('selected', false);

            d3.selectAll('.grid-item').style('fill', '#F2F2F2');

            d3.selectAll('.grid-item').style('stroke', 'white').style('stroke-width', 1);

            d3.select('#result').text("Select Options to Compare").style('fill', 'black');
            d3.select('#range-data-car1').text("Car 1 Range").style('fill', 'black');
            d3.select('#range-data-car2').text("Car 2 Range").style('fill', 'black');
            d3.select('#range-rect-car1').style('fill', '#F2F2F2');
            d3.select('#range-rect-car2').style('fill', '#F2F2F2');
        }

        function updateButtonColors() {
            if (selections.car1.type) {
                d3.selectAll('.grid-item[data-car="1"][data-category="type"]')
                    .style('fill', '#8FC8E5');
            }

            if (selections.car1.ev) {
                d3.selectAll('.grid-item[data-car="1"][data-category="ev"]')
                    .style('fill', '#8FC8E5');
            }

            if (selections.car2.type) {
                d3.selectAll('.grid-item[data-car="2"][data-category="type"]')
                    .style('fill', '#8FC8E5');
            }

            if (selections.car2.ev) {
                d3.selectAll('.grid-item[data-car="2"][data-category="ev"]')
                    .style('fill', '#8FC8E5');
            }
        }

        function compareResults() {
            const { car1, car2 } = selections;
            if (car1.type && car1.ev && car2.type && car2.ev) {
                const result1 = data[car1.ev][car1.type].efficiency;
                const result2 = data[car2.ev][car2.type].efficiency;
                let difference = (result2 - result1);
                const range1 = data[car1.ev][car1.type].ghg;
                const range2 = data[car2.ev][car2.type].ghg;

                difference = difference > 0 ? `+${difference.toFixed(2)}` : difference.toFixed(2);

                d3.select('#result')
                    .text(`Change in Emissions: ${difference}%`)
                    .style('fill', 'red')
                    .style('font-size', '24px');

                d3.select('#range-data-car1').text(`GHG Emissions Range: ${range1}`).style('fill', 'black');
                d3.select('#range-data-car2').text(`GHG Emissions Range: ${range2}`).style('fill', 'black');

                const ghg1 = parseInt(range1.split('-')[0]);
                const ghg2 = parseInt(range2.split('-')[0]);

                const color1 = calculateColor(ghg1);
                const color2 = calculateColor(ghg2);

                d3.select('#range-rect-car1').style('fill', color1);
                d3.select('#range-rect-car2').style('fill', color2);
            }
        }

        function calculateColor(value, minVal = 129, maxVal = 550) {
            const normalized = (value - minVal) / (maxVal - minVal);

            let red = 0, green = 0, blue = 0;

            if (normalized < 0.5) {
                green = 255;
                red = Math.round(2 * normalized * 255);
            } else {
                green = Math.round((1 - 2 * (normalized - 0.5)) * 255);
                red = 255;
            }

            const opacity = 0.5;

            return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
        }
    }

    renderDiagram();
    window.addEventListener('resize', renderDiagram);

    // Adding CSS Styles
    const style = document.createElement('style');
    style.innerHTML = `
        .grid-item{
            cursor: pointer;
            transition: fill 0.3s, stroke 0.3s;
        }
        .grid-item:hover{
            fill: #B8B8B8;
            stroke: #888888;
        }
        .range-data-rect, #reset-button {
            transition: fill 0.3s, stroke 0.3s;
        }
        #reset-button:hover {
            fill: #B8B8B8;
            stroke: #888888;
        }
        .chart-labels {
            font-family: sans-serif;
            font-weight: bold;
        }
        .diagram-labels {
            font-family: sans-serif;
            font-weight: bold;
            font-size: 14px;
        }
        .diagram-labels-result {
            font-family: sans-serif;
            font-weight: bold;
            font-size: 18px;
        }
        .range-data {
            font-family: sans-serif;
            font-size: 12px;
        }
    `;
    document.head.appendChild(style);
})();