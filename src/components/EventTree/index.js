import React from 'react';
import moment from 'moment';
import {Box, Dialog} from "@material-ui/core";
import {ThumbUp as ThumbUpIcon, ThumbDown as ThumbDownIcon} from "@material-ui/icons";
import momentTz from 'moment-timezone';

import EventDriver from './driver';
import EventUser from './user';
import { colors, texts } from '../../styled-components';
import GpsLocation from '../GPS';
import HistoryItem from '../HistoryItem';

const UID_TYPE_NAME = {
    SH: 'Shipment',
    ST: 'Stop',
    DR: 'Driver',
    US: 'User',
    WO: 'Worker',
    EH: 'Event Handler',
    CL: 'Client'
}
const eventTypeName = (t) => UID_TYPE_NAME[t] || ''

function CodeBloc({children, style}) {
    return <span style={{padding: '0px 2px', margin: '0px 2px', display: 'inline-block', borderRadius: 4, backgroundColor: '#f8f8f8', ...style}}>{children}</span>
}

const ACTION_NAME = {
    update_dropoff: 'update',
    update_pickup: 'update',
    update_status: 'update',
    'update-inbound': 'update',
    'modified-personal-info': 'modified Person Info',
    'modified-regions': 'modified Details Info',
    'modified-license': 'modified License Info',
    'modified-vehicle': 'modified Vehicle Info',
}

const EVIDENCE_UPDATE_NAME = {
    license_plate: 'License Plate',
    vehicle_name: 'Vehicle Name',
    color: 'Color',
    insurance_photo: 'Insurance Photo',
    registration_photo: 'Registration Photo',
    insurance_card_issued_date: 'Insurance Card Issued Date',
    registration_record_expired_date: 'Registration Record Expired Date',
    registration_record_issued_date: 'Registration Record Issued Date',
    insurance_card_expired_date: 'Insurance Card Expired Date',
    driver_license_issued_date: 'Driver License Issued Date',
    driver_license_state: 'Driver License State',
    state: 'State',
    driver_license_number: 'Driver License Number',
    driver_license_expired_date: 'Driver License Expired Date',
    front_photo: 'Driver License Photo (Front)',
    back_photo: 'Driver License Photo (Back)',
    street2: 'Street 2',
    email_unsubscribed: 'Email Unsubscribed',
    sms_unsubscribed: 'SMS Unsubscribed',
    first_name: 'First Name',
    middle_name: 'Middle Name',
    last_name: 'Last Name',
    street: 'Street',
    ssn: 'SSN',
    zipcode: 'Zipcode',
    regions: 'Regions',
    crews: 'Crews',
    birthday: 'Birthday',
    phone_number: 'Phone Number',
    email: 'Email',
    city: 'City',
    sub_model: "Sub Model",
    license_state: "License State"
}

const actionName = (type, action) => type === 'FEEDBACK' ? 'feedback' : (ACTION_NAME[action] || action)

const STATE_KEYS = [
    'status', 'remark', 'reason', 'inbound_status', 'text','access_code', 'instruction',
    'dropoff_latitude', 'dropoff_longitude', 'dropoff_earliest_time', 'dropoff_latest_time',
    'new_dropoff_earliest', 'old_dropoff_earliest', 'new_dropoff_latest', 'old_dropoff_latest', 'label',
    'crew_names', 'regions',
]

function EventObject({o}) {
    const {uid} = o || {}
    const comps = uid.split('_')
    const type = comps.length > 0 ? comps[0] : ''
    
    const id = comps[1]
    if (type === 'US') return <EventUser o={o} id={id} />
    if (type === 'DR') return <EventDriver o={o} id={id} />
    return <span style={{padding: 2, justifySelf: 'baseline', justifyItems: 'baseline'}}><CodeBloc><span style={{color: '#888'}}>{eventTypeName(type)}</span> {id}</CodeBloc></span>
}

function EventState({state}) {
    if (!state) return <div />
    const keys = STATE_KEYS.filter(x => state[x])
    if (keys.length < 1) return <div />
    return <div style={{padding: 5, border: 'dashed 1px #eee', backgroundColor: '#fdfdfd', marginTop: 2, borderRadius: 4}}>
        { keys.map(p => <div key={p}><span style={texts.label2}>{p} :</span> {state[p]}</div>)}
    </div>   
}

function EventEvidence({evidence}) {
    if (!evidence) return <div />
    const evidenceChanges = evidence.changes || '';
    const splitChanges = evidenceChanges.split(",");
    if(!splitChanges || splitChanges.length === 0) return <div/>

    return <div style={{padding: 5, border: 'dashed 1px #eee', backgroundColor: '#fdfdfd', marginTop: 2, borderRadius: 4}}>
        <ul style={{margin: 0, paddingLeft: 16}}>{splitChanges.map((evi, idx) => (<li key={idx} style={{fontSize: 13}}>{EVIDENCE_UPDATE_NAME[evi] || evi}</li>))}</ul>
    </div>   
}

