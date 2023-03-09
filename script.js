import bus_times_data from "./data/bus-times.json" assert { type: "json" };
import route_links from "./data/route-map-links.json" assert { type: "json" };

let locationinfojson = {};
let currentlySelectedroute = "";
let currentlySelectedroutetype = "";
let currentlySelectedsubrouteorstop = "";
let hasNativeDarkMode = false;

let darkToggle = document.querySelector("#darkToggle");
darkToggle.addEventListener("change", () => {
	activateDarkMode();
	if (hasNativeDarkMode) {
		darkToggle.checked = !darkToggle.checked;
	}
});

function activateDarkMode() {
	document.body.classList.toggle("dark-mode");
	/* toggle the darkToggle checkbox but allow it to still be clicked */
	darkToggle.checked = !darkToggle.checked;
	hasNativeDarkMode = true;
}

window
	.matchMedia("(prefers-color-scheme: dark)")
	.addEventListener("change", (event) => {
		if (event.matches) {
			activateDarkMode();
		}
	});

function populateBox(texttopopulate) {
	// Get a reference to the box element by its id
	let box = document.getElementById("databox");
	// Clear any previous content in the box
	box.innerHTML = "";
	// Create a paragraph element to display some data
	let p = document.createElement("p");
	// Set its text content as some data from API response (you can change this as you like)
	p.textContent = texttopopulate;
	// Append it to box element as its child node
	box.appendChild(p);
}

// Define a function that reads the JSON data and populates a dropdown box
function populateDropdowns() {
	// Get a reference to the dropdown box element by its id
	let firstdropdown = document.getElementById("firstdropdown");
	// Clear any previous content in the dropdown box
	firstdropdown.innerHTML = "";
	// Loop through the JSON data and create an option element for each location
	for (let i = 0; i < Object.keys(locationinfojson).length; i++) {
		// Create an option element
		let option = document.createElement("option");
		// Set its text content as the object name
		option.textContent = Object.keys(locationinfojson)[i];
		// Append it to the dropdown box element as its child node
		firstdropdown.appendChild(option);
	}
	//set currentlySelectedroute to the first option in the dropdown
	currentlySelectedroute =
		firstdropdown.options[firstdropdown.selectedIndex].text;

	let seconddropdown = document.getElementById("seconddropdown");
	seconddropdown.innerHTML = "";

	if (
		locationinfojson[
			Object.keys(locationinfojson)[firstdropdown.selectedIndex]
		].hasOwnProperty("Subroutes")
	) {
		currentlySelectedroutetype = "Subroutes";
	}
	if (
		locationinfojson[
			Object.keys(locationinfojson)[firstdropdown.selectedIndex]
		].hasOwnProperty("Stops")
	) {
		currentlySelectedroutetype = "Stops";
	}

	for (
		let i = 0;
		i <
		Object.keys(
			locationinfojson[Object.keys(locationinfojson)[firstdropdown.selectedIndex]][
				currentlySelectedroutetype
			]
		).length;
		i++
	) {
		let option = document.createElement("option");
		option.textContent =
			locationinfojson[Object.keys(locationinfojson)[firstdropdown.selectedIndex]][
				currentlySelectedroutetype
			][i];
		seconddropdown.appendChild(option);
	}

	currentlySelectedsubrouteorstop =
		seconddropdown.options[seconddropdown.selectedIndex].text;

	document.getElementById("firstdropdown").onchange = routechangeListener;
	document.getElementById(
		"seconddropdown"
	).onchange = subrouteorstopchangeListener;
}

function subrouteorstopchangeListener() {
	console.log("subrouteorstopchangeListener");
	let seconddropdown = document.getElementById("seconddropdown");
	currentlySelectedsubrouteorstop =
		seconddropdown.options[seconddropdown.selectedIndex].text;
	console.log(currentlySelectedsubrouteorstop);
}

