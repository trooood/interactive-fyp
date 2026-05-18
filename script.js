// main script

// Select chartholder
var chartHolder = d3.select("#chartholder");

// load colour arrays
const colorStep = 8;
var turboColors = d3.quantize(d3.interpolateTurbo, colorStep);  // create array from continuous scheme
var plasmaColors = d3.quantize(d3.interpolatePlasma, colorStep);
var greysColors = d3.quantize(d3.interpolateGreys, colorStep);
var spectralColors = d3.quantize(d3.interpolateSpectral, colorStep).reverse();  // reversed
var sinebowColors = d3.quantize(d3.interpolateSinebow, colorStep).reverse();  // reversed

// Declare the chart component
var myChart = d3.x3d.chart.scatterPlot()
    .width(600)
    .height(600)
    .mappings({ x: 'x', y: 'y', z: 'z', color: 'color', size: 'size' })
    .colors(turboColors);  // default colur scheme
    //.sizeRange([0.01, 1.0]);  // points are always same size for each sample size

var currentDataColumn = 'Mach_mag';  // default column
var currentSliderIndex = 0; // default time (0)
var currentSampleIndex = 0;  // default samples (1000)
const dataCache = {};  // init data cache

// store min/max values
var currentMinValue = null;
var currentMaxValue = null;

// for sample slider
const sampleMap = {
    0: { samples: '1000', size: 0.5},
    1: { samples: '5000', size: 0.1},
    2: { samples: '10000', size: 0.05}
};
const sampleSlider = document.getElementById('sample');
const sampleDisplay = document.getElementById('num-samples');
//const sampleSize = sampleMap[sampleIndex];

// for timestep slider
const timestepMap = [0, 0.00005, 0.0001, 0.00015, 0.0002, 0.00025];  // map timesteps. not sure if this is needed
const slider = document.getElementById('timestep');
const display = document.getElementById('timestep-value');

// for getting the values from the buttons
const columnNames = {
    'Mach_mag': 'Mach number',
    'U_mag': 'Velocity',
    'T': 'Temperature',
    'H2': 'Hydrogen concentration',
    'p': 'Pressure',
    'rho': 'Density'
};

// for getting the names of the colour scheme
const colourSchemeNames = {
    'turbo': 'Turbo',
    'plasma': 'Plasma',
    'greys': 'Greys',
    'spectral': 'Spectral',
    'sinebow': 'Sinebow'
};

const colourArrays = {
    'turbo': turboColors,
    'plasma': plasmaColors,
    'greys': greysColors,
    'spectral': spectralColors,
    'sinebow': sinebowColors
};

function updateSampleDisplay() {
    const index = parseInt(sampleSlider.value);
    currentSampleIndex = index;

    const sampleInfo = sampleMap[index];
    sampleDisplay.textContent = sampleInfo.samples;

    console.log('Sample index:', index, 'Samples:', sampleInfo.samples, 'Point size:', sampleInfo.size);
    updateChart();
}

function updateTimestep() {
    const index = parseInt(slider.value);
    currentSliderIndex = index;  // store current index

    const actualValue = timestepMap[index];
    display.textContent = actualValue;  // use this to show actual value instead of 0 (approx)

    console.log('Index:', index, 'Timestep:', actualValue);  // print index for linking to sample
    //updateChart(currentSliderIndex, currentDataColumn);
    updateChart();
}

//slider.addEventListener('input', updateTimestep);
//updateTimestep(); // Set initial value

// load data into cache
function loadData(timeIndex, sampleIndex) {
    const cacheKey = `${timeIndex}_${sampleIndex}`;

    if (dataCache[cacheKey]) {  // if already cached
        return Promise.resolve(dataCache[cacheKey]);
    }

    const sampleInfo = sampleMap[sampleIndex];
    const sampleCount = sampleInfo.samples;
    const filename = `data/${timeIndex}_sample${sampleCount}.csv`;
    console.log(`Loading: ${filename}`);
    
    return d3.csv(filename).then(data => {
        console.log(`Loaded timeIndex ${timeIndex}, sampleIndex ${sampleIndex}:`, data.length, "rows");
        dataCache[cacheKey] = data;  // cache data when loaded
        return data;
    });
}

// map csv data to chart structure
function mapData(data, colorColumn, sampleIndex) {

    const colorValues = data.map(d => +d[colorColumn]);  // gets the stats from the data
    const min = Math.min(...colorValues);
    const max = Math.max(...colorValues);

    currentMinValue = min;
    currentMaxValue = max;

    const displayName = columnNames[colorColumn];
    const displayElement = document.getElementById('data-minmax');

    /*
    if (displayElement) {
        displayElement.textContent = `Currently showing ${displayName}; min = ${min.toFixed(4)}, max = ${max.toFixed(4)}`;
    }
    */
    updateDataDescription(displayName);  // updates the caption
    
    return {  // mapped values
        values: data.map(d => ({
            //key: "data",
            key: +d[colorColumn],
            values: [
                { key: "x", value: +d.x },
                { key: "y", value: +d.y },
                { key: "z", value: +d.z },
                { key: "color", value: +d[colorColumn] },
                { key: "size", value: 1.0 }  // size is changed in updateChart (not here)
            ]
        }))
    };

}

function updateDataDescription(displayName) {  // for updating the caption
    const dataDesc1 = document.getElementById('data-description-1');
    const dataDesc2 = document.getElementById('data-description-2');
    if (dataDesc1) {
        dataDesc1.textContent = displayName;
    }
    if (dataDesc2) {
        dataDesc2.textContent = displayName;
    }
}

