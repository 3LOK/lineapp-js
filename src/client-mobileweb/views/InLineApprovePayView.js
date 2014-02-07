var lineapp = lineapp || {};

lineapp.InLineApprovePayView = lineapp.InLineApprovePayView || function(params) { return (function(params) {

    var payKey = params.payKey;
    var requests = params.requests;

    var self = new lineapp.EventHub();

    var wrapper = $("<div></div>", {"class":"lineapp_inlineapprovepayview_wrapper"});

    $("<div class='header'></div>").appendTo(wrapper);
    $("<div class='info'></div>").html("You are about to cut "+requests.length+" people in line for a miniscule sum of:").appendTo(wrapper);
    $("<div class='amount'></div>").html("$"+(_.reduce(requests, function(memo, request){ return memo + request.amount; }, 0)/100)).appendTo(wrapper);
    $("<div class='close'></div>").appendTo(wrapper).on("click", function() {
        self.fireEvent("close", {});
    });
    
    var button = $('<input type="submit" class="submitbutton">');
    button.click(function() {
    	self.fireEvent("continue", {});
    });
    wrapper.append(button);
    
    self.getDom = function() {
        return wrapper;
    };
    
	return self;
}(params))};
