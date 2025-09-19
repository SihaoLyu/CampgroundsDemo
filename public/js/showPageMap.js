mapboxgl.accessToken = mapAccessToken;

const coordinates = geometry.coordinates?.length === 2 ? geometry.coordinates : [-113.5684, 37.0965];

const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 10 // starting zoom
});

new mapboxgl.Marker()
    .setLngLat(coordinates)
    .addTo(map);