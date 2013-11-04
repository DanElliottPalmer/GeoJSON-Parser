#GeoJSONParser.js

###A GeoJSON parser that works with the Google Maps API to produce polygons, linestrings and points. Loads a GeoJSON or TopoJSON.

##Methods

###GeoJSON global object

`GeoJSON.loadJSON( url, onCompleteHandler )`: Loads a url pointing at a json/topojson file. onCompleteHandler returns the object.

`GeoJSON.parse( jsonObject )`:

###GeoJsonFeature Instance

`GeoJsonFeature.shapes`
Returns an array of features relating to the GeoJSON loaded.

`GeoJsonFeature.shapes.each( iterator )`
Calls the iterator over the shapes passing the index and the google marker/polyline/polygon.  Returning false breaks the loop.

`GeoJsonFeature.addEvent( index [optional], eventName, handler )`
Adds an event to all or a google marker/polyline/polygon within the GeoJsonFeature. Return either a google event listener or array of google event listeners.

`GeoJsonFeature.contains( lat, lng )`
Checks if the GeoJsonFeature contains the passed lat,lng or Google.maps.LatLng

`GeoJsonFeature.getBounds`
Returns the bounds of the whole GeoJsonFeature

`GeoJsonFeature.getCenter`
Returns the center of the GeoJsonFeature. This is based off the bounds.

`GeoJsonFeature.getStyles( index [optional] )`
Returns the style for the specified index or returns an array of all the shapes

`GeoJsonFeature.removeEvent( listener [optional] )`
Removes all the event listeners or just the specified one

`GeoJsonFeature.setMap( map )`
Sets the map for all the GeoJsonFeature shapes

`GeoJsonFeature.setStyles( index, key, val )`
`GeoJsonFeature.setStyles( index, styleObject )`
`GeoJsonFeature.setStyles( iterator )`
`GeoJsonFeature.setStyles( styleObject )`
Sets the style of the shape(s)

`GeoJsonFeature.trigger( index [optional], eventName )`
Triggers the event for all the shapes or just the specified