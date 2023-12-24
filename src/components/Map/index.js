import React, { Fragment, useEffect, useState } from 'react';
import ReactMapGL, { LinearInterpolator } from 'react-map-gl';
import {
    Editor,
    EditingMode,
    DrawPolygonMode,
    RENDER_STATE,
  } from "react-map-gl-draw";
import bbox from '@turf/bbox';
import WebMercatorViewport from 'viewport-mercator-project';
import DeckGL, { IconLayer, TextLayer } from 'deck.gl';
import _ from 'lodash';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';

import useMap from '../../hooks/Map';
import HOME_MARKERS from '../../assets/images/svg/home_marker.svg';
import { getBoundaryFromRegions } from '../../stores/api';
import colors from '../../themes/colors';

const MODES = [
    { id: "drawPolygon", text: "Draw Polygon", handler: DrawPolygonMode },
    { id: "editing", text: "Edit Feature", handler: EditingMode },
];

const DEFAULT_STYLE = {
    stroke: colors.black,
    strokeWidth: 2,
    fill: colors.grayTenth,
    fillOpacity: .5
};

const SELECTED_STYLE = {
    stroke: colors.main,
    strokeWidth: 2,
    fill: colors.main,
    fillOpacity: 0.5,
};

function getFeatureStyle({ feature, state }) {
    let style = null;
    switch (state) {
        case RENDER_STATE.SELECTED:
          style = { ...SELECTED_STYLE };
        break;
    
        default:
          style = { ...DEFAULT_STYLE };
    }
    return style;
}

