import React, { Component } from 'react';
import ReactMapGL, { Marker, Popup, LinearInterpolator } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import WebMercatorViewport from 'viewport-mercator-project';
import DeckGL, { PathLayer, IconLayer, ScatterplotLayer } from 'deck.gl';
import styles from './styles';
import _ from 'lodash';
import Moment from 'react-moment';
import StopPopupInfo from '../../components/StopPopupInfo/index';
// import Pin from './pin';
// import Circle from './dot';
import WarehouseIcon from './data/marker-1.svg';
import GreenDotIcon from './data/dot-green.svg';
import MARKERS from './data/markers.svg'
import PIN from './data/pin.svg';
import moment from 'moment';

import CarIcon from '../../assets/images/svg/car.svg';
import { CAR_ICON_MAPPING, DETECT_CAR_COLOR } from '../../constants/carIconMapping'
import { inject, observer } from 'mobx-react';
import VerifiedIcon from './data/verified-icon.svg'

@inject('assignmentStore')
class StopTooltip extends Component {
  constructor(props) {
    super(props)
  }
  
  render() {
      const {assignmentStore} = this.props;
      const {selectedAssignment} = assignmentStore;
      const geocodeAddressesInfo = selectedAssignment && selectedAssignment.geocodeAddresses ? selectedAssignment.geocodeAddresses: [];
      const pin = geocodeAddressesInfo.filter(info => info.shipment_id == this.props.stop.shipment_id)
      const { stop } = this.props
      const { predicted_departure_ts, actual_departure_ts, estimated_arrival_ts } = stop || {}
      return <div style={{fontSize: '13px', width: '220px', textAlign: 'center', margin: 0}}>
          { pin.length > 0 && pin[0].pin_verified == true && (
            <div>
              Verified Pin: ({pin[0].latitude.toFixed(4)}, {pin[0].longitude.toFixed(4)})
            </div>
          )}
          { predicted_departure_ts && <div>
            Predicted: <Moment interval={0} format={'hh:mm:ss a'}>{ predicted_departure_ts }</Moment>
          </div> }
          { estimated_arrival_ts && <div>
            ETA: <Moment interval={0} format={'hh:mm:ss a'}>{ estimated_arrival_ts }</Moment>
          </div> }
          { actual_departure_ts && <div>
            Actual: <Moment interval={0} format={'hh:mm:ss a'}>{ actual_departure_ts }</Moment>
          </div> }
      </div>
  }
}

@inject('locationStore', 'assignmentStore', 'trafficStore')
@observer
class AssignmentMap extends Component {
    constructor(props) {
        super(props)
        this.state = {
            zoom: 13,
            viewport: {
                latitude: 37.7577,
                longitude: -122.4376,
                zoom: 11
            },
            object: null,
            mapStyle: process.env.REACT_APP_MAP_STYLE_URL,
            driverLocation: []
        };
        this.showStop = this.showStop.bind(this);
        this.showStopTooltip = this.showStopTooltip.bind(this)
        this.iconMapping = {}
        this.iconMapping['green'] = {
            x: 0, y: 0, width: 160, height: 210, anchorY: 210
        }
        this.iconMapping['red'] = {
            x: 160, y: 0, width: 160, height: 210, anchorY: 210
        }
        this.iconMapping['yellow'] = {
            x: 320, y: 0, width: 160, height: 210, anchorY: 210
        }
        this.iconMapping['cyan'] = {
            x: 480, y: 0, width: 160, height: 210, anchorY: 210
        }
        this.iconMapping['purple'] = {
            x: 640, y: 0, width: 160, height: 210, anchorY: 210
        }
        this.iconMapping['gray'] = {
            x: 640, y: 210, width: 160, height: 210, anchorY: 210
        }
        this.iconMapping['orange'] = {
            x: 480, y: 210, width: 160, height: 210, anchorY: 210
        }
        for (var i = 0; i < 130; i++) {
            let w = i % 10
            let h = (i - w) / 10
            this.iconMapping['number-' + i] = {
                x: w * 40, y: 236 + h *40, width: 40, height: 40, anchorY: 52
            }
        }
        this.gotMap = this.gotMap.bind(this);
        this.initMap = this.initMap.bind(this)
    }

    initMap() {
      if (this.props.assignment || this.props.shipment)
        this.onAssignmentUpdate(this.props.assignment, this.props.shipment)
    }

