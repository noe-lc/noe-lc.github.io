var map, searchBox, markers = [];

function initMap() {
  const input = document.getElementById('pac-input');
  
  map = new google.maps.Map(document.getElementById('map'), {
    center:  { lat: 19.381290, lng: -99.128370 },
    zoom: 12
  });

  searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  searchBox.addListener('places_changed',onPlaceChanged);
  input.style.display = 'block';
};

const onPlaceChanged = () => {
  let bounds = new google.maps.LatLngBounds();
  const places = searchBox.getPlaces(); 

  if (places.length == 0) {
    return;
  }

  markers.forEach(marker=> marker.setMap(null));
  markers = [];
  const [firstPlace] = places;
  if (!firstPlace.geometry) { // solo el primer resultado
    alert("Este lugar no posee geometría");
    return;
  }

  markers.push(new google.maps.Marker({
    map: map,
    title: firstPlace.name,
    position: firstPlace.geometry.location
  }));

  if (firstPlace.geometry.viewport) {
    bounds.union(firstPlace.geometry.viewport);
    map.fitBounds(bounds);
  } else {
    map.setCenter(firstPlace.geometry.location);
  }
  
};

