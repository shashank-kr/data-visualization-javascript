// Create the chart
var pieHighChart = function(container){

    //Report start & end year
    if(yearRange[0] == "" || yearRange[0] == undefined)
        yearRange.shift();

    var startYear = yearRange[0];
    var endYear = yearRange[yearRange.length -1];

    var titleText = 'Clinical Study Report to the City and County, '+
                    countryName + ', from '+startYear+ ' to '+endYear;


    //Populate series data.
    var seriesTempData  =  aggstatsByName.map(function (t) {
        var seriesDataItem = {};
        seriesDataItem.y = t.data.reduce(function (result,item) {
            return result += item.qtr_result;
        },0);
        seriesDataItem.name = t.type;
        seriesDataItem.drilldown = t.type;
        return seriesDataItem;
    });

    //Calculate aggreagate value for % calculation

    var total = seriesTempData.reduce(function (result,item) {
        return result += item.y;

    },0);

    //map 'y' value to percentage to display in pie chart.
    var seriesFinalData = seriesTempData.map(function (item) {
        var seriesDataItem = {};
        seriesDataItem.name = item.name;
        seriesDataItem.y = roundToTwo(item.y*100/total)
        seriesDataItem.drilldown = item.drilldown;
        return seriesDataItem;
    });

    // set pie series data values.
    var seriesParams = [{
        name: countryName,
        colorByPoint: true,
        data:seriesFinalData
    }];

    //Prepare drilldown data

    var drilldownParams =  aggstatsByName.map(function (item) {

        //Filter parent data for the current drilldown data to calculate % of current item.
        var filterParentData =  seriesTempData.filter(function (t) {
            return t.name == item.type;

        })

        //get the total from filtered parent array & calculate %.
        var totalParent = filterParentData[0].y;

        var drilldownItem = {};
        drilldownItem.name = item.type;
        drilldownItem.id = item.type;

        //for each stat name , get yearly data
        drilldownItem.data = yearRange.map(function (year) {

            //Filter array based on current year
            var filterDataArrayByYear =  item.data.filter(function (t) {
                return t.stat_year == year;
            });

            //get stat results from yearly filtered list
            var resultPerYear = filterDataArrayByYear.reduce(function (result,item) {
                 result +=  item.qtr_result;
                 return result;
            },0)

            var resultInPercentage = roundToTwo(resultPerYear * 100 / totalParent);


            return ['Year '+year,resultInPercentage];
        });
        return drilldownItem;
    });

    Highcharts.chart(container, {
        chart: {
            type: 'pie'
        },
        title: {
            text: titleText
        },
        subtitle: {
            text: 'Click the slices to view quaterly report.'
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{point.name}: {point.y:.1f}%'
                }
            }
        },

        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
        },
        series: seriesParams,
        drilldown: {
            series: drilldownParams
        }
    });
}
