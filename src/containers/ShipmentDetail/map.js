import { WebMercatorViewport } from "@deck.gl/core";
import DeckGL, { IconLayer } from 'deck.gl';
import React, { useEffect, useState } from 'react';
import ReactMapGL, { LinearInterpolator, Popup } from 'react-map-gl';
import VerifiedPinIcon from './images/map-pin1.svg';
import GeocodedPinIcon from './images/map-pin2.svg';

function map(props) {
  const {geocodedLocation, verifiedLocation, isVerified} = props
  const [viewport, setViewport] = useState({
    width: 655,
    height: 352,
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 11,
    transitionDuration: 500,
  });
  const [openGeocoded, setOpenGeocoded] = useState(false)
  const [openVerified, setOpenVerified] = useState(false)

  useEffect(() => {
    const viewportWeb = new WebMercatorViewport(viewport);
    
    const minLng = geocodedLocation.longitude < verifiedLocation.longitude ? geocodedLocation.longitude : verifiedLocation.longitude;
    const maxLng = minLng == geocodedLocation.longitude ? verifiedLocation.longitude : geocodedLocation.longitude;
    const minLat = geocodedLocation.latitude < verifiedLocation.latitude ? geocodedLocation.latitude : verifiedLocation.latitude;
    const maxLat = minLat == geocodedLocation.latitude ? verifiedLocation.latitude : geocodedLocation.latitude;
    // too small box
    const vw = maxLng -  minLng
    const vh = maxLat -  minLat
    const gapw = Math.max(vw * 0.1, 0.0004)
    const gaph = Math.max(vh * 0.1, 0.0004)
    const bbox = [
      [minLng - gapw, minLat - gaph],
      [maxLng + gapw, maxLat + gaph]
    ];
    
    let { longitude, latitude, zoom } = viewportWeb.fitBounds(bbox,{padding: 50});
    setViewport({ ...viewport, longitude, latitude, zoom, transitionDuration: 500 });
  }, [])

  const _renderPinIconLayer = () => {
    const geocodedMarker = {
      location: [geocodedLocation.longitude, geocodedLocation.latitude],
      icon: 'geocodedIcon',
    }

    const verifiedMarker = {
      location: [verifiedLocation.longitude, verifiedLocation.latitude],
      icon: 'verifiedIcon',
    }

    const geocodedIconlayer = new IconLayer({
      id: 'geocoded-icon-layer',
      data: [geocodedMarker],
      pickable: true,
      iconAtlas: GeocodedPinIcon,
      iconMapping: {geocodedIcon: {x: 0, y: 0, width: 34, height: 78}},
      getIcon: d => d.icon,
      sizeScale: 1.5,
      opacity: 1,
      visible: true,
      getPosition: d => d.location,
      getSize: d => 48,
      onHover: () => {
        setOpenGeocoded(true)
      }
    });

    const verifiedIconlayer = new IconLayer({
      id: 'verified-icon-layer',
      data: [verifiedMarker],
      pickable: true,
      iconAtlas: VerifiedPinIcon,
      iconMapping: {verifiedIcon: {x: 0, y: 0, width: 34, height: 78}},
      getIcon: d => d.icon,
      sizeScale: 1.5,
      opacity: 1,
      visible: true,
      getPosition: d => d.location,
      getSize: d => 48,
      onHover: () => {
        setOpenVerified(true)
      }
    });

    // display verified location first if this stop are verified
    if (isVerified) {
      return [geocodedIconlayer, verifiedIconlayer] 
    }

    return [geocodedIconlayer]
  }

  return (
    <ReactMapGL
      {...viewport}
      transitionInterpolator={new LinearInterpolator()}
      onViewportChange={(v) => setViewport(v)}
      mapStyle={process.env.REACT_APP_MAP_STYLE_URL}
      width={"100%"}
      height={"100%"}>
      <DeckGL viewState={viewport} layers={[..._renderPinIconLayer()]}/>
      
      {openGeocoded && (
        <Popup tipSize={5}
          anchor="bottom"
          longitude={ geocodedLocation.longitude }
          latitude={ geocodedLocation.latitude }
          offsetTop={-30}
          offsetLeft={-10}
          captureClick={true}
          closeButton={true}
          onClose={() => {setOpenGeocoded(false)}}
          className={'map-tooltip'}>
          <div style={{textAlign: 'left', fontSize: '13px', width: '140px'}}>
            <strong>Gecoded Pin</strong>
            <p style={{color: '#3d42e1', textDecoration:'underline'}}>{geocodedLocation.latitude}, {geocodedLocation.longitude}</p>
          </div>
      </Popup>
      )}

      {openVerified && (
        <Popup tipSize={5}  
          anchor="bottom"
          longitude={ verifiedLocation.longitude }
          latitude={ verifiedLocation.latitude }
          offsetTop={-30}
          offsetLeft={0}
          captureClick={true}
          closeButton={true}
          onClose={() => {setOpenVerified(false)}}
          className={'map-tooltip'}>
          <div style={{textAlign: 'left', fontSize: '13px', width: '140px'}}>
            <strong>Verified Pin</strong>
            <p style={{color: '#3d42e1', textDecoration:'underline'}}>{verifiedLocation.latitude}, {verifiedLocation.longitude}</p>
          </div>
        </Popup>
      )}
      
    </ReactMapGL>
  );
}

export default map;