    componentWillReceiveProps(props) {
        const { assignment, shipment, previewShipment } = props
        if (!this.props.assignment ||
          !props.assignment ||
          assignment.assignment !== this.props.assignment.assignment ||
          shipment !== this.props.shipment ||
          previewShipment !== this.props.previewShipment)
            this.onAssignmentUpdate(assignment, shipment, previewShipment)

        let driverLocation =
            (!assignment || !assignment.driverLocation) ? [] : [{
                location: [assignment.driverLocation.longitude, assignment.driverLocation.latitude],
                heading: assignment.driverLocation.heading,
                angle: assignment.driverLocation.heading ? (assignment.driverLocation.heading < 90 ? 90 - assignment.driverLocation.heading : (450 - assignment.driverLocation.heading)) : 90,
                icon: DETECT_CAR_COLOR(assignment.driver),
                ts: assignment.driverLocation.timestamp
            }]

        this.setState({ stop: null, driverLocation })
    }

    showStop(stop) {
        this.setState({ stop })
    }

    showStopTooltip(stop) {
        this.setState({ hoveredStop: stop })
    }

    showTextTooltip(object) {
      this.setState({ object: object })
    }

    onAssignmentUpdate(assignment, shipment, previewShipment) {
        if (shipment && shipment.dropoff_address.lat) {
            this.setState({
                viewport: {
                    ...this.state.viewport,
                    latitude: shipment.dropoff_address.lat,
                    longitude: shipment.dropoff_address.lng,
                    zoom: 15,
                    transitionDuration: 500
                }
            })
            return
        }

        this.setState({
          path: []
        })

        const { trafficStore } = this.props
        const { stops } = assignment || {}
        trafficStore.getTrafficPath(stops).then((path) => this.setState({path}))

        if (!assignment || !assignment.bbox)
            return

        if (!assignment.shipments || assignment.shipments.length < 1) return
        if (!this.state.viewport) return
        const viewport = new WebMercatorViewport(this.state.viewport);

        let minLng = assignment.bbox[0][0];
        let maxLng = assignment.bbox[1][0];
        let minLat = assignment.bbox[0][1];
        let maxLat = assignment.bbox[1][1];
        
        if (previewShipment) {
            minLng = minLng <= previewShipment.dropoff_address.lng ? minLng : previewShipment.dropoff_address.lng;
            maxLng = maxLng >= previewShipment.dropoff_address.lng ? maxLng : previewShipment.dropoff_address.lng;
            minLat = minLat <= previewShipment.dropoff_address.lat ? minLat : previewShipment.dropoff_address.lat;
            maxLat = maxLat >= previewShipment.dropoff_address.lat ? maxLat : previewShipment.dropoff_address.lat;
        }
        // too small box
        const vw = maxLng -  minLng
        const vh = maxLat -  minLat
        const gapw = Math.max(vw * 0.1, 0.0004)
        const gaph = Math.max(vh * 0.1, 0.0004)
        const bbox = [
          [minLng - gapw, minLat - gaph],
          [maxLng + gapw, maxLat + gaph]
        ];

        if (previewShipment) bbox.push([previewShipment.dropoff_address.lng, previewShipment.dropoff_address.lat]);


        let { longitude, latitude, zoom } = viewport.fitBounds(bbox);
        this.setState({
            viewport: {
                ...this.state.viewport,
                longitude,
                latitude,
                zoom,
                transitionDuration: 500
            }
        });
    }

    _renderPopup() {
        const { stop } = this.state;

        return stop && (
            <Popup tipSize={5}
                anchor="top"
                longitude={stop.shipment.dropoff_address.lng}
                latitude={stop.shipment.dropoff_address.lat}
                closeOnClick={false}
                offsetTop={9}
                onClose={() => this.setState({ stop: null })} >
                <StopPopupInfo stop={stop} />
            </Popup>
        );
    }

    _renderLocationInfo() {
        const { displayLocation } = this.state
        return displayLocation && (
            <Popup tipSize={5}
                anchor="bottom"
                closeButton={false}
                longitude={ displayLocation.location[0] }
                latitude={ displayLocation.location[1] }
                closeOnClick={true}
                offsetTop={-8}
                className={'map-tooltip'}
                onClose={() => this.setState({ hoveredStop: null })} >
                <div style={{fontSize: '12px'}}>
                    <Moment format='hh:mm:ss a'>{ displayLocation.ts }</Moment>
                </div>
            </Popup>
        );
    }

