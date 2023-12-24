import React, { Component } from 'react';
import ReactMapGL, { Marker, Popup, LinearInterpolator } from 'react-map-gl';
import mapboxgl from 'mapbox-gl';
import WebMercatorViewport from 'viewport-mercator-project';
import DeckGL, { PathLayer, IconLayer, ScatterplotLayer } from 'deck.gl';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import { autorun } from 'mobx';
// import MARKERS from './data/markers.svg'
import MARKERS from './data/dots.svg'
import CAR from './data/car.png'
import CarIcon from '../../assets/images/svg/car.svg';
import { CAR_ICON_MAPPING, DETECT_CAR_COLOR } from '../../constants/carIconMapping'
import Moment from 'react-moment'
import { AxlButton, AxlModal } from 'axl-reactjs-ui'
import AdditionalShipmentForm from '../../components/AdditionalShipmentForm'
import styles from './styles'
import { api } from '../../stores/api';

export const COLOR_PALETE = [
  [15, 48, 217],
  [213, 85, 53],
  [212, 106, 106],
  [161, 195, 73],
  [239, 143, 119],
  [75, 78, 77],
  [35, 63, 136],
  [170, 116, 51],
  [68, 152, 165],
  [60, 122, 74],
  [88, 133, 176],
  [176, 23, 28],
  [53, 173, 141],
  [246, 84, 106],
  [44, 75, 37],
  [0, 128, 128],
  [246, 84, 106],
  [102, 17, 65],
  [30, 75, 0],
  [113, 141, 165],
  [56, 112, 18],
  [68, 0, 38],
  [8, 141, 165],
  [19, 7, 58],
  [85, 0, 0],
  [38, 23, 88],
  [128, 21, 21]
];


@inject('userStore')
class StopAssignmentTooltip extends Component {
    render() {
        const { stop, userStore, redeliverShipment } = this.props
        const { assignment } = stop
        const { isAdmin } = userStore
        return <div style={{fontSize: '13px', width: '240px', textAlign: 'center', margin: 0}}>
          <div style={{fontWeight: 'bold', marginBottom: '10px'}}>Assignment {assignment.label}</div>
          <div style = {styles.row}>
              <div style={styles.col_left}>ID:</div>
              <div style={styles.col_right}>{ assignment.id }</div>
          </div>
          <div style = {styles.row}>
              <div style={styles.col_left}>Predicted:</div>
              <div style={styles.col_right}><Moment interval={0} format={'hh:mm a'}>{ assignment.predicted_start_ts }</Moment> - <Moment interval={0} format={'hh:mm a'}>{ assignment.predicted_end_ts }</Moment></div>
          </div>
          <div style = {styles.row}>
              <div style={styles.col_left}>Driving:</div>
              <div style={styles.col_right}>{ (assignment.travel_distance / 1609).toFixed(1) } mi / { (assignment.travel_time / 3600).toFixed(1) } hours</div>
          </div>
          <div style = {styles.row}>
              <div style={styles.col_left}>Cost:</div>
              <div style={styles.col_right}> ${ assignment.tour_cost } / { assignment.shipment_count } boxes</div>
          </div>
          <div style={styles.row}>
              <div style={styles.col_left}>Box Count:</div>
              <div style={styles.col_right}>{assignment.shipment_count} / {assignment.max_box || 'N/A'}</div>
          </div>
          <div style={styles.row}>
              <div style={styles.col_left}>Volumic:</div>
              <div style={styles.col_right}>{assignment.volumic} / {assignment.max_volumic || 'N/A'}</div>
          </div>
          <div style = {styles.row}>
              <div style={styles.col_left}>Assigned:</div>
              <div style={styles.col_right}>{assignment.driver && <span> { assignment.driver.first_name } { assignment.driver.last_name }</span>}</div>
          </div>
          <div style = {styles.row}>
              <div style={styles.col_left}>Status:</div>
              <div style={styles.col_right}> { assignment.status }</div>
          </div>
          <div>
            <AxlButton compact={true} style={{width: '160px'}} onClick={ () => this.props.showAssignmentDetail && this.props.showAssignmentDetail(assignment) }>DETAIL</AxlButton>
          </div>
        </div>
    }
}

