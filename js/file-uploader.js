var reader;

function abortRead() {
    reader.abort();
}

var loadCSVData = function () {

    var progress = document.querySelector('.percent');

    function errorHandler(evt) {
        switch(evt.target.error.code) {
            case evt.target.error.NOT_FOUND_ERR:
                alert('File Not Found!');
                break;
            case evt.target.error.NOT_READABLE_ERR:
                alert('File is not readable');
                break;
            case evt.target.error.ABORT_ERR:
                break; // noop
            default:
                alert('An error occurred reading this file.');
        };
    }

    function updateProgress(evt) {
        // evt is an ProgressEvent.
        if (evt.lengthComputable) {
            var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
            // Increase the progress bar length.
            if (percentLoaded < 100) {
                progress.style.width = percentLoaded + '%';
                progress.textContent = percentLoaded + '%';
            }
        }
    }

    function handleFileSelect(evt) {

        // Check for the various File API support.
        if (window.File && window.FileReader && window.FileList && window.Blob) {


            var fileUpload = document.getElementById('files');
            var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.csv|.txt)$/;

            //Check for valid csv file
            if (regex.test(fileUpload.value.toLowerCase())) {

                // Reset progress indicator on new file selection.
                progress.style.width = '0%';
                progress.textContent = '0%';

                reader = new FileReader();
                reader.onerror = errorHandler;
                reader.onprogress = updateProgress;

                reader.onabort = function(e) {
                    alert('File read cancelled');
                };
                reader.onloadstart = function(e) {
                    document.getElementById('progress_bar').className = 'loading';
                    document.getElementById('cancel-read').className = 'display';
                    //document.getElementById('load-div').className = 'modal';
                };
                reader.onload = function(e) {
                    //hide cancel read button
                    document.getElementById('cancel-read').className = 'hide';
                    //document.getElementById('load-div').className = 'hide';

                    // Ensure that the progress bar displays 100% at the end.
                    progress.style.width = '100%';
                    progress.textContent = '100%';
                    setTimeout("document.getElementById('progress_bar').className='';", 2000);

                    //update global variable to store raw data from csv.
                    rawCSVData = e.target.result;

                    //get json object from input raw csv data
                    rawJsonObject = getJsonFromCsvDataString(rawCSVData);

                    //display uploaded raw csv data into table
                    showRawCSVDataTable('container-raw-table');

                    //Get coutry list & populate into drop down
                    var countryList = getCountyList(rawJsonObject,'pt_group');
                    populateCountryDropdown(countryList,'container-county-list');

                    //show processed data into table & charts
                    loadAllChartsAndProcessedTables();

                }

                reader.readAsText(evt.target.files[0]);

            }else {
                alert("Please upload a valid CSV file.");
            }

        } else {
            alert('The File APIs are not fully supported in this browser.');
        }
    }

    document.getElementById('files').addEventListener('change', handleFileSelect, false);

}
