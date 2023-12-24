import React, { useEffect, useState } from 'react';

import { get, cloneDeep } from 'lodash';
import { Box, Divider } from '@material-ui/core';
import clsx from 'clsx';
import DeckGL, { IconLayer } from 'deck.gl';
import ReactMapGL, { LinearInterpolator } from 'react-map-gl';

import { ADDRESS_NOT_ACCESSIBLE, APARTMENT_COMPLEX, COMMERCIAL_BUILDING } from '../../constants/common';
import { useStyles } from './styleLocationPin';
import MAKRERS from '../../assets/images/svg/markers.svg';
import HOME_MARKER from '../../assets/images/svg/home_marker.svg';
import PARKING_MARKER from '../../assets/images/svg/Parking_Marker.svg';
import ENTRANCE_MARKER from '../../assets/images/svg/Entrance_Marker.svg';
import PARKING_DISABLED_MARKER from '../../assets/images/svg/Parking_Marker_Gray.svg';
import ENTRANCE_DISABLED_MARKER from '../../assets/images/svg/Entrance_Marker_Gray.svg';
import POD_MARKER from '../../assets/images/svg/POD_pin.svg';
import AxlTabList from '../../components/AxlTabList';
import colors from '../../themes/colors';

const MAP_STYLE = `${process.env.REACT_APP_MAP_STYLE_URL}`;

const GEOCODE = 'GEOCODE';
const PARKING = 'PARKING';
const SHIPMENT = 'SHIPMENT';
const GATE = 'GATE';
const CURRENT_LOCATION = 'CURRENT_LOCATION';
const PARKING_DISABLED = 'PARKING_DISABLED';
const GATE_DISABLED = 'GATE_DISABLED';
const PHOTO = 'PHOTO';

const ICON_MAPPING = {
  [GEOCODE]: { x: 0, y: 0, width: 168, height: 224, anchorY: 210 },
  [PARKING]: { x: 0, y: 0, width: 195, height: 242, anchorY: 210 },
  [GATE]: { x: 0, y: 0, width: 195, height: 242, anchorY: 210 },
  [SHIPMENT]: { x: 690, y: 220, width: 60, height: 60 },
  [CURRENT_LOCATION]: { x: 530, y: 220, width: 60, height: 60 },
  [PARKING_DISABLED]: { x: 0, y: 0, width: 195, height: 242, anchorY: 210 },
  [GATE_DISABLED]: { x: 0, y: 0, width: 195, height: 242, anchorY: 210 },
  [PHOTO]: { x: 0, y: 0, width: 47, height: 61, anchorY: 61 },
};

