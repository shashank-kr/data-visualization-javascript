var donutHighChart = function (container) {

    var startYear = yearRange[0];
    var endYear = yearRange[yearRange.length -1];

    var titleText = 'Clinical Study Report count for, '+
        countryName + ', from '+startYear+ ' to '+endYear;

    //Get category name
    var categories = [],
        colors = Highcharts.getOptions().colors,
        statNameData = [],
        statNameYearlyData = [];



    //preparing data

    var colorIndex = 0;

    var data =  aggstatsByName.map(function (item) {

        //Populate category array
        categories.push(item.type);

        var dataItem = {};
        dataItem.y = item.data.reduce(function (result,currentitem) {
            return result += currentitem.qtr_result;
        },0);
        dataItem.color = colors[colorIndex];

        /*{
            y: 56.33,
                color: colors[0],
            drilldown: {
            name: 'MSIE versions',
                categories: ['MSIE 6.0', 'MSIE 7.0', 'MSIE 8.0', 'MSIE 9.0',
                'MSIE 10.0', 'MSIE 11.0'],
                data: [1.06, 0.5, 17.2, 8.11, 5.33, 24.13],
                color: colors[0]
        }
        }*/


        //Preapare drilldown item
        var drilldownItem = {};
        drilldownItem.name = 'Yearly '+item.type;
        drilldownItem.color = colors[colorIndex];
        drilldownItem.categories = [];

        //for each stat name , get yearly data
        drilldownItem.data = yearRange.map(function (year) {

            //Push category value attached with parent item.
            drilldownItem.categories.push(item.type + " Year " + year);


            //Filter array based on current year
            var filterDataArrayByYear =  item.data.filter(function (t) {
                return t.stat_year == year;
            });

            //get stat results from yearly filtered list
            var resultPerYear = filterDataArrayByYear.reduce(function (result,item) {
                result +=  item.qtr_result;
                return result;
            },0)

            return resultPerYear;
        });

        //add current drilldown data item to original data
        dataItem.drilldown = drilldownItem;

        //get next color index for next item.
        colorIndex++;

        return dataItem;
    });

    var dataLen = data.length,
        drillDataLen,
        brightness,
        i,
        j;


// Build the data arrays
    for (i = 0; i < dataLen; i++) {

        // add statistics name data
        statNameData.push({
            name: categories[i],
            y: data[i].y,
            color: data[i].color
        });

        // add statistics name data yearly
        drillDataLen = data[i].drilldown.data.length;
        for (j = 0; j < drillDataLen; j += 1) {
            brightness = 0.2 - (j / drillDataLen) / 5;
            statNameYearlyData.push({
                name: data[i].drilldown.categories[j],
                y: data[i].drilldown.data[j],
                color: Highcharts.Color(data[i].color).brighten(brightness).get()
            });
        }
    }

// Create the chart
    Highcharts.chart(container, {
        chart: {
            type: 'pie'
        },
        title: {
            text: titleText
        },
        subtitle: {
            text: ''
        },
        yAxis: {
            title: {
                text: ''
            }
        },
        plotOptions: {
            pie: {
                shadow: false,
                center: ['50%', '50%']
            }
        },

        tooltip: {
            valueSuffix: ''
        },
        series: [{
            name: 'Report',
            data: statNameData,
            size: '60%'

        }, {
            name: 'Yearly Report',
            data: statNameYearlyData,
            size: '80%',
            innerSize: '60%',
            id: 'yearlyReport'
        }],
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 400
                },
                chartOptions: {
                    series: [{
                        id: 'yearlyReport',
                        dataLabels: {
                            enabled: false
                        }
                    }]
                }
            }]
        }
    });

}