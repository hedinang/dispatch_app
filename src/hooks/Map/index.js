import polyline from '@mapbox/polyline';

export default function useMap() {
  const getJsonPolygons = (boundaries) => {
    // filter empty boundary
    const validJsonPolygons = boundaries.filter((b) => !!b)
      .map((b) => flipped(polyline.decode(b)));
    
    const geoJsonData = validJsonPolygons.map(json => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [json],
        },
      }
    })
    return geoJsonData;
  };

  const getPath = (feature) => {
    if (feature && feature.geometry && feature.geometry.coordinates) {
      console.log('data is: ', feature.geometry.coordinates);
      return polyline.encode(flipped(feature.geometry.coordinates[0]));
    }

    return "";
  }

  const flipped = (coords) => {
    var flipped = [];
    for (var i = 0; i < coords.length; i++) {
      flipped.push(coords[i].slice().reverse());
    }
    return flipped;
  }

  const toCoordinates = (boundary) => {
    if (!boundary || boundary === "") {
      return [];
    }

    try {
      return flipped(polyline.decode(boundary));
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  return {
    getJsonPolygons,
    getPath,
    flipped,
    toCoordinates
  };
}