@inject('assignmentStore', 'shipmentStore')
@observer
class AssignmentListMap extends Component {
  constructor(props) {
      super(props)
      this.state = {
          error: '',
          zoom: 13,
          viewport: {
              latitude: 37.7577,
              longitude: -122.4376,
              zoom: 11
          },
          mapStyle: process.env.REACT_APP_MAP_STYLE_URL,
      };
      this.showAssignmentTooltip = this.showAssignmentTooltip.bind(this)
      this._renderAssignmentTooltip = this._renderAssignmentTooltip.bind(this)
      this.clearShipment = this.clearShipment.bind(this)
      this.addShipment = this.addShipment.bind(this)
      this.cancelAddShipment = this.cancelAddShipment.bind(this)
      this.iconMapping = {}
      const iconW = 36, iconH = 36, iconAnchor = 18
      this.iconMapping['green'] = {
          x: 0, y: 0, width: iconW, height: iconH, anchorY: iconAnchor
      }
      this.iconMapping['red'] = {
          x: iconW, y: 0, width: iconW, height: iconH, anchorY: iconAnchor
      }
      this.iconMapping['yellow'] = {
          x: iconW * 2, y: 0, width: iconW, height: iconH, anchorY: iconAnchor
      }
      this.iconMapping['cyan'] = {
          x: iconW * 3, y: 0, width: iconW, height: iconH, anchorY: iconAnchor
      }
      this.iconMapping['purple'] = {
          x: iconW * 4, y: 0, width: iconW, height: iconH, anchorY: iconAnchor
      }
      this.iconMapping['white'] = {
        x: iconW * 5, y: 0, width: iconW, height: iconH, anchorY: iconAnchor
      }
  }

  cancelAddShipment = (e) => {
    this.setState({showAddShipment: false});
  };

  addShipment = (a, shipmentId) => {
    this.setState({error: ''});
    const { assignmentStore } = this.props;
    assignmentStore.redeliverShipment(shipmentId).then((data) => {
      if(!data.ok && data.message) {
        this.setState({error: data.message});
      } else {
        const {shipment, assignment} = data;
        if (!!shipment) {
          if (!shipment.dropoff_address || !shipment.dropoff_address.lat || !shipment.dropoff_address.lng) {
            this.setState({error: 'Cannot locate shipment. Shipment status is ' + shipment.status});
          } else if (shipment.is_cancelled) {
            this.setState({error: 'Shipment is cancelled, Status is ' + shipment.status});
          } else {
            // hide complete + in progress route
            assignmentStore.setHidden('completed', true);
            assignmentStore.setHidden('in_progress', true);
            this.setState({showAddShipment: false, redeliverShipment: shipment, redeliverAssignment: assignment});
            this.fitBoundary([
              [shipment.dropoff_address.lng - 0.05, shipment.dropoff_address.lat - 0.05],
              [shipment.dropoff_address.lng + 0.05, shipment.dropoff_address.lat + 0.05]
            ]);
          }
        } else {
          this.setState({error: 'Shipment not found!'});
        }
      }
    })
  };

  clearShipment() {
    this.setState({redeliverShipment: null})
    this.props.assignmentStore.setHidden('completed', false);
    this.props.assignmentStore.setHidden('in_progress', false);
    // const { assignmentStore } = this.props;
    // assignmentStore.redeliverShipment = null
  }

  componentDidMount() {
    this.boundaryDisposer = autorun(() => {
      const { assignmentStore } = this.props;
      const { boundary } = assignmentStore

      if (!boundary)
        return

      this.fitBoundary(boundary)
    }, {delay: 100})
  }

