var routeButton = $("#routeButton");
var getLocationButton = $("#getLocationButton");
var texto  = $("#texto");


// initial view: Barcelona [por que yo lo valgo ;p]
var map = L.map('map').setView([41.3904, 2.1914], 15);

//the base map:
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: ' &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors. Routes from <a href="http://project-osrm.org/">OSRM</a>',
    maxZoom: 18
}).addTo(map);
//map.attributionControl.setPrefix(''); // Don't show the 'Powered by Leaflet' text.

var carlat,carlon;
	
//retrieve values (date and car positions) from the database
var localDBlength =localStorage.length;
if (localDBlength == 0) {
	alert('Sorry, No car position available!!')
}
else {
	console.log('localDBlength: '+localDBlength)
	var lastItem = localDBlength -1 //last car position

	var itemKey = localStorage.key(lastItem);
	var values = localStorage.getItem(itemKey);
	values = values.split(";");
	var lat = values[0];
	var lon = values[1];
	var acc = values[2];
	var milliseconds = new Date(+itemKey);//convert to number
	var mes =milliseconds.getMonth()+1;
	var fecha =milliseconds.getFullYear()+'/'+mes+'/'+milliseconds.getDate()+', '+milliseconds.getHours()+':'+milliseconds.getMinutes();
	console.log(itemKey+', '+milliseconds);
	// redondear a 4 decimales
	Number.prototype.round = function(places) {
	  return +(Math.round(this + "e+" + places)  + "e-" + places);
	}
	carlat= +lat,
	carlon= +lon;
	console.log('car parked on: '+fecha+', at '+carlat.round(4)+', '+carlon.round(4));

	var carLatLng = new L.LatLng(lat, lon);
	map.setView(carLatLng, 16);
	
	// add car red marker, Extend the Default marker class
    var RedIcon = L.Icon.Default.extend({
        options: {iconUrl: 'img/marker-icon-red.png'}
    });
    var redIcon = new RedIcon();
	L.marker(carLatLng, {icon: redIcon}).addTo(map).bindPopup("<b>My car</b> should be here</br>parked on: "+fecha+"h").openPopup();

}

// find user position
function getLocation()  {
  var options = null;
  if (navigator.geolocation) {
    options={enableHighAccuracy: true, maximumAge: 3000, timeout: 30000};
	navigator.geolocation.getCurrentPosition(showPosition,getNoPosition,options);
  }
  else {
  	alert("Geolocation is not supported by this browser.");
  }
};

var mylat,mylon;

function showPosition(position) {
	mylat = position.coords.latitude;
	mylon = position.coords.longitude;
	accu= position.coords.accuracy;

	var myPosition = new L.LatLng(mylat, mylon);
	var centerlat= +lat;
	centerlat= centerlat+0.0005
	map.setView([centerlat,lon], 16);

	var distance2car= getDistanceFromLatLonInKm(mylat, mylon, carlat, carlon);

	L.marker(myPosition).addTo(map)
	.bindPopup("You are within " + distance2car.round(2) + " km from your car").openPopup();

	L.circle(myPosition, accu).addTo(map);
	routeButton.removeClass( "hide" );
	getLocationButton.addClass("hide");
	texto.addClass("hide");
}

function getNoPosition(position) {
	//map.setView([41.3905, 2.1914], 15);
	alert("Geolocation is not supported")
};

// find route with leaflet-routing-machine.js
function getRoute() {
	if (mylat == undefined) {
		getLocation();
	}

	L.Routing.control({
	    waypoints: [
	        L.latLng(mylat,mylon),
	        L.latLng(carlat,carlon)
	    ]
	}).addTo(map);
};

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