function BoundaryMap({boundary, handleChangeBoudary, warehouseInfo, strRegions}) {
    const mapStyle = process.env.REACT_APP_MAP_STYLE_URL;
    const [viewport, setViewport] = useState({
        width: 400,
        height: 400,
        latitude: 37.7577,
        longitude: -122.4376,
        zoom: 11
    })
    const [geojson, setGeojson] = useState({
        type: 'FeatureCollection',
        features: [],
    });
    const [modeHandler, setModeHandler] = useState(null);  
    const [modeId, setModeId] = useState(null);
    const [isSelectedBoundary, setIsSelectedBoundary] = useState(false);
    const [drawMode, setDrawMode] = useState('');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(null);
    const [drawGeojson, setDrawGeojson] = useState({
        type: 'FeatureCollection',
        features: [],
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isToggleZone, setIsToggleZone] = useState(true);
    const [orginalGeojson, setOriginalGeojson] = useState({
        type: 'FeatureCollection',
        features: [],
    });

    const { getPath, toCoordinates } = useMap();

    const calculateGeoJson = () => {
        let gjson = geojson;
        const coordinates = toCoordinates(boundary);
        
        gjson = {
            type: 'FeatureCollection',
            features: coordinates && coordinates.length > 0 ? [
                {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Polygon',
                        coordinates: [coordinates],
                    },
                }
            ] : [],
        };
        setGeojson(gjson);
        return gjson;
    }

    const renderWarehouseMarker = () => {
        return new IconLayer({
          id: 'warehouse-marker',
          data: [
            {
              location: [warehouseInfo && warehouseInfo.lng, warehouseInfo && warehouseInfo.lat],
              size: 40,
              icon: 'green',
            },
          ],
          pickable: true,
          iconAtlas: HOME_MARKERS,
          iconMapping: {
            green: { x: 0, y: 0, width: 168, height: 228, anchorY: 228 },
          },
          getIcon: (d) => d.icon,
          sizeScale: 1,
          opacity: 1,
          visible: true,
          billboard: false,
          getPosition: (d) => d.location,
          getSize: (d) => d.size,
        });
    };

    useEffect(() => {
        const gjson = calculateGeoJson(); 
        if (gjson && gjson.features && gjson.features.length > 0) {
          setModeId(MODES[1].id);
          setModeHandler(new EditingMode());
            _calculateViewport(gjson);
        } 
        else {
            setModeId(MODES[0].id);
            setModeHandler(new DrawPolygonMode());
            if(warehouseInfo) {
                setViewport(prev => ({
                    ...prev,
                    latitude: warehouseInfo.lat,
                    longitude: warehouseInfo.lng,
                }))
            }
        }
        
    }, [boundary, warehouseInfo]);

    const updateViewPort = (nextViewport) => {  
        setViewport(nextViewport);
    };

    const handleOnUpdate = (data) => {
        setGeojson(prev => ({...prev, 'features': data}));
        if(drawMode === "" || drawMode === 'new') {
            setDrawGeojson(prev => ({...prev, 'features': data}))
        }
        handleChangeBoudary(getPath(data[0]));
        if(data && data.length === 1 && modeId !== 'editing') {
            setModeId(MODES[1].id);
            setModeHandler(new EditingMode());
            return;
        }
    }

    const handleConfirmDelete = () => {
        setIsConfirmOpen(true);
    }

    const handleChangeDrawMode = (value) => {
        setDrawMode(value);
        setIsSelectedBoundary(false);
        setSelectedFeatureIndex(null);
        if(value === 'zones') {
            setIsToggleZone(!isToggleZone);
        }
        else {
            setIsToggleZone(true);
        }
        if(value === 'zones' && isToggleZone) {
            if(orginalGeojson && orginalGeojson.features && orginalGeojson.features.length === 0) {
                setIsLoading(true);
                getBoundaryFromRegions(strRegions).then(res => {
                    if(res.ok) {
                        const filterEmptyFeature = res.data.filter(d => d.features && d.features.length > 0 && d.features.some(f => !_.isEmpty(f.properties) && !_.isEmpty(f.geometry)));
                        if(filterEmptyFeature && filterEmptyFeature.length > 0) {
                            const geoFeatures = {type: 'FeatureCollection', features: _.flatMapDeep(filterEmptyFeature.map(f => f.features))};
                            setGeojson(geoFeatures);
                            setModeId(MODES[1].id);
                            setModeHandler(new EditingMode());
                            _calculateViewport(geoFeatures);
                            setOriginalGeojson(geoFeatures);
                            return;
                        }
                        else {
                            setGeojson({type: 'FeatureCollection', features: []}); 
                        }
                    }
                    else {
                        setGeojson({type: 'FeatureCollection', features: []});
                    }
                }).finally(() => {
                    setIsLoading(false);
                });
            }
            else {
                const geo = orginalGeojson;
                setGeojson(geo);
                if(geo && geo.features && geo.features.length > 0) {
                    _calculateViewport(geo);
                }
                setModeId(MODES[1].id);
                setModeHandler(new EditingMode());
            }
            return;
        } 
        else {
            const geo = calculateGeoJson();
            if(geo && geo.features && geo.features.length > 0) {
                _calculateViewport(geo);
            }
            setModeId(MODES[1].id);
            setModeHandler(new EditingMode());
        }
        if(!boundary || (!geojson || geojson.features && geojson.features.length === 0) || (!drawGeojson || drawGeojson.features && drawGeojson.features.length === 0)) {
            setModeId(MODES[0].id);
            setModeHandler(new DrawPolygonMode());
        }
        else {
            setModeId(MODES[1].id);
            setModeHandler(new EditingMode());
        }

        if(value === 'new' && !boundary && (!drawGeojson || (drawGeojson.features && drawGeojson.features.length === 0))) {
            setGeojson({
                type: 'FeatureCollection',
                features: [],
            });
            return;
        }

        if(value === 'new' && drawGeojson && drawGeojson.features && drawGeojson.features.length > 0) {
            setGeojson(drawGeojson);
            _calculateViewport(drawGeojson);
            setIsConfirmOpen(true);
            return;
        }

        if(value === 'new' && (geojson.features && geojson.features.length > 0 || boundary)) {
            const geo = calculateGeoJson();
            if(geo && geo.features && geo.features.length > 0) {
                _calculateViewport(geo);
            }
            setIsConfirmOpen(true);
        }
    }

    const _renderToolbar = () => {
        return (
            <div style={{ position: "absolute", top: 0, right: 0, display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '5px', alignItems: 'flex-end', padding: '5px', flexDirection: 'column', zIndex: 2 }}>
                <button onClick={() => handleChangeDrawMode('new')} style={{backgroundColor: '#00f', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', width: '25px', height: '25px', }}>
                    <i className='fa fa-plus' title='New boundary'></i>
                </button>
                <button onClick={() => handleChangeDrawMode('zones')} style={{backgroundColor: '#fa6725', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', width: '25px', height: '25px', }}>
                    <i className={isLoading ? 'fa fa-spinner fa-spin' : 'fa fa-list'} title={isLoading ? 'Loading...' : 'Get boundary from zones'}></i>
                </button>
                {isSelectedBoundary && <button onClick={handleConfirmDelete} style={{backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', width: '25px', height: '25px', }}>
                        <i className='fa fa-trash' title='Delete boundary'></i>
                    </button>}
            </div>
        );
    };

    const handleOnSelect = (selected) => {
        if(selected && selected.selectedFeatureIndex !== null && selected.selectedFeatureIndex > -1) {
            if(drawMode !== 'zones') {
                setIsSelectedBoundary(true);
            }
            else {
                if(isToggleZone) {
                    setIsSelectedBoundary(true);
                    setSelectedFeatureIndex(selected.selectedFeatureIndex);
                    handleChangeBoudary(getPath(selected.selectedFeature));
                    return;
                }
                setIsSelectedBoundary(false);
            }
            setSelectedFeatureIndex(selected.selectedFeatureIndex);
            handleChangeBoudary(getPath(selected.selectedFeature));
        }
        else {
            setIsSelectedBoundary(false);
            setSelectedFeatureIndex(null);
            handleChangeBoudary(getPath(null));
        }
    }


    const handleCloseConfirm = () => {
        setIsConfirmOpen(false);
        setSelectedFeatureIndex(null);
        setIsSelectedBoundary(false);
    }

    const handleDeleteOldBoundary = () => {
        setIsConfirmOpen(false);
        setModeId(MODES[0].id);
        setModeHandler(new DrawPolygonMode());
        setIsSelectedBoundary(false);
        setGeojson(prev => ({...prev, 'features': []}));
        handleChangeBoudary(getPath(null), true);
        setSelectedFeatureIndex(null);
        setDrawGeojson(prev => ({...prev, 'features': []}));
        setIsToggleZone(true);
    }

    const _calculateViewport = (geoFeatures) => {
        const bboxResult = bbox(geoFeatures);
        const [minLng, minLat, maxLng, maxLat] = bboxResult; // Turf.js
        const viewportWeb = new WebMercatorViewport(viewport);

        const { longitude, latitude, zoom } = viewportWeb.fitBounds(
            [
            [minLng, minLat],
            [maxLng, maxLat],
            ],
            {
            padding: 90
            }
        );
        setViewport({
            ...viewport,
            longitude,
            latitude, 
            zoom,
        });
    }

    const renderTextLayer = () => {
        return new TextLayer({
            id: 'text-layer',
            data: orginalGeojson && orginalGeojson.features ? orginalGeojson.features : [],
            pickable: true,
            getPosition: d => d.center,
            getText: d => d.properties.zone_id,
            getColor: d => ([255,0,0]),
            maxWidth: 400,
            getSize: 20,
            getAngle: 0,
            getTextAnchor: 'middle',
            getAlignmentBaseline: 'center',
            fontWeight: 600
        });
    }

    return (
        <Fragment>
            <ReactMapGL
                {...viewport}
                mapStyle={mapStyle}
                transitionInterpolator={new LinearInterpolator()}
                onViewportChange={updateViewPort}
                width={'100%'}
                height={'300px'}
            >
                <DeckGL layers={[renderWarehouseMarker(), !isToggleZone && drawMode === 'zones' && renderTextLayer()]} viewState={viewport}/>
                {_renderToolbar()}
                <Editor
                    mode={modeHandler}
                    onUpdate={({ data }) => handleOnUpdate(data)}
                    features={geojson}
                    editHandleShape="circle"
                    featureStyle={getFeatureStyle}
                    onSelect={handleOnSelect}
                    selectedFeatureIndex={selectedFeatureIndex}
                    style={{zIndex: 1, position: 'relative'}}
                />
            </ReactMapGL>

            <Dialog open={isConfirmOpen}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent dividers>
                    Are you sure to remove this boundary?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirm}>No</Button>
                    <Button onClick={handleDeleteOldBoundary} variant="contained" color='primary'>Yes</Button>
                </DialogActions>
            </Dialog>
        </Fragment>
        
    )
}

export default BoundaryMap
