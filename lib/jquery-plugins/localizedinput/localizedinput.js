/*

A jQuery localized input box plugin

Version 1.0.0

Authors:
	Yoav Amit
	Danny Leshem 

Project home:
	http://code.google.com/p/jquery-localizedinput/

License:
This source file is subject to the BSD license Available online: {@link http://www.opensource.org/licenses/bsd-license.php}
*/
openrest = openrest || {};

openrest.EditableLocalizedFieldStatic = {all:[]};

openrest.EditableLocalizedField = openrest.EditableLocalizedField || function(params) { return (function(params) {

    var self = new openrest.EventHub();

    openrest.EditableLocalizedFieldStatic.all.push(self);

    var flagsBaseUrl = "https://s3-eu-west-1.amazonaws.com/flags.images/";

    var locales = params.locales;
    var locale = params.locale;
    var input = params.input;
    var data = params.data || {};
    var placeHolder = params.placeHolder;

    var commitedData = JSON.parse(JSON.stringify(data));

    var field = null;
    var localizedDataDiv = null;

    var id = Math.random();
    input.attr("id", id);

    function changeLocale(loc)
    {
        _.each(openrest.EditableLocalizedFieldStatic.all, function(component)
        {
            component.changeLocale(loc);
        });
    }
    
    self.changeLocale = function(loc)
    {
        locale = loc;

        if (localizedDataDiv)
        {
            fillLocalizedData();
        }

        if (field)
        {
            field.val(data[loc] || "");
        }

        if ((commitedData[locale] || "").length === 0)
        {
            input.addClass("editable-empty");
            input.html(placeHolder);
        }
        else
        {
            input.removeClass("editable-empty");
            input.html(commitedData[loc]);
        }
    };

    function fillLocalizedData()
    {
        if (!localizedDataDiv) return;

        localizedDataDiv.html("");

        if (locales.length === 1) return;

        _.each(locales, function(loc) {
            var div = $("<div style='padding:5px 0px;display:table;width:500px;'>");

            if (loc === locale) div.css({"font-weight":"bold", "background":"yellow"});

            localizedDataDiv.append(div);

            var flag = $("<img style='width:15px;height:15px;padding:0px 5px;float:left' src='"+flagsBaseUrl+loc+".png"+"'>");
            div.append(flag);
            div.append($("<div style='max-width:500px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; -o-text-overflow: ellipsis;'>"+(data[loc] || "")+"</div>"));

            flag.on("mouseover", function()
            {
                changeLocale(loc);
            });
            div.on("click", function()
            {
                changeLocale(loc);
            });
        });
    }

    function setupField()
    {
        field.keyup(function(e)
        {
            data[locale] = $(this).val() || "";
            fillLocalizedData();

            self.fireEvent("keyup", e);
        });
        field.css("width", "437px");
    }

    input.on("mouseover", function() {
        init();
    });
    input.html((data[locale] || "").length === 0 ? null : data[locale]).addClass("editable-click");

    self.changeLocale(locale);

    function init() {
        input.editable({
            type:'text',
            value:(data[locale] || "").length === 0 ? null : data[locale],
            emptytext:placeHolder,
            placement:"bottom",
            validate:function() {
                var changed = false;

                for (var i in data) {
                    if (data[i] != commitedData[i]) changed = true;
                }

                commitedData = JSON.parse(JSON.stringify(data));

                if (changed) {
                    self.fireEvent("change");
                }
            }
        });
        input.editable("option", "value", (data[locale] || "").length === 0 ? null : data[locale]);
    }

    input.on("shown", function(e, editable)
    {
        field = $(".editable-input").find("input");

        setupField(field);

        localizedDataDiv = $("<div style='cursor:pointer;font-size:11px;line-height:15px' class='well'>");

        if (locales.length > 1) 
        {
            localizedDataDiv.insertAfter($(".editable-buttons"));
        }

        fillLocalizedData();

        self.fireEvent("focus");
    });

    input.on("hidden", function(e, editable)
    {
        localizedDataDiv = null;
        field = null;

        for (var i in data)
        {

            data[i] = commitedData[i];
        }

        input.html(commitedData[locale]);

        self.fireEvent("blur");
    });

    self.show = function() {
        init();
        input.editable("show");
    };

    self.focus = function(callback)
    {
        self.addEventListener("focus", callback);
    };

    self.blur = function(callback)
    {
        self.addEventListener("blur", callback);
    };

    self.keyup = function(callback)
    {
        self.addEventListener("keyup", callback);
    };

    self.change = function(callback)
    {
        self.addEventListener("change", callback);
    };

    self.val = function()
    {
        return data[locale];
    };

    self.refresh = function(params)
    {
        var _data = params.data || data;

        data = _data;
        commitedData = JSON.parse(JSON.stringify(data));

        self.changeLocale(locale);
    };

	return self;
}(params))};



