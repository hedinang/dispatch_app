import React, { Component, Fragment } from 'react';
import moment from 'moment-timezone';
import _ from 'lodash';

import EventObject from './event';
import { AxlSearchBox } from 'axl-reactjs-ui';
// Styles
import styles, { Container, Inner, List, Item, Circle, Date, Text, RemarkText, SearchContainer } from './styles';
import { inject, observer } from 'mobx-react';
import HistoryItem from '../HistoryItem';

@inject('locationStore')
@observer
export default class ShipmentHistoryList extends Component {
  constructor(props) {
    super(props);
  }

  _handleSearch = (e) => {
    const { shipmentHistory = {} } = this.props;
  };

  render() {
    const { locationStore } = this.props;
    const { status } = styles;
    const { shipmentHistory = [], shipment } = this.props;

    if (!shipmentHistory || shipmentHistory.length < 1) {
      return <div></div>;
    }

    let date = '';
    let events = _.sortBy(shipmentHistory, (e) => e.ts).flatMap((e) => {
      const d = moment(e.ts)
        .format('dddd M/D/YYYY')
        .toUpperCase();
      if (d === date) return [e];
      else {
        date = d;
        return [{ signal: 'DATE', date: d }, e];
      }
    });

    return (
      <Container>
        <SearchContainer>
          <AxlSearchBox theme={`default`} placeholder="Search..." defaultValue={``} style={{ width: '100%' }} onChange={this._handleSearch} />
        </SearchContainer>
        <Inner>
          <List>
            {events.map((e, i) => {
              if (e.signal === 'DATE')
                return (
                  <Item key={i}>
                    <Circle style={{ backgroundColor: status['STARTED'] }} />
                    <Text>{e.date}</Text>
                  </Item>
                );
              if (e.action === 'sms') return eventSMS({ e });

              if (e.category === 'SHIPMENT') {
                if (e.action === 'edit_delivery') return edit_delivery({ e });
                if (e.action === 'unlock') return eventUnlock({ e });
                if (e.type === 'INBOUND') return eventInbound({ e, locationStore });
                if (e.action === 'update_status') return eventUpdateStatus({ e });
                if (e.action === 'un-route') return eventUnroute({ e });
                if (e.type === 'MODIFIER') return eventModifyShipment({ e });
                if (e.action === 'add-redelivery') return redeliveryRoute({ e });
                if (e.action === 'lyft-update') return eventUpdateShipment({ e });
                if (e.action === 'geocode') return eventGeocode({ e });
                if (e.action === 'detect-profile') return eventGeocode({ e });
                if (e.action === 'add_shipment_billing') return eventShipmentBilling(e);
                if (['move-date', 'move-date-approve'].includes(e.action)) return eventMoveDate(e);
                return (
                  <Item key={e.id}>
                    <HistoryItem event={e} status={e.action}>
                      <Text>
                        <div>
                          <EventObject obj={e.subject} /> {e.action} <EventObject obj={e.object} />
                        </div>
                      </Text>
                      <Date>{moment.tz(e.ts, moment.tz.guess()).format('hh:mm A z')}</Date>
                    </HistoryItem>
                  </Item>
                );
              }
              if (e.category === 'STOP' && e.type === 'POD' && e.action === 'remove') {
                return eventRemoveStopPOD({ e });
              }
              if (e.category === 'STOP' && e.type === 'OUTBOUND') {
                return eventStopOutboundUpdate({ e, locationStore });
              }
              if (e.category === 'STOP' && e.type === 'POD' && e.action === 'remove') {
                return eventStopRemovePOD({ e });
              }
              if (e.category === 'STOP' && e.type === 'POD') {
                return eventStopPOD({ e, locationStore });
              }
              if (e.category === 'STOP' && e.type === 'MODIFIER') return eventStopModify({ e });
              return <div key={i}></div>;
            })}
          </List>
        </Inner>
      </Container>
    );
  }
}

function showLocation(location, locationStore) {
  const { geolocation } = location || {};
  const { latitude, longitude } = geolocation || {};

  if (!latitude) return null;

  return (
    <div style={styles.updateStopWrap}>
      At location
      <div
        style={styles.coordinatesWrap}
        onMouseEnter={() => {
          locationStore && locationStore.updateLocation([longitude, latitude]);
        }}
        onMouseLeave={() => {
          locationStore && locationStore.updateLocation(null);
        }}
      >
        [ {latitude.toFixed(6)}, {longitude.toFixed(6)} ]
      </div>{' '}
      <a target="_blank" href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}>
        Google Map
      </a>
    </div>
  );
}

