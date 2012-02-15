window.onload = function(){

	var mapElm = document.getElementById('map');
	var myOptions = {
		zoom: 3,
		center: new google.maps.LatLng(55.11608453987678,-5.09765625),
		mapTypeId:google.maps.MapTypeId.ROADMAP
	};
	
	var map = new google.maps.Map(mapElm,myOptions);

	var MapGeoJSON = GeoJSON({
		mapElement: map,
		JSONSrc: AmericaStates,
		polygonOptionsCallback: function(props){
			var styles = {
				fillColor: '#51D111',
				strokeColor: '#51D111',
				strokeWeight: 0.5
			};
			return styles;
		},
		polygonEventsCallback: function(polygonpiece,index,styles,props){
			google.maps.event.addListener(polygonpiece,'mousemove',function(){
				polygonpiece.strokeWeight = 5;
				if(props.NAME=="New York"){
					polygonpiece.fillColor = "#F00";
					polygonpiece.strokeWeight = 2;
				}
				polygonpiece.setMap(null);
				polygonpiece.setMap(map);
			});
			google.maps.event.addListener(polygonpiece,'mouseout',function(){
				polygonpiece.fillColor = styles.fillColor;
				polygonpiece.strokeWeight = styles.strokeWeight;
				polygonpiece.setMap(null);
				polygonpiece.setMap(map);
			});
			google.maps.event.addListener(polygonpiece,'click',function(){
				//MapGeoJSON[index].remove();
				alert('State is '+props.NAME);
			});
		},
		onError: function(index,message){
			alert('Error: '+message);
		}
	});

	
	/*
	setTimeout(function(){
		MapGeoJSON[3].hide();
		MapGeoJSON[10].hide();
		MapGeoJSON[7].hide();
	},5000);
	
	setTimeout(function(){
		MapGeoJSON[3].show();
		MapGeoJSON[10].show();
		MapGeoJSON[7].show();
	},7000);
	*/
};