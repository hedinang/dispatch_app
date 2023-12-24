import React, { Component } from 'react';
import { AxlModal, AxlButton, AxlTextArea, AxlDateInput } from 'axl-reactjs-ui';
import styles from './styles';
import Moment from 'react-moment';
import moment from 'moment-timezone';
import { Link } from "react-router-dom";
import { inject, observer } from 'mobx-react';
import _ from 'lodash'

import {
  withRouter,
  Route,
  Switch
} from 'react-router-dom'

@inject("driverPickupStore")
class PickupSlot extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showDetail: false,
      editETA: false,
      eta: null,
      note: props.slot.attributes ? props.slot.attributes.note : '',
      bookingTime: {}
    }
    this.saveNote = this.saveNote.bind(this)
    this.sendMessage = this.sendMessage.bind(this)
    this.show = this.show.bind(this)
    this.startEditingETA = this.startEditingETA.bind(this)
    this.updateETA = this.updateETA.bind(this)
    this.saveETA = this.saveETA.bind(this)
  }

  saveNote() {
    const { driverPickupStore, slot } = this.props
    driverPickupStore.editNote(slot.id, this.state.note).then(() => {
      this.setState({note: ''})
    })
  }

  sendMessage() {
    const { driverPickupStore, slot } = this.props
    driverPickupStore.sendMessage(slot.id, this.state.note).then(() => {
      this.setState({note: ''})
    })
  }

  show() {
    const { driverPickupStore, slot } = this.props
    driverPickupStore.getBookingInfo(slot).then(r => {
      console.log(r);
      this.setState({bookingTime: r})
    });
    this.setState({
      showDetail: true,
      note: '',
      editETA: false
    })
  }

  startEditingETA() {
    const now = (1 + Date.now() / 300000).toFixed(0) * 300000
    this.setState({ editETA: true, eta: now })
  }

  updateETA(e) {
    this.setState({eta: 1000 * (new moment(e)).unix()})
  }

  saveETA() {
    const { driverPickupStore, slot } = this.props    
    driverPickupStore.updateETA(slot.id, this.state.eta).then((r) => {
      this.setState({editETA: false})
    })
  }

  render() {
    const { slot } = this.props
    const { driver, assignments, end, attributes = {}, notes = [], eta } = slot
    const pickedUpTs = slot.pickedUpTs ? slot.pickedUpTs : _.min(assignments.filter(a => a.actual_start_ts).map(a => a.actual_start_ts))
    const styled = pickedUpTs ? (moment(pickedUpTs).isAfter(moment(end).add(30, 'm')) ? styles.pickedupLate : styles.pickedup) : (slot.eta ? { border: 'solid 1px #222' } : {})
    const now = (1 + Date.now() / 300000).toFixed(0) * 300000

    // console.log('slot is: ', slot);
    const etaTimeOptions = {
      dateFormat: 'hh:mm A',
      placeHolder: 'ETA',
      enableTime: true,
      altInput: true,
      clickOpens: true,
      defaultValue: slot.eta ? slot.eta : now
    }
    return <div style={styles.slotContainer}>
      <div style={{...styles.slot, ...styled}} onClick={this.show}>
        <div style={{textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', fontSize: '14px', fontWeight: 'bold', color: '#237'}}>
          { driver && <span>{driver.first_name} {driver.last_name}</span>}
          { !driver && <span>UN-CLAIMED</span>}
        </div>
        <div style={{display: 'flex'}}>
          <div style = {{flex: 1, textAlign: 'left'}}>
            {assignments.map(a => <code key={a.id} style={{padding: '1px 4px', margin: '2px', fontSize: '16px', fontWeight: 'bold', color: a.status === 'COMPLETED' ? '#28881c' : (a.status === 'IN_PROGRESS' ? '#e8703a' : 'black')}}>{a.label}</code>)}
          </div>
          <div style = {{flex: 1, textAlign: 'right'}}>
            { pickedUpTs && <span><i className={'far fa-clock'} /> <code style={{fontSize: '14px', fontWeight: 'bold'}}>{moment.tz(pickedUpTs, moment.tz.guess()).format("hh:mma z")}</code></span>}
            { !pickedUpTs && slot.eta && <span style={{fontSize: '14px', marginLeft: 8, color: '#822'}}>[eta] <code style={{fontSize: '14px', fontWeight: 'bold'}}> {moment.tz(slot.eta, moment.tz.guess()).format("hh:mma z")} <Moment format={'h:mma'}>{ slot.eta }</Moment></code></span>}
          </div>
        </div>
      </div>
      { this.state.showDetail && driver && <AxlModal onClose={() => this.setState({showDetail: false}) } style={{width: 600, minHeight: 200, maxHeight: 800, paddingBottom: 60}}>
        <h4>
          [{driver.id}] {driver.first_name} {driver.last_name}
        </h4>
        { !pickedUpTs && <div style={{position: 'absolute', backgroundColor: '#fee', top: 0, left: 0, padding: 5, fontSize: '14px'}}>
          {!this.state.editETA && <div>
            { eta && <span><strong>ETA</strong>{moment.tz(eta, moment.tz.guess()).format("hh:mm A z")} </span>}
            { !eta && <span style={{color: '#f33'}}>No ETA</span> }
            <span onClick={ this.startEditingETA } style={{cursor: 'pointer', dislay: 'inline-block', marginLeft: 8, padding: '2px 8px', fontSize: 13, backgroundColor: '#eee', borderRadius: 6}}>edit</span>
          </div> }
          {this.state.editETA && <div style={{display: 'flex'}}>
            <AxlDateInput onChange={ this.updateETA } displayToday={false} options={etaTimeOptions} theme={`main`} />
            <div>
              <AxlButton style={{ margin: '5px 8px' }} tiny={true} onClick={() => this.setState({editETA: false})}>Cancel</AxlButton>
              <AxlButton disabled = { !this.state.eta } style={{ margin: '5px 8px' }} onClick={this.saveETA } tiny={true}>Save</AxlButton>
            </div>
          </div>}
        </div>}
        { pickedUpTs && <div style={{position: 'absolute', backgroundColor: '#efe', top: 0, left: 0, padding: 5, fontSize: '14px'}}>
          <strong>Showed up</strong>{moment.tz(pickedUpTs, moment.tz.guess()).format("hh:mm A z")}
        </div>}
        <div style={{marginBottom: 10}}>
          Phone Number: {driver.phone_number}
        </div>
        <div style={{marginBottom: 10}}>
          { assignments.map(a => <div key={a.id}>
            Route <a target="_blank" href={`/routes/today/${slot.region}/all/${a.id}`}>
              <strong style={{color: a.status === 'COMPLETED' ? '#28881c' : (a.status === 'IN_PROGRESS' ? '#e8703a' : 'black')}}>{a.label}</strong>
            </a> [{a.shipment_count}]: { a.status ? a.status : 'PENDING'}
          { this.state.bookingTime && this.state.bookingTime[a.id] && <span> <strong>{this.state.bookingTime[a.id].action}ed</strong> @ {this.state.bookingTime[a.id].time}</span> }
          </div>) }
        </div>
        <div style={{textAlign: 'left'}}>
          { notes.map(note => <div style={{padding: '4px 16px'}} key={note.ts}>
            <span style={styles.time}>[{moment.tz(note.ts, moment.tz.guess()).format("hh:mma z")}]</span>
            <strong> {note.user_name} </strong>
            <span>{ note.type === 'message' ? 'sent message' : 'added note'}</span>: 
            &ldquo; <strong><i>{note.note}</i></strong> &rdquo;
          </div>) }
        </div>

        <div style={{margin: '16px 16px'}}>
          <AxlTextArea style={{width: '100%', height: '60px'}} placeholder={'Note'} value={this.state.note} onChange={(v) => this.setState({note: v.target.value})} />
        </div>
        <div style={{position: 'absolute', bottom: 0, left: 10, right: 10, display: 'flex', justifyContent: 'center'}}>
          <div style={{flex: 1}}>
            <AxlButton disabled={!this.state.note} style={{display: 'block'}} onClick={ this.saveNote }>SAVE</AxlButton>
          </div>
          <div style={{flex: 1}}>
            <AxlButton style={{display: 'block'}} onClick={() => this.setState({showDetail: false}) } bg={'red'}>Close</AxlButton>
          </div>
          <div style={{flex: 1}}>
            <AxlButton disabled={!this.state.note} style={{display: 'block'}} onClick={ this.sendMessage } bg={'bluish'}>Message</AxlButton>
          </div>
        </div>
      </AxlModal>}
    </div>
  }
}

@inject('driverPickupStore')
@observer
class DriverPickupTimeContainer extends Component {
  constructor(props) {
    super(props)
    this.reload = this.reload.bind(this)
  }

  componentDidMount() {
    const { match, driverPickupStore } = this.props
    driverPickupStore.selectRegion(match.params.region)
    this.timer = setInterval(this.reload, 300000);
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }

  reload() {
    const { driverPickupStore } = this.props
    driverPickupStore.loadPickupTime()
  }

  componentWillReceiveProps(props) {
    if (props.match.params.region !== this.props.match.params.region) {
      const { match, driverPickupStore } = this.props
      driverPickupStore.selectRegion(props.match.params.region)
    }
  }

  render() {
    const { driverPickupStore } = this.props
    const { region, pickupInfo = {}, startTs } =  driverPickupStore
    const { groups = [] } = pickupInfo
    const { match } = this.props

    // console.log('group is: ', groups);
    return <div>
      { startTs && <div><span style={{display: 'inline-block', padding: 16, backgroundColor: '#fefefe', margin: 10, border: 'solid 1px #888', borderRadius: 8, fontSize: '1.2em', fontWeight: 500}}><i className={'fa fa-calendar'} /> <Moment format={'dddd MMM DD'}>{ startTs * 1000 + 12 * 3600 * 1000 }</Moment> </span></div> }
      { groups.map(g => <div style={styles.group} key={g.id}>
        <div style={styles.groupHeader}>
          { g.start && g.end && <span>{moment.tz(g.start, moment.tz.guess()).format("hh:mm A z")} - {moment.tz(g.end, moment.tz.guess()).format("hh:mm A z")}</span> }
          { (!g.start || !g.end) && <span>NON-REGISTERED</span> }
        </div>
        <div style={styles.groupBody}>
          { g.slots.map((s) => <PickupSlot slot={s} key={s.driver_id} />) }
        </div>
      </div>) }
    </div>
  }
}

export default DriverPickupTimeContainer