function EventDetail({event, formatDate= "MMM DD", widthFormatDate = 100}) {
    const { fact, state, ts, action, evidence, origin, location, type } = event || {}
    const { status, inbound_status } = state || {}
    const { geolocation } = location || {}

    if (event.type === 'timeline') return (
      <div style={{position: 'relative', padding: 4, justifyItems: 'baseline'}}>
          <div style={{display: 'flex'}}>
              <div style={{flex: 1, position: 'relative'}}>
                  <div style={{position: 'absolute', left: 0, right: 0, top: 10, height: 1, backgroundColor: '#ccc'}}/>
              </div>
              <div style={{width: widthFormatDate, textAlign: 'center'}}>
                  <CodeBloc style={{padding: '2px 16px', minWidth: 60, border: 'solid 1px #ccc', fontSize: 13}}>{
                      momentTz.tz(ts, moment.tz.guess()).format(formatDate)
                  }</CodeBloc>
              </div>
              <div style={{flex: 1, position: 'relative'}}>
                  <div style={{position: 'absolute', left: 0, right: 0, top: 10, height: 1, backgroundColor: '#ccc'}}/>
              </div>
          </div>
      </div>
    )

    const showState = !['sms', 'picture','edit_delivery'].includes(action);
    const showEvidence = ['sms','edit_delivery','scan'].includes(action);
    const showGPS = geolocation && !origin;
    const showDriverEvent = ["modified-personal-info", "modified-license", "modified-vehicle"].includes(event.action);
    const showFact = ["modified-regions"].includes(event.action);

    return <div style={{position: 'relative', padding: 4, justifyItems: 'baseline'}}>
        <HistoryItem event={event} status={status || inbound_status} dotLeft={-11}>
            <span style={{fontSize: '0.8em', color: '#888'}}>[{moment(ts).format('HH:mm')}]</span>
            <EventObject o={event.subject} /> { actionName(type, action) } <EventObject o={event.object} /> {showGPS && <GpsLocation geolocation={geolocation} size={'sm'} hideNumber={true} google={true}  /> }
            {showEvidence && <EventState state={evidence} />}
            {showFact && <EventState state={fact} />}
            {showFact && showState && <Box py={0.5} px={2}>to</Box>}
            {showState && <EventState state={state} />}
            {showDriverEvent && <EventEvidence evidence={evidence}/>}
            { showFeedback(event) }
        </HistoryItem>
    </div>
}

const showFeedback = (event) => {
    if (event.type !== 'FEEDBACK') return null;
    const { state } = event || {}
    const { comment, thumb } = state || {}
    return <div style={{padding: 5, border: 'dashed 1px #eee', borderRadius: 4, backgroundColor: '#fdfdfd', marginTop: 2,}}>
        { thumb === 'true' && <ThumbUpIcon style={{color: '#4abc4e'}} /> }
        { thumb === 'false' && <ThumbDownIcon style={{color: '#d0021b'}} /> }
        { comment && <span style={texts.body}> { comment }</span>}
    </div>
}

const buildTree = (events) => {
    if (!events) return []
    let eventMap = {}
    let wrappers = events.map(e => {
        const w = { ...e, subs: [], processed: false }
        eventMap[w.id] = w
        return w
    })
    for (let event of wrappers) {
        if (event.origin && eventMap[event.origin]) {
            event.processed = true
            eventMap[event.origin].subs.push(event)
        }
    }
    return wrappers.filter(e => !e.processed)
}

const addTimeline = (events, isBefore = false) => {
    if (!events || events.length < 1) return []
    let date = isBefore ? moment('9999-12-31') : moment('2010-01-01')
    let timelined = []
    events.forEach(e => {
        const day = moment(e.ts).startOf('day')
        if (!isBefore && day.isAfter(date)) {
            timelined.push({
                'type': 'timeline',
                ts: day
            })
        }
        if(isBefore && day.isBefore(date)) {
            timelined.push({
                'type': 'timeline',
                ts: day
            })
        }
        date = day
        timelined.push(e)
    })
    return timelined
}

export function EventBlocInner({ events, formatDate, widthFormatDate }) {
    return <div style={{ paddingLeft: 13, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 15, left: 5, width: 1, bottom: 5, backgroundColor: '#ccc' }}>
        </div>
        {events && events.map((event,i) => <div key={event.id || i}>
            <EventDetail event={event} formatDate={formatDate} widthFormatDate={widthFormatDate}/>
            {event.subs && event.subs.length > 0 && <div style={{ paddingLeft: 10, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 13, left: -6, height: 1, width: 15, backgroundColor: '#ccc' }}/>
                <EventBlocInner events={event.subs} formatDate={formatDate} widthFormatDate={widthFormatDate}/>
            </div>}
        </div>)}
    </div>
}

export default function EventTree({ events, formatDate, widthFormatDate, isBefore }) {
    const timelined = addTimeline(buildTree(events), isBefore)

    return <EventBlocInner events={timelined} formatDate={formatDate} widthFormatDate={widthFormatDate}/>
}
