var lineapp = lineapp || {};

lineapp.InLineLineView = lineapp.InLineLineView || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var peopleDivs = {};

    var wrapper = $("<div></div>", {"class":"lineapp_inlinelineview_wrapper"});

    var waitingLine = $("<div></div>", {"class":"waitingline"}).appendTo(wrapper);
    $("<div></div>", {"class":"desk"}).appendTo(waitingLine);

    var vipLine = $("<div></div>", {"class":"vipline"}).appendTo(waitingLine);
    var normalLine = $("<div></div>", {"class":"normalline"}).appendTo(waitingLine);

    var lineWidth = 55;

    self.initLines = function(lines) {
        vipLine.empty();
        normalLine.empty();
        peopleDivs = {};

        _.each(lines.VIP, function(person) {
            addVipPerson(person);
        })

        _.each(lines.NORMAL, function(person) {
            addNormalPerson(person);
        })

    };

    function addVipPerson(person) {
        lineWidth += 55;
        waitingLine.css({"width":lineWidth});

        var spot = $("<div></div>", {"class":"spotsaver"}).appendTo(vipLine);
        _.defer(function() {
            var dom = $("<div></div>", {"class":"vip"})
                .css({left:spot.position().left+5})
                .hide()
                .appendTo(vipLine)
                .fadeIn({complete:nextAnimation});
            peopleDivs[person.id] = {dom:dom, spot:spot};
        });
    }

    function addNormalPerson(person) {
        lineWidth += 55;
        waitingLine.css({"width":lineWidth});

        var spot = $("<div></div>", {"class":"spotsaver"}).appendTo(normalLine);
        _.defer(function() {
            var dom = $("<div></div>", {"class":"normal"})
                .html(person.ask)
                .css({left:spot.position().left+5})
                .hide()
                .appendTo(normalLine)
                .fadeIn({complete:nextAnimation});
            peopleDivs[person.id] = {dom:dom, spot:spot};
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

        peopleDivs[person.id].dom.html(amount);
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
        }

    }

    function onJoinEventInner(params) {
        var person = params.person;
        console.log(person);
        addNormalPerson(person);
    }

    function onLeaveEventInner(params) {
        var person = params.person;

        peopleDivs[person.id].dom.fadeOut({
            complete:function() {
                peopleDivs[person.id].dom = null;
                if (!peopleDivs[person.id].spot) {
                    delete peopleDivs[person.id];
                    lineWidth -= 55;
                    waitingLine.css({"width":lineWidth});
                    nextAnimation();
                }
            }
        });
        peopleDivs[person.id].spot.fadeOut({
            complete:function() {
                peopleDivs[person.id].spot = null;
                if (!peopleDivs[person.id].next) {
                    delete peopleDivs[person.id];
                    nextAnimation();
                }
            }
        });
    };

    self.swap = function(params) {
        var id1 = params.id1;
        var id2 = params.id2;

        var dom1 = peopleDivs[id1].dom;
        var dom2 = peopleDivs[id2].dom;

        dom1.animate({left:dom2.css("left"), duration:1000});
        dom2.animate({left:dom1.css("left"), duration:1000});
    };

    XXXX = self.swap;

    self.getDom = function() {
        return wrapper;
    };
    
	return self;
}(params))};


