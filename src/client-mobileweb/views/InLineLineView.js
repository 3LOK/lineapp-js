var lineapp = lineapp || {};

lineapp.InLineLineView = lineapp.InLineLineView || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var peopleDivs = {};

    var wrapper = $("<div></div>", {"class":"lineapp_inlinelineview_wrapper"});

    var waitingLine = $("<div></div>", {"class":"waitingline"}).appendTo(wrapper);
    $("<div></div>", {"class":"desk"}).appendTo(waitingLine);

    var vipLine = $("<div></div>", {"class":"vipline"}).appendTo(waitingLine);
    var normalLine = $("<div></div>", {"class":"normalline"}).appendTo(waitingLine);

    var CREATOR_WIDTH_AND_MARGIN = 78;

    var lineWidth = CREATOR_WIDTH_AND_MARGIN;

    self.initLines = function(lines) {
        vipLine.empty();
        normalLine.empty();
        peopleDivs = {};

        _.each(lines.VIP, function(person) {
            addPerson(person, vipLine);
        })

        _.each(lines.NORMAL, function(person) {
            addPerson(person, normalLine);
        })

    };

    function addPerson(person, line) {
        lineWidth += CREATOR_WIDTH_AND_MARGIN;
        waitingLine.css({"width":lineWidth});

        var spot = $("<div></div>", {"class":"spotsaver"}).appendTo(line);
        _.defer(function() {
            var dom = $("<div></div>", {"class":"person"})
                .css({left:spot.position().left+5})
                .hide()
                .appendTo(line)
                .fadeIn({complete:nextAnimation});

            var face = $("<img />", {"class":"face"}).appendTo(dom);
            face.attr("src", "http://graph.facebook.com/"+person.id+"/picture?type=square");

            var ask = $("<div></div>", {"class":"info"}).html(person.ask).appendTo(dom);

            dom.addClass("creature"+((person.id % 3) +1));

            peopleDivs[person.id] = {dom:dom, spot:spot, ask:ask};

            if (person.id !== lineapp.Facebook.getUid()) {
                dom.on("click", function() {
                    self.fireEvent("swap", {partner:person.id});
                });
            }
        });
    }

    self.onJoinEvent = function(params) {
        addAnimation({type:"join", params:params})
    };

    self.onLeaveEvent = function(params) {
        addAnimation({type:"leave", params:params})
    };

    self.onSetPriceEvent = function(params) {
        var person = params.person;
        var amount = params.amount;

        peopleDivs[person.id].ask.html(amount);
    };

    self.onSwapEvent = function(params) {
        var clientId = params.clientId;
        var clientIds = params.clientIds;

        _.each(clientIds, function(otherId) {
            addAnimation({"type":"swap", params:{clientId1:clientId, clientId2:otherId}});
        });
    };

    var animations = [];
    var inAnimations = false;

    function addAnimation(params) {
        animations.push(params);
        if (!inAnimations) {
            nextAnimation();
        }
    }

    function nextAnimation() {
        if (animations.length === 0) {
            inAnimations = false;
            return;
        }

        inAnimations = true;

        var topAnimation = animations.shift();

        console.log("Animating", topAnimation.type);

        switch(topAnimation.type) {
            case "join":
                onJoinEventInner(topAnimation.params);
            break;
            case "leave":
                onLeaveEventInner(topAnimation.params);
            break;
            case "set_price":
                // Nothing to do, set price is not animated
            break;
            case "swap":
                onSwapEventInner(topAnimation.params);
            break;
        }

    }

    function onJoinEventInner(params) {
        var person = params.person;
        console.log(person);
        addPerson(person, normalLine);
    }

    function onLeaveEventInner(params) {
        var person = params.person;

        var startLeft = parseInt(peopleDivs[person.id].dom.css("left"));
        console.log(startLeft);

        var numAnimations = 0;

        function onAnimationDone() {
            numAnimations--;
            if (numAnimations <= 0) {
                peopleDivs[person.id].dom.remove();
                peopleDivs[person.id].spot.remove();
                delete peopleDivs[person.id];
                lineWidth -= CREATOR_WIDTH_AND_MARGIN;
                waitingLine.css({"width":lineWidth});
                nextAnimation();
            }
        }

        _.each(peopleDivs, function(personDiv) {
            var left = parseInt(personDiv.dom.css("left"));

            if (left > startLeft) {
                numAnimations++;
                personDiv.dom.animate({left:left-CREATOR_WIDTH_AND_MARGIN}, onAnimationDone)
            }
        });

        numAnimations++;
        peopleDivs[person.id].dom.fadeOut({complete:onAnimationDone});
        numAnimations++;
        peopleDivs[person.id].spot.fadeOut({complete:onAnimationDone});
    };

    function onSwapEventInner(params) {
        var clientId1 = params.clientId1;
        var clientId2 = params.clientId2;

        var dom1 = peopleDivs[clientId1.id].dom;
        var dom2 = peopleDivs[clientId2.id].dom;

        var completed = 0;

        dom1.animate({left:dom2.css("left"), duration:1000}, function() {
            completed++;
            if (completed === 2) nextAnimation();
        });
        dom2.animate({left:dom1.css("left"), duration:1000}, function() {
            completed++;
            if (completed === 2) nextAnimation();
        });
    };

    self.getDom = function() {
        return wrapper;
    };
    
	return self;
}(params))};


