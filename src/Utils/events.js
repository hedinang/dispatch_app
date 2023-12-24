import _ from 'lodash';
import moment from "moment";

// Utils
import * as SHIPMENT_STATUS from '../constants/shipmentStatus';
import {VERBIAGE} from "../constants/verbiage";
import { EVENT_OBJECT_TYPES } from '../constants/event';
import { secondTohour } from '../components/ReorderShipment';
import { convertMeterToMile } from '../constants/common';
import colors from '../themes/colors';

const defaultTimezone = moment.tz.guess();

function translateEvents(originalEvents, shipment) {
  let translatedEvents = _.map(originalEvents
    .filter(oe => oe.ts)
    .sort((e1, e2) => new Date(e2.ts).getTime() - new Date(e1.ts).getTime()
    ), _.clone);
  let pastSignals = [];
  translatedEvents.slice().reverse().forEach(ev => {
    ev.pastSignals = (ev.pastSignals || []).concat(pastSignals);
    if (ev.signal === SHIPMENT_STATUS.RECEIVED_OK && pastSignals.includes(SHIPMENT_STATUS.GEOCODE_FAILED)) {
      ev.convertedSignal = 'RECEIVED_OK__GEOCODE_FAILED';
    } else if (ev.signal === SHIPMENT_STATUS.PICKUP_FAILED && pastSignals.includes(SHIPMENT_STATUS.MISSING)) {
      ev.convertedSignal = 'PICKUP_FAILED__MISSING';
    } else if (ev.signal === SHIPMENT_STATUS.PICKUP_FAILED && pastSignals.includes(SHIPMENT_STATUS.RECEIVED_OK)) {
      ev.convertedSignal = 'PICKUP_FAILED__RECEIVED_OK';
    } else if (ev.signal === SHIPMENT_STATUS.PICKUP_FAILED && pastSignals.includes(SHIPMENT_STATUS.RECEIVED_DAMAGED)) {
      ev.convertedSignal = 'PICKUP_FAILED__RECEIVED_DAMAGED';
    } else if (ev.signal === SHIPMENT_STATUS.PICKUP_FAILED) {
      ev.convertedSignal = 'PICKUP_FAILED__UNSCANNED';
    }  else if (ev.signal === SHIPMENT_STATUS.PICKUP_SUCCEEDED && pastSignals.includes(SHIPMENT_STATUS.DROPOFF_FAILED)) {
      ev.convertedSignal = 'PICKUP_SUCCEEDED__REATTEMPT';
    } else if(ev.signal === SHIPMENT_STATUS.DROPOFF_FAILED && _.countBy(pastSignals)[SHIPMENT_STATUS.PICKUP_SUCCEEDED] > 1) {
      ev.convertedSignal = 'UNDELIVERABLE';
    } else if (ev.signal === SHIPMENT_STATUS.DROPOFF_FAILED && pastSignals.includes(SHIPMENT_STATUS.DROPOFF_FAILED)) {
      ev.convertedSignal = 'DROPOFF_FAILED__REATTEMPT';
    } else if (ev.signal === SHIPMENT_STATUS.DROPOFF_SUCCEEDED && pastSignals.includes(SHIPMENT_STATUS.DROPOFF_FAILED)) {
      ev.convertedSignal = 'DROPOFF_SUCCEEDED__REATTEMPT';
    } else if (ev.signal === SHIPMENT_STATUS.UNDELIVERABLE) {
      ev.convertedSignal = 'UNDELIVERABLE';
    } else if (ev.signal === SHIPMENT_STATUS.DISPOSABLE) {
      ev.convertedSignal = 'DISPOSABLE';
    } else {
      ev.convertedSignal = ev.signal;
    }
    pastSignals.push(ev.signal);
  });

  // Handle the case missing but inbound lock does not populate event
  if (translatedEvents.length === 0 && shipment.status === SHIPMENT_STATUS.PICKUP_FAILED) {
    translatedEvents.unshift({
      shipment_id: shipment.id,
      convertedSignal: 'PICKUP_FAILED__MISSING',
      ts: shipment.dropoff_earliest_ts
    })
  }

  return translatedEvents;
}

