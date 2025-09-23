mapboxgl.accessToken = mapAccessToken;

const WIDTH_MIN = 320;
const WIDTH_MAX = 1080;
const ZOOM_MIN = 1.9;
const ZOOM_MAX = 3.8;

function zoomFromWidth() {
    const w = window.innerWidth;
    const wMin = WIDTH_MIN, wMax = WIDTH_MAX;
    const zMin = ZOOM_MIN, zMax = ZOOM_MAX;
    const clamp01 = x => Math.max(0, Math.min(1, x));
    const tLog = clamp01(Math.log(w / wMin) / Math.log(wMax / wMin));
    const tLin = clamp01((w - wMin) / (wMax - wMin));

    let t;
    if (w < 600) {
        t = Math.pow(tLog, 1.35);
    } else {
        t = 0.35 * tLin + 0.65 * Math.pow(tLog, 0.95);
    }
    return zMin + t * (zMax - zMin);
}

const map = new mapboxgl.Map({
    container: 'map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/standard',
    center: [-98.5795, 39.8283],
    zoom: zoomFromWidth()
});

map.on('load', () => {
    // Add a new source from our GeoJSON data and
    // set the 'cluster' option to true. GL-JS will
    // add the point_count property to your source data.
    map.addSource('campgrounds', {
        type: 'geojson',
        generateId: true,
        data: {
            type: "FeatureCollection",
            features: allGeometries
        },
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {
            // Use step expressions (https://docs.mapbox.com/style-spec/reference/expressions/#step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                100,
                '#f1f075',
                750,
                '#f28cb1'
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                100,
                30,
                750,
                40
            ],
            'circle-emissive-strength': 1
        }
    });

    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 5,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff',
            'circle-emissive-strength': 1
        }
    });

    // inspect a cluster on click
    map.addInteraction('click-clusters', {
        type: 'click',
        target: { layerId: 'clusters' },
        handler: (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['clusters']
            });
            const clusterId = features[0].properties.cluster_id;
            map.getSource('campgrounds').getClusterExpansionZoom(
                clusterId,
                (err, zoom) => {
                    if (err) return;

                    map.easeTo({
                        center: features[0].geometry.coordinates,
                        zoom: zoom
                    });
                }
            );
        }
    });

    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    map.addInteraction('click-unclustered-point', {
        type: 'click',
        target: { layerId: 'unclustered-point' },
        handler: (e) => {
            const coordinates = e.feature.geometry.coordinates.slice();
            const title = e.feature.properties.title;
            const link = e.feature.properties.link;

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(
                    `<a href=${link}>${title}</a>`
                )
                .addTo(map);
        }
    });

    // Change the cursor to a pointer when the mouse is over a cluster of POIs.
    map.addInteraction('clusters-mouseenter', {
        type: 'mouseenter',
        target: { layerId: 'clusters' },
        handler: () => {
            map.getCanvas().style.cursor = 'pointer';
        }
    });

    // Change the cursor back to a pointer when it stops hovering over a cluster of POIs.
    map.addInteraction('clusters-mouseleave', {
        type: 'mouseleave',
        target: { layerId: 'clusters' },
        handler: () => {
            map.getCanvas().style.cursor = '';
        }
    });

    // Change the cursor to a pointer when the mouse is over an individual POI.
    map.addInteraction('unclustered-mouseenter', {
        type: 'mouseenter',
        target: { layerId: 'unclustered-point' },
        handler: () => {
            map.getCanvas().style.cursor = 'pointer';
        }
    });

    // Change the cursor back to a pointer when it stops hovering over an individual POI.
    map.addInteraction('unclustered-mouseleave', {
        type: 'mouseleave',
        target: { layerId: 'unclustered-point' },
        handler: () => {
            map.getCanvas().style.cursor = '';
        }
    });
});