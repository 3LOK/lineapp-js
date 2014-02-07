var lineapp = lineapp || {};

lineapp.InLinePresenter = lineapp.InLinePresenter || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var lineManagement = params.lineManagement;

    var config = new lineapp.InLineConfigPresenter({lineManagement:lineManagement});
    var line = new lineapp.InLineLinePresenter({lineManagement:lineManagement});

    var view = new lineapp.InLineView();

    view.addConfigView(config.getView());
    view.addLineView(line.getView());

    config.addEventListener("leave", function() {
        self.fireEvent("leave");
    });

    line.addEventListener("swap", function(e) {
        var theirId = e.partner;

        var myPos;
        var theirPos;

        var lines = lineManagement.getLines();

        var clientIds = {};

        _.each(lines, function(line, lineId) {
            clientIds[lineId] = []

            _.each(line, function(person, index) {

                clientIds[lineId].push(person);

                if (person.id === lineapp.Facebook.getUid()) {
                    myPos = {lineId:lineId, pos:index};
                }
                if (person.id === theirId) {
                    theirPos = {lineId:lineId, pos:index};
                }
            });
        });

        if (myPos.lineId !== theirPos.lineId) return; // Don't let swapping between lines (TODO: move to VIP?)
        if (myPos.pos < theirPos.pos) return; // Don't swap back

        var clientIds = clientIds[myPos.lineId];

        clientIds = _.first(clientIds, myPos.pos);

        if (theirPos.pos > 0) clientIds = _.rest(clientIds, theirPos.pos);

        clientIds.reverse();

        var requests = _.pluck(clientIds, "ask");
        var clientIds = _.pluck(clientIds, "clientId");

        requests = _.map(requests, function(request) {
            request = request || {};
            request.destination = "demo"+parseInt(Math.random()*100)+"@gmail.com";
            request.currency = "USD";
            request.amount = request.amount || 500;
            return request;
        });

        view.showApprovePay();

        lineapp.LineAppService.request({
            request:{
                "type":"create_payment",
                "paymentRequests":requests
            },
            callback:function(e) {
                if (e.error) {
                    alert(e.error.message);
                    return;
                }
                
                var payKey = e.value.payKey || null;

                var presenter = lineapp.InLineApprovePayPresenter({payKey:payKey, requests:requests});
                view.fillApprovePay(presenter.getView());

                presenter.addEventListener("close", function() {
                    view.closeApprovePay();
                });
                
                presenter.addEventListener("continue", function() {
                    view.closeApprovePay();
                    
                    var payDialogPresenter = new lineapp.PayDialogPresenter({
                    	payKey : payKey
                    });
                    payDialogPresenter.addEventListener("done", function(e) {
                    	var e = e || {};
                    	var status = e.status || null;

                        if (status === "success") {
                            lineManagement.performEvents([{type:"swap", 
                                                         clientId:{ns:"com.facebook", id:lineapp.Facebook.getUid()}, 
                                                         clientIds:clientIds,
                                                         payKey:payKey}]);
                        }
                    });
                });

                /*
                view.approvePayment({payKey:e.value.payKey, callback:function(response) {
                }});
               */
            }
        });

        /*

                                    */
    });

    self.close = function() {
        config.close();
        line.close();
    }

    self.getView = function() {
        return view;
    };
    
	return self;
}(params))};

var lineapp = lineapp || {};

lineapp.InLineConfigPresenter = lineapp.InLineConfigPresenter || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var lineManagement = params.lineManagement;

    var view = new lineapp.InLineConfigView();

    function update() {
        var lines = lineManagement.getLines();

        _.each(lines, function(line) {
            _.each(line, function(person, index) {

                if (person.id === lineapp.Facebook.getUid()) {

                    view.setPosition(index+1);
                    view.setTimeInLine(person.joinTimestamp);
                    view.setAsk(person.ask.amount);

                    view.setEta(1000); // TODO!
                    view.setTotalEarned(0); // TODO!

                }
            });
        });
    };

    update();

    view.addEventListener("leave", function() {
        self.fireEvent("leave");
    });

    view.addEventListener("setprice", function(e) {
        lineManagement.performEvents([{type:"set_price", 
                                     price:{destination:"yoavamit@yahoo.com", currency:"USD", amount:e.value}, 
                                     clientId:{ns:"com.facebook", id:lineapp.Facebook.getUid()}}]);
    });

    lineManagement.addEventListener("changed", update);

    self.close = function() {
        lineManagement.removeEventListener("changed", update);
        view.close();
    };

    self.getView = function() {
        return view;
    };
    
	return self;
}(params))};

lineapp.InLineLinePresenter = lineapp.InLineLinePresenter || function(params) { return (function(params) {

    var DEFAULT_PRICE = 500;

    var self = new lineapp.EventHub();

    var lineManagement = params.lineManagement;

    var view = new lineapp.InLineLineView();

    view.initLines(lineManagement.getLines());

    var onChanged = function(e) {
        var events = e.events;
        _.each(events, function(event) {
            console.log("Handling", event.type);
            switch (event.type) {
                case "join":
                    view.onJoinEvent({person:{id:event.clientId.id, clientId:event.clientId, ask:null, joinTimestamp:event.timestamp}}); 
                    break;
                case "leave":
                    view.onLeaveEvent({person:{id:event.clientId.id, clientId:event.clientId}}); 
                    break;
                case "set_price":
                    view.onSetPriceEvent({person:{id:event.clientId.id, clientId:event.clientId}, amount:event.price.amount}); 
                    break;
                case "swap":
                    view.onSwapEvent({clientId:event.clientId, clientIds:event.clientIds}); 
                    break;
            }
        });
    }

    lineManagement.addEventListener("changed", onChanged);

    view.addEventListener("swap", function(e) {
        self.fireEvent("swap", e);
    });

    self.getView = function() {
        return view;
    };

    self.close = function() {
        lineManagement.removeEventListener("changed", onChanged);
    };
    
	return self;
}(params))};