const renderDeliveryTimeAndLabel = (milestone, events, shipment) => {
  const timezone = shipment && shipment.timezone ? shipment.timezone : 'America/Los_Angeles';
  const timeAndLabel = {
    time: '',
    label: 'Scheduled Delivery on:',
  };
  const eventTsList = events.filter(e => VERBIAGE[e.convertedSignal]).map(e => e.ts);
  const latestEventTs = eventTsList[0] || shipment.dropoff_latest_ts;

  switch (milestone) {
    case SHIPMENT_STATUS.PROCESSING:
    case SHIPMENT_STATUS.PROCESSED:
    case SHIPMENT_STATUS.RECEIVED:
    case SHIPMENT_STATUS.OUT_FOR_DELIVERY:
    case SHIPMENT_STATUS.NEXT_IN_QUEUE:
    default:
      const fromDate = moment(shipment.dropoff_earliest_ts).tz(timezone).format('MM/DD/YYYY');
      const fromTime = moment(shipment.dropoff_earliest_ts).tz(timezone).format('hh:mm A');
      const toDate = moment(shipment.dropoff_latest_ts).tz(timezone).format('MM/DD/YYYY');
      const toTime = moment(shipment.dropoff_latest_ts).tz(timezone).format('hh:mm A');

      timeAndLabel.label = 'Scheduled Delivery on:';
      timeAndLabel.time = fromDate === toDate
        ? `${fromDate}, ${fromTime} - ${toTime}`
        : `${fromDate} ${fromTime} - ${toDate} ${toTime}`;
      break;
    case SHIPMENT_STATUS.FAILED:
      timeAndLabel.label = 'Attempted on:';
      timeAndLabel.time = moment(latestEventTs).tz(timezone).format('MM/DD/YYYY hh:mm A');
      break;
    case SHIPMENT_STATUS.DELIVERED:
      timeAndLabel.label = 'Delivered on:';
      timeAndLabel.time = moment(latestEventTs).tz(timezone).format('MM/DD/YYYY hh:mm A');
      break;
  }

  return timeAndLabel;
};

const convertAssignmentConversationToTitle = (obj) => {
  if(!obj) return '';

  const isToday = moment().isSame(obj.ts, 'day');
  const date = isToday ? 'TODAY' : moment(obj.ts).format('MM/DD/YYYY');
  const time = moment(obj.ts).format('hh:mmA');
  const status = obj.status;

  if(obj.ref_type === 'ASSIGNMENT') {
    return `ASSIGNMENT ${status.toUpperCase()} - ${date}, ${time}`;
  } else if(obj.ref_type === 'PICK_UP') {
    return `${obj.label} PICKUP ${status.toUpperCase()} - ${date}, ${time}`;
  } else if(obj.ref_type === 'DROP_OFF') {
    return `${obj.label} DROPOFF ${status.toUpperCase()} - ${date}, ${time}`;
  } else {
    return null;
  }
}

const filterEvents = (type, array) => {
  if(!array || !array.length) return [];

  let cloneArray = [];

  if(type === 'ASSIGNMENT') {
    cloneArray = array.map(a => (
      ['activate', 'deactivate', 'finish'].indexOf(a.action) !== -1 && {status: a.action, ref_type: 'ASSIGNMENT', ts: a.ts})
    ).filter(a => a);
  } else if(type === 'STOPS') {
    cloneArray = array
      .filter(s => _.includes(['SUCCEEDED', 'FAILED'], s.status) && _.includes(['PICK_UP', 'DROP_OFF'], s.type))
      .map(s => ({
        label: s.label ? s.label.driver_label : null,
        status: s.status,
        ref_type: s.type,
        ts: Date.parse(s._updated)
      })
    );
  } else if(type === 'TIMELINE') {
    cloneArray = array.map(msg => ({ref_type: msg.activity, body: msg.description, ...msg}))
  }

  return cloneArray;
}

const mapShipmentLabelToStops = (shipmentLabels, stops) => stops.map(stop => {
  if(stop.type === 'PICK_UP') {
    const s = shipmentLabels.filter(s => s.pickup_stop_id === stop.id)[0];
    return ({label: {driver_label: s.driver_label}, ...stop});
  } else if(stop.type === 'DROP_OFF') {
    const s = shipmentLabels.filter(s => s.dropoff_stop_id === stop.id)[0];
    return ({label: {driver_label: s.driver_label}, ...stop});
  }
});

const convertActivityLogToTitle = (obj) => {
  if(!obj) return '';

  const cachedUsers = JSON.parse(sessionStorage.getItem(`${process.env.REACT_APP_SESSION_STORAGE_PREFIX}-USERS`));
  const isToday = moment().isSame(obj.ts, 'day');
  const date = isToday ? 'TODAY' : moment(obj.ts).format('MM/DD/YYYY');
  const time = moment(obj.ts).format('hh:mmA');

  if(obj.description) {
    return `${obj.description} - ${date}, ${time}`;
  } else if(obj.activity) {
    const user = cachedUsers &&
      cachedUsers.value &&
      cachedUsers.value.filter(u => (u.id === obj.user_id))[0] || {username: `User ${obj.user_id}`};
    const userTrigger = cachedUsers &&
      cachedUsers.value &&
      obj.trigger_user_id &&
      cachedUsers.value.filter(u => u.id === obj.trigger_user_id)[0] || {username: `User ${obj.trigger_user_id}`};
    const mappedToActivity = {
      SOLVE_TOPIC: `${user.username} has solved this topic  - ${date}, ${time}`,
      UNSOLVE_TOPIC: `${user.username} has unsolved this topic - ${date}, ${time}`,
      FOLLOW_TOPIC: `${user.username} has followed this topic - ${date}, ${time}`,
      UNFOLLOW_TOPIC: `${userTrigger.username} has unfollowed this topic - ${date}, ${time}`,
      FORCED_FOLLOW_TOPIC: `${userTrigger.username} has forced ${user.username} to follow this topic - ${date}, ${time}`,
      FORCED_UNFOLLOW_TOPIC: `${userTrigger.username} has forced ${user.username} to unfollow this topic - ${date}, ${time}`,
    }

    return mappedToActivity[obj.activity];
  } else '';

}

