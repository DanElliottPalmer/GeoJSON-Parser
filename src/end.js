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