    _renderLastDriverUpdate() {
        const { lastDriverUpdate } = this.state
        return lastDriverUpdate && (
            <Popup tipSize={5}
                anchor="bottom"
                closeButton={false}
                longitude={ lastDriverUpdate.location[0] }
                latitude={ lastDriverUpdate.location[1] }
                closeOnClick={true}
                offsetTop={-16}
                className={'map-tooltip'}
                onClose={() => this.setState({ hoveredStop: null })} >
                <div style={{fontSize: '14px'}}>
                    Last update: <b><Moment format='hh:mm:ss a'>{ lastDriverUpdate.ts }</Moment></b>
                </div>
            </Popup>
        );
    }

    _renderTooltip() {
        const { hoveredStop } = this.state;
        const isDropoff = hoveredStop && hoveredStop.type === 'DROP_OFF'
        return hoveredStop && (
            <Popup tipSize={5}
                anchor="bottom"
                closeButton={false}
                longitude={ isDropoff ? hoveredStop.shipment.dropoff_address.lng : hoveredStop.shipment.pickup_address.lng}
                latitude={ isDropoff ? hoveredStop.shipment.dropoff_address.lat : hoveredStop.shipment.pickup_address.lat }
                closeOnClick={true}
                offsetTop={-30}
                className={'map-tooltip'}
                onClose={() => this.setState({ hoveredStop: null })} >
                <StopTooltip stop={hoveredStop} />
            </Popup>
        );
    }

    _renderPopupText() {
    const { object = {} } = this.state;
    const {lat = null, long = null, content = ''} = object || {};
    const isAvaiable = object && lat && long;

    return isAvaiable && (
      <Popup tipSize={5}
             anchor="bottom"
             closeButton={false}
             longitude={long}
             latitude={lat}
             closeOnClick={true}
             offsetTop={-30}
             className={'text-popup-tooltip'}
             onClose={() => this.setState({ object: null })}>
        {!!content && <div width={120} style={{fontSize: 11}} dangerouslySetInnerHTML={{__html: content}}/>}
      </Popup>
    );
  }

