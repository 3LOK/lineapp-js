// For some reason, Titanium.API.timestamp is not implemented on Android
if (!Ti.API.timestamp) {
	Ti.API.timestamp = function(e){};
}
var jQuery = undefined;
Ti.API.timestamp("Starting to load app.js");
