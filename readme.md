#GeoJSON.js
***

A GeoJSON parser that works with the Google Maps API to produce polygons,
linestrings and points. Coded so the user has more freedom with manipulating
styles and events.

##Requirements
* GeoJSON.js or GeoJSON.min.js
* Some GeoJSON data
* A page set up with a Google Map
* Some toothpaste (not really)

##Usage

1. Include GeoJSON.js in your HTML file.
        
        <script type="text/javascript" src="GeoJSON.js"></script>

2. After you have declared your map, in the script put:

        var geojsonOutput = GeoJSON({SETTINGS});
        
    But replace SETTINGS with **your** settings. It returns an object storing the shapes
    and a few methods.
    
##Settings

* `googleMap`: Your google map variable. This must be set as the shapes have no
where to go!
* `JSONSrc`: This is your geojson data. This must be stored as a JSON object.
* `polygonOptionsCallback`: This callback is called when a polygon shape needs
styling. I'll explain how these callbacks further down.
* `polygonEventsCallback`: This callback is so you can set [Google Events]
(https://developers.google.com/maps/documentation/javascript/events) to the
polygon pieces.
* `pointOptionsCallback`: Used to set styles on points
* `pointEventsCallback`: Used to set events for points
* `linestringOptionsCallback`: Used to set styles for lines
* `linestringEventsCallback`: Used to set events for lines
* `onError`: Callback for when there is an error.

##Option Callbacks

These callbacks are for when you are setting the styles for the polygon, polyline
or point. As each item has different style properties, you can only set certain styles.
Within your geojson you might have stored properties relating to the element. All option
callbacks pass these properties allowing you to use them and style accordingly. To set
the styles, you must return an object with the properties you wish to set.

###Styles
* Polygon: strokeColor, strokeOpacity, strokeWeight, fillColor and fillOpacity
* Polyline: strokeColor, strokeOpacity and strokeWeight
* Point: icon, shadow and title.

###Example
    polygonOptionsCallback: function(properties){
        var styles = {
            fillColor: '#F00'
        };
        //Change polygons so the fillcolour and strokeweight are different
        //as Dan is an awesome name.
        if(properties.Name=="Dan"){
            styles.fillColor = '#00F';
            styles.strokeWeight = 100;
        }
        return styles;
    }
##Event Callbacks

These callbacks are for when you want to add events such as click and mousemove to the
element. The events added **MUST** be [Google Events]
(https://developers.google.com/maps/documentation/javascript/events). The variables
passed to the callback function are: 

* the element
* the index of the item in the Glorious Returned Object
* the default styles
* properties that were stored in the geojson.

###Example
    polygonEventsCallback: function(elm,ind,styles,props){
        google.maps.event.addListener(elm,'click',function(){
            elm.fillColor = "#0F0";
            elm.setMap(null);
            elm.setMap(map);
        });
    }

**NOTE:** I have added an extra method to Google's polygons, polylines and markers. This method is `update()`. This basically sets the map to null then sets it back to the original map. Hopefully it can save time on updating the styles.

###Example 2
    polygonEventsCallback: function(elm,ind,styles,props){
        google.maps.event.addListener(elm,'click',function(){
            elm.fillColor = "#0F0";
            elm.update();
        });
    }
    
##The Glorious Returned Object
Once you have used `GeoJSON`, it will return an object.
 
* `shapes`: This is an array housing all the shape goodness. Each item in the array has
its own properties and methods.
* `hide`: This is a method to hide everything! Every polygon, polyline or point within
itself.
* `show`: This method shows all the bits you just hid.
* `remove`: This removes all the polygons, polylines and points.

As previously mentioned, the items within the shape array have their own properties and
methods. These are:

* `shapes`: These are the actual Google polygon/polyline/point objects.
* `prop`: The properties from the GeoJSON of this element.
* `error`: A string message explaining if there is an error with this piece? Not sure
why I put this in.
* `hide`: Hides all the pieces.
* `show`: Shows all the pieces.
* `remove`: Removes all the pieces.

##Help Me Please :)

If there are any problems feel free to message me on Git or email me - 
danelliottpalmer@gmail.com and I'll to help if I can.

Also! Look at [johan](https://github.com/johan/world.geo.json)'s geojson stash.
Absolutely amazazing!

Thank you please