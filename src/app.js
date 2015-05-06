/**
 * CurrentCity (C) GKSoftware, 2015.
 */

var UI = require('ui');
var Vector2 = require('vector2');
var Vibe = require('ui/vibe');
var ajax = require('ajax');

var currentCity = "...";
var retryLimit = 3;

var mainWindow;
var timeText;
var locationText;
var statusText;

////////////////// FUNCTIONS

function updateStatus(status) {
	statusText.text(status);
}

function updateCity(city) {
	
	if (city != currentCity) {
		if (city == "...") {

			//
			
		} else {
			
			Vibe.vibrate('short');
			updateStatus('');
		}
		
		currentCity = city;
		locationText.text(city);
	}		
}

function downloadCityName(coords) {
	updateStatus("Getting city name...");
	
	ajax({
		url: 'http://nominatim.openstreetmap.org/reverse?format=json&lat=' + coords.latitude + '&lon=' + coords.longitude,
		type: 'json',
	}, function(json) {
		
		var city = json.address.village;
		if (json.address.town) city = json.address.town;
		if (json.address.city) city = json.address.city;
		
		updateCity(city);
		
	}, function(error) {
		
		// Retry
		retryLimit = retryLimit - 1;
		if (retryLimit > -1) {
			downloadCityName(coords);
		} else {
			retryLimit = 3;
			updateStatus('Network error');
		}
		
	});
}

function updatePosition() {
	updateStatus('Positioning...');
	
	navigator.geolocation.getCurrentPosition(
		function success(pos) {
			console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);
			downloadCityName(pos.coords);
			retryLimit = 3;
		},
		function error(err) {
			console.log('location error (' + err.code + '): ' + err.message);
			
			retryLimit = retryLimit - 1;
			if (retryLimit > -1) {
				updatePosition();
			} else {
				retryLimit = 3;
				updateStatus('Positioning failed');
			}
		},
		{
			enableHighAccuracy: false,
			maximumAge: 10000,
			timeout: 10000
		}
	);
}

////////////////// USER INTERFACE

function openMainWindow() {
	
	mainWindow = new UI.Window({
		backgroundColor: 'white',
		fullscreen: true,
		scrollable: false
	});

	timeText = new UI.TimeText({
		text: "%H:%M",
		color: 'black',
		font: 'bitham-42-bold',
		textAlign: 'center',
		backgroundColor: 'clear',
		position: new Vector2(0, 30),
		size: new Vector2(144, 50)
	});

	locationText = new UI.Text({
		text: "...",
		color: 'black',
		font: 'gothic-24-bold',
		position: new Vector2(0, 80),
		size: new Vector2(144, 50)	
	});
	
	statusText = new UI.Text({
		text: "Starting...",
		color: 'black',
		font: 'gothic-24',
		position: new Vector2(0, 120),
		size: new Vector2(144, 50)
	});

	mainWindow.add(timeText);
	mainWindow.add(locationText);
	mainWindow.add(statusText);

	mainWindow.show();
}

///////////////////// RUN

openMainWindow();
updatePosition();
