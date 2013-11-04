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