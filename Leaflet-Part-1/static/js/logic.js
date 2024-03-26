// queryUrl
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
  }

  // GeoJSON layer
  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      let magnitude = feature.properties.mag;
      let radius = Math.max(Math.min(magnitude, 10), 1) * 5;
      let depth = feature.geometry.coordinates[2];
      let color = getColor(depth);
      return L.circleMarker(latlng, {
        radius: radius,
        fillColor: color,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
      });
    },
    onEachFeature: onEachFeature
  });

  // earthquake layer
  createMap(earthquakes);
}

// map
function createMap(earthquakes) {
  // Base layers
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // basemaps object
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // overlay
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // map
  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Add legend
  let legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend');
    let depths = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
    let labels = [];

    // loop through our depth intervals and generate a label with a colored square for each interval
    for (let i = 0; i < depths.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
        depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(myMap);
}

// color based on depth
function getColor(depth) {
  return depth > 90 ? '#FF0000' :
         depth > 80 ? '#FF4500' :
         depth > 70 ? '#FFA500' :
         depth > 60 ? '#FFD700' :
         depth > 50 ? '#FFFF00' :
         depth > 40 ? '#ADFF2F' :
         depth > 30 ? '#32CD32' :
         depth > 20 ? '#00FF00' :
         depth > 10 ? '#00FFFF' :
                     '#0000FF';
}