  fitBoundary(boundary) {
    if (this.currentBoundary && this.currentBoundary === boundary) {
      return
    }
    this.currentBoundary = boundary
    if (!this.state.viewport)
      return
    // too small box
    let isTooSmall = boundary[1][0] -  boundary[0][0] < 0.0004
    let c = { longitude: boundary[0][1], latitude: boundary[0][0], zoom: 15}
    const viewport = new WebMercatorViewport(this.state.viewport);

    let { longitude, latitude, zoom } = isTooSmall ? c : viewport.fitBounds(
        boundary.slice().map(b => b.slice()),
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

  componentWillUnmount() {
    if (this.boundaryDisposer) this.boundaryDisposer()
  }

  stopColorEncode(s) {
    if (s === 'DF' || s === 'FF') return 'red'
    if (s === 'DL') return 'purple'
    if (s === 'DE') return 'cyan'
    if (s === 'DS') return 'green'
    return 'yellow'
  }

  _renderPath() {
      const { assignmentStore } = this.props
      const { activeDriverLocations, completedAssignments, inProgressAssignments, pendingAssignments, unassignedAssignments,
         pickingUpAssignments, inactiveAssignments, riskyAssignments,
         hidden } = assignmentStore
      const assignments = [...(hidden['completed'] ? [] : completedAssignments.slice())
        ,...(hidden['in_progress'] ? [] : inProgressAssignments.slice())
        ,...(hidden['picking_up'] ? [] : pickingUpAssignments.slice())
        ,...(hidden['pending'] ? [] : pendingAssignments.slice())
        ,...(hidden['unassigned'] ? [] : unassignedAssignments.slice())
        ,...(hidden['inactive'] ? [] : inactiveAssignments.slice())
        ,...(hidden['at_risk'] ? [] : riskyAssignments.slice())
      ]
      if (!assignments)
          return []
      const data = assignments.filter(a => a.path).map(a => {
        return {
          path: a.path.slice().map(l => l.slice()).map(l => [l[1], l[0]]),
          label: a.label,
          color: COLOR_PALETE[a.id % COLOR_PALETE.length],
          id: a.id,
        }
      })
      const layer = new PathLayer({
          id: 'path-layer',
          data: data,
          widthScale: 5,
          rounded: true,
          widthMinPixels: 2,
          getPath: d => d.path,
          getColor: d => d.color,
          getWidth: d => 1
      });

      /* dropoff */
      let dropoffMarkers = null
      if(assignments && assignments.length > 0) {
        dropoffMarkers = assignments.slice().filter(a => a.path).flatMap(p => {
          let st = p.extra && p.extra.dropoff_status ? p.extra.dropoff_status.split('|').filter(d => d && d.length > 0 && d[0] === 'D') : null
          return p.path.slice().map((d,i) => {
            return {
                location: _.reverse(d.slice()),
                assignment: p,
                size: 18,
                icon: !p.driver_id ? 'white' : st ? this.stopColorEncode(st[i]) : 'yellow'
            }
          })
        })
      }
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
          opacity: 1,
          visible: true,
          getPosition: d => d.location,
          getSize: d => d.size,
          onClick: (info) => {
            const {object} = info
            if (object && object.assignment)
              this.showAssignmentTooltip(object)
            if (!object)
              this.showAssignmentTooltip(null)
          }

      });


      const driverIconlayer = new IconLayer({
          id: 'driver-icon-layer',
          data: activeDriverLocations,
          pickable: true,
          // iconAtlas and iconMapping are required
          // getIcon: return a string
          // iconAtlas: CAR,
          // iconMapping: {'car': {x: 0, y: 0, width: 32, height: 32, mask: false, anchorY: 16}},
          iconAtlas: CarIcon,
          iconMapping: CAR_ICON_MAPPING,
          getAngle: d => d.geolocation.angle,
          getIcon: d => DETECT_CAR_COLOR(d.driver),
          sizeScale: 1,
          opacity: 1,
          visible: true,
          getPosition: d => d.geolocation.lnglat.slice(),
          getSize: d => 24,
          onClick: (info) => {
            const {object} = info
            if (object && object.assignment)
              this.showDriverLocationToolTip(object)
            if (!object)
              this.showDriverLocationToolTip(null)
          }
      });


      return [layer, dropoffIconlayer, driverIconlayer]
  }

  showAssignmentTooltip(stop) {
    if (!stop) return this.setState({ hoveredStop: null, hoveredDriver: null });
    api.get(`/assignments/${stop.assignment.id}/detail`)
      .then((response) => {
        if (response.data) {
          const { maxBox, maxVolumic } = response.data;
          stop.assignment.max_box = maxBox || 'N/A';
          stop.assignment.max_volumic = maxVolumic || 'N/A';
        }
        this.setState({ hoveredStop: stop, hoveredDriver: null });
      })
      .catch(() => this.setState({ hoveredStop: null, hoveredDriver: null }));
  }

  showDriverLocationToolTip(location) {
    this.setState({ hoveredDriver: location, hoveredStop: null })
  }

  gotoAssignmentDetails = (assignment) => {
    if (this.props.showAssignmentDetail) {
      if (this.state.redeliverShipment) {
        this.props.showAssignmentDetail(assignment, this.state.redeliverShipment.id);
      } else {
        this.props.showAssignmentDetail(assignment);
      }
    }
  };

  _renderAssignmentTooltip() {
    const { hoveredStop } = this.state;
    return hoveredStop && (
        <Popup tipSize={5}
            anchor="bottom"
            longitude={ hoveredStop.location[0] }
            latitude={ hoveredStop.location[1] }
            offsetTop={-18}
            captureClick={true}
            className={'map-tooltip'}
            closeButton={true}
            closeOnClick={false}
            onClose={() => this.setState({ hoveredStop: null })} >
            <StopAssignmentTooltip stop={hoveredStop} showAssignmentDetail={this.gotoAssignmentDetails} />
        </Popup>
    );
  }

