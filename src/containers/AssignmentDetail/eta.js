import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import moment from 'moment-timezone';
import { inject, observer } from 'mobx-react';
import { IconButton } from '@material-ui/core';
import Edit from '@material-ui/icons/Edit';
import { AxlModal, AxlButton } from 'axl-reactjs-ui';
import TimeKeeper from 'react-timekeeper';
import { toast } from 'react-toastify';

import styles from './styles';
import TooltipContainer from '../../components/TooltipContainer';
import { PERMISSION_DENIED_TEXT } from '../../constants/common';
import { ACTIONS } from '../../constants/ActionPattern';

const selectedDay = {
  textAlign: 'center',
  width: 120,
  padding: 4,
  border: 'solid 1px #888',
  borderRadius: 4,
  color: '#242',
};

const unselectedDay = {
  textAlign: 'center',
  width: 120,
  padding: 4,
  border: 'solid 1px #fefefe',
  borderRadius: 4,
  color: '#aaa',
  cursor: 'pointer',
};

const TIME_UNIT = {
  MINUTE: 'minute',
  HOUR: 'hour',
  DAY: 'day',
  TODAY: 'today',
  TOMORROW: 'tomorrow',
}

@inject('etaStore', 'permissionStore')
@observer
export default class Eta extends Component {
  constructor(props) {
    super(props);
    this.state = {
      updating: false,
      selectedDate: moment.tz(props && props.tz).startOf(TIME_UNIT.DAY),
    };

    const { etaStore, assignmentId } = this.props;
    etaStore.setAssignment(assignmentId);
    this.setEta = this.setEta.bind(this);
    this.edit = this.edit.bind(this);
    this.cancel = this.cancel.bind(this);
    this.hours = _.flatMap(_.range(6, 20), (h) => [`${h}:00`, `${h}:30`]);
  }

  componentDidUpdate(p) {
    const { assignmentId } = p || {};
    const { etaStore } = this.props;

    if (assignmentId !== this.props.assignmentId) {
      etaStore.setAssignment(this.props.assignmentId);
    }
  }

  edit() {
    const { tz } = this.props;
    const today = moment.tz(tz).startOf(TIME_UNIT.DAY);
    const initial = moment.tz(tz).startOf(TIME_UNIT.HOUR).add(1, TIME_UNIT.HOUR).format('HH:mm');
    const currentHour = moment.tz(tz).get(TIME_UNIT.HOUR);

    this.setState({
      updating: true,
      today,
      day: TIME_UNIT.TODAY,
      hour: parseInt(initial.split(':')[0]),
      minute: parseInt(initial.split(':')[1]),
      initial,
      selectedDate: today.set({
        [TIME_UNIT.HOUR]: currentHour + 1,
      }),
    });
  }

  cancel() {
    const { tz } = this.props;
    const today = moment.tz(tz).startOf(TIME_UNIT.DAY);
    const currentHour = moment.tz(tz).get(TIME_UNIT.HOUR);

    this.setState({ 
      updating: false,
      selectedDate: today.set({
        [TIME_UNIT.HOUR]: currentHour + 1,
      }),
    });
  }

  setEta() {
    const { etaStore, onUpdate } = this.props;
    const { day, selectedDate } = this.state;
    if (!day) return;

    if (selectedDate.valueOf() < moment().valueOf()) {
      toast.error("Cannot set ETA in the past", {containerId: 'main'});
      return;
    }

    etaStore.updateEta(selectedDate.valueOf()).then((r) => {
      if (r && onUpdate) {
        onUpdate(r);
      }
    });
    this.setState({ updating: false });
  }

  setTime = (data) => {
    const { selectedDate } = this.state;

    this.setState({
      initial: data.formatted24,
      hour: data.hour24,
      minute: data.minute,
      selectedDate: selectedDate && selectedDate.set({
        [TIME_UNIT.HOUR]: data.hour24,
        [TIME_UNIT.MINUTE]: data.minute,
      }),
    });
  };

  changeDate = (type) => {
    const { tz } = this.props;
    const { hour, minute } = this.state;
    const date = moment.tz(tz).startOf(TIME_UNIT.DAY).set({
      [TIME_UNIT.HOUR]: hour,
      [TIME_UNIT.MINUTE]: minute,
    });
    
    if (type === TIME_UNIT.TOMORROW) {
      date.add(1, TIME_UNIT.DAY);
    } 
    
    this.setState({
      selectedDate: date,
      day: type,
      initial: date.format("HH:mm"),
    });
  }

  render() {
    const { etaStore, permissionStore, tz } = this.props;
    const { eta } = etaStore || {};
    const isDenied = permissionStore.isDenied(ACTIONS.ASSIGNMENTS.EDIT_ETA);
    const { day, selectedDate } = this.state;

    return (
      <Fragment>
        <span style={styles.text}>
          {eta && eta.eta && <span>{moment.tz(eta.eta, moment.tz.guess()).format('MM/DD hh:mm a z')}</span>}
          <TooltipContainer title={isDenied ? PERMISSION_DENIED_TEXT : ''}>
            <IconButton disabled={isDenied} aria-controls="assignment-eta" onClick={this.edit} size="small">
              <Edit fontSize="small" />
            </IconButton>
          </TooltipContainer>
        </span>
        {this.state.updating && (
          <AxlModal onClose={this.cancel} style={{ width: '320px', height: '575px', textAlign: 'center', paddingBottom: '40px', paddingLeft: '16px', paddingRight: '16px' }}>
            <h4>Provide Driver Pickup ETA</h4>
            <div>
              <div style={{ fontSize: '0.8em', color: '#666', marginBottom: 10 }}>Timezone: {tz}</div>
              <div style={{ display: 'flex', textAlign: 'center', alignContent: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <div onClick={() => this.changeDate(TIME_UNIT.TODAY)} style={this.state.day === TIME_UNIT.TODAY ? selectedDay : unselectedDay}>
                  Today
                </div>
                <div onClick={() => this.changeDate(TIME_UNIT.TOMORROW)} style={this.state.day === TIME_UNIT.TOMORROW ? selectedDay : unselectedDay}>
                  Tomorrow
                </div>
              </div>
              {eta && eta.eta && <div style={{marginBottom: 8, fontSize: '0.8em', color: '#666',}} >ETA: {moment.tz(eta.eta, moment.tz.guess()).format('MM/DD hh:mm a z')}</div>}
              {[TIME_UNIT.TODAY, TIME_UNIT.TOMORROW].includes(day) && (
                <div style={{marginBottom: 8, fontSize: '0.8em', color: '#666',}}>
                  Selected Date: {selectedDate.format("MM DD, Y HH:mm z")}
                </div>
              )}
              <div>
                <TimeKeeper time={this.state.initial} coarseMinutes={15} forceCoarseMinutes={true} onChange={this.setTime} />
              </div>
            </div>
            <div style={{ textAlign: 'center', position: 'absolute', bottom: '10px', left: 0, right: 0, paddingTop: '12px', height: '40px' }}>
              <TooltipContainer title={isDenied ? PERMISSION_DENIED_TEXT : ''}>
                  <AxlButton compact={true} disabled={(!this.state.day && !this.state.hour) || isDenied} circular={true} bg={'red'} style={{ width: '140px' }} onClick={this.setEta}>
                    UPDATE
                  </AxlButton>
              </TooltipContainer>
              <AxlButton compact={true} circular={true} style={{ width: '140px' }} onClick={this.cancel}>
                CANCEL
              </AxlButton>
            </div>
          </AxlModal>
        )}
      </Fragment>
    );
  }
}