const separateObject = (obj) => {
  if(!obj){
      return {
          object_type: '',
          object_id: ''
      }
  }
  const { uid } = obj;
  if(!uid){
    return {
        object_type: '',
        object_id: ''
    }
  } else {
    const type = uid.split('_')[0];
    const object_type = EVENT_OBJECT_TYPES[type] ? EVENT_OBJECT_TYPES[type] : type;
    const object_id = uid.split('_')[1];
    return {
      object_type: object_type,
      object_id: object_id
    }
  }
}

const objectList = () => {
  return function (text, render) {
    const self = this;
    const splitText = text.trim().split('\\');
    const symbol = splitText[1] || '@';
    
    const data = _.get(self, splitText[0]);
    if(!data) return '';

    const inner = Object.entries(data)
      .map(([key, val]) => val && `<li><strong>${key}</strong> <span style="color: #882222">${symbol}</span> ${val}</li>`)
      .join("");

    return `<ul>${inner}</ul>`
  }
}

const lowerCase = () => {
  return function (text, render) {
    const value = render(text);
    return value.toLowerCase();
  }
}

const upperCase = () => {
  return function (text, render) {
    const value = render(text);
    return value.toUpperCase();
  }
}

const removeDash = () => {
  return function (text, render) {
    const value = render(text);
    return value.replaceAll(['_'], '');
  }
}

const replaceDash = () => {
  return function (text, render) {
    const value = render(text);
    return value.replaceAll(['_'], ' ');
  }
}

const convertMeterToMileString = () => {
  return function(val, render) {
    const renderValue = render(val);
    if(!renderValue || isNaN(renderValue)) return '';

    return `${convertMeterToMile(+renderValue, 1)}`;
  }
}

const convertSecondToHour = () => {
  return function(val, render) {
    const renderValue = render(val);
    if(!renderValue || isNaN(renderValue)) return '';

    return secondTohour(+renderValue);
  }
}

const getDotColor = (color, event) => {
  if (color != null && color.startsWith("$.")) {
    const colorField = color.replace("$.", "");
    const colorFieldValue = _.get(event, colorField, "");

    if (!colorFieldValue) return colors.grayMain
    if (['SUCCEEDED', 'GEOCODED', 'DROPOFF_SUCCEEDED', 'RECEIVED_OK', 'SUCCESSED'].includes(colorFieldValue)) return colors.lightGreen
    if (['EN_ROUTE', 'COMING_SOON', 'PICKUP_SUCCEEDED', 'PICKUPED'].includes(colorFieldValue)) return colors.main
    if (['READY', 'ROUTED', 'PICKUP_READY', 'DROPOFF_READY'].includes(colorFieldValue)) return colors.lightOrange
    if (['FAILED', 'GEOCODE_FAILED', 'DROPOFF_FAILED', 'PICKUP_FAILED'].includes(colorFieldValue)) return colors.red
    return colors.grayMain
  }
  return color;
}

const listFieldBoolean = ['all'];

const transformBoolean = (evt, field, val) => {
  if (!val || val === 'false') return evt[field] = false;
  return evt[field] = true;
}

