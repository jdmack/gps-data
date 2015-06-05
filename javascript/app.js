function stuff()
{
    var messageDiv = document.getElementById('message');
    messageDiv.innerHTML = "Hi";
    getPosition();

    $('#display-status').html("Testing");
}


function getPosition()
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



function geolocationError(error)
{
   alert("An unexpected error occurred [" + error.code + "]: " + error.message);
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
