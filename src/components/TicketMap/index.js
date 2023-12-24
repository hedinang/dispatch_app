import React, { Component, Fragment } from 'react';
import { inject } from 'mobx-react';import mapboxgl from 'mapbox-gl';
import WarehouseIcon from './data/marker-1.svg';
import WebMercatorViewport from 'viewport-mercator-project';
import ReactMapGL, { LinearInterpolator } from 'react-map-gl';
import DeckGL, { IconLayer } from 'deck.gl';
import { autorun } from 'mobx';
import CarIcon from './data/car.svg';
import { CAR_ICON_MAPPING } from './data/carIconMapping'
import Moment from 'react-moment';

@inject('locationStore')
class TicketMap extends Component {
  constructor(props) {
    super(props)
    const {ticket} = props
    this.state ={
      zoom: 13,
      viewport: {
          latitude: ticket.address.lat,
          longitude: ticket.address.lng,
          zoom: 11
      },
      ticketId: null,
      mapStyle: process.env.REACT_APP_MAP_STYLE_URL,
      driverLocation: null
    }
    this.gotMap = this.gotMap.bind(this);
    this.initMap = this.initMap.bind(this)
  }

  gotMap(map) {
    if (!map || map === this.mapRef) return
    this.mapRef = map
    setTimeout(this.initMap, 50);
  }

  initMap() {}

  componentDidMount() {
    const { locationStore, ticket } = this.props;
    const { address } = ticket
    this.boundaryDisposer = autorun(() => {
      const { lastLocation } = locationStore

      if (!lastLocation)
        return

      // trace()

      const boundary = [
        [ Math.min(address.lng, lastLocation.longitude) - 0.005, Math.min(address.lat, lastLocation.latitude) - 0.005],
        [ Math.max(address.lng, lastLocation.longitude) + 0.005, Math.max(address.lat, lastLocation.latitude) + 0.005 ]
      ]

      this.fitBoundary(boundary)
    }, {delay: 100})
  }

  componentWillUnmount() {
    if (this.boundaryDisposer) this.boundaryDisposer()
  }

  _renderLocation() {
    const { ticket } = this.props
    if (!ticket) return []

    const pickupMarker = {
      location: [ticket.address.lng, ticket.address.lat],
      icon: 'warehouse',
    }

    const pickupIconlayer = new IconLayer({
      id: 'pickup-icon-layer',
      data: [pickupMarker],
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

    const { locationStore } = this.props
    const { lastLocation } = locationStore

    const driverIconlayer = lastLocation == null ? null : new IconLayer({
      id: 'driver-icon-layer',
      data: [{
        location: [lastLocation.longitude, lastLocation.latitude],
        angle: lastLocation.heading ? (lastLocation.heading < 90 ? 90 - lastLocation.heading : (450 - lastLocation.heading)) : 90
      }],
      pickable: true,
      // iconAtlas and iconMapping are required
      // getIcon: return a string
      // iconAtlas: CAR,
      // iconMapping: {'car': {x: 0, y: 0, width: 32, height: 32, mask: false, anchorY: 16}},
      iconAtlas: CarIcon,
      iconMapping: CAR_ICON_MAPPING,
      getAngle: d => d.angle,
      getIcon: d => 'silver', //DETECT_CAR_COLOR(d.driver),
      sizeScale: 1,
      opacity: 1,
      visible: true,
      getPosition: d => d.location,
      getSize: d => 24,
  });


    return [pickupIconlayer, driverIconlayer]
  }

  fitBoundary(boundary) {
    if (this.currentBoundary && this.currentBoundary === boundary) {
      return
    }
    this.currentBoundary = boundary
    if (!this.state.viewport)
      return
    
    // too small box
    let isTooSmall = boundary[1][0] -  boundary[0][0] < 0.004
    let c = { longitude: boundary[0][1], latitude: boundary[0][0], zoom: 15}
    const viewport = new WebMercatorViewport(this.state.viewport);

    let { longitude, latitude, zoom } = isTooSmall ? c : viewport.fitBounds(
        boundary,
        { padding: 40 }
    );

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

  render() {
    const { locationStore, ticket } = this.props
    const { lastLocation } = locationStore
    const { delivery_id } = lastLocation || {}
    const current_id = !delivery_id ? null : delivery_id.split('_')[1]
    const isActive = current_id === ticket.id
    return <Fragment><ReactMapGL
      {...this.state.viewport}
      mapStyle={this.state.mapStyle}
      transitionInterpolator={new LinearInterpolator()}
      onViewportChange={(viewport) => this.setState({ viewport })}
      width={'100%'}
      height={'100%'}
      ref={map => this.gotMap(map)}
    >
      <DeckGL {...this.state.viewport} layers={ this._renderLocation() } />
    </ReactMapGL>
      { lastLocation && <div style={{fontSize: '0.8em', color: '#888', display: 'flex', padding: '2px 8px'}}>
        <div style={{flex: 1, textAlign: 'left'}}>Last Update <Moment interval={0} format={'hh:mm:ssA'}>{ lastLocation.timestamp }</Moment></div>
        { lastLocation.assignment_id && <div>On Assignment: {lastLocation.assignment_id}</div> }
        { isActive && <div>Active on this ticket</div> }
      </div>}
    </Fragment>
  }

}

export default TicketMap
