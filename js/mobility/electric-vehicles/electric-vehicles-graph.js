const data = {
    ICEV: {
      Pickup: { efficiency: 100, ghg: "543-573" },
      SUV: { efficiency: 82, ghg: "435-485" },
      Sedan: { efficiency: 71, ghg: "373-420" }
    },
    HEV: {
      Pickup: { efficiency: 72, ghg: "388-410" },
      SUV: { efficiency: 59, ghg: "317-345" },
      Sedan: { efficiency: 49, ghg: "262-287" }
    },
    BEV: {
      Pickup: { efficiency: 35, ghg: "182-207" },
      SUV: { efficiency: 31, ghg: "162-170" },
      Sedan: { efficiency: 24, ghg: "129-136" }
    }
  };
  
  let selections = {
    car1: { type: null, ev: null },
    car2: { type: null, ev: null }
  };
  
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
  
  function compareResults() {
    const { car1, car2 } = selections;
    if (car1.type && car1.ev && car2.type && car2.ev) {
      const result1 = data[car1.ev][car1.type].efficiency;
      const result2 = data[car2.ev][car2.type].efficiency;
      let difference = (result2 - result1);
      const range1 = data[car1.ev][car1.type].ghg;
      const range2 = data[car2.ev][car2.type].ghg;
  
      difference = difference > 0 ? `+${difference.toFixed(2)}` : difference.toFixed(2);
  
      document.getElementById('result').innerText = `Change in Emissions: ${difference}%` ;
      document.getElementById('range-data-car1').innerText = `GHG Emissions Range: ${range1}`;
      document.getElementById('range-data-car2').innerText = `GHG Emissions Range: ${range2}`;
  
      let resultColor;
      if (difference === 0) {
        resultColor = 'gray';
      } else {
        resultColor = difference < 0 ? 'green' : 'red';
      }
      document.getElementById('result').style.color = resultColor;
  
      const ghg1 = parseInt(data[car1.ev][car1.type].ghg.split('-')[0]);
      const ghg2 = parseInt(data[car2.ev][car2.type].ghg.split('-')[0]);
    
      const color1 = calculateColor(ghg1);
      const color2 = calculateColor(ghg2);
    
      document.getElementById('range-data-car1').style.backgroundColor = color1;
      document.getElementById('range-data-car2').style.backgroundColor = color2;
    }
  }
  
  document.querySelectorAll('.grid-item').forEach(item => {
    item.addEventListener('click', () => {
      const car = item.dataset.car;
      const category = item.dataset.category;
      const value = item.dataset.value;
  
      selections[`car${car}`][category] = value;
  
      document.querySelectorAll(`.grid-item[data-car="${car}"][data-category="${category}"]`).forEach(i => {
        i.classList.remove('selected');
      });
  
      item.classList.add('selected');
  
      compareResults();
    });
  });
  
  (() => {
    const container = document.getElementById("electric-vehicles-graph");
  
    const tooltipDiv = document.createElement("div");
    tooltipDiv.id = "tooltip";
    tooltipDiv.className = "tooltip";
    container.appendChild(tooltipDiv);
  
    const tooltip = d3.select(container).select("#tooltip");
  
    const aspectRatio = 0.7;
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth * aspectRatio;
  
    const dynamicMargin = {
      top: containerHeight * 0.05,
      right: containerWidth * 0.2,
      bottom: containerHeight * 0.12,
      left: containerWidth * 0.1,
    };
  
    const width = containerWidth - dynamicMargin.left - dynamicMargin.right;
    const height = containerHeight - dynamicMargin.top - dynamicMargin.bottom;
  
    const svg = d3.select("#electric-vehicles-graph")
                  .append("svg")
                  .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`)
                  .attr("preserveAspectRatio", "xMinYMin meet")
                  .append("g")
                  .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);
  
  })();