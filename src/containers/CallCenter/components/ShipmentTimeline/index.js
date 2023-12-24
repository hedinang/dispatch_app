import React from 'react';
import {VERBIAGE} from "../../../../constants/verbiage";
import {renderDeliveryTimeAndLabel, translateEvents} from "../../../../Utils/events";
import {isoToLocalHuman, isToday} from "../../../../Utils/calendar";
import * as SHIPMENT_STATUS from "../../../../constants/shipmentStatus";
import moment from "moment";
import styles, * as E from './styles';

export default class ShipmentTimeline extends React.Component {

  renderText = (event, shipment, client) => {
    if (!VERBIAGE[event.convertedSignal]) return null;
    const timezone = shipment && shipment.timezone ? shipment.timezone : 'America/Los_Angeles';
    const etaInSeconds = event.eta ? Math.round((event.eta || 0)/1000) : 0;
    const etaInTime = (etaInSeconds + moment(event.ts).unix()) * 1000;
    const dropoffTime = moment(shipment.dropoff_latest_ts).tz(timezone).format('HH:mm');
    const eventDate = moment(event.ts).tz(timezone).format('YYYY-MM-DD');
    const eventDateTimeIso = moment.tz(eventDate + ' ' + dropoffTime, timezone).toISOString();

    VERBIAGE[event.convertedSignal].axlehire_email = 'support@axlehire.com';
    VERBIAGE[event.convertedSignal].dropoff_latest = isoToLocalHuman(shipment.dropoff_latest_ts, timezone, event.ts);
    VERBIAGE[event.convertedSignal].eta_in_minutes = event.eta ? Math.round(etaInSeconds/60) : null;
    VERBIAGE[event.convertedSignal].client_company = client.company;
    VERBIAGE[event.convertedSignal].event_latest_ts = isoToLocalHuman(eventDateTimeIso, timezone, event.ts);
    VERBIAGE[event.convertedSignal].eta_in_time = event.eta && event.ts ? moment(etaInTime).tz(timezone).format('hh:mm A'):
      moment(shipment.dropoff_latest_ts).tz(timezone).format('hh:mm A');
    return VERBIAGE[event.convertedSignal].description;
  };

  render() {
    const { shipment, events, client } = this.props;

    if(!shipment || !events || !events.length || !client) return false;

    const progress = {
      [SHIPMENT_STATUS.PROCESSING]: {left: '0'},
      [SHIPMENT_STATUS.PROCESSED]: {left: '0'},
      [SHIPMENT_STATUS.RECEIVED]: {left: '25%'},
      [SHIPMENT_STATUS.OUT_FOR_DELIVERY]: {left: '50%'},
      [SHIPMENT_STATUS.NEXT_IN_QUEUE]: {left: '75%'},
      [SHIPMENT_STATUS.REATTEMPTING]: {left: '75%'},
      [SHIPMENT_STATUS.FAILED]: {right: '0', backgroundColor: '#d0021b'},
      [SHIPMENT_STATUS.RETURNED]: {right: '0'},
      [SHIPMENT_STATUS.CANCELLED]: {right: '0', backgroundColor: '#d0021b'},
      [SHIPMENT_STATUS.DELIVERED]: {right: '0', backgroundColor: '#4abc4e'},
      [SHIPMENT_STATUS.UNDELIVERABLE_SH]: {right: '0', backgroundColor: '#d0021b'},
    };
    const translatedEvents = translateEvents(events || [], shipment);

    return <E.Container>
      <E.Inner>
        {translatedEvents.map((event, id) => {
          const text = this.renderText(event, shipment, client);

          if (!text) return null;

          const eventDate = moment(event.ts).tz(shipment.timezone).format('MMM DD');
          const eventTime = moment(event.ts).tz(shipment.timezone).format('hh:mm A');
          const mstone = VERBIAGE[event.convertedSignal].milestone;
          const isFailed = [SHIPMENT_STATUS.UNDELIVERABLE_SH, SHIPMENT_STATUS.FAILED, SHIPMENT_STATUS.CANCELLED].includes(mstone);

          return <E.Item key={id}>
            <E.DateTime>
              <E.Date>{eventDate}</E.Date>
              <E.Time>{eventTime}</E.Time>
            </E.DateTime>
            <E.StatusContainer>
              <E.Status className={`${isFailed ? 'fail' : ''}`} style={{backgroundColor: progress[mstone].backgroundColor}} />
              <E.Line className={`line`} />
            </E.StatusContainer>
            <E.Text>{text}</E.Text>
          </E.Item>;
        })}
      </E.Inner>
    </E.Container>;
  }
}