function routechangeListener() {
	// Get a reference to the dropdown box element by its id
	let firstdropdown = document.getElementById("firstdropdown");
	let seconddropdown = document.getElementById("seconddropdown");
	currentlySelectedroute =
		firstdropdown.options[firstdropdown.selectedIndex].text;

	console.log(currentlySelectedroute);

	if (
		locationinfojson[
			Object.keys(locationinfojson)[firstdropdown.selectedIndex]
		].hasOwnProperty("Subroutes")
	) {
		currentlySelectedroutetype = "Subroutes";
	}
	if (
		locationinfojson[
			Object.keys(locationinfojson)[firstdropdown.selectedIndex]
		].hasOwnProperty("Stops")
	) {
		currentlySelectedroutetype = "Stops";
	}

	//clear all children of seconddropdown
	while (seconddropdown.firstChild) {
		seconddropdown.removeChild(seconddropdown.firstChild);
	}

	for (
		let i = 0;
		i <
		Object.keys(
			locationinfojson[Object.keys(locationinfojson)[firstdropdown.selectedIndex]][
				currentlySelectedroutetype
			]
		).length;
		i++
	) {
		let option = document.createElement("option");
		option.textContent =
			locationinfojson[Object.keys(locationinfojson)[firstdropdown.selectedIndex]][
				currentlySelectedroutetype
			][i];
		seconddropdown.appendChild(option);
	}
	currentlySelectedsubrouteorstop =
		seconddropdown.options[seconddropdown.selectedIndex].text;
	
	

	//get map-link from locationinfojson
	let mapurl = locationinfojson[currentlySelectedroute]["map-link"];
	replaceMap(mapurl);
}

function callazureapi() {
	let url =
		"https://usc-bus-api.azurewebsites.net/api/usc-bus-api?requestType=returnTime&Route=" +
		currentlySelectedroute +
		"&" +
		currentlySelectedroutetype +
		"=" +
		currentlySelectedsubrouteorstop;
	//replace spaces from url with +
	url = url.replace(/ /g, "+");
	console.log(url);
	fetch(url)
		.then((response) => {
			// Check if the response is ok
			if (response.ok) {
				// return the response body as JSON data
				return response.json();
			} else {
				// Throw an error if the response is not ok
				throw new Error("Something went wrong");
			}
		})
		.then((data) => {
			// Do something with the JSON data
			console.log(data["response"]);
			populateBox(data["response"]);
		});
}

function populateFields() {
	console.log(locationinfojson);
	populateDropdowns();
	callazureapi()
}

window.onload = function () {
	return_locations(populateFields);
	if (
		window.matchMedia &&
		window.matchMedia("(prefers-color-scheme: dark)").matches
	) {
		activateDarkMode();
	}
};

function replaceMap(url) {
	var iframe = document.getElementById("map");
	iframe.src = url;
}

function drawPolyline(gpsCoordinates) {
  // Create a new google.maps.Polyline object
  var polyline = new google.maps.Polyline({
    // Set the path property to the array of gps coordinates
    path: gpsCoordinates,
    // Set other properties such as stroke color, weight, etc.
    strokeColor: "#FF0000",
    strokeWeight: 2,
  });

  // Add the polyline to the map
  polyline.setMap(map);
}

function return_locations(callback) {
	console.log(bus_times_data);
	var result = {};
	//bus_times_data is an array of objects
	//each object has a Route, Departure, and Destination property
	//for each object in this array run code
	bus_times_data.forEach(function (item) {
		var route = item.Route;
		// if there is no key in result with the name of the route
		if (!result.hasOwnProperty(route))
		{
			if (item.hasOwnProperty("Destination"))
			{
				result[route] = {'Subroutes': []}
			}
			else
			{
				result[route] = {'Stops': []}
			}
		}
		if (item.hasOwnProperty("Destination"))
		{
			result[route]['Subroutes'].push(item.Departure+ " to " + item.Destination);
		}
		else
		{
			result[route]['Stops'].push(item.Departure);
		}
		if (route_links.hasOwnProperty(route))
		{
			result[route]['map-link'] = route_links[route];
		}
	});
	locationinfojson = result;
	callback();
}