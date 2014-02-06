var lineapp = lineapp || {};

lineapp.InLineApprovePayView = lineapp.InLineApprovePayView || function(params) { return (function(params) {

    var payKey = params.payKey;
    var requests = params.requests;

    var self = new lineapp.EventHub();

    var wrapper = $("<div></div>", {"class":"lineapp_inlineapprovepayview_wrapper"});

    var uniqueId = _.uniqueId();

    $("<div class='header'></div>").appendTo(wrapper);
    $("<div class='info'></div>").html("You are about to cut "+requests.length+" people in line for a miniscule sum of:").appendTo(wrapper);
    $("<div class='amount'></div>").html("$"+(_.reduce(requests, function(memo, request){ return memo + request.amount; }, 0)/100)).appendTo(wrapper);
    
    wrapper.append($(
        '<form id="form" action="https://www.sandbox.paypal.com/webapps/adaptivepayment/flow/pay" target="PPDGFrame" class="standard">' +
        '<input type="submit" id="' + uniqueId + '">' +
        '<input id="type" type="hidden" name="expType" value="mini">' +
        '<input id="paykey" type="hidden" name="paykey" value="'+payKey+'">' +
        '</form>'));

    var embeddedPPFlow = new PAYPAL.apps.DGFlow({trigger:uniqueId});

    self.getDom = function() {
        return wrapper;
    };
    
	return self;
}(params))};
