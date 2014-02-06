var lineapp = lineapp || {};

lineapp.InLineConfigView = lineapp.InLineConfigView || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var joinTimestamp = null;

    var wrapper = $("<div></div>", {"class":"lineapp_inlineconfigview_wrapper"});

    var pos = $("<div></div>", {"class":"position"}).appendTo(wrapper);
    var timeInLine = $("<div></div>", {"class":"timeinline"}).appendTo(wrapper);
    var timeEta = $("<div></div>", {"class":"timeeta"}).appendTo(wrapper);
    var ask = $("<select></select>").appendTo(wrapper);
    var totalEarned = $("<div></div>").appendTo(wrapper);
    var leave = $("<button></button>").html("Leave").appendTo(wrapper);

    leave.on("click", function() {
        self.fireEvent("leave");
    });

    $("<option></option>", {"value":100, "html":"$1"}).appendTo(ask);
    $("<option></option>", {"value":200, "html":"$2"}).appendTo(ask);
    $("<option></option>", {"value":300, "html":"$3"}).appendTo(ask);
    $("<option></option>", {"value":400, "html":"$4"}).appendTo(ask);
    $("<option></option>", {"value":500, "html":"$5"}).appendTo(ask);
    $("<option></option>", {"value":600, "html":"$6"}).appendTo(ask);
    $("<option></option>", {"value":700, "html":"$7"}).appendTo(ask);
    $("<option></option>", {"value":800, "html":"$8"}).appendTo(ask);
    $("<option></option>", {"value":900, "html":"$9"}).appendTo(ask);

    ask.change(function() {
        self.fireEvent("setprice", {value:ask.val()});
    });

    function updateTimeInLine() {
        if (!joinTimestamp) return;

        var diff = new Date().getTime() - joinTimestamp;

        var seconds = parseInt(diff/1000);

        var hours = parseInt(seconds/60/60);
        var minutes = parseInt(seconds/60) - hours*60;
        seconds = seconds - minutes*60 - hours*60*60;

        timeInLine.html(pad(hours)+":"+pad(minutes)+":"+pad(seconds));
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
        timeEta.html(val);
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