function eventSMS(props) {
  const { e } = props;
  return (
    <Item key={e.id}>
      <HistoryItem event={e} status={'STARTED'}>
        <Text>
          <div>
            Send SMS -{' '}
            {e.fact && e.fact.sms_type
              ? e.fact.sms_type
                  .replace('RECIPIENT', '')
                  .replace(/__/g, ' ')
                  .replace(/_/g, '-')
                  .toLowerCase()
              : null}
          </div>
          <div style={{ color: 'brown' }}>
            <small>{e.evidence.text}</small>
          </div>
        </Text>
        <Date>{moment.tz(e.ts, moment.tz.guess()).format('hh:mm A z')}</Date>
      </HistoryItem>
    </Item>
  );
}

function eventInbound(props) {
  const { e, locationStore } = props;
  const { status } = styles;
  const lockAction = e.action === 'lock' && e.fact && e.fact.user_unlock && e.fact.user_unlock_id;
  return (
    <Item key={e.id}>
      <HistoryItem event={e} status={null}>
        <Text>
          <div>
            {(e.action !== 'update-inbound' || !e.state) && (
              <Fragment>
                <EventObject obj={e.subject} />
                {lockAction && (
                  <Fragment>
                    {' '}
                    User <b style={styles.strong}>{e.fact.user_unlock}</b>[{e.fact.user_unlock_id}]
                  </Fragment>
                )}
                {' ' + e.action + ' '}
                <EventObject obj={e.object} />
                {lockAction && <Fragment> in Assingment[{e.fact.assignment_id}]</Fragment>}
              </Fragment>
            )}
            {e.action === 'update-inbound' && e.state && (
              <Fragment>
                <EventObject obj={e.subject} /> Update Inbound Status of <EventObject obj={e.object} /> to <b style={styles.strong}>{e.state.inbound_status}</b>
                {e.fact && e.fact.warehouse_alias && <RemarkText> Warehouse: {e.fact.warehouse_alias}</RemarkText>}
                {e.fact && e.fact.assignment_id && <RemarkText> Assignment: {e.fact.assignment_id}</RemarkText>}
                {e.state.indbound_notes ? <RemarkText>{e.state.indbound_notes}</RemarkText> : ''}
              </Fragment>
            )}
          </div>
          {e.location && showLocation(e.location, locationStore)}
        </Text>
        <Date>{moment.tz(e.ts, moment.tz.guess()).format('hh:mm A z')}</Date>
      </HistoryItem>
    </Item>
  );
}

function eventUpdateStatus(props) {
  const { e } = props;
  const { status } = styles;
  const state = e.state || {};
  const { remark } = state || {};
  return (
    <Item key={e.id}>
      <HistoryItem event={e} status={state.status}>
        <Text>
          <div>
            <EventObject obj={e.subject} /> update <EventObject obj={e.object} /> status to <b style={styles.strong}>{state.status}</b>
            {remark ? <RemarkText>{remark}</RemarkText> : ''}
          </div>
        </Text>
        <Date>{moment.tz(e.ts, moment.tz.guess()).format('hh:mm A z')}</Date>
      </HistoryItem>
    </Item>
  );
}

function edit_delivery(props) {
  const { e } = props;
  let fromEvidence = [];
  if (e.evidence) {
    for (const [key, value] of Object.entries(e.evidence)) {
      fromEvidence.push(
        <div>
          <span>+</span> <b style={styles.strong}>{key}</b> <span style={{ color: '#822' }}>&#64;</span> <RemarkText style={{ display: 'inline' }}>{value}</RemarkText>
        </div>,
      );
    }
  }
  const { status } = styles;
  return (
    <Item key={e.id}>
      <HistoryItem event={e} status={'PICKUPED'}>
        <Text>
          <div>
            <EventObject obj={e.subject} /> {e.action} for <EventObject obj={e.object} />
            {fromEvidence}
          </div>
        </Text>
        <Date>{moment.tz(e.ts, moment.tz.guess()).format('hh:mm A z')}</Date>
      </HistoryItem>
    </Item>
  );
}

function redeliveryRoute(props) {
  const { e } = props;
  const { status } = styles;
  return (
    <Item key={e.id}>
      <HistoryItem event={e} status={'PICKUPED'}>
        <Text>
          <div>
            <EventObject obj={e.subject} /> {e.action} <EventObject obj={e.object} /> to Assignment <b style={styles.strong}>{e.fact.assignment_id}</b>
          </div>
        </Text>
        <Date>{moment.tz(e.ts, moment.tz.guess()).format('hh:mm A z')}</Date>
      </HistoryItem>
    </Item>
  );
}

