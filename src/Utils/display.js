import _ from 'lodash';
import {SHIPMENT_STATUSES as SHIPMENT_STATUS} from "../constants/shipment";
import {CALL_AGRUMENTS} from "../constants/callSession";

// Convert text to Capitalize
export function toCapitalize(text) {
  if(!text) return;

  return text.split("").map((l, i) => {
      if(i!==0) {
        return l.toLowerCase();
      } else {
        return l.toUpperCase()
      }
    }).join("");
}

export const titleCase = (text) => _.startCase(_.toLower(text));

// Convert driver license format

export function convertDriverLicenseFormat(text) {
  if(!text) return null;

  var regObj = {
    'firstName':                ['DAC','DCT','DCT','DAC','DAC','DAC','DAC','DAC'],
    'lastName':                 ['DAB','DCS','DCS','DCS','DCS','DCS','DCS','DCS'],
    'middleName':               ['DAD','DAD','DAD','DAD','DAD','DAD','DAD','DAD'],
    'expirationDate':           ['DBA','DBA','DBA','DBA','DBA','DBA','DBA','DBA'],
    'issueDate':                ['DBD','DBD','DBD','DBD','DBD','DBD','DBD','DBD'],
    'dateOfBirth':              ['DBB','DBB','DBB','DBB','DBB','DBB','DBB','DBB'],
    'gender':                   ['DBC','DBC','DBC','DBC','DBC','DBC','DBC','DBC'],
    'eyeColor':                 ['DAY','DAY','DAY','DAY','DAY','DAY','DAY','DAY'],
    'hairColor':                ['DAZ','DAZ','DAZ','DAZ','DAZ','DAZ','DAZ','DAZ'],
    'height':                   ['DAU','DAU','DAU','DAU','DAU','DAU','DAU','DAU'],
    'streetAddress':            ['DAG','DAG','DAG','DAG','DAG','DAG','DAG','DAG'],
    'streetAddressSupplement':  ['DAH','DAH','DAH','DAH','DAH','DAH','DAH','DAH'],
    'city':                     ['DAI','DAI','DAI','DAI','DAI','DAI','DAI','DAI'],
    'state':                    ['DAJ','DAJ','DAJ','DAJ','DAJ','DAJ','DAJ','DAJ'],
    'postalCode':               ['DAK','DAK','DAK','DAK','DAK','DAK','DAK','DAK'],
    'customerId':               ['DBJ','DAQ','DAQ','DAQ','DAQ','DAQ','DAQ','DAQ'],
    'documentId':               ['N/A','DCF','DCF','DCF','DCF','DCF','DCF','DCF'],
    'issuingCountry':           ['N/A','DCG','DCG','DCG','DCG','DCG','DCG','DCG'],
    'middleNameTruncation':     ['N/A','DDG','N/A','DDG','DDG','DDG','DDG','DDG'],
    'firstNameTruncation':      ['N/A','DDF','N/A','DDF','DDF','DDF','DDF','DDF'],
    'lastNameTruncation':       ['N/A','DDE','N/A','DDE','DDE','DDE','DDE','DDE'],
    'placeOfBirth':             ['N/A','N/A','DCI','DCI','DCI','DCI','DCI','DCI'],
    'auditInformation':         ['N/A','N/A','DCJ','DCJ','DCJ','DCJ','DCJ','DCJ'],
    'inventoryControlNumber':   ['N/A','N/A','DCK','DCK','DCK','DCK','DCK','DCK'],
    'lastNameAlias':            ['DBO','DBN','DBN','DBN','DBN','DBN','DBN','DBN'],
    'firstNameAlias':           ['DBP','DBG','DBG','DBG','DBG','DBG','DBG','DBG'],
    'suffixAlias':              ['DBR','N/A','DBS','DBS','DBS','DBS','DBS','DBS'],
    'suffix':                   ['DBN','DCU','DCU','DCU','DCU','DCU','DCU','DCU'],
  }
  var results = {};
  var arr = "";
  arr = text.split(/\s+/);
  arr = arr.map(r => {
    Object.values(regObj).map((regArr, id) => regArr.map(reg => {
      const rg = new RegExp(reg, 'ig');
      const check = r.match(rg);
      if(check) {
        const regSplit = new RegExp(check.pop(), 'ig');
        results[Object.keys(regObj)[id]] = r.replace(regSplit, '');
        return;
      }
    }))
  });

  return results;
}

// Conver shipment outbound events
export function translateEvents(originalEvents, shipment) {
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
  if (translatedEvents.length === 0 && shipment && shipment.status === SHIPMENT_STATUS.PICKUP_FAILED) {
    translatedEvents.unshift({
      shipment_id: shipment.id,
      convertedSignal: 'PICKUP_FAILED__MISSING',
      ts: shipment.dropoff_earliest_ts
    })
  }

  return translatedEvents;
}

export function handleAgrument(a) {
  const agrs = a.split('|');
  const arg_1 = a[0];
  const arg_2 = a[1] || null;

  if(arg_1 === CALL_AGRUMENTS.RECIPIENT) {
    return ({type: CALL_AGRUMENTS.RECIPIENT, shipmentId: arg_2});
  } else if(arg_1 === CALL_AGRUMENTS.UNKNOWN_RECIPIENT) {
    return ({type: CALL_AGRUMENTS.UNKNOWN_RECIPIENT, shipmentId: arg_2})
  } else return null;
}

export function copyToClipboard(text) {
  var textField = document.createElement('textarea');
  textField.innerText = text;
  document.body.appendChild(textField);
  textField.select();
  document.execCommand('copy');
  textField.remove();
}

export function copyToLocation({altitude = null, latitude = null, longitude = null}) {
  var textField = document.createElement('textarea');
  textField.innerText = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  document.body.appendChild(textField);
  textField.select();
  document.execCommand('copy');
  textField.remove();
}

export function IDScanTimeFormatNormal(text) {
  // MMDDYYYY => MM/DD/YYYY
  const month = text.substr(0, 2);
  const day = text.substr(2, 2);
  const year = text.substr(4, 4);

  return [month, day, year].join("/");
}

/**
 * Convert (milli)seconds to time string (hh:mm:ss[:mss]).
 *
 * @param Boolean isSec
 *
 * @return String
 */
Number.prototype.toTime = function(isSec) {
  var ms = isSec ? this * 1e3 : this,
    lm = ~(4 * !!isSec),  /* limit fraction */
    fmt = new Date(ms).toISOString().slice(11, lm);

  if (ms >= 8.64e7) {  /* >= 24 hours */
    var parts = fmt.split(/:(?=\d{2}:)/);
    parts[0] -= -24 * (ms / 8.64e7 | 0);
    return parts.join(':');
  }

  return fmt;
};

Number.prototype.toHours = function(fixed = 3) {
  if(!this) return 0;
  return parseFloat(this / 3.6e3).toFixed(fixed);
};