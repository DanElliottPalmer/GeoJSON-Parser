window.GeoJSON = function(settings){
	
	google.maps.Polygon.prototype.update = 
	google.maps.Polyline.prototype.update = 
	google.maps.Marker.prototype.update = function(){
		var m = this.getMap();
		this.setMap(null);
		this.setMap(m);
	};
	
	var _versionInfo = {
			title: 'GeoJSON',
			version: '1.1',
			created: 'Dan Palmer'
		},
		tmpProperties = {},
		tmpIndex = 0;
	
	
	
	//GeoJSONObj class	->	GeoJSON Feature
	GeoJSONObj = function(){
		this.shapes = []; 									//Stores all the google shape overlays
		this.prop = {}; 									//Stores all the properties from json
		this.error = "";									//In case there is an error
		this.hide = function(){								//Hides all the shape overlays
			var a = this.shapes.length;
			while(a--){
				this.shapes[a].setMap(null);
			}
		};								
		this.show = function(){								//Shows all the shape overlays
			var a = this.shapes.length;
			while(a--){
				this.shapes[a].setMap(settings.googleMap);
			}
		};							
		this.remove = function(){							//Hides and deletes all the shape overlays
			var a = this.shapes.length;
			while(a--){
				this.shapes[a].setMap(null);
				google.maps.event.clearInstanceListeners(this.shapes[a]);
			}
			this.shapes = [];
		};
		this.getBounds = function(){
			var	s = this.shapes,
				l = s.length,
				bounds = new google.maps.LatLngBounds();
			while(l--){
				if(s[l]._GJTYPE=="polygon"){
					var pathsArray = s[l].getPaths().getArray(),
						pathsArrayLen = pathsArray.length;
					while(pathsArrayLen--){
						var pathsArrayLen2 = pathsArray[pathsArrayLen].length;
						while(pathsArrayLen2--){
							bounds.extend(new google.maps.LatLng(pathsArray[pathsArrayLen].getAt(pathsArrayLen2).lat(),pathsArray[pathsArrayLen].getAt(pathsArrayLen2).lng()));
						}
					}
				} else if(s[l]._GJTYPE=="line"){
					var pathsArray = s[l].getPath().getArray(),
						pathsArrayLen = pathsArray.length;
					while(pathsArrayLen--){
						var pathsArrayLen2 = pathsArray[pathsArrayLen].length;
						while(pathsArrayLen2--){
							bounds.extend(new google.maps.LatLng(pathsArray[pathsArrayLen].getAt(pathsArrayLen2).lat(),pathsArray[pathsArrayLen].getAt(pathsArrayLen2).lng()));
						}
					}
				} else if(s[l]._GJTYPE=="marker"){
					bounds.extend(s[l].getPosition());
				}
			}
			return bounds;
		};				
	};

	

	
	
	/////////////////////Settings//////////////////////
	//
	//
	
	settings = settings || {};															//In case user hasn't defined anything
	settings = {
		googleMap: settings.googleMap || null,										//The target map
		JSONSrc: settings.JSONSrc || {},												//The JSON src
		polygonOptionsCallback: settings.polygonOptionsCallback || function(){},		//Callback for changing polygon styles
		polygonEventsCallback: settings.polygonEventsCallback || function(){},			//Callback for adding events to polygons
		pointOptionsCallback: settings.pointOptionsCallback || function(){},			//Callback for changing point options
		pointEventsCallback: settings.pointEventsCallback || function(){},				//Callback for adding events to points
		linestringOptionsCallback: settings.linestringOptionsCallback || function(){},	//Callback for changing linestring styles
		linestringEventsCallback: settings.linestringEventsCallback || function(){},	//Callback for adding events to linestrings
		onError: settings.onError || function(index,message){							//Error callback
			alert('Error: '+message);
		}										
	};

	if(settings.googleMap===null){
		settings.onError(-1,'No map element declared');
		return {};
	}

	
	
	
	/////////////////////Recurssive parsers//////////////////////
	//
	//

	_ParseFeatureType = function(json){
		var tmpOut = [];
		if(json.hasOwnProperty('type')){
			if(json.type.toLowerCase()==="featurecollection"){
				if(json.hasOwnProperty('features')){
					var a=0,len=json.features.length;
					for(a;a<len;a++){
						tmpOut.push(_ParseFeatureType(json.features[a]));
					}
				} else {
					var tmpFeature = new GeoJSONObj();
						tmpFeature.error = "Object does not have a 'Features' property. Incorrect GeoJSON formatting.";
					settings.onError(tmpIndex,tmpFeature.error);
					tmpIndex++;
					return tmpFeature;
				}
			} else if(json.type.toLowerCase()==="feature") {
				var tmpFeature = _ParseFeature(json);
				tmpIndex++;
				return tmpFeature;
			}
		} else {
			var tmpFeature = new GeoJSONObj();
				tmpFeature.error = "Object does not have a 'Type' property. Incorrect GeoJSON formatting.";
			settings.onError(tmpIndex,tmpFeature.error);
			tmpIndex++;
			return tmpFeature;
		}
		return tmpOut;
	};
	
	_ParseFeature = function(json){
		var tmpOut = new GeoJSONObj();
		tmpOut.prop = tmpProperties = json.properties || {};
		if(json.hasOwnProperty('geometry')){
			tmpOut.shapes = _ParseGeometry(json.geometry);
		} else {
			tmpOut.error = "Object does not have a 'Geometry' property. No shape files can be created.";
			settings.onError(tmpIndex,tmpOut.error);
		}
		return tmpOut;
	};
	
	
	//Types of GeoJSON: Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon, GeometryCollection
	_ParseGeometry = function(json){
		var tmpOut = [];
		if(json.hasOwnProperty('type')){
			if(json.type.toLowerCase()==="geometrycollection"){
				var b=0,len2=json.geometries.length,geomArr = [];
				for(b;b<len2;b++){
					geomArr = geomArr.concat(_ParseGeometry(json.geometries[b]));	
				}			
				tmpOut = tmpOut.concat(geomArr);
			} else if(json.type.toLowerCase()==="point"){
				tmpOut.push(_ParsePoint(json.coordinates));
			} else if(json.type.toLowerCase()==="multipoint"){
				var b=0, len2=json.coordinates.length;
				for(b;b<len2;b++){
					tmpOut.push(_ParsePoint(json.coordinates[b]));
				}
			} else if(json.type.toLowerCase()==="linestring"){
				tmpOut.push(_ParseLineString(json.coordinates));
			} else if(json.type.toLowerCase()==="multilinestring"){
				var b=0, len2=json.coordinates.length;
				for(b;b<len2;b++){
					tmpOut.push(_ParseLineString(json.coordinates[b]));
				}
			} else if(json.type.toLowerCase()==="polygon"){
				var b=0, len2=json.coordinates.length;
				for(b;b<len2;b++){
					tmpOut.push(_ParsePolygon(json.coordinates[b]));
				}
			} else if(json.type.toLowerCase()==="multipolygon"){
				var b=0, len2=json.coordinates.length;
				for(b;b<len2;b++){
					var bb=0,bblen=json.coordinates[b].length;
					for(bb;bb<bblen;bb++){
						tmpOut.push(_ParsePolygon(json.coordinates[b][bb]));
					}
				}
			}
		}
		return tmpOut;
	};
	
	
	
	
	
	
	
	
	/////////////////////Type Parsers//////////////////////
	//
	//
	
	_ParsePoint = function(json){
		var callbackDefaults = settings.pointOptionsCallback(tmpProperties) || {};
		var defaults = {
			icon: callbackDefaults.icon || "",
			shadow: callbackDefaults.shadow || "",
			title: callbackDefaults.title || "Default"
		};
	
		var tmpPoint = new google.maps.Marker({
			map: settings.googleMap,
			position: new google.maps.LatLng(json[1],json[0]),
			icon: defaults.icon,
			shadow: defaults.shadow,
			title: defaults.title,
			_GJTYPE: 'marker'
		});
		
		settings.pointEventsCallback(tmpPoint,tmpIndex,defaults,tmpProperties);
		
		return tmpPoint;
	};
	
	_ParseLineString = function(json){
		var linestringCoords = [],
			linestringObj;
			
		var callbackDefaults = settings.linestringOptionsCallback(tmpProperties) || {};
		var defaults = {
			strokeColor: callbackDefaults.strokeColor || "#000",
			strokeOpacity: callbackDefaults.strokeOpacity || "1.0",
			strokeWeight: callbackDefaults.strokeWeight || "5"
		};
		
		var c=0,len3=json.length;
		for(c;c<len3;c++){
			linestringCoords.push(new google.maps.LatLng(json[c][1],json[c][0]));
		}
		
		linestringObj = new google.maps.Polyline({
			path: linestringCoords,
			strokeColor: defaults.strokeColor,
			strokeOpacity: defaults.strokeOpacity,
			strokeWeight: defaults.strokeWeight,
			_GJTYPE: 'line'
		});
		
		linestringObj.setMap(settings.googleMap);
		
		settings.linestringEventsCallback(linestringObj,tmpIndex,defaults,tmpProperties);
		
		return linestringObj;
		
	};
	
	_ParsePolygon = function(json){
		var polygonCoords = [],
			polygonObj;
		
		var c=0,len3=json.length;
		for(c;c<len3;c++){
			polygonCoords.push(new google.maps.LatLng(json[c][1],json[c][0]));
		}		
		
		//Styles - Defaults and callback settings
		var callbackStyles = settings.polygonOptionsCallback(tmpProperties) || {};
		var defaults = {
			strokeColor: callbackStyles.strokeColor || "#FF0000",
		    strokeOpacity: callbackStyles.strokeOpacity || 0.8,
		    strokeWeight: callbackStyles.strokeWeight || 2,
		    fillColor: callbackStyles.fillColor || "#FF0000",
		    fillOpacity: callbackStyles.fillOpacity || 0.35
		};
		

		polygonObj = new google.maps.Polygon({
			paths: polygonCoords,
			strokeColor: defaults.strokeColor,
		    strokeOpacity: defaults.strokeOpacity,
		    strokeWeight: defaults.strokeWeight,
		    fillColor: defaults.fillColor,
		    fillOpacity: defaults.fillOpacity,
		    _GJTYPE: 'polygon'
		});
		
		
		polygonObj.setMap(settings.googleMap);	
		settings.polygonEventsCallback(polygonObj,tmpIndex,defaults,tmpProperties);
		
		return polygonObj;
	};
	
	
	
	
	
	
	
	/////////////////////Initialise//////////////////////
	//
	//
	
	var outputArr = [];										//The output array storing all the GeoJSONObj
	outputArr = _ParseFeatureType(settings.JSONSrc);		//Let's get the ball rolling!
	return {
		shapes: outputArr,
		hide: function(){
			var a = this.shapes.length;
			while(a--){
				this.shapes[a].hide();
			}
		},
		show: function(){
			var a = this.shapes.length;
			while(a--){
				this.shapes[a].show();
			}
		},
		remove: function(){
			var a = this.shapes.length;
			while(a--){
				this.shapes[a].remove();
			}
			this.shapes = [];
		}
	};
	
};