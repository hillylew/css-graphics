(function () {
    const aspectRatio = 1.0;

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
        container.selectAll('*').remove();

        const containerWidth = container.node().offsetWidth;
        const containerHeight = containerWidth * aspectRatio;
        const dynamicMargin = {
            top: containerHeight * 0.05,
            right: containerWidth * 0.05,
            bottom: containerHeight * 0.05,
            left: containerWidth * 0.05
        };

        const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
        const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;

        const svg = container.append("svg")
            .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .append("g")
            .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

        addTitleText(svg, width, height);
        const groupContainer = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);
        appendOptions(groupContainer, 1);
        appendResult(groupContainer);
        appendOptions(groupContainer, 2);
        appendRangeData(groupContainer);
        appendResetButton(groupContainer);

        d3.selectAll('.grid-item').on("click", handleItemClick);

        function appendOptions(parent, carId) {
            const boxWidth = width * 0.2;
            const boxHeight = height * 0.15;
            const spacing = boxHeight * 1.2;
            const columnGap = width * 0.05;
            const offsetX = carId === 1 ? -width * 0.3 - boxWidth / 2 - columnGap / 2 : width * 0.3 - boxWidth / 2 - columnGap / 2;

            addOptionLabels(parent, offsetX, boxWidth, columnGap);
            addCarTypeOptions(parent, offsetX, boxWidth, boxHeight, spacing, carId);
            addEVOptions(parent, offsetX + boxWidth + columnGap, boxWidth, boxHeight, spacing, carId);
        }

        function appendResult(parent) {
            appendResultBox(parent, 0, -height * 0.5, `Select Options to Compare`, `result-bg`, `result`);
        }

        function appendRangeData(parent) {
            appendResultBox(parent, -width * 0.3, height * 0.3, `GHG Emissions Range`, `range-rect-car1`, `range-data-car1`);
            appendResultBox(parent, width * 0.3, height * 0.3, `GHG Emissions Range`, `range-rect-car2`, `range-data-car2`);
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
                .style("fill", "#00274c")
                .style("stroke", "white")
                .style("cursor", "pointer")
                .attr("rx", 5)
                .attr("ry", 5);

            parent.append("text")
                .attr("id", "reset-button-text")
                .attr("class", "chart-labels")
                .attr("x", 0)
                .attr("y", buttonY + buttonHeight / 2)
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .style("pointer-events", "none")
                .style("fill", "white")
                .text("Reset");

            d3.select("#reset-button").on("click", resetSelections);
        }

        function handleItemClick() {
            const item = d3.select(this);
            const car = item.attr("data-car");
            const category = item.attr("data-category");
            const value = item.attr("data-value");

            selections[`car${car}`][category] = value;

            d3.selectAll(`.grid-item[data-car="${car}"][data-category="${category}"]`)
                .classed('selected', false)
                .style("fill", "#F2F2F2");

            d3.selectAll(`text[data-car="${car}"][data-category="${category}"]`)
                .style("fill", "black");

            d3.selectAll(`text[data-car="${car}"][data-category="${category}"][data-value="${value}"]`)
                .style("fill", "red");

            updateRange(`car${car}`);
            compareResults();
        }

        function resetSelections() {
            selections = {
                car1: { type: null, ev: null },
                car2: { type: null, ev: null }
            };

            d3.selectAll('.grid-item').classed('selected', false).style('fill', '#F2F2F2').style('stroke', 'white').style('stroke-width', 1);
            d3.selectAll('text[data-category]').style("fill", "black");
            d3.select('#result').text("Select Options to Compare").style('fill', 'black');
            d3.select('#range-data-car1').text("GHG Emissions Range").style('fill', 'black');
            d3.select('#range-data-car2').text("GHG Emissions Range").style('fill', 'black');
            d3.select('#range-rect-car1').style('fill', '#F2F2F2');
            d3.select('#range-rect-car2').style('fill', '#F2F2F2');
        }

        function updateRange(car) {
            if (selections[car].type && selections[car].ev) {
                const range = data[selections[car].ev][selections[car].type].ghg;
                const ghg = parseInt(range.split('-')[0], 10);
                const color = calculateColor(ghg);

                d3.select(`#range-data-${car}`).text(`GHG Emissions Range: ${range}`).style('fill', 'black');
                d3.select(`#range-rect-${car}`).style('fill', color);
            }
        }

        function compareResults() {
            const { car1, car2 } = selections;
            if (car1.type && car1.ev && car2.type && car2.ev) {
                const result1 = data[car1.ev][car1.type].efficiency;
                const result2 = data[car2.ev][car2.type].efficiency;
                let difference = (result2 - result1).toFixed(2);
                difference = difference > 0 ? `+${difference}` : difference;

                d3.select('#result').attr("class", "chart-labels").text(`Change in Emissions: ${difference}%`).style('fill', 'red');
                updateRange("car1");
                updateRange("car2");
            } else {
                d3.select('#result').attr("class", "chart-labels").text("Select Options to Compare").style('fill', 'black');
            }
        }

        function calculateColor(value, minVal = 129, maxVal = 573) {
            const normalized = (value - minVal) / (maxVal - minVal);
            const red = normalized < 0.5 ? Math.round(2 * normalized * 255) : 255;
            const green = normalized < 0.5 ? 255 : Math.round((1 - 2 * (normalized - 0.5)) * 255);
            return `rgba(${red}, ${green}, 0, 0.5)`;
        }

        function addTitleText(svg, width, height) {
            svg.append("text").attr("x", width / 2 - width * 0.3)
                .attr("y", height * 0.1)
                .attr("text-anchor", "middle")
                .attr("class", "chart-labels")
                .style("font-weight", "bold")
                .text("Vehicle 1");

            svg.append("text").attr("x", width / 2 + width * 0.3)
                .attr("y", height * 0.1)
                .attr("text-anchor", "middle")
                .attr("class", "chart-labels")
                .style("font-weight", "bold")
                .text("Vehicle 2");
        }

        function addOptionLabels(parent, offsetX, boxWidth, columnGap) {
            ["select vehicle", "select battery"].forEach((label, index) => {
                let colX = index === 0 ? offsetX - boxWidth / 2 : offsetX + boxWidth + columnGap - boxWidth / 2;
                parent.append("text")
                    .attr("class", "chart-labels")
                    .attr("x", colX + boxWidth / 2)
                    .attr("y", -height * 0.35)
                    .attr("text-anchor", "middle")
                    .attr("pointer-events", "none")
                    .text(label);
            });
        }

        // Image links (change for website)
        function addCarTypeOptions(parent, offsetX, boxWidth, boxHeight, spacing, carId) {
            const carTypes = ["Pickup", "SUV", "Sedan"];
            carTypes.forEach((type, index) => {
                const row = spacing * (index + 1) - height * 0.5;
                parent.append("image")
                    .attr("class", "grid-item")
                    .attr("xlink:href", `../../images/icon-${type.toLowerCase()}.png`)
                    // .attr("xlink:href", `/sites/default/files/css-graphics/images/icon-${type.toLowerCase()}.png`)
                    .attr("x", offsetX - boxWidth / 2)
                    .attr("y", row)
                    .attr("width", boxWidth)
                    .attr("height", boxHeight)
                    .attr("data-car", carId)
                    .attr("data-category", "type")
                    .attr("data-value", type)
                    .style("stroke", "white")
                    .attr("rx", 5)
                    .attr("ry", 5);

                parent.append("text")
                    .attr("class", "chart-labels")
                    .attr("x", offsetX - boxWidth / 2 + boxWidth / 2)
                    .attr("y", row + boxHeight + 15)
                    .attr("text-anchor", "middle")
                    .attr("pointer-events", "none")
                    .attr("data-car", carId)
                    .attr("data-category", "type")
                    .attr("data-value", type)
                    .text(type);
            });
        }

        function addEVOptions(parent, offsetX, boxWidth, boxHeight, spacing, carId) {
            const carEvs = ["ICEV", "HEV", "BEV"];
            carEvs.forEach((ev, index) => {
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
                    .attr("rx", 5)
                    .attr("ry", 5);

                parent.append("text")
                    .attr("class", "chart-labels")
                    .attr("x", offsetX - boxWidth / 2 + boxWidth / 2)
                    .attr("y", row + boxHeight / 2 + 4)
                    .attr("text-anchor", "middle")
                    .attr("pointer-events", "none")
                    .attr("data-car", carId)
                    .attr("data-category", "ev")
                    .attr("data-value", ev)
                    .text(ev);
            });
        }

        function appendResultBox(parent, x, y, text, rectId, textId) {
            const boxWidth = width * 0.20;
            const columnGap = width * 0.05;
            const totalWidth = boxWidth * 2 + columnGap;
            const rectHeight = height * 0.1;

            const groupBox = parent.append("g")
                .attr("class", "result-group")
                .attr("transform", `translate(${x}, ${y})`);

            groupBox.append("rect")
                .attr("class", "range-data-rect")
                .attr("id", rectId)
                .attr("x", -totalWidth / 2)
                .attr("y", -rectHeight / 2)
                .attr("width", totalWidth)
                .attr("height", rectHeight)
                .style("fill", "#F2F2F2")
                .style("stroke", "white")
                .attr("rx", 5)
                .attr("ry", 5);

            groupBox.append("text")
                .attr("class", "chart-labels")
                .attr("id", textId)
                .attr("x", 0)
                .attr("y", 0)
                .attr("text-anchor", "middle")
                .attr("dy", ".35em")
                .text(text);
        }
    }

    renderDiagram();
    window.addEventListener('resize', renderDiagram);

    const style = document.createElement('style');
    style.innerHTML = `
        .grid-item {
            cursor: pointer;
            transition: fill 0.3s, stroke 0.3s;
        }
        .grid-item:hover {
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