function eventUnroute(props) {
  const { e } = props;
  const { status } = styles;
  const label = e.fact && e.fact.label;
  const reason = e.evidence ? e.evidence.reason : null;
  return (
    <Item key={e.id}>
      <HistoryItem event={e} status={'FAILED'}>
        <Text>
          <div>
            <EventObject obj={e.subject} /> un-route <EventObject obj={e.object} /> from <EventObject obj={e.ref} />
            {label && (
              <span>
                {' '}
                with label <b style={styles.strong}>{label}</b>
              </span>
            )}
            {reason && (
              <span>
                {' '}
                with reason: <strong style={styles.strong}>{reason}</strong>{' '}
              </span>
            )}
          </div>
        </Text>
        <Date>{moment.tz(e.ts, moment.tz.guess()).format('hh:mm A z')}</Date>
      </HistoryItem>
    </Item>
  );
}

function eventStopOutboundUpdate(props) {
  const { e, locationStore } = props;
  const { status } = styles;
  const state = e.state || {};
  const { remark } = state || {};

  return (
    <Item key={e.id}>
      <HistoryItem event={e} status={state.status}>
        <Text>
          <div>
            <EventObject obj={e.subject} /> {e.action.replace('_', ' ')} <EventObject obj={e.object} />
            {e.action !== 'reattempt' && (
              <span>
                {' '}
                status to <b style={styles.strong}>{state.status}</b>
              </span>
            )}
            {e.action === 'reattempt' && <span> from Stop {e.fact && e.fact.previous_stop_id} </span>}
            {remark ? <RemarkText>{remark}</RemarkText> : ''}
          </div>
          {e.location && showLocation(e.location, locationStore)}
        </Text>
        <Date>{moment.tz(e.ts, moment.tz.guess()).format('hh:mm A z')}</Date>
      </HistoryItem>
    </Item>
  );
}

function eventStopModify(props) {
  const { e } = props;
  const { status } = styles;
  if (!e.state) return <div></div>;
  const keys = Object.keys(e.state);
  return (
    <Item key={e.id}>
      <HistoryItem event={e} status={e.state.status}>
        <Text>
          <div>
            <EventObject obj={e.subject} /> {e.action.replace('_', ' ')} <EventObject obj={e.object} />
          </div>
          {keys.map((key) => (
            <div key={key}>
              <span>+</span> <b style={styles.strong}>{key}</b> <span style={{ color: '#822' }}>&#64;</span> <RemarkText style={{ display: 'inline' }}>{e.state[key]}</RemarkText>
            </div>
          ))}
        </Text>
        <Date>{moment.tz(e.ts, moment.tz.guess()).format('hh:mm A z')}</Date>
      </HistoryItem>
    </Item>
  );
}

function eventStopRemovePOD(props) {
  const { e, locationStore } = props;
  const { status } = styles;
  const { state } = e || {};
  const { remark } = state || {};
  return (
    <Item key={e.id}>
      <HistoryItem event={e} status={e.action}>
        <Text>
          <div>
            <EventObject obj={e.subject} /> {e.action.replace('_', ' ')} from <EventObject obj={e.object} />
            {remark ? <RemarkText>{remark}</RemarkText> : ''}
          </div>
        </Text>
        <Date>{moment(e.ts).format('hh:mm A')}</Date>
      </HistoryItem>
    </Item>
  );
}

function eventStopPOD(props) {
  const { e, locationStore } = props;
  const { status } = styles;
  const { state } = e || {};
  const { remark } = state || {};
  return (
    <Item key={e.id}>
      <HistoryItem event={e} status={e.action}>
        <Text>
          <div>
            <EventObject obj={e.subject} /> upload {e.action.replace('_', ' ')} for <EventObject obj={e.object} />
            {remark ? <RemarkText>{remark}</RemarkText> : ''}
          </div>
          {e.location && showLocation(e.location, locationStore)}
        </Text>
        <Date>{moment.tz(e.ts, moment.tz.guess()).format('hh:mm A z')}</Date>
      </HistoryItem>
    </Item>
  );
}
function eventRemoveStopPOD(props) {
  const { e } = props;
  const { status } = styles;
  return (
    <Item key={e.id}>
      <HistoryItem event={e} status={e.action}>
        <Text>
          <div>
            <EventObject obj={e.subject} /> {e.action.replace('_', ' ')} photo of <EventObject obj={e.object} /> from <EventObject obj={e.ref} />
          </div>
        </Text>
        <Date>{moment.tz(e.ts, moment.tz.guess()).format('hh:mm A z')}</Date>
      </HistoryItem>
    </Item>
  );
}

