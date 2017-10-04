
// Create the chart
var colLinePieHighChart = function(container){

    if(yearRange[0] == "" || yearRange[0] == undefined)
        yearRange.shift();

    var startYear = yearRange[0];
    var endYear = yearRange[yearRange.length -1];

    var titleText = 'Yearly Clinical Study Report, '+
        countryName + ', from '+startYear+ ' to '+endYear;

    var xAxisCategories = yearRange;
    var labelsItemHtml = 'Total Clinical Report';

    //prepare data or column chart.
    var colChartData =  aggstatsByName.map(function (item) {
        var colChartItems = {};
        colChartItems.type = 'column';
        colChartItems.name = item.type;

        //for each stat name , get yearly data
        colChartItems.data = yearRange.map(function (year) {
            var filterDataArrayByYear =  item.data.filter(function (t) {
                return t.stat_year == year;
            });


            //get stat results from yearly filtered list
            var resultPerYear = filterDataArrayByYear.reduce(function (result,item) {
                return result +=  item.qtr_result;
            },0)

            return resultPerYear;
        });
        return colChartItems;
    });

    //Calculate average for spline chart data from 'colChartData'

    var splineChartObj = {};
    splineChartObj.type = 'spline';
    splineChartObj.name = 'Average';
    splineChartObj.data = [];
    splineChartObj.marker = {
        ineWidth: 2,
        lineColor: Highcharts.getOptions().colors[3],
        fillColor: 'white'
    }

    //Count no of objects for avg. calculation
    var nCount = colChartData.length;
    var nYears = yearRange.length;

    //for each year calculate avg.
    for(var iYr=0; iYr < nYears ; iYr++){

        //Calculate avg.
        var yrlyTotal = colChartData.reduce(function (yearlyTotal,item) {
            return yearlyTotal += item.data[iYr];
        },0)

        var avgResult = roundToTwo(yrlyTotal / nCount);

        //push result to spine chart data array.
        splineChartObj.data.push(avgResult);
    }

    // Preapare data for Pie-chart total.
    var pieChartTotalParams = {};
        pieChartTotalParams.type = 'pie';
        pieChartTotalParams.name = 'Total clinical reports.';
        pieChartTotalParams.center = [80, 70],
        pieChartTotalParams.size =  100,
        pieChartTotalParams.showInLegend = false,
        pieChartTotalParams.dataLabels = {
            enabled: false
        }

    //Populate series data.
    pieChartTotalParams.data  =  aggstatsByName.map(function (t) {
        var seriesDataItem = {};
        seriesDataItem.y = t.data.reduce(function (result,item) {
            return result += item.qtr_result;
        },0)
        seriesDataItem.name = t.type;
        return seriesDataItem;
    });

    var combChartSeriesParams = colChartData;

    //Push spline chart object to original combn. chart
    combChartSeriesParams.push(splineChartObj);

    //Push pe chart total data
    combChartSeriesParams.push(pieChartTotalParams);

    //display chart
    Highcharts.chart(container, {
        title: {
            text: titleText
        },
        xAxis: {
            categories: xAxisCategories
        },
        labels: {
            items: [{
                html: labelsItemHtml,
                style: {
                    left: '50px',
                    top: '18px',
                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
                }
            }]
        },
        series:combChartSeriesParams
    });

}