    _renderPath() {
        const { assignment, previewShipment, shipment, pods = [] } = this.props;
        if (!assignment || !assignment.stops) {
            if (!shipment)
                return []
            const shipmentMarkers = [
                {
                  location: [shipment.dropoff_address.lng, shipment.dropoff_address.lat],
                  size: 42,
                  icon: 'red'
                }
            ]
            const shipmentPodMarkers = pods.map( ({event, ...pod}) => ({
              ...pod,
              ts: event.ts,
              location: (event && event.location && event.location.geolocation) ? [event.location.geolocation.longitude, event.location.geolocation.latitude] : [],
              size: 42,
              icon: 'pin',
            }));
            return [
                new IconLayer({
                    id: 'dropoff-icon-layer',
                    data: shipmentMarkers,
                    pickable: true,
                    // iconAtlas and iconMapping are required
                    // getIcon: return a string
                    iconAtlas: MARKERS,
                    iconMapping: this.iconMapping,
                    getIcon: d => d.icon,
                    sizeScale: 1,
                    opacity: 1,
                    visible: true,
                    getPosition: d => d.location,
                    getSize: d => d.size,
                    onHover: ({object, x, y}) => {
                      if (object && object.stop)
                        this.showStopTooltip(object ? object.stop : null)
                      if (!object)
                        this.showStopTooltip(null)
                    }
                }),
                new IconLayer({
                id: 'pin-icon-layer',
                data: shipmentPodMarkers,
                pickable: true,
                // iconAtlas and iconMapping are required
                // getIcon: return a string
                iconAtlas: PIN,
                iconMapping: {pin: {x: 0, y: 0, width: 31, height: 42, anchorY: 42}},
                getIcon: d => d.icon,
                sizeScale: 1,
                opacity: 1,
                visible: true,
                getPosition: d => d.location,
                getSize: d => d.size,
                onHover: ({object, x, y}) => {
                  if(object) {
                    const obj = {
                      content: `POD taken @${(object && object.ts) ? moment(object.ts).format('MM/DD/YYYY - HH:mmA') : '-'}<br />[${object && object.location ? object.location[0] : '-'} - ${object && object.location ? object.location[1] : '-'}]`,
                      long: object && object.location ? object.location[0] : null,
                      lat: object  && object.location ? object.location[1] : null,
                    }
                    this.showTextTooltip(obj)
                  }
                  if(!object) {
                    this.showTextTooltip(null)
                  }
                  // if (object && object.stop)
                  //   this.showStopTooltip(object ? object.stop : null)
                  // if (!object)
                  //   this.showStopTooltip(null)
                  // const tooltip = `${object.name}\n${object.address}`;
                  /* Update tooltip
                     http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
                  */
                }
              })
            ]
        }
        let pickupFailed = assignment.stops.filter(s => s.type === 'PICK_UP' && s.status === 'FAILED')
            .map(s => s.shipment.id)
        let pickedUp = assignment.stops.filter(s => s.type === 'PICK_UP' && s.status === 'SUCCEEDED')
            .map(s => s.shipment.id)
        const p = _.sortBy(assignment.stops, (s) => s.sequence_id)
            .filter(s => s.type === 'PICK_UP' || s.type === 'DROP_OFF')
            .filter(s => s.shipment)
            .filter(s => pickupFailed.indexOf(s.shipment.id) < 0)
            .map(s => s.type === 'DROP_OFF' ? s.shipment.dropoff_address : s.shipment.pickup_address)
            .map(s => [s.lng, s.lat])
        const { path } = this.state
        const data = [
            {
                path: p,
                color: [20,20,0, !!path ? 50 : 120]
            }
        ]
        const layer = new PathLayer({
            id: 'path-layer',
            data: data,
            pickable: true,
            widthScale: 5,
            rounded: true,
            widthMinPixels: 2,
            getPath: d => d.path,
            getColor: d => d.color,
            getWidth: d => 1,
            onHover: ({object, x, y}) => {
                /* Update tooltip
                    http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
                */
            }
        });


        /* pickup */
        const pickupMarkers = _.uniqBy(assignment.stops
            .filter(s => s.type === 'PICK_UP' && !s._deleted)
            .filter(s => s.shipment)
            .map(s => s.shipment.pickup_address), 'street')
            .map(s => {
                return {
                    location: [s.lng, s.lat],
                    icon: 'warehouse'
                }
            })

        const pickupIconlayer = new IconLayer({
            id: 'pickup-icon-layer',
            data: pickupMarkers,
            pickable: true,
            // iconAtlas and iconMapping are required
            // getIcon: return a string
            iconAtlas: WarehouseIcon,
            iconMapping: {warehouse: {x: 0, y: 0, width: 150, height: 150, anchorY: 150}},
            getIcon: d => d.icon,
            sizeScale: 1,
            opacity: 1,
            visible: true,
            getPosition: d => d.location,
            getSize: d => 48,
        });

        /* dropoff */
        let stopColorEncode = (s) => {
          if (!s.status || s.status === 'PENDING' || s.status === 'REATTEMPT') return 'yellow'
          if (s.status === 'DISCARDED') return 'gray'
          if (s.status === 'FAILED') return 'red'
          if (pickedUp.indexOf(s.shipment.id) >= 0 && (s.status === 'EN_ROUTE' || s.status == 'READY')) return 'orange'
          if (moment(s.actual_departure_ts).isAfter(moment(s.shipment.dropoff_latest_ts))) return 'purple'
          if (moment(s.actual_departure_ts).isBefore(moment(s.shipment.dropoff_earliest_ts))) return 'cyan'
          return 'green'
        }
        const dropoffMarkers = _.sortBy(assignment.stops, (s) => s.sequence_id)
            .filter(s => s.type === 'DROP_OFF')
            .filter(s => s.shipment)
            .flatMap(s => [
                {
                    location: [s.shipment.dropoff_address.lng, s.shipment.dropoff_address.lat],
                    stop: s,
                    sequence: (s.label ? _.reverse(s.label.driver_label.split('-'))[0].split('.')[0] : '0'),
                    icon: stopColorEncode(s),
                    size: 42,
                    excluded: pickupFailed.indexOf(s.shipment.id) >= 0
                },
                {
                  location: [s.shipment.dropoff_address.lng, s.shipment.dropoff_address.lat],
                  icon: 'number-' + (s.label ? _.reverse(s.label.driver_label.split('-'))[0].split('.')[0] : '0'),
                  size: 28
                }
            ]);

        if (previewShipment) {
            dropoffMarkers.push(
              {
                location: [previewShipment.dropoff_address.lng, previewShipment.dropoff_address.lat],
                size: 42,
                icon: 'red'
              }
            )
        }
          /*
        const dropoffNumbers = _.sortBy(assignment.stops, (s) => s.sequence_id)
            .filter(s => s.type === 'DROP_OFF')
            .filter(s => s.shipment)
            .map(s => {
                return {
                    location: [s.shipment.dropoff_address.lng, s.shipment.dropoff_address.lat],
                    icon: 'number-' + (s.label ? _.reverse(s.label.driver_label.split('-'))[0].split('.')[0] : '0')
                }
            })
          */
        const dropoffIconlayer = new IconLayer({
            id: 'dropoff-icon-layer',
            data: dropoffMarkers,
            pickable: true,
            // iconAtlas and iconMapping are required
            // getIcon: return a string
            iconAtlas: MARKERS,
            iconMapping: this.iconMapping,
            getIcon: d => d.icon,
            sizeScale: 1,
            getOpacity: d => d.excluded ? 0.2 : 1,
            visible: true,
            getPosition: d => d.location,
            getSize: d => d.size,
            onHover: ({object, x, y}) => {
              if (object && object.stop)
                this.showStopTooltip(object ? object.stop : null)
              if (!object)
                this.showStopTooltip(null)
                // const tooltip = `${object.name}\n${object.address}`;
                /* Update tooltip
                   http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
                */
            }
        });
        
        const {assignmentStore} = this.props;
        const {selectedAssignment} = assignmentStore;
        const geocodeAddressesInfo = selectedAssignment && selectedAssignment.geocodeAddresses? selectedAssignment.geocodeAddresses: [];
        
        const dropoffTmp = _.sortBy(assignment.stops, (s) => s.sequence_id)
            .filter(s => s.type === 'DROP_OFF')
            .filter(s => s.shipment)
        
        const dropoffVerifiedMarkers = []
        dropoffTmp.forEach(s => {
          let pin_verified = false
          geocodeAddressesInfo.forEach(info => {
            if (info.shipment_id == s.shipment.id) {
              pin_verified = info.pin_verified
              return
            }
          });
          if (pin_verified == true) {
            dropoffVerifiedMarkers.push({
              location: [s.shipment.dropoff_address.lng, s.shipment.dropoff_address.lat],
              icon: 'verifiedIcon',
              size: 28,
            }) 
          }
        });

        const verifiedIconlayer = new IconLayer({
          id: 'verified-icon-layer',
          data: dropoffVerifiedMarkers,
          pickable: true,
          iconAtlas: VerifiedIcon,
          iconMapping: {verifiedIcon: {x: 0, y: 0, width: 80, height: 80, anchorY: 20}},
          getIcon: d => d.icon,
          sizeScale: 1.1,
          getOpacity: d => d.excluded ? 0.2 : 1,
          visible: true,
          getPosition: d => d.location,
          getSize: d => d.size,
      });
        return [layer, pickupIconlayer, dropoffIconlayer, verifiedIconlayer]
    }

