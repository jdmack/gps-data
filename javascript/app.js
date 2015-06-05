
var toggleRecord = false;
var togglePlayback = false;
var readWriteFile = true;
var debugOutput = false;

var counter = 0;
var geoDataLog = "";
var geoDataArray = new Array();


/*******************************************************************************
* Function called when the Record button is clicked
*
*******************************************************************************/
function toggleRecordClick()
{
    //getGeoData();
    if(toggleRecord) {
        // Toggle Recording Off
        toggleRecord = false;
        $("#button-toggle-record").text("Start Recording");
        $("#button-toggle-playback").prop("disabled", false);
        $("#display-status").html("");
        writeGeoDataLog();
    }
    else {
        // Toggle Recording On
        toggleRecord = true;
        $("#button-toggle-record").text("Stop Recording");
        $("#button-toggle-playback").prop("disabled", true);
        $("#display-status").html("Recording");
        updateGeoData();
    }

}

/*******************************************************************************
* Function called when the Playback button is clicked
*
*******************************************************************************/
function togglePlaybackClick()
{
    if(togglePlayback) {
        // Toggle Playback Off
        togglePlayback = false;
        $("#button-toggle-playback").text("Start Playback");
        $("#button-toggle-record").prop("disabled", false);
        $("#display-status").html("");
    }
    else {
        // Toggle Playback On
        togglePlayback = true;
        $("#button-toggle-playback").text("Stop Playback");
        $("#button-toggle-record").prop("disabled", true);
        $("#display-status").html("Playback");
        dataRead = false;
        readGeoData();
        //if(debugOutput) $("#message").html("");
    }

}

/*******************************************************************************
* Displays the captured geodata in the display table.
*
*******************************************************************************/
function displayGeoData(geoData)
{
    // Display the data in the data table in the app view.
    $("#display-longitude").html(geoData.longitude);
    $("#display-latitude").html(geoData.latitude);
    $("#display-heading").html(geoData.heading + " degrees");
    $("#display-speed").html(geoData.speed + " m/s");

    // Used in testing to see each individual line of data since in testing my geodata didn't change in each collection
    var entry = geoData.timestamp + " - Longitude: " + geoData.longitude + ", Latitude: " + geoData.latitude + ", Heading: " + geoData.heading + ", Speed: " + geoData.speed;
    if(debugOutput) $("#message").append("<p>" + entry + "</p>");
}

/*******************************************************************************
* Adds a geodata record to the log variable in memory.
*
*******************************************************************************/
function recordGeoData(geoData)
{
    // Create entry string and add to log string
    var entry = geoData.timestamp + " - Longitude: " + geoData.longitude + ", Latitude: " + geoData.latitude + ", Heading: " + geoData.heading + ", Speed: " + geoData.speed + "\n";
    geoDataLog += entry;
}

/*******************************************************************************
* Turns the geodata log string into a Blob and writes it to a file.
*
*******************************************************************************/
function writeGeoDataLog()
{
    // Create blog with the log data
    var dataBlob = blackberry.utils.stringToBlob(geoDataLog, "UTF-8");

    // Create directory for the log file
    var fileDir = blackberry.io.dir.appDirs.app.storage.path + "/gps-data";
    blackberry.io.dir.createNewDir(fileDir);

    // Save log file
    blackberry.io.file.saveFile(fileDir + "/GPS_data.log", dataBlob);
}

/*******************************************************************************
* Initiates reading the geodata log, either from the file or from the memory 
* string, used in testing.
*
*******************************************************************************/
function readGeoData()
{
    if(readWriteFile) {
        // Read geodata from log file
        readGeoDataLog();
    }
    else {
        // Read geo data from memory string
        parseGeoData(geoDataLog); 
    }
}

/*******************************************************************************
* Opens the geodata log file if it exists.
*
*******************************************************************************/
function readGeoDataLog()
{
    // Get log file path and create filename
    var fileDir = blackberry.io.dir.appDirs.app.storage.path + "/gps-data";
    var filename = fileDir + "/GPS_data.log";

    // If the log file exists, open the log file and specify callback to load the data
    if(blackberry.io.file.exists(filename)) {
        blackberry.io.file.readFile(filename, loadGeoDataLog);
    }
}

