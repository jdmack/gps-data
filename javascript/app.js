
/*
TODO
- recordButton toggle text and disable
- playbackButton toggle text and disable
- display geoData in table
- write geoData to file
- playback data from file


playback: 
have each set of gps data in array, iterate through the array, get time till since last action and timeout for that length
*/

var toggleRecord = false;
var togglePlayback = false;



function toggleRecordClick()
{
    //getGeoData();
    if(toggleRecord) {
        toggleRecord = false;
        $("#button-toggle-record").text("Start Recording");
        $("#button-toggle-playback").prop("disabled", false);
    }
    else {
        toggleRecord = true;
        $("#button-toggle-record").text("Stop Recording");
        $("#button-toggle-playback").prop("disabled", true);
    }

}

function togglePlaybackClick()
{
    //getGeoData();
    if(togglePlayback) {
        togglePlayback = false;
        $("#button-toggle-playback").text("Start Playback");
        $("#button-toggle-record").prop("disabled", false);
    }
    else {
        togglePlayback = true;
        $("#button-toggle-playback").text("Stop Playback");
        $("#button-toggle-record").prop("disabled", true);
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
      alert("HTML5 geolocation is not supported.");
   }
}

function geolocationSuccess(position)
{
   //Extract information about the users current position:
   var time = position.timestamp;
   var coordinates = position.coords;

   //Retrieve geographic information about the GPS fix:
   var lat = coordinates.latitude;
   var lon = coordinates.longitude;
   var alt = coordinates.altitude;
   var acc = coordinates.accuracy;
   var altAcc = coordinates.altitudeAccuracy;
   var head = coordinates.heading;
   var speed = coordinates.speed;

   alert("You are located at " + lat + ", " + lon);
}

function geolocationError(error)
{
   alert("An unexpected error occurred [" + error.code + "]: " + error.message);
}

