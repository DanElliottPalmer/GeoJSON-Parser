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