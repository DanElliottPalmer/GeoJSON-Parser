(function(window){
	var gj = window.GeoJSON = {};
var defaultStyles = {
	"fillColor":"#000",
	"fillOpacity":0.5,
	"icon": "",
	"shadow": "",
	"strokeColor":"#000",
	"strokeOpacity": 1,
	"strokeWeight":2,
	"zIndex": 1
};

var httpRequest = ( window.XMLHttpRequest || ActiveXObject('Msxml2.XMLHTTP') || ActiveXObject('Microsoft.XMLHTTP') );

var parseJSON = window.JSON && window.JSON.parse || (function(){var d,b,a={'"':'"',"\\":"\\","/":"/",b:"\b",f:"\f",n:"\n",r:"\r",t:"\t"},m,k=function(n){throw {name:"SyntaxError",message:n,at:d,text:m}},g=function(n){if(n&&n!==b){k("Expected '"+n+"' instead of '"+b+"'")}b=m.charAt(d);d+=1;return b},f=function(){var o,n="";if(b==="-"){n="-";g("-")}while(b>="0"&&b<="9"){n+=b;g()}if(b==="."){n+=".";while(g()&&b>="0"&&b<="9"){n+=b}}if(b==="e"||b==="E"){n+=b;g();if(b==="-"||b==="+"){n+=b;g()}while(b>="0"&&b<="9"){n+=b;g()}}o=+n;if(!isFinite(o)){k("Bad number")}else{return o}},h=function(){var q,p,o="",n;if(b==='"'){while(g()){if(b==='"'){g();return o}if(b==="\\"){g();if(b==="u"){n=0;for(p=0;p<4;p+=1){q=parseInt(g(),16);if(!isFinite(q)){break}n=n*16+q}o+=String.fromCharCode(n)}else{if(typeof a[b]==="string"){o+=a[b]}else{break}}}else{o+=b}}}k("Bad string")},j=function(){while(b&&b<=" "){g()}},c=function(){switch(b){case"t":g("t");g("r");g("u");g("e");return true;case"f":g("f");g("a");g("l");g("s");g("e");return false;case"n":g("n");g("u");g("l");g("l");return null}k("Unexpected '"+b+"'")},l,i=function(){var n=[];if(b==="["){g("[");j();if(b==="]"){g("]");return n}while(b){n.push(l());j();if(b==="]"){g("]");return n}g(",");j()}}k("Bad array")},e=function(){var o,n={};if(b==="{"){g("{");j();if(b==="}"){g("}");return n}while(b){o=h();j();g(":");if(Object.hasOwnProperty.call(n,o)){k('Duplicate key "'+o+'"')}n[o]=l();j();if(b==="}"){g("}");return n}g(",");j()}}k("Bad object")};l=function(){j();switch(b){case"{":return e();case"[":return i();case'"':return h();case"-":return f();default:return b>="0"&&b<="9"?f():c()}};return function(q,o){var n;m=q;d=0;b=" ";n=l();j();if(b){k("Syntax error")}return typeof o==="function"?(function p(u,t){var s,r,w=u[t];if(w&&typeof w==="object"){for(s in w){if(Object.prototype.hasOwnProperty.call(w,s)){r=p(w,s);if(r!==undefined){w[s]=r}else{delete w[s]}}}}return o.call(u,t,w)}({"":n},"")):n}}());


var parsers = {
	
	"linestring": function( coordinates ){
		var i = -1,
			l = coordinates.length,
			path = new Array( l ),
			bounds = new google.maps.LatLngBounds();
		while( ++i < l ){
			path[i] = new google.maps.LatLng( coordinates[i][1], coordinates[i][0] );
			bounds.extend( path[i] );
		}
		return [
			new google.maps.Polyline({
				"path": path
			}),
			bounds
		];
	},

	"point": function( coordinates ){
		var ll = new google.maps.LatLng( coordinates[1], coordinates[0] ),
			bounds = new google.maps.LatLngBounds();
		bounds.extend(ll);
		return [
			new google.maps.Marker({
				"position": ll
			}),
			bounds
		];
	},

	"polygon": function( coordinates ){
		var i = -1,
			i2 = -1,
			l = coordinates.length,
			l2 = 0,
			path = new Array( l ),
			bounds = new google.maps.LatLngBounds();

		while( ++i < l ){
			i2 = -1;
			l2 = coordinates[i].length;
			path[i] = new Array(l2);
			while( ++i2 < l2 ){
				path[i][i2] = new google.maps.LatLng( coordinates[i][i2][1], coordinates[i][i2][0] );
				bounds.extend( path[i][i2] );
			}
		}

		//Second polygon is the cutout, for some reason we need to 
		//reverse the coordinates
		if( l===2 ){
			path[1] = path[1].reverse();
		}

		return [
			new google.maps.Polygon({
				"paths": path
			}),
			bounds
		];
	},

	//Taken from https://github.com/mbostock/topojson but with
	//a few tweaks
	"topojson": function( topojson, o ){

		function transformAbsolute(transform) {
	        if (!transform) return noop;
	        var x0,
	        y0,
	        kx = transform.scale[0],
	            ky = transform.scale[1],
	            dx = transform.translate[0],
	            dy = transform.translate[1];
	        return function(point, i) {
	            if (!i) x0 = y0 = 0;
	            point[0] = (x0 += point[0]) * kx + dx;
	            point[1] = (y0 += point[1]) * ky + dy;
	        };
	    }

		function reverse(array, n) {
			var t, j = array.length,
				i = j - n;
			while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;
		}

		function featureOrCollection(topology, o) {
			var r;

			if( o.type === "GeometryCollection" ){
				r = {
					"type": "FeatureCollection"
				};
				var l = o.geometries.length;
				r.features = new Array(l);
				while(l--){
					r.features[l] = feature(topology, o.geometries[l]);
				}
			} else {
				r = feature(topology, o);
			}

			return r;
	    }

	    function feature(topology, o) {
	        var f = {
	            type: "Feature",
	            id: o.id,
	            properties: o.properties || {},
	            geometry: object(topology, o)
	        };
	        if (o.id == null) delete f.id;
	        return f;
	    }

	    function object(topology, o) {
	        var absolute = transformAbsolute(topology.transform),
	            arcs = topology.arcs;

	        function arc(i, points) {
	            if (points.length) points.pop();
	            for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length, p; k < n; ++k) {
	                points.push(p = a[k].slice());
	                absolute(p, k);
	            }
	            if (i < 0) reverse(points, n);
	        }

	        function point(p) {
	            p = p.slice();
	            absolute(p, 0);
	            return p;
	        }

	        function line(arcs) {
	            var points = [];
	            for (var i = 0, n = arcs.length; i < n; ++i) arc(arcs[i], points);
	            if (points.length < 2) points.push(points[0].slice());
	            return points;
	        }

	        function ring(arcs) {
	            var points = line(arcs);
	            while (points.length < 4) points.push(points[0].slice());
	            return points;
	        }

	        function polygon(arcs) {
	        	var l = arcs.length;
	        	while(l--){
	        		arcs[l] = ring(arcs[l]);
	        	}
	            return arcs;
	        }

	        function geometry(o) {
	            var t = o.type,
	            	r;
	            if( t === "GeometryCollection" ){
	            	r = {
	            		"type": t
	            	};
	            	var l = o.geometries.length;
	            	r.geometries = new Array(l);
	            	while(l--){
	            		r.geometries[l] = geometry( o.geometries[l] );
	            	}
	            } else if( t in geometryType ){
	            	r = {
	            		"coordinates": geometryType[t](o),
	            		"type": t
	            	};
	            } else {
	            	r = null;
	            }

	            return r;
	        }

	        var geometryType = {
	            Point: function(o) {
	                return point(o.coordinates);
	            },
	            MultiPoint: function(o) {
	            	var l = o.coordinates.length,
	            		r = new Array(l);
	            	while(l--){
	            		r[l] = point(o.coordinates[l]);
	            	}
	            	return r;
	            },
	            LineString: function(o) {
	                return line(o.arcs);
	            },
	            MultiLineString: function(o) {
	            	var l = o.arcs.length,
	            		r = new Array(l);
	            	while(l--){
	            		r[l] = line(o.arcs[l]);
	            	}
	                return r;
	            },
	            Polygon: function(o) {
	            	var p = polygon(o.arcs);
	            	if(p.length===2){
	            		p[1] = p[1].reverse();
	            	}
	                return p;
	            },
	            MultiPolygon: function(o) {
	            	var l = o.arcs.length,
	            		r = new Array(l);
	            	while(l--){
	            		r[l] = polygon(o.arcs[l]);
	            	}
	            	return r;
	            }
	        };

	        return geometry( o );
	    }

		return featureOrCollection( topojson, o );
	}

};
gj.loadJSON = function( url , fnLoad ){

	//Create new request
	var jsonRequest = new httpRequest();

	//Readystatechange setup
	jsonRequest.onreadystatechange = function(){

		//Check states
		if( jsonRequest.readyState===4 && jsonRequest.status===200 ){
			fnLoad( parseJSON( jsonRequest.responseText ) );
		} else if( jsonRequest.readyState===4 && jsonRequest.status!==200 ){
			throw new Error( jsonRequest.status + ": " + jsonRequest.statusText );
		}

	};

	//Error setup
	jsonRequest.onerror = function(){
		jsonRequest.abort();
		throw new Error("GeoJSON.loadJSON error");
	};

	//Request setup
	jsonRequest.open( "GET", url, true );
	jsonRequest.send(null);

};


gj.parse = function( jsonObject ){

	var features;

	switch (jsonObject.type){

		case "Feature":
			features = new Array(1);
			features[0] = new GeoJsonFeature( jsonObject );
			break;

		case "FeatureCollection":
			var i = -1,
				l = jsonObject.features.length;
			features = new Array(l);
			while( ++i < l ){
				features[i] = new GeoJsonFeature( jsonObject.features[i] );
			}
			break;

		case "GeometryCollection":
			var i = -1,
				l = jsonObject.geometries.length;
			features = new Array(l);
			while( ++i < l ){
				features[i] = new GeoJsonFeature( jsonObject.geometries[i] );
			}
			break;

		case "Topology":
			/*
			 * There will probably be a better way of doing this
			 * that won't mean it has to loop twice over itself
			 * to create one shape.
			 */

			var jsonArray = [];
			for( var key in jsonObject.objects ){
				jsonArray.push( parsers.topojson(jsonObject, jsonObject.objects[key]) );
			}

			//Run through self
			features = [];
			var i = -1,
				l = jsonArray.length;
			while( ++i < l ){
				features = features.concat( gj.parse( jsonArray[i] ) );
			}
			
			break;

	}

	return features;
};
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
	//Check if geometry library has been loaded
	if( !google.maps.geometry ){
		var msg = "Google Maps geometry library as not been loaded. Please add &libraries=geometry to your script url";
		if( window.console && window.console.warn ){
			console.warn(msg);
		} else {
			alert(msg);
		}
	}

})(this);