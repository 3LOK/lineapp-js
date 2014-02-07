var lineapp = lineapp || {};

lineapp.WallAppView = lineapp.WallAppView || function(params) { return (function(params) {
    var self = new lineapp.EventHub();

    var wrapperDiv = $("<div></div>");

	self.getDom = function() {
		return wrapperDiv;
	};
	
	self.reset = function(lineManagement) {
		wrapperDiv.empty();
		
		var lines = lineManagement.getLines();
		
		var i = 1;
		_.each(lines.NORMAL, function(person) {
			var personDiv = $("<div class=\"person\"></div>");
			wrapperDiv.append(personDiv);
			
			var position = i++;
			var positionDiv = $("<div class=\"position\"></div>");
			positionDiv.text(position);
			personDiv.append(positionDiv);
			
			var imageUrl = "https://graph.facebook.com/" + person.clientId.id + "/picture";
			var imageDiv = $("<img src=\"" + imageUrl + "\" class=\"profile\"></img>");
			personDiv.append(imageDiv);
			
			var name = "kdgjjfdkhgfd";
			var nameDiv = $("<div class=\"name\"></div>");
			nameDiv.text(name);
			personDiv.append(nameDiv);
		});
	};

	return self;
}(params))};