const tranformEventMap = (date, dataEvents, templates) => {
  dataEvents = dataEvents.flatMap((e) => {
    let d = moment(e.ts)
      .format('dddd M/D/YYYY')
      .toUpperCase();
    if (d === date) return [e];
    else {
      date = d;
      return [{ signal: 'DATE', date: d }, e];
    }
  });

  const dataTemplates = templates.data;
  let dataMap = new Map();
  for (const e of dataEvents) {
    let template = dataTemplates.find(f => f.category === e.category && f.action === e.action && f.type === e.type);
    template = template ? template : dataTemplates.find(f => f.category === 'DEFAULT' && f.type === 'DEFAULT' && f.action === 'default');
    if (!template.hidden && e.signal !== 'DATE') {
      const subject = separateObject(e.subject);
      const object = separateObject(e.object);
      const rel = separateObject(e.rel);
      const ref = separateObject(e.ref);
      const source = separateObject(e.source);
      const fact = e.fact;
      if(!_.isEmpty(fact)) {
        for (let idx = 0; idx < listFieldBoolean.length; idx++) {
          const field = listFieldBoolean[idx];
          const data = !_.isEmpty(fact[field]) && fact[field].toLowerCase();
          if (_.isEmpty(data)) {
            break;
          }
          transformBoolean(fact, field, data);
        }
      }
      dataMap.set(e.id, {
        origin: e,
        converted: {
          id: e.id,
          sub_type: subject.object_type,
          sub_id: subject.object_id,
          sub: `${subject.object_type} [${subject.object_id}]`,
          obj_type: object.object_type,
          obj_id: object.object_id,
          obj: `${object.object_type} [${object.object_id}]`,
          rel_type: rel.object_type,
          rel_id: rel.object_id,
          rel_obj: `${rel.object_type} [${rel.object_id}]`,
          ref_type: ref.object_type,
          ref_id: ref.object_id,
          ref_obj: `${ref.object_type} [${ref.object_id}]`,
          source_type: source.object_type,
          source_id: source.object_id,
          source_obj: `${source.object_type} [${source.object_id}]`,
          fromRecipient: source.object_id && source.object_id.toLowerCase().includes('recipient'),
          functions: ['lowerCase', 'upperCase', 'removeDash', 'replaceDash', 'convertMeterToMileString', 'convertSecondToHour', 'objectList', 'splitText', 'capitalizeText', 'formatDateTime', 'formatDate', 'formatTime', 'renderLocation', 'compareObject']
        },
        template: template,
      })
    }
    if (e.signal === 'DATE') {
      template = dataTemplates.find(f => f.category === 'DATE' && f.type === 'DATE' && f.action === 'date');
      dataMap.set(e.date, {
        origin: e,
        converted: {
          date: e.date,
        },
        template: template,
      })
    }
  }
  return dataMap;
}

const capitalizeText = () => {
  return function (text, render) {
    const value = render(text);
    if(!value) return '';

    return value.replace(/(^\w|\s\w)(\S*)/g, (_,m1,m2) => m1.toUpperCase() + m2.toLowerCase());
  }
};

const splitText = () => {
  return function (text, render) {
    if(!text) return '';
    
    const self = this;
    const splitText = text.trim().split('\\');
    const symbol = splitText[1] || ',';
    const data = _.get(self, splitText[0]);

    if(!data) return '';
    const contents = data.split(symbol);

    const inner = contents
      .map((val) => val && `<li> ${val} </li>`)
      .join("");
      
    return `<ul>${inner}</ul>`
  }
}

const formatDateTime = () => {
  return function (text, render) {
    if(!text) return '';

    const self = this;
    const splitText = text.trim().split('|');
    const date = _.get(self, splitText[0]);
    const dataTimezone = _.get(self, splitText[1]);

    const tz = dataTimezone || defaultTimezone;
    const format = splitText[2] || `MM/DD/YYYY HH:mm z`;

    if (!date) return '';

    return `${moment.tz(date, tz).format(format)}`;
  }
}

const renderLocation = () => {
  return function (text, render) {
    if(!text) return '';

    const splitLocation = text.trim().split('|');
    if(splitLocation && splitLocation.length < 2) return ''

    const lat = parseFloat(render(splitLocation[0]));
    const long = parseFloat(render(splitLocation[1]));

    if (!lat || !long) return ''
    
    return `<div style="cursor: pointer;" class="show-map-marker" data-lat=${lat} data-long=${long}>At location [${lat.toFixed(6)}, ${long.toFixed(6)}] <a target="_blank" href="https://www.google.com/maps/search/?api=1&query=${lat},${long}">Google Map</a></div>`
  }
}

const compareObject = () => {
  return function (text, render) {
    if(!text) return '';

    const self = this;
    const splitText = text.trim().split('|');
    const state = _.get(self, splitText[0]);
    const fact = _.get(self, splitText[1]);

    if(_.isEmpty(state)) return '';

    return Object.keys(state).map(key => {
      if(_.isEmpty(fact) || state[key] !== fact[key]) {
        return `<div>${key}: ${state[key]}</div>`
      }
    }).join("\r\n")
  }
}

export {
  filterEvents,
  translateEvents,
  mapShipmentLabelToStops,
  convertActivityLogToTitle,
  renderDeliveryTimeAndLabel,
  convertAssignmentConversationToTitle,
  separateObject,
  objectList,
  lowerCase,
  upperCase,
  removeDash,
  replaceDash,
  convertMeterToMileString,
  convertSecondToHour,
  getDotColor,
  tranformEventMap,
  splitText,
  capitalizeText,
  formatDateTime,
  renderLocation,
  compareObject,
}
