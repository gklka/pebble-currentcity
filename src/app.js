/**
 * CurrentCity (C) GKSoftware, 2015.
 */

var UI = require('ui');
var Vector2 = require('vector2');
var Vibe = require('ui/vibe');
var ajax = require('ajax');
var Accel = require('ui/accel');

var currentCity = "...";
var retryLimit = 3;

var mainWindow;
var blackBg;
var timeText;
var locationText;
var statusText;

////////////////// FUNCTIONS

function updateStatus(status) {
	statusText.text(status);
}

function updateCity(city) {
	
	if (city == currentCity) {

		if (city == "...") {
			//
		} else {
			// Indicate that we have finished
			updateStatus('Updated');
			setTimeout(function() {
				updateStatus('');
			}, 1000);
		}

	} else {
		
		if (city == "...") {
			//
		} else {
			Vibe.vibrate('double');
			
			updateStatus('Updated');
			setTimeout(function() {
				updateStatus('');
			}, 1000);
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
//		if (json.address.postcode) city = city + " " + json.address.postcode;
		
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

			setTimeout(function() {
				updatePosition();
			}, 1000 * 60 * 15); // update in every 15 mins
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
		fullscreen: false,
		scrollable: false
	});
	
	blackBg = new UI.Rect({
		backgroundColor: 'black',
		position: new Vector2(0, 0),
		size: new Vector2(144, 100)
	});

	timeText = new UI.TimeText({
		text: "%H:%M",
		color: 'white',
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
		position: new Vector2(0, 100),
		size: new Vector2(144, 50)	
	});
	
	statusText = new UI.Text({
		text: "Starting...",
		color: 'black',
		font: 'gothic-14',
		position: new Vector2(0, 148),
		size: new Vector2(144, 20)
	});

	mainWindow.add(blackBg);
	mainWindow.add(timeText);
	mainWindow.add(locationText);
	mainWindow.add(statusText);
	
	mainWindow.on('show', function(e) {
		updatePosition();
	});
	
	mainWindow.show();
}

///////////////////// RUN

openMainWindow();

Accel.init();
Accel.on('tap', function(e) {
	console.log('Peek event!');
	updatePosition();
});
