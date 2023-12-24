import React, { Component, Fragment } from 'react';
import {inject, observer} from "mobx-react";
import { IconButton, Button, Typography } from '@material-ui/core';
import styles, * as E from './eta_styles';
import Moment from 'react-moment';
import moment from 'moment-timezone'
import Edit from '@material-ui/icons/Edit';
import { AxlModal, AxlButton } from 'axl-reactjs-ui';
import styled from 'styled-components';
import _ from 'lodash'
import TimeKeeper from 'react-timekeeper';

const selectedDay = {
    textAlign: 'center',
    width: 120,
    padding: 4,
    border: 'solid 1px #888',
    borderRadius: 4,
    color: '#242'
}

const unselectedDay = {
    textAlign: 'center',
    width: 120,
    padding: 4,
    border: 'solid 1px #fefefe',
    borderRadius: 4,
    color: '#aaa',
    cursor: 'pointer'
}

const hourDiv = {}

const Hour = (t, selected, onClick) => {
    const comps = t.split(':')
    const h = comps[0]
    const m = comps[1]
    return selected ?
        <span style={{display: 'inline-block', padding: '3px 6px', margin: 2, borderRadius: 4, border: 'solid 1px #228', backgroundColor: '#46e'}}> <span style={{fontWeight: 500, color: '#fff'}}>{ h }</span>:<span style={{color: '#f8f8f8'}}>{ m }</span> </span>
        : <span onClick={onClick} style={{display: 'inline-block', cursor: 'pointer', padding: '3px 6px', margin: 2, borderRadius: 4, border: 'solid 1px #eee'}}> <span style={{fontWeight: 500, color: '#222'}}>{ h }</span>:<span style={{color: '#666'}}>{ m }</span> </span>
}

export default class Eta extends Component {
  constructor (props) {
      super(props)
    const { start, tz} = props
    const today = moment.tz(tz || 'America/Los_Angeles').startOf('day')
    const predictedDay = moment(start).tz(tz || 'America/Los_Angeles').startOf('day')
    const day = predictedDay.isBefore(today) ? today : predictedDay
    this.state = {
      predictedDay,
      today,
      day
    }
    this.setEta = this.setEta.bind(this)
    this.cancel = this.cancel.bind(this)
    this.hours = _.flatMap(_.range(6,20), h => [`${h}:00`, `${h}:30`])
  }

  componentDidUpdate(p) {
    const {tz, start} = this.props
    const today = moment.tz(tz || 'America/Los_Angeles').startOf('day')
    const initial = moment.tz(tz).startOf('hour').add(1, 'hours').format('HH:mm')
    // this.setState({
    //     today,
    //     day: start,
    //     hour: parseInt(initial.split(':')[0]),
    //     minute: parseInt(initial.split(':')[1]),
    //     initial
    // })
  }

  cancel() {
    const { onCancel } = this.props
    onCancel && onCancel()
  }

  setEta() {
    const { onUpdate, tz } = this.props
    const { day, hour, minute, today } = this.state
    if (!day || !hour) return
    const time = moment(day).add(hour, 'hours').add(minute, 'minutes').tz('UTC')
    if (time.isBefore(moment().add(30, 'minutes'))) {
      alert('Pickup Time needs to be at least 30 minutes from now!')
      return
    }
    const ts = time.unix()
    console.log(ts)
    onUpdate && onUpdate(ts)
  }

  setTime = (data) => {
    this.setState({
      initial: data.formatted24,
      hour: data.hour24,
      minute: data.minute
    });
  }

  render() {
    const { tz } = this.props
    const { day, hour, minute, today } = this.state

    return <Fragment>
                <h4>
                    Select Route start Time
                </h4>
                <div>
                    <div style={{fontSize: '0.8em', color: '#666', marginBottom: 10}}>
                        Timezone: { tz }
                    </div>
                    <div style={{display: 'flex', textAlign: 'center', alignContent: 'center', justifyContent: 'center', marginBottom: 10}}>
                      Day: { day.format('YYYY/MM/DD') }
                    </div>
                    <div>
                        <TimeKeeper time={this.state.initial} coarseMinutes={30} forceCoarseMinutes onChange={this.setTime} />
                        {/* { this.hours.map(h => Hour(h, h == this.state.hour, () => this.setState({hour: h}))) } */}
                    </div>
                </div>
                <div style={{textAlign: 'center', position: 'absolute', bottom: '10px', left: 0, right: 0, paddingTop: '12px', height: '40px'}}>                                    
                  <AxlButton compact={true} disabled={!this.state.day && !this.state.hour} circular={true} bg={'red'} style={{width: '140px'}} onClick={this.setEta}>UPDATE</AxlButton>
                  <AxlButton compact={true} circular={true} style={{width: '140px'}} onClick={this.cancel}>CANCEL</AxlButton>
                </div>
    </Fragment>
  }
}