import React, { useEffect, useState } from 'react'

import { Box, IconButton, makeStyles } from '@material-ui/core'
import DeckGL, { IconLayer } from 'deck.gl';
import ReactMapGL, { LinearInterpolator } from 'react-map-gl';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';

import MAKRERS from '../../assets/images/svg/markers.svg';
import HOME_MARKER from '../../assets/images/svg/home_marker.svg';
import PARKING_MARKER from '../../assets/images/svg/Parking_Marker.svg';
import ENTRANCE_MARKER from '../../assets/images/svg/Entrance_Marker.svg';
import POD_MARKER from '../../assets/images/svg/POD_pin.svg';
import VERIFIED_MARKER from '../../assets/images/svg/verified-pin.svg';

const MAP_STYLE = `${process.env.REACT_APP_MAP_STYLE_URL}`;

const GEOCODE = 'GEOCODE';
const PARKING = 'PARKING';
const SHIPMENT = 'SHIPMENT';
const GATE = 'GATE';
const PHOTO = 'PHOTO';
const VERIFIED = 'VERIFIED';

const ICON_MAPPING = {
  [GEOCODE]: { x: 0, y: 0, width: 168, height: 224, anchorY: 210 },
  [PARKING]: { x: 0, y: 0, width: 195, height: 242, anchorY: 210 },
  [GATE]: { x: 0, y: 0, width: 195, height: 242, anchorY: 210 },
  [SHIPMENT]: { x: 690, y: 220, width: 60, height: 60 },
  [PHOTO]: { x: 0, y: 0, width: 47, height: 61, anchorY: 61 },
  [VERIFIED]: { x: 0, y: 0, width: 66.667, height: 66.667, anchorY: 61 },
};

const useStyles = makeStyles((theme) => ({
  span: {
    "&:not(:last-of-type)::after": {
      content: '", "',
      marginRight: 4,
    }
  }
}))

function ShipmentPins({pins, stopInfo, isZoomOut, setIsZoomOut}) {
  if(!pins || pins.length < 1) return <Box display={'flex'} justifyContent={'center'}>No data found</Box>

  const [viewport, setViewport] = useState({ 
    zoom: 16, 
    minZoom: 8, 
    maxZoom: 20, 
    latitude: 37.7577, 
    longitude: -122.4376, 
  });
  const [layers, setLayers] = useState([]);
  const typeGeocode = pins && pins.filter(item => item.type === GEOCODE && item);
  const typeParking = pins && pins.filter((item) => item.type === PARKING && item);
  const typeGate = pins && pins.filter((item) => item.type === GATE && item);
  const typeVerified = pins && pins.filter((item) => item.type === VERIFIED && item);
  const classes = useStyles();

  useEffect(() => {
    const {longitude, latitude} = stopInfo && stopInfo.stop && stopInfo.stop.location;
    const dropoff = { latitude, longitude, type: SHIPMENT, icon: MAKRERS };
    const geocode = typeGeocode
    .map(m => ({
      ...m,
      id: GEOCODE,
      icon: HOME_MARKER,
    }));

    const parking = typeParking
    .map(m => ({
      ...m,
      id: PARKING,
      icon: PARKING_MARKER,
    }));

    const gate = typeGate
    .map(m => ({
      ...m,
      id: GATE,
      icon: ENTRANCE_MARKER,
    }));

    const verified = typeVerified
    .map(m => ({
      ...m,
      id: VERIFIED,
      icon: VERIFIED_MARKER,
    }));

    setViewport((previous) => ({ ...previous, latitude, longitude }));
    setLayers([{ ...dropoff, id: SHIPMENT, size: 40 }, ...geocode, ...parking, ...gate, ...verified].map((item) => renderMarker(item)));
  }, [pins]);

  const renderMarker = ({ id, latitude, longitude, icon, size }) => {
    return new IconLayer({
      id: id,
      data: [{ icon: id, location: [longitude, latitude], size: size || 60 }],
      pickable: true,
      iconAtlas: icon,
      iconMapping: ICON_MAPPING,
      getIcon: (d) => d.icon,
      sizeScale: 1,
      opacity: 1,
      visible: true,
      billboard: true,
      getPosition: (d) => d.location,
      getSize: (d) => d.size,
    });
  };

  const handleChangeViewport = (viewState) => {
    setViewport(viewState);
  };

  return (
    <Box position={'relative'}>
      <Box height={ isZoomOut ? 500 : 350}>
        <ReactMapGL {...viewport} mapStyle={MAP_STYLE} transitionInterpolator={new LinearInterpolator()} width="100%" height="100%" onViewportChange={handleChangeViewport}>
          <DeckGL layers={layers} viewState={viewport} />
        </ReactMapGL>
      </Box>

      {!isZoomOut && 
        <Box
          position={'absolute'} 
          left={0} 
          bottom={0}
          width={'100%'}
          display={'flex'}
          flexDirection={'column'}
          alignItems={'flex-end'}
        >
          <IconButton 
            style={{color: '#fff', border: '1px solid #acacac', borderRadius: 4, padding: 4, marginBottom: 4, backgroundColor: '#acacac', marginRight: 4}}
            onClick={() => setIsZoomOut(true)}
          >
            <ZoomOutMapIcon/>
          </IconButton>
          <Box 
            bgcolor={'#838383'} 
            p={1} 
            display={'flex'} 
            justifyContent={'center'} 
            color={'#fff'} 
            fontSize={13} 
            width={'calc(100% - 16px)'}
          >
            {typeGeocode && typeGeocode.length > 0 && <span className={classes.span}>Address ({typeGeocode.length})</span>}
            {typeParking && typeParking.length > 0 && <span className={classes.span}>Parking ({typeParking.length})</span>}
            {typeGate && typeGate.length > 0 && <span className={classes.span}>Entrance ({typeGate.length}) </span>}
            {typeVerified && typeVerified.length > 0 && <span className={classes.span}>Verified ({typeVerified.length}) </span>}
          </Box>
        </Box>
      }
    </Box>
  )
}

export default ShipmentPins