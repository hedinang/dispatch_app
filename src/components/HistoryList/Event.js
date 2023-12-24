import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { inject } from 'mobx-react';
import moment from 'moment-timezone';
import { AxlModal } from 'axl-reactjs-ui';
import { secondTohour } from '../ReorderShipment';
import styles, * as E from './styles';
import HistoryItem from '../HistoryItem';
import { convertMeterToMile } from '../../constants/common';

import { EVENT_OBJECT_TYPES } from '../../constants/event';
import DriverDetailContainer from '../../containers/DriverDetail';

const ASSIGNMENT_MODIFIER_ACTIONS = ['add_note'];

@inject('driverStore', 'userStore')
class EventObject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDriverProfile: false,
      driverID: null,
    };
    this.onShowDriverProfile = this.onShowDriverProfile.bind(this);
  }

  onShowDriverProfile = (driver) => {
    if (driver) {
      this.setState({ showDriverProfile: true, driverID: driver })
    }
  };
  onHideDriverProfile = () => {
    this.setState({ showDriverProfile: false });
  };

  render() {
    const { obj } = this.props;
    if (!obj) return <span></span>;
    const { uid } = obj;
    const type = uid ? EVENT_OBJECT_TYPES[uid.split('_')[0]] : '';
    const object_id = uid.split('_')[1];
    const { showDriverProfile, driverID } = this.state;
    const name = obj.attributes && obj.attributes.name ? obj.attributes.name : '';
    if (type === 'Driver')
      return (
        <Fragment>
          <E.DriverLink onClick={() => this.onShowDriverProfile(object_id)}>
            {type} <strong style={styles.strong}>{name}</strong> [{object_id}]
          </E.DriverLink>
          {showDriverProfile && driverID && (
            <AxlModal style={styles.modalDriverProfileContainer} onClose={this.onHideDriverProfile}>
              <DriverDetailContainer {...this.props} driverId={driverID} isHiddenButtonBack={true}/>
            </AxlModal>
          )}
        </Fragment>
      );
    return (
      <span>
        {type} <strong style={styles.strong}>{name}</strong> [{object_id}]
      </span>
    );
  }
}

