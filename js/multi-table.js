

// This function creates a table with a row for each statistic in a flat data
// object and a column for each time period in the data object.

var showRawCSVDataTable = function (containerId) {

    var rawTable = document.createElement("table");
    var thead = document.createElement("thead");
    var tbody = document.createElement("tbody");

    var rows = rawCSVData.split("\n");

    var nRows = rows.length;
    var nCols = rows[0].split(",").length;

    //Format & insert header row
    var headerRow = rawTable.insertRow(-1);
    var headerCells = rows[0].split(",");

    //Insert header rows.
    for (var k = 0; k < nCols ; k++) {

        var headerCell = document.createElement("th");
        //var headerCell = headerRow.insertCell(-1);
        headerRow.appendChild(headerCell);

        //Remove extra double quote
        var trimmedCellData = headerCells[k] != undefined ? headerCells[k].replace(/\"/g, ""):"";

        //Capitalise header name
        if(trimmedCellData.indexOf("_") != -1){
            headerCell.innerHTML = capitalizeWords(trimmedCellData.split("_")[1]);
        }else{
            headerCell.innerHTML = capitalizeWords(TrimQuote(trimmedCellData));
        }

    }
    thead.appendChild(headerRow);

    //Insert data rows
    for (var i = 1; i < nRows; i++) {

        var row = tbody.insertRow(-1);
        var dataCells = rows[i].split(",");

        for (var j = 0; j < nCols ; j++) {
            var dataCell = row.insertCell(-1);
            dataCell.innerHTML = dataCells[j] != undefined ? dataCells[j].replace(/\"/g, "") :""; //remove extra double quote
        }
    }
    rawTable.appendChild(thead);
    rawTable.appendChild(tbody);

    var rawCSVTable = document.getElementById(containerId);
    rawCSVTable.innerHTML = "";
    rawCSVTable.appendChild(rawTable);

}

var showProcessedCsvDataTable = function (filteredByCountryData, tableId) {

    //use 'Visits' col to get all years cols name.
    var visitsYrs = filteredByCountryData.filter(function (d) {
                    return d.stat_name == "Visits";
                });
    //group years
    var groupObjByYear   =   visitsYrs.groupBy('stat_year');
    
    //Get years.
    var yrCols = getObjectPropList(groupObjByYear);
    
    //update global variable for year for use in chart
    yearRange = yrCols.sort();
    
    // And one for the quarter columns
    var groupObjByYearQtrly = visitsYrs.groupBy('datestring');

    //Get qrtly cols
    var qtrCols = getObjectPropList(groupObjByYearQtrly);

    // Add an empty column for the statistic name
    yrCols.unshift("");
    qtrCols.unshift("");

    //Get agregate status
    //var aggstats = filteredByCountryData.groupBy('stat_name');
    var aggstats = groupByKey(filteredByCountryData,'stat_name');
    
    //update 'aggstats' data into global variable for later use.
    aggstatsByName = aggstats;

    // Create the table
    var processedDatatable = document.createElement("table");
    var processedThead = document.createElement("thead");
    var processedTbody = document.createElement("tbody");

    //Format & insert yearly header row
    var yrHeaderRow = processedDatatable.insertRow(-1);
    var nYrHeaderCols = yrCols.length;

    //Insert year header rows.
    for (var k = 0; k < nYrHeaderCols ; k++) {

        var yrHeaderCell = document.createElement("th");
        yrHeaderRow.appendChild(yrHeaderCell);
        yrHeaderCell.innerHTML = yrCols[k];
        
        //set the col span for quaterly header
        var colSpanLen = groupObjByYear[yrCols[k]] != undefined ? groupObjByYear[yrCols[k]].length : 0;
        yrHeaderCell.setAttribute("colspan",colSpanLen);

    }

    processedThead.appendChild(yrHeaderRow);

    //Format & insert quarter header row
    var qtrlyHeaderRow = processedDatatable.insertRow(-1);
    var nQtrlyHeaderCols = qtrCols.length;
    

    //Insert second header rows.
    for (var l = 0; l < nQtrlyHeaderCols ; l++) {

        var qtrlyHeaderCell = document.createElement("th");
        qtrlyHeaderRow.appendChild(qtrlyHeaderCell);
        qtrlyHeaderCell.innerHTML = qtrCols[l].substr(4, 6);
    }
    processedThead.appendChild(qtrlyHeaderRow);

    var nDataRows = aggstats.length;
    
    //Insert data rows
    for (var m = 0; m < nDataRows; m++) {

        var dRow = processedTbody.insertRow(-1);
        
        var dataCell = dRow.insertCell(-1);
        dataCell.innerHTML = aggstats[m].data[0].stat_name;
        
        for (var n = 0; n < nQtrlyHeaderCols-1 ; n++) {
            var dataCell = dRow.insertCell(-1);
            dataCell.innerHTML = aggstats[m].data[n] != undefined ? aggstats[m].data[n].qtr_result :"";
        }
    }
    processedDatatable.appendChild(processedThead);
    processedDatatable.appendChild(processedTbody);

    var processedDataTableId = document.getElementById(tableId);
    processedDataTableId.innerHTML = "";
    processedDataTableId.appendChild(processedDatatable);
    
};
