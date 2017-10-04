/*function getJsonFromCsvDataString1(csvDataString) {

    var lines = csvDataString.split("\n");

    var result = [];

    var headers=lines[0].split(",");

    for(var i=1;i<lines.length;i++){

        var obj = {};
        var currentline=lines[i].split(",");

        for(var j=0;j<headers.length;j++){
            obj[headers[j]] = currentline[j];
        }

        result.push(obj);

    }

    return result; //JavaScript object
    //return JSON.stringify(result); //JSON
}*/

function CSVToArray(strData, strDelimiter) {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp((
        // Delimiters.
        "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
        // Quoted fields.
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
        // Standard fields.
        "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");

    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;

    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)) {

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);
        }

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[2].replace(
                new RegExp("\"\"", "g"), "\"");
        } else {

            // We found a non-quoted value.
            var strMatchedValue = arrMatches[3];
        }

        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
    }
    // Return the parsed data.
    return (arrData);
}

function getJsonFromCsvDataString(csv) {
    var array = CSVToArray(csv);
    var objArray = [];
    for (var i = 1; i < array.length; i++) {
        objArray[i - 1] = {};
        for (var k = 0; k < array[0].length && k < array[i].length; k++) {
            var key = array[0][k];
            objArray[i - 1][key] = array[i][k]
        }
    }

    var json = JSON.stringify(objArray);
    var str = json.replace(/},/g, "},\r\n");
    str = JSON.parse(str);

    return str;
}

function capitalizeWords(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function TrimQuote(inputStr) {
    return inputStr.replace (/(^")|("$)/g, '');
}

function filterArrayByCountry(arrayInput,inputCountryName) {

    //var other_stats = ["Active Therapy Starts", "LTBI Therapy Starts", "Visits"];
    var statsToDisplay = ["Active Cases Reported","Active Therapy Starts", "LTBI Therapy Starts", "Visits"];

    /*var filteredData = arrayInput.filter(function(d) {
        return (d.stat_name == "Active Cases Reported" &&
                d.pt_group == "County of Residence: Denver") ||

               ((other_stats.indexOf(d.stat_name) > -1) &&
                d.pt_group == "All Patients")

            ; });*/


    var filteredData = arrayInput.filter(function(d) {

        var country = extractCountyName(d.pt_group);

        if(!(country == "" || country == undefined) &&
            !(inputCountryName == "" || inputCountryName == undefined)){
            return country.toLowerCase() == inputCountryName.toLowerCase()
                && statsToDisplay.indexOf(d.stat_name) > -1;
        }
    });

    return filteredData;
}

//Extract county name from semi colon separated value
function extractCountyName(inputName) {

    if(!(inputName == "" || inputName == undefined)){

        //check if county name contains ':'
        if(inputName.indexOf(":") > -1){
            var tempArray = inputName.split(":");
            return tempArray[tempArray.length -1].trim();
        }else {
            return inputName;
        }
    }
}

function formatArrayAsNeeded(inputArr) {

    // Format the variables as neeeded
    inputArr.forEach(function(d) {
        d.stat_year = +d.stat_year;
        d.stat_qtr = +d.stat_qtr;
        d.datestring = d.stat_year + " QTR" + d.stat_qtr;
        d.qtr_result = +d.qtr_result;
    });

}

//group by functions on array
Array.prototype.groupBy = function(prop) {
    return this.reduce(function(groups, item) {
        var val = item[prop];
        groups[val] = groups[val] || [];
        groups[val].push(item);
        return groups;
    }, {});
}


function groupByKey(arr, key) {
    var newArr = [],
        types = {},
        newItem, i, j, cur;
    for (i = 0, j = arr.length; i < j; i++) {
        cur = arr[i];
        if (!(cur[key] in types)) {
            types[cur[key]] = {
                type: cur[key],
                data: []
            };
            newArr.push(types[cur[key]]);
        }
        types[cur[key]].data.push(cur);
    }
    return newArr;
}



function getObjectPropList(inputObj) {

    //Get years.
    var propList = [];
    for(var prop in inputObj){
        if(prop !="")
        propList.push(prop);
    }

    return propList;
}

//Round given number upto two digits.
function roundToTwo(num) {
    return +(Math.round(num + "e+2")  + "e-2");
}

//Get list of county names from input csv json object
function getCountyList(inputData,countyColName) {
    var result = inputData.groupBy(countyColName);

    var countyFullNameList = getObjectPropList(result);

    return countyFullNameList.map(function (item) {
        return extractCountyName(item);
    })
}

//populate county dropdown list
var populateCountryDropdown = function (countryList,containerId) {

    if(countryList.length > 0){

        var selectElement = document.createElement('select');
        selectElement.setAttribute('name', 'county');
        selectElement.setAttribute('id', 'county');
        selectElement.setAttribute('onchange', 'reloadChart(this)');

        countryList.forEach(function (item) {

            var optionElement = document.createElement('option');
            optionElement.appendChild(document.createTextNode(item));
            //optionElement.setAttribute('text', items[i]);
            optionElement.setAttribute('value', item);

            selectElement.appendChild(optionElement);
        })
        //create lebel for above select element

        var labelTag = document.createElement('label');
        labelTag.setAttribute('class', 'lblCounty');
        labelTag.appendChild(document.createTextNode("Select county to visualise data:"));


        var placeId = document.getElementById(containerId);
        placeId.innerHTML = "";
        placeId.appendChild(labelTag);
        placeId.appendChild(selectElement);

    }
}

