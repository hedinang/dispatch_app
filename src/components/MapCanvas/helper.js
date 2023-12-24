import { PathLayer, IconLayer } from 'deck.gl';
import _ from 'lodash';
import moment from 'moment';
import {toJS} from 'mobx';
import MARKERS from './data/markers.svg';
import WarehouseIcon from './data/marker-1.svg';


export const iconMappingObj = {
  green: {
    x: 0,
    y: 0,
    width: 160,
    height: 210,
    anchorY: 210,
  },
  red: {
    x: 160,
    y: 0,
    width: 160,
    height: 210,
    anchorY: 210,
  },
  yellow: {
    x: 320,
    y: 0,
    width: 160,
    height: 210,
    anchorY: 210,
  },
  cyan: {
    x: 480,
    y: 0,
    width: 160,
    height: 210,
    anchorY: 210,
  },
  purple: {
    x: 640,
    y: 0,
    width: 160,
    height: 210,
    anchorY: 210,
  },
};

for (let i = 0; i < 130; i++) {
  const w = i % 10;
  const h = (i - w) / 10;
  iconMappingObj['number-' + i] = {
    x: w * 40,
    y: 236 + h * 40,
    width: 40,
    height: 40,
    anchorY: 52,
  };
}
/* dropoff */
export const stopColorEncode = (s) => {
  if (!s.status || s.status === 'PENDING' || s.status === 'REATTEMPT') return 'yellow';
  if (s.status === 'FAILED') return 'red';
  if (moment(s.actual_departure_ts).isAfter(moment(s.shipment.dropoff_latest_ts))) return 'purple';
  if (moment(s.actual_departure_ts).isBefore(moment(s.shipment.dropoff_earliest_ts))) return 'cyan';
  return 'green';
};

export const renderPath = (stops, setHoverStop) => {
  const pickupFailed = stops.filter((s) => s.type === 'PICKUP' && s.status === 'FAILED').map((s) => s.shipment.id);
  const p = _.sortBy(stops, (s) => s.sequence_id)
    .filter((s) => s.type === 'PICK_UP' || s.type === 'DROP_OFF')
    .filter((s) => s.shipment)
    .filter((s) => pickupFailed.indexOf(s.shipment.id) < 0)
    .map((s) => (s.type === 'DROP_OFF' ? s.shipment.dropoff_address : s.shipment.pickup_address))
    .map((s) => [s.lng, s.lat]);
    
  const data = [
    {
      path: p,
      color: [20, 20, 0, 100],
    },
  ];
  const layer = new PathLayer({
    id: 'path-layer',
    data,
    pickable: true,
    widthScale: 5,
    rounded: true,
    widthMinPixels: 2,
    getPath: (d) => d.path,
    getColor: (d) => d.color,
    getWidth: (d) => 1,
    onHover: ({ object, x, y }) => {
      /* Update tooltip
                      http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
                  */
    },
  });

  /* pickup */
  const pickupMarkers = _.uniqBy(
    stops
      .filter((s) => s.type === 'PICK_UP')
      .filter((s) => s.shipment)
      .map((s) => s.shipment.pickup_address),
    'street',
  ).map((s) => {
    return {
      location: [s.lng, s.lat],
      icon: 'warehouse',
    };
  });

  const pickupIconlayer = new IconLayer({
    id: 'pickup-icon-layer',
    data: pickupMarkers,
    pickable: true,
    // iconAtlas and iconMapping are required
    // getIcon: return a string
    iconAtlas: WarehouseIcon,
    iconMapping: { warehouse: { x: 0, y: 0, width: 150, height: 150, anchorY: 150 } },
    getIcon: (d) => d.icon,
    sizeScale: 1,
    opacity: 1,
    visible: true,
    getPosition: (d) => d.location,
    getSize: (d) => 48,
  });

  const dropoffMarkers = _.sortBy(stops, (s) => s.sequence_id)
    .filter((s) => s.type === 'DROP_OFF')
    .filter((s) => s.shipment)
    .flatMap((s) => [
      {
        location: [s.shipment.dropoff_address.lng, s.shipment.dropoff_address.lat],
        stop: s,
        sequence: s.label ? _.reverse(s.label.driver_label.split('-'))[0].split('.')[0] : '0',
        icon: stopColorEncode(s),
        size: 42,
      },
      {
        location: [s.shipment.dropoff_address.lng, s.shipment.dropoff_address.lat],
        icon: 'number-' + (s.label ? _.reverse(s.label.driver_label.split('-'))[0].split('.')[0] : '0'),
        size: 28,
      },
    ]);

  const dropoffIconlayer = new IconLayer({
    id: 'dropoff-icon-layer',
    data: dropoffMarkers,
    pickable: true,
    // iconAtlas and iconMapping are required
    // getIcon: return a string
    iconAtlas: MARKERS,
    iconMapping: iconMappingObj,
    getIcon: (d) => d.icon,
    sizeScale: 1,
    opacity: 1,
    visible: true,
    getPosition: (d) => d.location,
    getSize: (d) => d.size,
    onHover: ({ object, x, y }) => {
      if (object && object.stop) setHoverStop(object ? object.stop : null);
      if (!object) setHoverStop(null);
      // const tooltip = `${object.name}\n${object.address}`;
      /* Update tooltip
               http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
            */
    },
  });

  return [layer, pickupIconlayer, dropoffIconlayer];
};
