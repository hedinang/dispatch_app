import React, { Component } from 'react';
import {withRouter} from 'react-router-dom';
import styles from './styles';
import moment from "moment-timezone";
import _ from 'lodash'; 

const checkDifference = (state, fact) => {
  if(_.isEmpty(state)) return <div></div>;  
  return Object.keys(state).map(key => {
    if(_.isEmpty(fact) || state[key] !== fact[key]) {
      return <div>{key}: {state[key]}</div>
    }
  })
}

class EventSubject extends Component {
  TYPE_NAME = {
    'DR': 'driver',
    'US': 'user',
    'AS': 'assignment',
    'SH': 'shipment',
    'ST': 'stop',
    'BS': 'booking session',
    'TK': 'ticket'
  }

  render() {
    const { subject } = this.props
    if (!subject || !subject.uid) return <span></span>
    const uid_type = subject.uid.split('_')[0]
    const uid_id = subject.uid.split('_')[1]
    const type_name = this.TYPE_NAME[uid_type] || ''
    const name = subject.attributes && subject.attributes.name ? subject.attributes.name : null
    
    return <span style={{fontSize: '0.9em'}}>
      <span>{ type_name }</span> <strong>{ name || uid_id }</strong> { name && <span style={{color: '#888'}}>[{uid_id}]</span> }
    </span>
  }
}

class HistoryEvent extends Component {
  showTicketHistory = () => {
    const {event, history} = this.props;
    if (!event || !['void', 'discard', 'set_eta', 'book_eta', 'unbook_eta'].includes(event.action))
      return;

    const bookingSession = event.rel && event.rel.uid && event.rel.uid.startsWith("BS_") ? event.rel.uid : event.object.uid;
    const ticketId = event.object && event.object.uid && event.object.uid.startsWith("TK_") ? event.object.uid.replace("TK_", "") : "";

    history.replace(`/ticket-booking/${bookingSession}/ticket/${ticketId}/history`)
  }

  render() {
    const {event, history} = this.props;
    const etype = `${event.category}-${event.type}-${event.action}`;

    return <div style={styles.container}>
      <div style={styles.subject}>
        <div style={styles.subject.time}>{ moment.tz(event.ts, moment.tz.guess()).format('MM/DD HH:mm:ss z') }</div>
        <div> <EventSubject subject={event.subject} /></div>
      </div>
      <div style={{...styles.body, cursor: ['void', 'discard', 'set_eta', 'book_eta', 'unbook_eta'].includes(event.action) ? 'pointer' : 'default'}}
           onClick={this.showTicketHistory}
      >
        <div style={{paddingBottom: 4}}>
          <span style={styles.body.action}>{ event.action }</span>
          <span style={styles.body.subtitle}>
            {(etype === 'BOOKING-COMMUNICATION-sms' || etype === 'BOOKING-COMMUNICATION-pn') && event.fact && <span> to { event.fact.all === 'true' ? ' all ' : '' } {event.fact.driver_count} drivers {event.fact.driver_name && <strong>{ event.fact.driver_name}</strong>} { event.fact && event.fact.book_name && <span>with <code style={{display: 'inline-block', backgroundColor: '#efefff', padding: '0 2px', borderRadius: '3px'}}>{event.fact.book_name}</code> tickets</span>} </span>}
            {etype.startsWith('TICKET-OUTBOUND') && event.fact && event.fact.item && <span> <EventSubject subject={{uid: event.fact.item}} /> for <EventSubject subject={{uid: event.fact.holder}} /></span>}
          </span>
        </div>
        <div style={{fontSize: '0.9em'}} >
          {(etype === 'BOOKING-COMMUNICATION-sms' || etype === 'BOOKING-COMMUNICATION-pn') && event.evidence && event.evidence.content && <span dangerouslySetInnerHTML ={{__html: event.evidence.content.replace('\n', '<br />') }} />}
          {event.fact && event.fact.ticket_book_name && <div>ticket: {event.fact.ticket_book_name}</div>}
          {etype.startsWith('TICKET-PLANNING') && event.ref && <div>{['reassign', 'assign'].includes(event.action) ? 'to' : 'from'} <EventSubject subject={event.ref} /></div>}
          {etype.startsWith('TICKET-PLANNING') && event.fact && event.fact.old_holder && <div>from: <EventSubject subject={{uid: event.fact.old_holder}} /></div>}
          {etype.startsWith('TICKET') && event.state && event.state.reason && <div>reason: <em>{event.state.reason}</em></div>}
          {etype.startsWith('TICKET') && event.state && event.state.reason_code && <div>reason code: <em>{event.state.reason_code}</em></div>}
          {etype.startsWith('TICKET') && event.source && ['AP_Outbound-Scan-Id'].includes(event.source.uid) && <div>source: <em>{event.source.uid}</em></div>}
          {etype === 'TICKET-PLANNING-add-assignments' && <div>{ event.fact.assignment_ids}</div>}
          {etype === 'TICKET-PLANNING-remove-assignment' && <div>{ event.fact.assignment_id}</div>}
          {etype === 'ASSIGNMENT-OUTBOUND-update_traffic' && event.state && event.evidence && <div>
              Travel Time from <b>{ event.state.travel_time }</b>
              to <b>{ event.evidence.travel_time }</b> Travel distance
              from <b>{ event.state.travel_distance }</b>
              to <b>{ event.evidence.travel_distance }</b> and driver picked up: {event.state.picked_up}               
          </div>}
          {etype === 'BOOKING-MANAGEMENT-remove-driver' && <div>
            <div>Driver <strong>{event && event.ref && event.ref.attributes && event.ref.attributes.name}</strong> [<strong>{event && event.state && event.state.driver_id}</strong>]</div>
            <div>reason: {event && event.evidence && event.evidence.reason}</div>
          </div>}
          {etype === 'TICKET-PLANNING-update-ticket-book' && <div>
            <div>group: {event && event.object && ((event.object.attributes && event.object.attributes.name) || event.object.uid)}</div>
            {checkDifference(event.state, event.fact)}
          </div>}

          {event && event.state && event.state.valid_from && <div>
            <div>valid from: { moment(event.state.valid_from).format('h:mm A') }</div>
          </div>}

          {event && event.state && event.state.valid_to && <div>
            <div>valid to: {event && event.state && moment(event.state.valid_to).format('h:mm A') }</div>
          </div>}
        </div>
      </div>
    </div>
  }
}

export default withRouter(HistoryEvent)