export default class Event extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { event } = this.props;
    const reason = event.evidence ? event.evidence.reason : null;
    const reasonCode = event.evidence ? event.evidence.reason_code : null;
    const amount = event.state ? event.state.amount || event.state.bonus : null;
    const type = event.state ? event.state.type : null;
    const key = (event.category || '') + '.' + (event.type || '') + '.' + (event.action || '');
    const sourceUID = event.source ? event.source.uid : null;
    if (event.type === 'DATE')
      return (
        <div style={styles.item}>
          <span style={{ ...styles.car, backgroundColor: styles.status[event.action] }} />
          <span style={{ textDecoration: 'underline' }}>{event.date}</span>
        </div>
      );

    if (event.subject && event.subject.uid === 'WO_AssignmentRefresher') return <span></span>;

    if (key === 'ASSIGNMENT.FINANCE.transaction')
      return (
        <div style={styles.item}>
          <HistoryItem event={event} status={null}>
            <div style={styles.inner}>
              <div style={styles.notes}>
                Payment of $<strong style={styles.strong}>{amount}</strong> has been added to <EventObject obj={event.ref} /> for <EventObject obj={event.object} />
              </div>
              {event.ts && <div style={styles.time}>{moment.tz(event.ts, moment.tz.guess()).format('HH:mm:ss A z')}</div>}
            </div>
          </HistoryItem>
        </div>
      );

    if (key === 'ASSIGNMENT.FINANCE.payment') {
      return (
        <div style={styles.item}>
          <HistoryItem event={event} status={null}>
            <div style={styles.inner}>
              <div style={styles.notes}>
                Amount of $<strong style={styles.strong}>{amount}</strong> has been paid to <EventObject obj={event.ref} /> for <EventObject obj={event.object} />
              </div>
              {event.ts && <div style={styles.time}>{moment.tz(event.ts, moment.tz.guess()).format('HH:mm:ss A z')}</div>}
            </div>
          </HistoryItem>
        </div>
      );
    }

    if (key === 'ASSIGNMENT.FINANCE.adjustment') {
      return (
        <div style={styles.item}>
          <HistoryItem event={event} status={null}>
            <div style={styles.inner}>
              <div style={styles.notes}>
                <div>
                  Tour cost changed to <strong style={styles.strong}>{event.fact && event.fact.new_tour_cost} </strong>
                </div>
                <ul style={styles.list}>
                  <li>Shipment Count: {event.evidence && event.evidence.shipment_count}</li>
                  <li>Travel Time: {event.state && secondTohour(+event.state.new_travel_time)}</li>
                  <li>
                    Distance: {event.state && event.state.new_travel_distance && convertMeterToMile(event.state.new_travel_distance)} {`mi`}{' '}
                  </li>
                </ul>
              </div>
              {event.ts && <div style={styles.time}>{moment.tz(event.ts, moment.tz.guess()).format('HH:mm:ss A z')}</div>}
            </div>
          </HistoryItem>
        </div>
      );
    }

    if (key === 'ASSIGNMENT.PLANNING.add-delivery')
      return (
        <div style={styles.item}>
          <HistoryItem event={event} status={null}>
            <div style={styles.inner}>
              <div style={styles.notes}>
                <EventObject obj={event.subject} /> add <EventObject obj={event.ref} /> to <EventObject obj={event.object} /> with label {event.evidence && <strong style={styles.strong}>{event.evidence.label}</strong>}
              </div>
              {event.ts && <div style={styles.time}>{moment.tz(event.ts, moment.tz.guess()).format('HH:mm:ss A z')}</div>}
            </div>
          </HistoryItem>
        </div>
      );

    if (key === 'ASSIGNMENT.FINANCE.evaluate')
      return (
        <div style={styles.item}>
          <HistoryItem event={event} status={null}>
            <div style={styles.inner}>
              <div style={styles.notes}>
                <EventObject obj={event.subject} /> {event.action} <EventObject obj={event.object} />
              </div>
              {event.ts && <div style={styles.time}>{moment.tz(event.ts, moment.tz.guess()).format('HH:mm:ss A z')}</div>}
            </div>
          </HistoryItem>
        </div>
      );

    if (key === 'ASSIGNMENT.PLANNING.announce-sms')
      return (
        <div style={styles.item}>
          <HistoryItem event={event} status={null}>
            <div style={styles.inner}>
              <div style={styles.notes}>
                <EventObject obj={event.subject} /> send SMS to {event.evidence.driver_count} drivers regarding <EventObject obj={event.object} />.
              </div>
              {event.ts && <div style={styles.time}>{moment.tz(event.ts, moment.tz.guess()).format('HH:mm:ss A z')}</div>}
            </div>
          </HistoryItem>
        </div>
      );

    if (key === 'ASSIGNMENT.OUTBOUND.google_traffic') {
      return (
        <Fragment>
          <div style={styles.item}>
            <HistoryItem event={event} status={event.action}>
              <div style={styles.inner}>
                <div style={styles.notes}>
                  <EventObject obj={event.subject} /> {event.action} <EventObject obj={event.object} />
                  {event.ref && (
                    <span>
                      {' '}
                      to <EventObject obj={event.ref} />
                    </span>
                  )}
                  {event.state && event.evidence && (
                    <div>
                      Travel Time from <strong>{event.state.travel_time}</strong> to <strong>{event.evidence.travel_time}</strong> Travel distance from <strong>{event.state.travel_distance}</strong> to <strong>{event.evidence.travel_distance}</strong> and driver picked up: {event.state.picked_up}
                    </div>
                  )}
                </div>
                {/* <div style={styles.notes}>{render[`${item.ref_type}-${item.action}`] ? render[`${item.ref_type}-${item.action}`].content(item) : render[item.ref_type].content(item)}</div> */}
                {event.ts && <div style={styles.time}>{moment.tz(event.ts, moment.tz.guess()).format('HH:mm:ss A z')}</div>}
              </div>
              <div style={styles.clear}></div>
            </HistoryItem>
          </div>
        </Fragment>
      );
    }

    if (event.action === 'performing-stop' && event.state['DELIVERY-STATUS_performing_stop_id'] != 'null') {
      return (
        <Fragment>
          <div style={styles.item}>
            <HistoryItem event={event} status={event.action}>
              <div style={styles.inner}>
                <div style={styles.notes}>
                  <EventObject obj={event.subject} /> {event.action} of Shipment_id / Stop_id [{event.state['shipment_id']} / {event.state['DELIVERY-STATUS_performing_stop_id']}], <EventObject obj={event.object} />
                  {event.ref && (
                    <span>
                      {' '}
                      to <EventObject obj={event.ref} />
                    </span>
                  )}
                  {amount && (
                    <span>
                      {' '}
                      of $<strong style={styles.strong}>{amount}</strong>{' '}
                    </span>
                  )}
                  {reason && (
                    <span>
                      {' '}
                      with reason: <strong style={styles.strong}>{reason}</strong>{' '}
                    </span>
                  )}
                </div>
                {event.ts && <div style={styles.time}>{moment.tz(event.ts, moment.tz.guess()).format('HH:mm:ss A z')}</div>}
              </div>
              <div style={styles.clear}></div>
            </HistoryItem>
          </div>
        </Fragment>
      );
    }
    if (key === 'DRIVER.ELIGIBILITY.remove-pool') {
      return (
        <Fragment>
          <div style={styles.item}>
            <HistoryItem event={event} status={event.action}>
              <div style={styles.inner}>
                <div style={styles.notes}>
                  <EventObject obj={event.subject} />
                  <span> {event.action} </span>
                  <EventObject obj={event.object} />
                  {event.ref && (
                    <span>
                      {' '}
                      from <EventObject obj={event.ref} />
                    </span>
                  )}
                  {amount && (
                    <span>
                      {' '}
                      of $<strong style={styles.strong}>{amount}</strong>{' '}
                    </span>
                  )}
                  {reason && (
                    <span>
                      {' '}
                      with reason: <strong style={styles.strong}>{reason}</strong>{' '}
                    </span>
                  )}
                </div>
                {event.ts && <div style={styles.time}>{moment.tz(event.ts, moment.tz.guess()).format('HH:mm:ss A z')}</div>}
              </div>
            </HistoryItem>
          </div>
        </Fragment>
      );
    }
    if (key === 'STOP.POD.remove') {
      return (
        <Fragment>
          <div style={styles.item}>
            <HistoryItem event={event} status={event.action}>
              <div style={styles.inner}>
                <div style={styles.notes}>
                  <EventObject obj={event.subject} />
                  <span> {event.action} </span> photo of <EventObject obj={event.object} />
                  {event.ref && (
                    <span>
                      {' '}
                      from <EventObject obj={event.ref} />
                    </span>
                  )}
                  {reason && (
                    <span>
                      {' '}
                      with reason: <strong style={styles.strong}>{reason}</strong>{' '}
                    </span>
                  )}
                </div>
                {event.ts && <div style={styles.time}>{moment.tz(event.ts, moment.tz.guess()).format('HH:mm:ss A z')}</div>}
              </div>
            </HistoryItem>
          </div>
        </Fragment>
      );
    }

    if (key === 'SHIPMENT.PLANNING.un-route') {
      return (
        <Fragment>
          <div style={styles.item}>
            <HistoryItem event={event} status={event.action}>
              <span style={{ ...styles.car, backgroundColor: styles.status[event.action] || styles.status.system }} />
              <div style={styles.inner}>
                <div style={styles.notes}>
                  <EventObject obj={event.subject} />
                  <span> {event.action} </span>
                  <EventObject obj={event.object} />
                  {event.ref && (
                    <span>
                      {' '}
                      from <EventObject obj={event.ref} />
                    </span>
                  )}
                  {event.fact && event.fact.label && (
                    <span>
                      {' '}
                      with label <b style={styles.strong}>{event.fact.label}</b>
                    </span>
                  )}
                  {reasonCode && (
                    <span>
                      {' '}
                      with reason code: <strong style={styles.strong}>{reasonCode}</strong>{' '}
                    </span>
                  )}
                  {reason && (
                    <span>
                      {' '}
                      with reason: <strong style={styles.strong}>{reason}</strong>{' '}
                    </span>
                  )}
                </div>
                {event.ts && <div style={styles.time}>{moment.tz(event.ts, moment.tz.guess()).format('HH:mm:ss A z')}</div>}
              </div>
            </HistoryItem>
          </div>
        </Fragment>
      );
    }

    if (['ASSIGNMENT.FINANCE.adjust_payment'].includes(key)) {
      return (
        <Fragment>
          <div style={styles.item}>
            <HistoryItem event={event} status={event.action}>
              <div style={styles.inner}>
                <div style={styles.notes}>
                  <EventObject obj={event.subject} />
                  <span> {event.action} </span>
                  <EventObject obj={event.object} />
                  {type && (
                    <span>
                      {' '}
                      for <strong style={styles.strong}>{type}</strong>{' '}
                    </span>
                  )}
                  {amount && (
                    <span>
                      {' '}
                      of $<strong style={{ ...styles.strong, color: amount < 0 ? '#f00' : null }}>{amount}</strong>{' '}
                    </span>
                  )}
                  {reason && (
                    <span>
                      {' '}
                      with reason: <strong style={styles.strong}>{reason}</strong>{' '}
                    </span>
                  )}
                </div>
                {event.ts && <div style={styles.time}>{moment.tz(event.ts, moment.tz.guess()).format('HH:mm:ss A z')}</div>}
              </div>
            </HistoryItem>
          </div>
        </Fragment>
      );
    }

    if (['ASSIGNMENT.MODIFIER.update_pickup'].includes(key)) {
      return (
        <Fragment>
          <div style={styles.item}>
            <HistoryItem event={event} status={event.action}>
              <div style={styles.inner}>
                <div style={styles.notes}>
                  <EventObject obj={event.subject} />
                  <span> {event.action} </span>
                  <EventObject obj={event.object} />
                  <ul style={styles.list}>
                    {event.evidence && event.evidence.from_warehouse_id && (
                      <li>
                        <span>
                          {' '}
                          from warehouse: <strong style={styles.strong}>{event.evidence.from_warehouse_id}</strong>{' '}
                        </span>
                      </li>
                    )}
                    {event.evidence && event.evidence.to_warehouse_id && (
                      <li>
                        <span>
                          {' '}
                          to warehouse: <strong style={styles.strong}>{event.evidence.to_warehouse_id}</strong>{' '}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
                {event.ts && <div style={styles.time}>{moment.tz(event.ts, moment.tz.guess()).format('HH:mm:ss A z')}</div>}
              </div>
            </HistoryItem>
          </div>
        </Fragment>
      );
    }

    if (ASSIGNMENT_MODIFIER_ACTIONS.includes(event.action)) {
      const action = _.get(event, 'action', '').replace('_', ' ');
      const entries = Object.entries(_.get(event, 'state'), {});

      return (
        <Fragment key={event.id}>
          <div style={styles.item}>
            <HistoryItem event={event} status={event.action}>
              <div style={styles.inner}>
                <div style={styles.notes}>
                  <EventObject obj={event.subject} /> <span>{action}</span>
                  {entries.map(([key, value]) => (
                    <div key={key}>
                      <span>+</span> <span style={styles.fieldKey}>{key}</span> <span style={{ color: '#822' }}>@</span> <span style={styles.fieldValue}>{value}</span>
                    </div>
                  ))}
                </div>
                <div style={styles.time}>{moment.tz(event.ts, moment.tz.guess()).format('HH:mm:ss A z')}</div>
              </div>
            </HistoryItem>
          </div>
        </Fragment>
      );
    }

    return (
      <Fragment key={event.id}>
        <div style={styles.item}>
          <HistoryItem event={event} status={event.action}>
            <div style={styles.inner}>
              <div style={styles.notes}>
                <EventObject obj={event.subject} />
                {event.fact && event.fact.action == 'completed_drop_off' && <span> COMPLETE </span>}
                {event.fact && event.fact.action == 'back_pressed' && <span> BACKPRESS </span>}
                <span> {event.action} </span>
                <EventObject obj={event.object} />
                {event.ref && (
                  <span>
                    {' '}
                    to <EventObject obj={event.ref} />
                  </span>
                )}
                {amount && (
                  <span>
                    {' '}
                    of $<strong style={styles.strong}>{amount}</strong>{' '}
                  </span>
                )}
                {(reason || reasonCode || (sourceUID && ['AP_Outbound-Scan-Id'].includes(sourceUID))) && (
                  <Fragment>
                    <span>{' '}with: </span>
                    <ul style={{margin: 0, paddingLeft: 20}}>
                      {reason && <li>reason: <strong style={styles.strong}>{reason}</strong></li>}
                      {reasonCode && <li>reason code: <strong style={styles.strong}>{reasonCode}</strong></li>}
                      {sourceUID && ['AP_Outbound-Scan-Id'].includes(sourceUID) && <li>source: <strong style={styles.strong}>{sourceUID}</strong></li>}
                    </ul>
                  </Fragment>

                )}
              </div>
              {/* <div style={styles.notes}>{render[`${item.ref_type}-${item.action}`] ? render[`${item.ref_type}-${item.action}`].content(item) : render[item.ref_type].content(item)}</div> */}
              {event.ts && <div style={styles.time}>{moment.tz(event.ts, moment.tz.guess()).format('HH:mm:ss A z')}</div>}
            </div>
            <div style={styles.clear} />
          </HistoryItem>
        </div>
      </Fragment>
    );
  }
}