    _renderTrafficPath() {
      const { path } = this.state;
      if (!path) return []

      const data = [
          {
              path: path.map(x => [x[1], x[0]]),
              color: [20,150,20,255]
          }
      ]
      const layer = new PathLayer({
          id: 'path-layer-detail',
          data: data,
          pickable: true,
          widthScale: 5,
          rounded: true,
          widthMinPixels: 2.5,
          widthMaxPixels: 3.5,
          capRounded: true,
          jointRounded: true,
          getPath: d => d.path,
          getColor: d => d.color,
          getWidth: d => 2.0,
          getDashArray: d => [4,3],
          dashJustified: true,
      });



      return [layer]
  }
    _renderActualDropoff() {
      const { location } = this.props.locationStore
      if(location === null || location === undefined)
        return null
      else{
        const loc = this.props.locationStore.getLocation()
        const actualDropoffMarker = [{
          location: [parseFloat(loc[0]),parseFloat(loc[1])],
          icon: 'greenDot'
        }]

        const actualDropoffIconlayer = new IconLayer({
          id: 'actual-dropoff-icon-layer',
          data: actualDropoffMarker,
          pickable: true,
          // iconAtlas and iconMapping are required
          // getIcon: return a string
          iconAtlas: GreenDotIcon,
          iconMapping: {greenDot: {x: 0, y: 0, width: 50, height: 50 }},
          getIcon: d => d.icon,
          sizeScale: 1,
          opacity: 1,
          visible: true,
          getPosition: d => d.location,
          getSize: d => 28,
        })
        return actualDropoffIconlayer
      }
    }