function eventModifyShipment(props) {
  const { e } = props;
  const { status } = styles;
  const fromEvidence = e.evidence ? ['remark', 'status', 'reason'].filter((x) => e.evidence[x]) : [];
  let fromState = [];
  if (e.state) {
    for (const [key, value] of Object.entries(e.state)) {
      if (value && (!e.fact || e.fact[key] !== value)) {
        fromState.push(key);
      }
    }
  }
  const fields = e.evidence && e.evidence.fields ? e.evidence.fields.split(',') : fromState;
  const withValueFields = fields.filter((f) => e.state[f]);
  // console.log(fields, withValueFields)
  if (withValueFields.length < 1) return <div></div>;
  return (
    <Item key={e.id}>
      <HistoryItem event={e} status={null}>
        <Text>
          <div>
            <EventObject obj={e.subject} /> update <EventObject obj={e.object} /> set
          </div>
          {withValueFields.map((field) => (
            <div key={field}>
              <span>+</span> <b style={styles.strong}>{field.replace('.', ' ').replace('_', ' ')}</b> <span style={{ color: '#822' }}>&#64;</span> <RemarkText style={{ display: 'inline' }}>{e.state[field]}</RemarkText>
            </div>
          ))}
        </Text>
        <Date>{moment.tz(e.ts, moment.tz.guess()).format('hh:mm A z')}</Date>
      </HistoryItem>
    </Item>
  );
}

function eventUpdateShipment(props) {
  const { e } = props;
  const { state } = e || {};
  let fromState = [];
  if (e.state) {
    for (const [key, value] of Object.entries(e.state)) {
      fromState.push(key);
    }
  }
  return (
    <Item key={e.id}>
      <HistoryItem event={e} status={null}>
        <Text>
          <div>
            <EventObject obj={e.subject} /> {e.action} <EventObject obj={e.object} />
          </div>
          {state &&
            Object.entries(state).map((field) => (
              <div>
                <span>+</span> <b style={styles.strong}>{field[0]}</b> <span style={{ color: '#822' }}>&#64;</span> <RemarkText style={{ display: 'inline' }}>{field[1]}</RemarkText>
              </div>
            ))}
        </Text>
        <Date>{moment.tz(e.ts, moment.tz.guess()).format('hh:mm A z')}</Date>
      </HistoryItem>
    </Item>
  );
}

function eventUnlock(props) {
  const { e } = props;
  const { status } = styles;

  return (
    <Item key={e.id}>
      <HistoryItem event={e} status={e.action}>
        <Text>
          <div>
            {e.fact && e.fact.user_unlock && e.fact.user_unlock_id && (
              <Fragment>
                User <b style={styles.strong}>{e.fact.user_unlock}</b>[{e.fact.user_unlock_id}]
              </Fragment>
            )}
            <EventObject obj={e.subject} /> {e.action} <EventObject obj={e.object} />
          </div>
        </Text>
        <Date>{moment(e.ts).format('hh:mm A')}</Date>
      </HistoryItem>
    </Item>
  );
}

function eventGeocode(props) {
  const { e } = props;

  return (
    <Item key={e.id}>
      <HistoryItem event={e} status={e.action}>
        <Text>
          <EventObject obj={e.subject} /> {e.action} <EventObject obj={e.object} /> with status: <strong style={{ fontFamily: 'AvenirNext-Bold', color: e && e.state && e.state.status === 'GEOCODE_FAILED' && 'red' }}>{e.state.status}</strong>
        </Text>
        <Date>{moment(e.ts).format('hh:mm A')}</Date>
      </HistoryItem>
    </Item>
  );
}

function eventShipmentBilling(event) {
  const billingType = _.get(event, 'state.shipment_billing_type', '');

  return (
    <Item key={event.id}>
      <HistoryItem event={event} status={event.action}>
        <Text>
          <EventObject obj={event.subject} /> add shipment billing.
          <p style={{ margin: 0 }}>Billing type: <strong>{billingType}</strong></p>
        </Text>
        <Date>{moment(event.ts).format('hh:mm A')}</Date>
      </HistoryItem>
    </Item>
  );
}

function eventMoveDate(event) {
  const action = event.action;
  const reason = _.get(event, 'state.reason');

  return (
    <Item key={event.id}>
      <HistoryItem event={event} status={event.action}>
        <Text>
          <EventObject obj={event.subject} /> <span>{action}</span> <EventObject obj={event.object} /> with reason <strong style={styles.strong}>{reason}</strong>
        </Text>
        <Date>{moment(event.ts).format('hh:mm A')}</Date>
      </HistoryItem>
    </Item>
  );
}
