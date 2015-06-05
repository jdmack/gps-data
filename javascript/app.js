
/*
TODO
- write geoData to file
- playback data from file
*/

var toggleRecord = false;
var togglePlayback = false;
var readWriteFile = false;
var debugOutput = false;

var counter = 0;
var geoDataLog = "";
var geoDataArray = new Array();


function toggleRecordClick()
{
    //getGeoData();
    if(toggleRecord) {
        toggleRecord = false;
        $("#button-toggle-record").text("Start Recording");
        $("#button-toggle-playback").prop("disabled", false);
        $("#display-status").html("");
    }
    else {
        toggleRecord = true;
        $("#button-toggle-record").text("Stop Recording");
        $("#button-toggle-playback").prop("disabled", true);
        $("#display-status").html("Recording");
        updateGeoData();
    }

}

function togglePlaybackClick()
{
    if(togglePlayback) {
        togglePlayback = false;
        $("#button-toggle-playback").text("Start Playback");
        $("#button-toggle-record").prop("disabled", false);
        $("#display-status").html("");
    }
    else {
        togglePlayback = true;
        $("#button-toggle-playback").text("Stop Playback");
        $("#button-toggle-record").prop("disabled", true);
        $("#display-status").html("Playback");
        dataRead = false;
        readGeoData();
        //if(debugOutput) $("#message").html("");
    }

}

function displayGeoData(geoData)
{
    $("#display-longitude").html(geoData.longitude);
    $("#display-latitude").html(geoData.latitude);
    $("#display-heading").html(geoData.heading + " degrees");
    $("#display-speed").html(geoData.speed + " m/s");

    var entry = geoData.timestamp + " - Longitude: " + geoData.longitude + ", Latitude: " + geoData.latitude + ", Heading: " + geoData.heading + ", Speed: " + geoData.speed;
    if(debugOutput) $("#message").append("<p>" + entry + "</p>");
}

function recordGeoData(geoData)
{
    var entry = geoData.timestamp + " - Longitude: " + geoData.longitude + ", Latitude: " + geoData.latitude + ", Heading: " + geoData.heading + ", Speed: " + geoData.speed + "\n";
    geoDataLog += entry;
}

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

function readGeoData()
{
    if(readWriteFile) {
        readGeoDataLog();
    }
    else {
        parseGeoData(geoDataLog); 
    }
}

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

function loadGeoDataLog(fullPath, dataBlob)
{
    // Populate geoDataLog with the string data from blob
    geoDataLog = blackberry.utils.blobToString(dataBlob, "UTF-8");
    parseGeoData(geoDataLog);
}

function parseGeoData(geoDataString)
{
    if(debugOutput) $("#message").html("");
    // Split the string up around "\n"
    var entries = geoDataString.split("\n");
    if(debugOutput) $("#message").append("<p>Total Entries: " + entries.length + "</p>");

    var regex = /(\d+) - Longitude: (-?\d+\.\d+), Latitude: (-?\d+\.\d+), Heading: (\d+|null), Speed: (\d+|null)/;

    geoDataArray = new Array();

    for(var i = 0; i < entries.length; ++i) {
        if(entries[i].length == 0) continue;
        var match = regex.exec(entries[i]);

        // NOTE: match[0] is the whole string
        var geoData = {
            timestamp: match[1],
            longitude: match[2],
            latitude: match[3],
            heading: match[4],
            speed: match[5]
        };
        
        geoDataArray.push(geoData);
    }
    playbackGeoData();
}

function playbackGeoData()
{
    if(togglePlayback) {
        if(geoDataArray.length > 0) {
            var geoData = geoDataArray[0];
            geoDataArray.shift();
            displayGeoData(geoData);
            setTimeout(playbackGeoData, 1000);
        }
        else {
            togglePlaybackClick();
        }
    }
}


function clearGeoDataLog()
{
    geoDataLog = "";
}

function updateGeoData()
{
    if(toggleRecord) {
         
        getGeoData();
        setTimeout(updateGeoData, 1000);
    }
}

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

function geolocationError(error)
{
   alert("An unexpected error occurred [" + error.code + "]: " + error.message);
}