function setColorScheme(scheme) {
    if (scheme === 'turbo') { myChart.colors(turboColors); }
    else if (scheme === 'plasma') { myChart.colors(plasmaColors) }
    else if (scheme === 'greys') { myChart.colors(greysColors) }
    else if (scheme === 'spectral') { myChart.colors(spectralColors) }
    else if (scheme === 'sinebow') { myChart.colors(sinebowColors) }

    const displayName = colourSchemeNames[scheme];
    const colourArray = colourArrays[scheme];
    if (colourArray) {
        myChart.colors(colourArray);
        
        // update display element to show current scheme
        const schemeDisplay = document.getElementById('colourscheme-name');
        if (schemeDisplay) {
            schemeDisplay.textContent = `Current scheme: ${displayName}`;
        }
        //updateChart(currentSliderIndex, currentDataColumn);
        updateChart();
        updateColorBar(colourArray);
    }

    // Re-render with current data column
    //updateChart(currentSliderIndex, currentDataColumn);
}

// call chart
function renderChart(colorColumn) {
    currentDataColumn = colorColumn;
    //updateChart(currentSliderIndex, colorColumn);
    updateChart();

    /*
    loadData(0).then(data => {
        var chartData = mapData(data, colorColumn);
        chartHolder.datum(chartData).call(myChart);
    });
    */
}

//function updateChart(index, colorColumn) {
function updateChart() {

    // Get current values from both sliders
    const timeIndex = currentSliderIndex;
    const sampleIndex = currentSampleIndex;

    loadData(timeIndex, sampleIndex).then(data => {

        // Get the point size based on sample count
        const sampleInfo = sampleMap[sampleIndex];
        const sampleCount = sampleInfo.samples;  // this is only used for debugging
        const pointSize = sampleInfo.size;  // get size from size map
        console.log(`sampleCount ${sampleCount}, pointSize ${pointSize}`);
        myChart.sizeRange([sampleInfo.size, 1.0]);

        var chartData = mapData(data, currentDataColumn, sampleIndex);
        chartHolder.datum(chartData).call(myChart);  // this calls the chart
        console.log(`Updated chart to timeIndex ${timeIndex}, sampleIndex ${sampleIndex}`);

        const currentColors = myChart.colors() || turboColors;
        updateColorBar(currentColors);
    });
}

function updateColorBar(colors) {
    const displayColors = colors.slice(0, colorStep);
    let table = document.getElementById('color-bar-table');
    if (!table) {
        table = document.createElement('table');
        table.id = 'color-bar-table';
        // Insert the table before the original row or append to body
        const originalRow = document.getElementById('color-bar-row');
        if (originalRow && originalRow.parentElement) {
            originalRow.parentElement.insertBefore(table, originalRow);
        } else {
            document.body.appendChild(table);
        }
    }

    table.innerHTML = '';
    
    const colorRow = table.insertRow();
    colorRow.id = 'color-bar-row';

    for (let i = 0; i < colorStep; i++) {
        const cell = colorRow.insertCell();
        cell.style.backgroundColor = displayColors[i];
        cell.style.width = '12.5%';
        cell.style.height = '20px';
        cell.style.margin = '0';
        cell.style.padding = '0';
        cell.style.border = 'none';

    }

    const valueRow = table.insertRow();
    const values = [];  // store range values for colourbar
    
    if (currentMinValue !== null && currentMaxValue !== null) {
        const step = (currentMaxValue - currentMinValue) / (colorStep-1);
        for (let i = 0; i < colorStep; i++) {
            values.push(currentMinValue + (step * i));
        }
    }
    else {
        for (let i = 0; i < colorStep; i++) {
            values.push('');
        }
    }

    // add values to bottom cells
    for (let i = 0; i < colorStep; i++) {
        const cell = valueRow.insertCell();
        cell.style.textAlign = 'center';
        cell.style.fontSize = '15px';
        cell.style.padding = '4px 0';
        cell.style.border = 'none';
        //cell.style.borderTop = 'none';
        
        // Format the value (adjust decimal places as needed)
        if (typeof values[i] === 'number') {
            cell.textContent = values[i].toFixed(4);
        } else {
            cell.textContent = values[i];
        }
    }

}






// buttons for data column
document.getElementById('data_mach').addEventListener('click', () => renderChart('Mach_mag'));
document.getElementById('data_velocity').addEventListener('click', () => renderChart('U_mag'));
document.getElementById('data_temp').addEventListener('click', () => renderChart('T'));
document.getElementById('data_h2').addEventListener('click', () => renderChart('H2'));
document.getElementById('data_pressure').addEventListener('click', () => renderChart('p'));
document.getElementById('data_rho').addEventListener('click', () => renderChart('rho'));

// buttons for colour scheme
document.getElementById('colour_turbo').addEventListener('click', () => setColorScheme('turbo'));
document.getElementById('colour_plasma').addEventListener('click', () => setColorScheme('plasma'));
document.getElementById('colour_greys').addEventListener('click', () => setColorScheme('greys'));
document.getElementById('colour_spectral').addEventListener('click', () => setColorScheme('spectral'));
document.getElementById('colour_sinebow').addEventListener('click', () => setColorScheme('sinebow'));

sampleSlider.addEventListener('input', updateSampleDisplay);
slider.addEventListener('input', updateTimestep);
window.addEventListener('load', function() {  // default load colour scheme (can be edited?)
    if (typeof turboColors !== 'undefined') {
        updateColorBar(turboColors);
    }
});
//updateTimestep(); // Set initial value
//updateChart(0, 'Mach_mag');
//updateTimestep();

/*
slider.addEventListener('input', function() {
    const actualValue = timestepMap[this.value];  // if don't need actual value can remove
    console.log('Timestep:', actualValue);
});
*/

// Initial render
initialize();
renderChart('Mach_mag');
setColorScheme('turbo');  // default
//updateSampleDisplay();