function LocationPin({ shipmentAddressInfo, selectedStop }) {
  const classes = useStyles();
  const [pins, setPins] = useState([]);
  const [selectedPin, setSelectedPin] = useState(GEOCODE);
  const [excludedPins, setExcludedPins] = useState([]);
  const [viewport, setViewport] = useState({ 
    zoom: 16, 
    minZoom: 8, 
    maxZoom: 20, 
    latitude: 37.7577, 
    longitude: -122.4376, 
  });
  const locations = get(shipmentAddressInfo, 'customer_locations');
  const location = get(shipmentAddressInfo, 'customer_main_location');
  const infoImages = selectedStop && selectedStop.info && selectedStop.info.images 
  && selectedStop.info.images.filter(im => im.geolocation && im.geolocation.latitude && im.geolocation.longitude);
  const [layers, setLayers] = useState([]);
  const [tabs, setTabs] = useState([]);
  const latitude = get(location, 'latitude');
  const longitude = get(location, 'longitude');
    
  useEffect(() => {
    const dropoff = { latitude, longitude, type: SHIPMENT, icon: MAKRERS };
    const geocode = locations && locations.find((address) => address.type === GEOCODE);
    const parking = locations && locations.find((address) => address.type === PARKING);
    const gate = locations && locations.find((address) => address.type === GATE);

    const geocodePin = geocode ? { ...geocode, icon: HOME_MARKER } : { latitude, longitude, type: GEOCODE, icon: HOME_MARKER };
    const parkingPin = parking ? { ...parking, icon: PARKING_MARKER } : { latitude, longitude, type: PARKING, icon: PARKING_DISABLED_MARKER };
    const gatePin = gate ? { ...gate, icon: ENTRANCE_MARKER } : { latitude, longitude, type: GATE, icon: ENTRANCE_DISABLED_MARKER };
    
    const convertPOD = infoImages && infoImages.length > 0 ? infoImages.map(im => ({
      latitude: im.geolocation && im.geolocation.latitude,
      longitude: im.geolocation && im.geolocation.longitude,
      icon: POD_MARKER,
      id: PHOTO,
      type: PHOTO,
    })) : [];

    const ignorePins = [];
    if (!gate) ignorePins.push(GATE);
    if (!parking) ignorePins.push(PARKING);

    setPins([
      { ...dropoff, id: SHIPMENT, size: 40 },
      { ...geocodePin, id: GEOCODE },
      { ...parkingPin, id: PARKING },
      { ...gatePin, id: GATE },
      ...convertPOD,
    ]);
    if (latitude && longitude && !tabs.some(tab => tab.value === GEOCODE)) {
      setTabs(prev => [
        { 
          label: 'Address Pin', 
          value: GEOCODE, 
          tabPanelComponent: null, 
          confirm: 'Confirm Address Pin' 
        },
        { 
          label: 'Entrance Pin', 
          value: GATE, 
          tabPanelComponent: null, 
          exclude_value: GATE
        },
        ...prev,
      ])
      setViewport((previous) => ({ ...previous, latitude, longitude }));
      setLayers([
        { ...dropoff, id: SHIPMENT, size: 40 },
        { ...geocodePin, id: GEOCODE }].map((item) => renderMarker(item)))
    }
    else {
      setSelectedPin(PHOTO);
      if (convertPOD && convertPOD.length > 0) {
        setLayers(convertPOD.filter((p) => p && p.id === PHOTO).map((item) => renderMarker(item)));
        setViewport((previous) => ({ ...previous, latitude: convertPOD[0].latitude, longitude: convertPOD[0].longitude }));
      }
    }
    setExcludedPins(ignorePins);
  }, [locations, location]);

  const addressType = get(shipmentAddressInfo, 'recipient_questionnaire.address_type');
  const haveParking = [APARTMENT_COMPLEX, COMMERCIAL_BUILDING].includes(addressType);
  const hasPOD = infoImages && infoImages.length > 0;

  if (haveParking && latitude && longitude && !tabs.some(tab => tab.value === PARKING)) tabs.push({ 
    label: 'Parking Pin', 
    value: PARKING, 
    tabPanelComponent: null,  
    exclude_value: PARKING 
  });

  if (hasPOD && !tabs.some(tab => tab.value === PHOTO)) tabs.push({ 
    label: `Photo Pin (${infoImages && infoImages.length})`, 
    value: PHOTO, 
    tabPanelComponent: null, 
    exclude_value: PHOTO 
  });

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

  const handleChangeTab = (_, tab) => {
    setSelectedPin(tab);
    const selectedPin = pins.find((p) => p.id === tab);
    if(selectedPin) {
      setViewport((previous) => ({ ...previous, latitude: selectedPin.latitude, longitude: selectedPin.longitude }));
    }
    setLayers(pins.filter((p) => p && p.id === tab || p.id === SHIPMENT).map((item) => renderMarker(item)));
  };

  const handleChangeViewport = (viewState) => {
    setViewport(viewState);
  };

  if (!latitude && !longitude && infoImages && infoImages.length < 1) return <Box textAlign={'center'}>No location pins found</Box>

  return (
    <Box>
      <AxlTabList
        variant='scrollable'
        value={selectedPin}
        onChange={handleChangeTab}
        tabList={tabs}
        TabIndicatorProps={{ style: { background: colors.periwinkleSecondary, height: 3, }}}
        className={{
          appBar: classes.appBar,
          tabPanel: classes.tabPanel,
        }}
        classes={{
          tab: {root: classes.muiTabRoot }
        }}
      />
      <div className={clsx({ [classes.map]: true })}>
        <ReactMapGL {...viewport} mapStyle={MAP_STYLE} transitionInterpolator={new LinearInterpolator()} width="100%" height="100%" onViewportChange={handleChangeViewport}>
          <DeckGL layers={layers} viewState={viewport} />
        </ReactMapGL>
      </div>
    </Box>
  )
}

export default LocationPin