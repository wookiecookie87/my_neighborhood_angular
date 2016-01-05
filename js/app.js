var locations = [
	{
		name : "Home",
		pos : {
			lat : 37.564359,
			lng : 127.034917
		}
	},
	{
		name : "Work",
		pos : {
			lat : 37.583654,
			lng : 127.003655
		}
	},
	{
		name : "Gym",
		pos : {
			lat : 37.582544,
			lng : 127.002459
		}
	},
	{
		name : "Lunch place",
		pos : {
			lat : 37.580489,
			lng : 127.004239
		}	
	},
	{
		name : "Changdeogung Palace",
		pos : {
			lat : 37.579151,
			lng : 126.990947
		}	
	},
	{
		name : "Library",
		pos : {
			lat : 37.580958,
			lng : 126.983066
		}	
	},
	{
		name : "Gyeongbokgung Palace",
		pos : {
			lat : 37.577952,
			lng : 126.976939
		}	
	},
	{
		name : "The Blue House",
		pos : {
			lat : 37.584856,
			lng : 126.975995
		}	
	},
]

var model = function(data){
	this.locationName = ko.observable(data.name);
	this.pos = ko.observable(data.pos);
	this.lat = ko.observable(data.pos.lat);
	this.lng = ko.observable(data.pos.lng);
	this.filter = ko.observable(true);
}

var viewModel = function(){
	var self = this;
	var list = $(".search-list ul");
	var map = null;
	var marker = null;
	var markers = [];
	var bubbles = [];
	var mapOptions = null;
	var mapCanvas = null;
	var infoWindow = null;
	var bounceTemp = null;

	var client_id = "ACNAN1F1N3130P42NEXRRCNNJAVVBETYV2PKROURK32J3JKI";
	var client_secret = "EH5EK1M2Q31IN31YE2ZX4GLRC55KXW14DLPAEDB1ZVOKROXB";

	this.getInsta = function(lat, lng, place){
		var instaUrl = "https://api.foursquare.com/v2/venues/explore?client_id="+client_id+"&client_secret="+client_secret+
						"&ll="+lat+","+lng+"&v=20151231&radius=500&section=topPicks&limit=10";
		var setData = "";

		var instaRequestTimeout = setTimeout(function(){
			alert("failed to get the resources");
		}, 3000);

		$.ajax({
			type: "GET",
			url : instaUrl,
			cache : false,
			dataType : "jsonp",
			success : function(data){
				var items = data.response.groups[0].items;
				console.log(items);
				setData += '<div id="bubble-content"><h3>'+place+'</h3><div style="height: 120px" id="reco-table">';
				setData += "<h5>Recommended Place near "+place+"</h5>";
				setData += "<table>";
				setData += "<th>Name of the Place</th><th>Address</th>";
				
				items.forEach(function(item){
					setData += "	<tr>"
					setData += "		<td>"+item.venue.name+"</td>"
					setData += "		<td>"+item.venue.location.address+"</td>"
					setData += "	</tr>"
				});
				setData += "	</table>";
				setData += "    </div></div>"
				//$("#reco-table").html(setData);
				$("#reco-table").css("height", "120px");
				$("#reco-table").css("overflow-y", "scroll");
				infoWindow.setContent(setData)

				clearTimeout(instaRequestTimeout);
			}

		});

		return infoWindow
		
	}

	this.appInit = function(){
		this.searchText = ko.observable("");
		this.locationList = ko.observableArray([]);
		locations.forEach(function(location){
			var Locations = new model(location);
			self.createMarker(Locations);
			self.locationList().push(Locations);
		});
	}

	this.mapInit = function(){
		mapCanvas = document.getElementById('map');
	   	mapOptions = {
	      center: new google.maps.LatLng(37.580489, 127.004239),
	      zoom: 12,
	      mapTypeId: google.maps.MapTypeId.ROADMAP
	    }
	    map = new google.maps.Map(mapCanvas, mapOptions);
	}

    this.clearMarkers = function(){
		for(var i = 0; i < markers.length; i++){
			markers[i].setMap(null);
		}
	}

	this.createMarker = function(location){
		var locationName = location.locationName();
		var locationPosition = location.pos();
		var lat = location.lat();
		var lng = location.lng();
		

		marker = new google.maps.Marker({
			position : locationPosition,
			map:map,
			title : locationName,
			animation: google.maps.Animation.DROP,
			draggable : true
		})

		infoWindow = new google.maps.InfoWindow();

		marker.addListener("click", function(){
			if (bounceTemp && bounceTemp.getAnimation() !== null) {
				bounceTemp.setAnimation(null);
				this.setAnimation(google.maps.Animation.BOUNCE);
				bounceTemp = this;
			} else {
				this.setAnimation(google.maps.Animation.BOUNCE);
				bounceTemp = this;
			}

			if(infoWindow)infoWindow.close();
			map.setCenter(marker.getPosition());
			self.getInsta(lat, lng, locationName);
			
			infoWindow.open(map, this);
		})

		markers.push(marker);
	}

	this.toggleBounce = function(marker) {
		if (marker.getAnimation() !== null) {
			marker.setAnimation(null);
		} else {
			marker.setAnimation(google.maps.Animation.BOUNCE);
		}
	}

	this.addBubble = function(title){
		var contentString = '<div id="bubble-content"><h3>'+title+'</h3><div id="reco-table"></div></div>';
		return new google.maps.InfoWindow({
			content : contentString
		})
	}
	
	this.filterList = function(){
		var list = self.locationList();
		var len = self.locationList().length
		var filterText = self.searchText();
		self.clearMarkers();
			for(var i = 0; i < len; i++){
				if(list[i].locationName().toLowerCase().indexOf(filterText.toLowerCase()) < 0){
					list[i].filter(false)
				}else{
					list[i].filter(true);
					self.createMarker(list[i])
				}
			}
	}

	this.showLocation = function(place){
		var clickedMarker = null;
		var clickedMap = null;
		markers.forEach(function(marker){
			if(place.locationName() == marker.title){
				clickedMarker = marker;
				clickedMap = marker.map;
			}
		});
		infoWindow.open(clickedMap, clickedMarker);
		self.getInsta(clickedMarker.position.lat(), clickedMarker.position.lng(), place.locationName());
		$("#reco-table").css("height", "120px");
		$("#reco-table").css("overflow-y", "scroll");
		//clickedMarker.setAnimation(google.maps.Animation.BOUNCE);

	}

	this.mapInit();
	this.appInit();
}