  _renderDriverTooltip() {
    const { hoveredDriver } = this.state;
    return hoveredDriver && (
        <Popup tipSize={5}
            anchor="bottom"
            longitude={ hoveredDriver.geolocation.lnglat[0] }
            latitude={ hoveredDriver.geolocation.lnglat[1] }
            offsetTop={-18}
            captureClick={true}
            className={'map-tooltip'}
            closeButton={true}
            closeOnClick={false}
            onClose={() => this.setState({ hoveredDriver: null })} >
            <div style={{textAlign: 'left', fontSize: '13px', minWidth: '200px'}}>
              <div>
                { hoveredDriver.driver && hoveredDriver.driver.photo && <div style={{ display: 'inline-block', textAlign: 'center', width: '48px', height: '48px', borderRadius: '24px', marginRight: '8px', float: 'left', overflow: 'hidden'}}>
                  <img src={hoveredDriver.driver.photo} style={{width: '100%'}} />
                </div> }
                <code>[{hoveredDriver.driverId}]</code>
                { hoveredDriver.driver && <span> {hoveredDriver.driver.first_name} {hoveredDriver.driver.last_name}</span> }
              </div>
              <div>Assignment ID: {hoveredDriver.assignmentId}</div>
              {hoveredDriver.assignment && <div>
                {hoveredDriver.assignment.label && <div>Assignment Label: {hoveredDriver.assignment.label}</div>}
                <div style={{textAlign: 'center'}}>
                  <AxlButton compact={true} style={{width: '160px'}} onClick={ () => this.props.showAssignmentDetail && this.props.showAssignmentDetail(hoveredDriver.assignment) }>SHOW ASSIGNMENT</AxlButton>
                </div>
              </div>}

            </div>
        </Popup>
    );
  }

  render() {
    const { showAddShipment, redeliverShipment, redeliverAssignment, error } = this.state
    return <ReactMapGL
        {...this.state.viewport}
        mapStyle={this.state.mapStyle}
        transitionInterpolator={new LinearInterpolator()}
        onViewportChange={(viewport) => this.setState({ viewport })}
        width={'100%'}
        height={'100%'}
        ref={map => this.mapRef = map}
    >
      <DeckGL onLayerClick = { (info) => {if (!info || !info.object) this.setState({hoveredStop: null, hoveredDriver: null}) } } {...this.state.viewport} layers={ [ ...this._renderPath() ] } />
      {this._renderAssignmentTooltip()}
      {this._renderDriverTooltip()}

      { redeliverShipment && <Marker latitude={redeliverShipment.dropoff_address.lat} longitude={redeliverShipment.dropoff_address.lng} offsetLeft={-11} offsetTop={-11}>
        <div style={{width: '18px', height: '18px', borderRadius: '11px', backgroundColor: '#f00', border: 'solid 2px #800', opacity: 0.8}} />
      </Marker>}

      <div style={{position: 'absolute', left: '6px', top: '6px'}}>
        {!redeliverShipment && <AxlButton compact={true} tiny={true} onClick={() => this.setState({showAddShipment: true}) }>Redeliver</AxlButton>}
        {redeliverShipment && (
          <div style={{ width: '200px', padding: '6px', backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0px 1px 1px #444' }}>
            <div><code>{redeliverShipment.id}</code></div>
            <div>Status: <em>{redeliverShipment.status}</em></div>
            <div>Customer: <strong>{redeliverShipment.customer.name}</strong></div>
            <div>
              <div>{redeliverShipment.dropoff_address.street}</div>
              <div>{redeliverShipment.dropoff_address.city}, {redeliverShipment.dropoff_address.state} {redeliverShipment.dropoff_address.zipcode}</div>
            </div>
            {redeliverAssignment && (
              <div style={{marginTop: 10, borderTop: '1px solid #ccc', paddingTop: 5}}>
                <div>Current Assignment</div>
                <div><code>{redeliverAssignment.id}</code></div>
                <div>Status: <em>{redeliverAssignment.status}</em></div>
                <div>Date: <Moment format="MM/DD/YYYY">{redeliverAssignment.predicted_start_ts}</Moment></div>
              </div>
            )}
            <div style={{textAlign: 'center', margin: '4px'}}>
              <AxlButton style={{width: '120px'}} compact={true} bg={'red'} tiny={true} onClick={this.clearShipment}>Clear</AxlButton>
            </div>
          </div>
        )}
      </div>

      { showAddShipment && <AxlModal style={{...styles.axlModal, ...styles.axlAddShipmentModal}} onClose={() => this.setState({showAddShipment: false})} >
          <AdditionalShipmentForm onAddShipment={this.addShipment} onCancel={this.cancelAddShipment} error={error} />
      </AxlModal> }

    </ReactMapGL>
  }
}

export default AssignmentListMap