    _renderDriverLocation() {
        const driverIconlayer = new IconLayer({
            id: 'driver-icon-layer',
            data: this.state.driverLocation,
            pickable: true,
            // iconAtlas and iconMapping are required
            // getIcon: return a string
            iconAtlas: CarIcon,
            iconMapping: CAR_ICON_MAPPING,
            getIcon: d => d.icon,
            sizeScale: 1,
            opacity: 1,
            visible: true,
            getAngle: d => d.angle,
            getPosition: d => d.location,
            getSize: d => 25,
            onHover: ({object, x, y}) => {
                this.setState({lastDriverUpdate: object})
            }
        });

        return [driverIconlayer]
    }

    _renderTrajectory() {
        const { locations } = this.props
        if (!locations || locations.length < 1)
            return []
        const data = [
            {
                path: locations.map(d => [d.longitude, d.latitude]),
                color: [150,250,150, 150]
            }
        ]
        const layer = new PathLayer({
            id: 'trajectory-layer',
            data,
            pickable: true,
            widthScale: 5,
            rounded: true,
            widthMinPixels: 2,
            getPath: d => d.path,
            getColor: d => d.color,
            getWidth: d => 1,
        });

        /* dots */
        const dotMarkers = locations.map(d => {
            return {
                location: [d.longitude, d.latitude],
                ts: d.timestamp,
                angle: d.heading ? (360 - d.heading) : 0
            }
        })

        /*
        const dotIconlayer = new IconLayer({
            id: 'location-icon-layer',
            data: dotMarkers,
            pickable: true,
            // iconAtlas and iconMapping are required
            // getIcon: return a string
            iconAtlas: Dot,
            iconMapping: {dot: {x: 0, y: 0, width: 12, height: 12, anchorY: 6}},
            getIcon: d => 'dot',
            sizeScale: 1,
            opacity: 1,
            visible: true,
            getColor: d => [91, 154, 240],
            getPosition: d => d.location,
            getAngle: d => d.angle,
            getSize: d => 12,
            onHover: ({object, x, y}) => {
                this.setState({ displayLocation: object })
            }
        });
        */

        const dotIconlayer = new ScatterplotLayer({
          id: 'location-icon-layer',
          data: dotMarkers,
          pickable: true,
          opacity: 1,
          stroked: true,
          filled: true,
          radiusScale: 1,
          radiusMinPixels: 4,
          radiusMaxPixels: 4,
          lineWidthMinPixels: 0.5,
          getPosition: d => d.location,
          getRadius: d => 4,
          getFillColor: d => [50, 210, 250, 160],
          getLineColor: d => [0, 140, 250, 200],
          onHover: ({object, x, y}) => {
            this.setState({ displayLocation: object })
          }
        });

        return [layer, dotIconlayer]
    }

    gotMap(map) {
      if (!map || map === this.mapRef) return
      this.mapRef = map
      setTimeout(this.initMap, 50);
    }

    render() {
        const { shipment, previewShipment } = this.props

        return <ReactMapGL
            {...this.state.viewport}
            mapStyle={this.state.mapStyle}
            transitionInterpolator={new LinearInterpolator()}
            onViewportChange={(viewport) => this.setState({ viewport })}
            width={'100%'}
            height={'100%'}
            ref={map => this.gotMap(map)}
        >
            <DeckGL {...this.state.viewport} layers={ [...this._renderTrafficPath(), ...this._renderTrajectory(), ...this._renderPath(),...this._renderDriverLocation(), this._renderActualDropoff()] } />
            { shipment && shipment.dropoff_address.lat && <Marker offsetTop={-17} offsetLeft={-17} latitude={ shipment.dropoff_address.lat } longitude={ shipment.dropoff_address.lng }>
                <div style={styles.selectedStop}></div>
            </Marker> }

          { previewShipment && previewShipment.dropoff_address.lat && <Marker offsetTop={-17} offsetLeft={-17} latitude={ previewShipment.dropoff_address.lat } longitude={ previewShipment.dropoff_address.lng }>
            <div style={styles.selectedStop}></div>
          </Marker> }
            { this._renderPopupText() }
            {this._renderPopup()}
            { this._renderTooltip() }
            { this._renderLastDriverUpdate() }
            { this._renderLocationInfo() }
        </ReactMapGL>
    }
}

export default AssignmentMap
