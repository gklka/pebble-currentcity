/**
 * CurrentCity (C) GKSoftware, 2015.
 */

var UI = require('ui');
var Vector2 = require('vector2');

var main = new UI.Window({
	backgroundColor: 'white',
	fullscreen: true,
	scrollable: false
});

var timeText = new UI.TimeText({
	text: "%H:%M",
	color: 'black',
    font: 'bitham-42-bold',
	textAlign: 'center',
	backgroundColor: 'clear',
	position: new Vector2(0, 30),
	size: new Vector2(144, 50)
});

var locationText = new UI.Text({
	text: "City",
	color: 'black',
	font: 'gothic-24-bold',
	position: new Vector2(0, 80),
	size: new Vector2(144, 50)	
});

main.add(timeText);
main.add(locationText);

main.show();
