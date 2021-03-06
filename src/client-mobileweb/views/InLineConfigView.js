var lineapp = lineapp || {};

lineapp.InLineConfigView = lineapp.InLineConfigView || function(params) { return (function(params) {

    var self = new lineapp.EventHub();
    var etatext = "elapsed time in line";
    var joinTimestamp = null;
    
    var wrapper = $("<div></div>", {"class":"lineapp_inlineconfigview_wrapper"});
    var logo = $("<div>", {"id":"logo"}).appendTo(wrapper);
    var logoimg = $("<img>",{"id": "logoimg", "src":"lineapp.png"}).appendTo(logo);
    var poscontainer = $("<div>",{"id":"poscontainer"}).appendTo(wrapper);
    var pos = $("<div>",{"id":"pos"}).appendTo(poscontainer);
    var placeInLineText = $("<div>",{"id":"placeInLineText"}).text("YOUR PLACE IN LINE").appendTo(poscontainer);
    var rightContainer = $("<div>",{"id":"rContainer"}).appendTo(wrapper);
    var eta = $("<div>", {"id":"eta"}).appendTo(rightContainer);
    var etaimg = $("<img>", {"id":"clock", "src":"clock.png"}).appendTo(eta);
    var timeInLine = $("<div>", {"id":"etatime", "class": "timeeta"}).appendTo(eta);
    var etatext = $("<div>", {"id":"etatext"}).text(etatext).appendTo(eta);
    //var timeEta = $("<div></div>", {"class":"timeeta"}).appendTo(wrapper);
    var price = $("<div>", {"id": "price"}).appendTo(rightContainer);
    var cashboximg = $("<img>", {"id": "cashboximg", "src": "cashbox-bg.png"}).appendTo(price);
    var cashbox = $("<div>", {"id":"cashbox"}).appendTo(price);
    var ask = $("<select>").appendTo(cashbox);
    for(var i=1; i<10; i++) {
    	$('<option>').text("$"+i).val(100*i).appendTo(ask);
    }
    //var timeInLine = $("<div></div>", {"class":"timeinline"}).appendTo(wrapper);
    var totalEarned = $("<div></div>").appendTo(wrapper);
    var leave = $("<div class='leave'></div>", {"id":"leave"}).appendTo(wrapper);

    leave.on("click", function() {
        self.fireEvent("leave");
    });

    ask.change(function() {
        self.fireEvent("setprice", {value:ask.val()});
    });

    function updateTimeInLine() {
        if (!joinTimestamp) return;

        var diff = new Date().getTime() - joinTimestamp;

        var seconds = parseInt(diff/1000);

        var minutes = parseInt(seconds/60);
        seconds = seconds - minutes*60;
	var val = pad(minutes)+":"+pad(seconds);
        timeInLine.html(val);
    };

    function pad(num) {
        var str = ""+num;

        if (str.length === 1) str = "0"+str;

        return str;
    }

    var internalId = setInterval(updateTimeInLine, 1000);

    self.setPosition = function(val) {
        pos.html(val);
    };

    self.setTimeInLine = function(_joinTimestamp) {
        joinTimestamp = _joinTimestamp;
        updateTimeInLine();
    };

    self.setEta = function(val) {
    };

    self.setAsk = function(val) {
        ask.val(val);
    };

    self.setTotalEarned = function(val) {
        totalEarned.val(val);
    };

    self.getDom = function() {
        return wrapper;
    };

    self.close = function() {
        clearInterval(internalId);
        intervalId = null;
    };
    
	return self;
}(params))};


