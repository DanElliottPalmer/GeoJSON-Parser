var GeoJsonFeature = function( jsonObject ){

	this.id = jsonObject.id || null;
	this.properties = jsonObject.properties || {};

	this._bounds = null;
	this._center = null;

	var g = jsonObject.geometry || jsonObject,
		matches = g.type.toLowerCase().match(/(multi)?([\w]+)/),
		parseResults;

	if( matches[1] !== undefined && matches[1] !== "" ){
		//Loop
		var i = -1,
			l = g.coordinates.length;
		this.shapes = new Array( l );
		this._bounds = new google.maps.LatLngBounds();
		while( ++i < l ){
			parseResults = parsers[ matches[2] ]( g.coordinates[i] );
			this.shapes[i] = parseResults[0];
			this._bounds.union( parseResults[1] );
		}
	} else {
		parseResults = parsers[ matches[2] ]( g.coordinates );
		this.shapes = new Array(1);
		this.shapes[0] = parseResults[0];
		this._bounds = parseResults[1];
	}

	this._center = this._bounds.getCenter();



	var that = this;
	this.shapes.each = function( fnIterator ){
		var i = -1,
			l = this.length,
			brk = false;
		while( ++i < l ){
			brk = !!fnIterator.call( that, i, this[i] );
			if(brk){
				break;
			}
		}
	};

};
GeoJsonFeature.prototype = {

	"addEvent": function( index, evt, handler ){
		var props = this.properties;

		if( arguments.length===3 ){
			var s = this.shapes[index];
			return google.maps.event.addListener( s, evt, function(e){
				handler.call( s, e, index, props );
			});
		}


		var listeners = new Array( this.shapes.length );
		this.shapes.each(function( i, s ){
			listeners[i] = google.maps.event.addListener( s, index, function(e){
				evt.call( s, e, i, props );
			} );
		});
		return listeners;
	},

	"constructor": GeoJsonFeature,

	"contains": function( lat, lng ){

		//Check if we've been given 2 points
		if( arguments.length === 2 ){
			lat = new google.maps.LatLng( lat, lng );
		}

		var inShape = false;

		this.shapes.each(function( index, shape ){

			//Check if shape is a point
			if( shape instanceof google.maps.Marker ){
				var pos = shape.getPosition();
				if( pos.lat() === lat.lat() && pos.lng() === lat.lng() ){
					inShape = true;
					return false;
				}
			}

			//Check if shape is linestring
			if( shape instanceof google.maps.Polyline ){
				if( inShape = google.maps.geometry.poly.isLocationOnEdge( lat, shape, 0.000001 ) ){
					return false;
				}
			}

			//Check if shape is polygon
			if( shape instanceof google.maps.Polygon ){
				if( inShape = google.maps.geometry.poly.containsLocation( lat, shape ) ){
					return false;
				}
			}

		});

		return inShape;

	},

	"getBounds": function(){
		return this._bounds;
	},

	"getCenter": function(){
		return this._center;
	},

	"getStyles": function( index ){

		var style, prop;

		if( index !== undefined ){
			var shape = this.shapes[index];
			style = {};

			for( prop in defaultStyles ){
				style[ prop ] = shape[prop] || defaultStyles[prop];
			}
			return style;
		}

		style = new Array( this.shapes.length );
		this.shapes.each(function( i, shape ){
			style[i] = {};
			for( prop in defaultStyles ){
				style[i][prop] = shape[prop] || defaultStyles[prop];
			}
		});

		return style;

	},

	"removeEvent": function( listener ){


		if( Object.prototype.toString.call(listener)==="[object Array]" ){
			var l = listener.length;
			while( l-- ){
				google.maps.event.removeListener( listener[l] );
			}
		} else {
			google.maps.event.removeListener(listener);
		}

	},

	"setMap": function( map ){
		var l = this.shapes.length;
		while( l-- ){
			this.shapes[l].setMap( map );
		}
	},

	"setStyles": function( index, key, val ){

		//Index, key, value
		if( arguments.length===3 ){
			var s = {};
			s[key] = val;
			this.shapes[index].setOptions(s);
			return;
		}

		//Index, style object
		if( arguments.length===2 ){
			this.shapes[index].setOptions(key);
			return;
		}

		//Function iterator
		if( typeof index === "function" ){

			var style;
			this.shapes.each(function( i, shape ){

				style = this.getStyles(i);
				style = index( this.properties, style );

				if( typeof style === "object" ){
					this.setStyles( i, style );
				}	

			});

			return;
		}

		//Styles for everything
		this.shapes.each(function( i, s ){
			s.setOptions( index );
		});

	},

	"trigger": function( index, evt ){

		if(arguments.length===2){
			google.maps.event.trigger( this.shapes[index], evt );
			return;
		}

		this.shapes.each(function(i, s){
			google.maps.event.trigger( s, evt );
		});

	}

};

gj.GeoJsonFeature = GeoJsonFeature;