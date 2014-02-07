var lineapp = lineapp || {};

lineapp.WallAppView = lineapp.WallAppView || function(params) { return (function(params) {
    var self = new lineapp.EventHub();

    var wrapperDiv = $("<div></div>");

	self.getDom = function() {
		return wrapperDiv;
	};
	
	var names = {
		"100001715134794" : "Donald",
		"605719079" : "Danny",
		"100000020578085" : "Adi",
		"705941934" : "Yair",
		"709137690" : "Yoav"
	};
	https://graph.facebook.com//picture
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
			
			var name = names[person.clientId.id];
			var nameDiv = $("<div class=\"name\"></div>");
			nameDiv.text(name);
			personDiv.append(nameDiv);
		});
		
		var joinWrapper = $("<div class=\"joinwrapper\"></div>")
		wrapperDiv.append(joinWrapper);
		
		var joinButton = $("<div class=\"joinbutton\">GET IN LINE!</div>");
		joinWrapper.append(joinButton);
		joinButton.click(function() {
			self.fireEvent("join", {});
		});
	};

	return self;
}(params))};
