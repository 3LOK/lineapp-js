var openrest = openrest || {};

openrest.MapsView = openrest.MapsView || function(params) { return (function(params) 
{
    var div = params.div;
    var mapOptions = params.mapOptions || {};
    var controlOptions = params.controlOptions || { "mapTypeIds": [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE] };
    var self = {};

    mapOptions["mapTypeId"] = mapOptions["mapTypeId"] || google.maps.MapTypeId.ROADMAP;
    
    var map = new google.maps.Map(div, mapOptions);
    map.mapTypeControlOptions = controlOptions;

    self.getNative = function()
    {
        return map;
    };

    self.setCenter = function(lat, lng, zoom)
    {
        if (map === null) return;
        map.setCenter(new google.maps.LatLng(lat, lng));
        map.setZoom(zoom);
    };

    self.createPolygon = function(params)
    {
        var polygon = params.polygon;
        var color = params.color;

        return new openrest.Polygon({map:map, polygon:polygon, color:color});
    };

    self.addMarker = function(params)
    {
        var lat = params.lat;
        var lng = params.lng;

        return new openrest.MapMarker({map:map, lat:lat, lng:lng});
    }
    
    self.refresh = function()
    {
        if (map === null) return;
        google.maps.event.trigger(map, 'resize');
    };

	return self;
}(params))};

openrest.Polygon = openrest.Polygon || function(params) { return (function(params) 
{
    var map = params.map;
    var polygon = params.polygon;
    var color = params.color;
    var self = {};

    var _polygon =  new PolygonEditor(map, polygon, color);

    self.disableEditing = function()
    {
        _polygon.disableEditing();
    };

    self.enableEditing = function()
    {
        _polygon.enableEditing();
    };

    self.latLngs = function()
    {
        return _polygon.latLngs();
    };

	return self;
}(params))};

openrest.MapMarker = openrest.MapMarker || function(params) { return (function(params) 
{
    var map = params.map;
    var lat = params.lat;
    var lng = params.lng;

    var self = {};
    var marker = new google.maps.Marker({'clickable':false, 'position':new google.maps.LatLng(lat, lng)});
    marker.setMap(map.getNative ? map.getNative() : map);

    self.remove = function()
    {
        marker.setMap(null);
    };

	return self;
}(params))};
