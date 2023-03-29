require([
	"esri/Map",
	"esri/layers/GeoJSONLayer",
	"esri/views/MapView",
	"esri/rest/locator",
], (Map, GeoJSONLayer, MapView, locator) => {
	const url =
		"https://portal.spatial.nsw.gov.au/geoserver/liveTransport/buses/FeatureServer/0/query?f=geojson";

	//Use the Fetch API to retrieve GeoJSON data from the data source API

	fetch(
		"https://portal.spatial.nsw.gov.au/geoserver/liveTransport/buses/FeatureServer/0/query?f=geojson"
	)
		.then((response) => response.json())
		.then((data) => console.log(data));

	const renderer = {
		type: "simple",
		symbol: {
			type: "simple-marker",
			color: "#33cc33",
			outline: {
				color: "",
			},
		},
		visualVariables: [
			{
				type: "color",
				field: "vehicle.position.speed",
				stops: [
					{
						value: 0,
						color: "#ff3300",
					},
				],
			},
		],
	};

	//adding geoJson layer using the url provided

	const geojsonLayer = new GeoJSONLayer({
		url: url,
		renderer: renderer,
	});

	const map = new Map({
		basemap: "streets", //basemap can be of different types streets, satellite, topographic
		layers: [geojsonLayer],
	});

	const view = new MapView({
		container: "viewDiv",
		center: [151.52662658691406, -33.15675735473633],
		zoom: 4,
		map: map,
	});

	// Set up a locator url using the world geocoding service
	const locatorUrl =
		"https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";

	view.popup.autoOpenEnabled = false;
	view.on("click", (event) => {
		// Get the coordinates of the click on the view
		const lat = Math.round(event.mapPoint.latitude * 1000) / 1000;
		const lon = Math.round(event.mapPoint.longitude * 1000) / 1000;

		view.popup.open({
			// Set the popup's title to the coordinates of the location
			title: "Location",
			location: event.mapPoint, // Set the location of the popup to the clicked location
		});

		const params = {
			location: event.mapPoint,
		};

		// Display the popup
		// Execute a reverse geocode using the clicked location
		locator
			.locationToAddress(locatorUrl, params)
			.then((response) => {
				// If an address is successfully found, show it in the popup's content
				view.popup.content = response.address;
			})
			.catch(() => {
				// If the promise fails and no result is found, show a generic message
				view.popup.content = "No address was found for this location";
			});
	});
});
