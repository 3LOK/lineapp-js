/**
 * Polygon editor for Google Maps.
 * The Google Maps v3 Javascript library and polygonEdit.js must be loaded before this library.
 *
 * @version 2-0-0 (2011-05-01)
 * @author DL
 */

///////////////////////////////////////////////////////////////////////////////

function PolygonEditor(map, latLngs, color) {
  if (latLngs.length < 3) {
    throw new Error("Invalid number of vertices: " + latLngs.length);
  }

  this.map = map;
  this.color = color;

  this.pol = undefined;
  this.editable = false;
  this.loadPolygon(latLngs);
}

PolygonEditor.prototype.loadPolygon = function(latLngs) {
    if (this.pol) {
      this.pol.stopEdit();
      this.pol.setMap(null);
    }
  
    this.pol = this.createPolygon(latLngs);
    this.pol.setMap(this.map);
    if (this.editable) {
      this.pol.runEdit();
    }
}

PolygonEditor.prototype.getPolygon = function() {
    return this.pol;
}

PolygonEditor.prototype.createPolygon = function (latLngs) {
  var gLatLngs = [];
  for (var i in latLngs) {
    var latLng = latLngs[i];
    gLatLngs.push(new google.maps.LatLng(latLng.lat, latLng.lng));
  }
  return new google.maps.Polygon({ "strokeColor": this.color, "strokeOpacity": 0.6, "strokeWeight": 2, path: gLatLngs });
}

PolygonEditor.prototype.enableEditing = function () {
  if (!this.editable) {
    this.editable = true;
    this.pol.runEdit();
  }
}

PolygonEditor.prototype.disableEditing = function () {
  if (this.editable) {
    this.editable = false;
    this.pol.stopEdit();
  }
}

PolygonEditor.prototype.latLngs = function () {
  var latLngs = [];

  var pol = this.pol;
  var path = pol.getPath();
  for (var i = 0, l = path.length; i < l; ++i) {
    var latLng = path.getAt(i);
    latLngs.push({ "lat": latLng.lat(), "lng": latLng.lng() });
  }
  return latLngs;
}