/*******************************************************************************
* Callback function used when the blackberry utils opens the log file. It converts
* the blob into a string and passes it to the parse function.
*
*******************************************************************************/
function loadGeoDataLog(fullPath, dataBlob)
{
    // Populate geoDataLog with the string data from blob
    geoDataLog = blackberry.utils.blobToString(dataBlob, "UTF-8");
    parseGeoData(geoDataLog);
}

/*******************************************************************************
* Parses the geodata log string. First it splits it into the individual lines
* and then it uses regex to parse each line for the individual values. Creates
* an object and stores those objects in an array for playback.
*
*******************************************************************************/
function parseGeoData(geoDataString)
{
    if(debugOutput) $("#message").html("");
    // Split the string up around "\n"
    var entries = geoDataString.split("\n");
    if(debugOutput) $("#message").append("<p>Total Entries: " + entries.length + "</p>");

    // Regex for each entry
    var regex = /(\d+) - Longitude: (-?\d+\.\d+), Latitude: (-?\d+\.\d+), Heading: (\d+|null), Speed: (\d+|null)/;

    geoDataArray = new Array();

    // Iterate over each entry line and perform regex
    for(var i = 0; i < entries.length; ++i) {
        if(entries[i].length == 0) continue;
        var match = regex.exec(entries[i]);

        // NOTE: match[0] is the whole string
        // Create single geoData object for entry
        var geoData = {
            timestamp: match[1],
            longitude: match[2],
            latitude: match[3],
            heading: match[4],
            speed: match[5]
        };
        
        // Array containing all geoData objects for playback
        geoDataArray.push(geoData);
    }

    // Perform the playback
    playbackGeoData();
}

/*******************************************************************************
* Every 1000ms it grabs the front geodata record off the array and displays it. 
* Does 1000ms because that's how fast the values are recorded. An imporovement would
* be to use the actual timestamp data to determine how long to timeout for.
*
*******************************************************************************/
function playbackGeoData()
{
    if(togglePlayback) {
        // If there are additional geodata objects to playback
        if(geoDataArray.length > 0) {
            // Remove geoData from front of array
            var geoData = geoDataArray[0];
            geoDataArray.shift();

            // Display the data
            displayGeoData(geoData);

            // Set timeout to do this again
            setTimeout(playbackGeoData, 1000);
        }
        else {
            // No more objects to display, toggle playback off and update UI
            togglePlaybackClick();
        }
    }
}


/*******************************************************************************
* Clears the geodata log string.
*
*******************************************************************************/
function clearGeoDataLog()
{
    geoDataLog = "";
}

/*******************************************************************************
* Calls the function to get geo data from the blackberry OS and then sets a timeout
* to do the next request in 1000ms.
*
*******************************************************************************/
function updateGeoData()
{
    if(toggleRecord) {
         
        getGeoData();
        // Gathers data every 1000ms
        setTimeout(updateGeoData, 1000);
    }
}

/*******************************************************************************
* Makes a call to the blackberry API to get geodata. Provides callbacks for success
* and failure.
*
*******************************************************************************/
function getGeoData()
{
   //First test to see that the browser supports the Geolocation API
   if (navigator.geolocation !== null)
   {
      var options;
      navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError, options);
   }
   else {
      alert("No GPS data is available. Please check your phone.");
   }
}

/*******************************************************************************
* The success function for getting the geodata from blackberry. It grabs the values
* from the object blackberry returns and creates my own object to store the data.
* Then calls the functions to display the data to the app and record it in the log
* string.
*
*******************************************************************************/
function geolocationSuccess(position)
{
    //Extract information about the users current position:
    var timestamp = position.timestamp;
    var coordinates = position.coords;
    
    // Retrieve geographic information about the GPS fix:
    var latitude = coordinates.latitude;
    var longitude = coordinates.longitude;
    //var altitude = coordinates.altitude;
    //var accuracy = coordinates.accuracy;
    //var altitudeAccuracy = coordinates.altitudeAccuracy;
    var heading = coordinates.heading;
    var speed = coordinates.speed;

    var geoData = {
        timestamp: timestamp,
        latitude: latitude,
        longitude: longitude,
        heading: heading,
        speed: speed
    };
    
    displayGeoData(geoData);
    recordGeoData(geoData);
}

/*******************************************************************************
* The error function for getting the geodata from blackberry. It creates the popup
* with the error message.
*
*******************************************************************************/
function geolocationError(error)
{
   alert("An unexpected error occurred [" + error.code + "]: " + error.message);
}

