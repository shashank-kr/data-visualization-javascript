"use strict";

//global variable to hold uploaded csv data
var rawCSVData = null;
var rawJsonObject = null;

// Define dimensions of the plot
var margin = {top: 120, right: 60, bottom: 60, left: 180};
var height = 500;
var width = 960;

//global variable to hold year range
var yearRange = [];

//Default value at the intial loading time.
var countryName = 'All Patients';

//Grouped data by statistics name.
var aggstatsByName = [];

// Define the transition duration
var transDur = 500;

// Set up a global variable for the names of the stats reported here
// (in hopes of making it easier to keep line colors consistent
var reportStats = [];

var stats;

// gradient color setup for all charts.
// Radialize the colors
Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function (color) {
    return {
        radialGradient: {
            cx: 0.5,
            cy: 0.3,
            r: 0.7
        },
        stops: [
            [0, color],
            [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
        ]
    };
});

//uploade csv data in row form into global variable 'rawCSVData'
loadCSVData();

function reloadChart(ddlCounty) {
    //var selectedText = ddlCounty.options[ddlCounty.selectedIndex].innerHTML;
    var selectedValue = ddlCounty.value;

    //Updated selected county name to global variable
    countryName = selectedValue;

    //Reload processed data table & all charts.
    loadAllChartsAndProcessedTables();
}

var loadAllChartsAndProcessedTables = function () {

    //Filter data by county name
    var countrySpecificData = filterArrayByCountry(rawJsonObject,countryName);

    //Format this array as needed
    formatArrayAsNeeded(countrySpecificData);

    // Assign the data outside of the function for later use
    stats = countrySpecificData;

    // Load the processed data & display in table.
    showProcessedCsvDataTable(countrySpecificData,'container__table');

    //Pie highchart
    pieHighChart('container__pie-chart');

    //Load donut highchart
    donutHighChart('container__donut-chart');

    //Load combination highchart
    colLinePieHighChart('container__col-line-pie-chart');
}

