import React, { Component } from 'react';

import { AlxFlatDateInput, AxlButton, AxlCheckbox, AxlInput, AxlTextArea, Styles } from 'axl-reactjs-ui';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import { Link, withRouter } from 'react-router-dom';
import { get, isEmpty, sortBy } from 'lodash';
import { Box, CircularProgress } from '@material-ui/core';
import { toast } from 'react-toastify';

import TooltipContainer from '../../components/TooltipContainer';
import { toHoursAndMinutes } from '../../Utils/calendar';
import { ACTIONS } from '../../constants/ActionPattern';
import { PERMISSION_DENIED_TEXT } from '../../constants/common';
import styles from './styles';
import AxlAutocomplete from '../../components/AxlAutocomplete';
import { getAppFeatures } from '../../stores/api';
import { DEFAULT_DIRECT_BOOKING_COMMUNICATION_TEMPLATE } from '../../constants/ticket';

const DEFAULT_REGION = "SFO";
@inject('assignmentStore', 'scheduleStore', 'permissionStore', 'regionStore')
@observer
class ScheduleCreation extends Component {
  constructor(props) {
    super(props);
    this.onSave = this.onSave.bind(this);
    this.updateField = this.updateField.bind(this);
    let today = moment()
      .startOf('date')
      .add(1, 'day');
    this.state = {
      schedule: {
        earliest_pickup_time: 420, //7am
        latest_pickup_time: 660, //11am
        type: 'assignment',
        region: {},
        name: 'Routes for ' + today.format('YYYY-MM-DD'),
        max_reservation: 1,
        target_date: today.format('YYYY-MM-DD'),
        description: 'Routes',
        target_drivers: [],
        target_assignments: [],
        enable_driver_bonus: false,
        ttl: 240, // in minutes,
        first_break_booking_time: 300, // in seconds,
        booking_duration: 10, // in seconds,
        communication: DEFAULT_DIRECT_BOOKING_COMMUNICATION_TEMPLATE,
        enable_push_notification: true,
      },
      error: '',
      directBookingPushNoti: false,
      isSaving: false,
    };
  }

  componentDidMount() {
    const { regionStore } = this.props;
    if (regionStore.regions && regionStore.regions.length < 1) {
      regionStore.init();
    }
  }

  getFeatures = (owners) => {
    getAppFeatures([...owners, 'AP_DEFAULT']).then(res => {
      const {direct_booking_push_notification} = res.data;

      this.setState({
        directBookingPushNoti: direct_booking_push_notification || false,
        schedule: {
          ...this.state.schedule,
          enable_push_notification: direct_booking_push_notification || false,
        }
      })
    })
  }

  onSave() {
    const { scheduleStore, permissionStore, history } = this.props;
    const isDenied = permissionStore.isDenied(ACTIONS.BOOKING_SESSIONS.CREATE_DIRECT_BOOKING_SESSION);
    if (isDenied) return;

    const { schedule: stateSchedule } = this.state;

    if(!get(stateSchedule, 'region.value')) {
      toast.error("Region cannot empty", {containerId: 'main'})
      return;
    }

    let schedule = Object.assign({}, {
      ...this.state.schedule,
      region: stateSchedule && stateSchedule.region && stateSchedule.region.value,
    });
    schedule.target_date = schedule.target_date + 'T12:00:00';

    this.setState({isSaving: true});
    scheduleStore.insertSchedule(schedule).then((id) => {
      this.setState({isSaving: false});
      history.push(`/schedule/${id}`);
    });
  }

  updateField(name) {
    return (event) => {
      let schedule = {};
      if (event.target && event.target.type.toLowerCase() === 'checkbox') {
        schedule[name] = event.target.checked;
      } else {
        schedule[name] = event.target.value;
      }
      this.setState({ schedule: Object.assign(this.state.schedule, schedule) });
    };
  }

  updateDate = (name, isTimestamp) => (dates) => {
    let schedule = {};
    if (!dates || dates.length < 1) {
      schedule[name] = null;
    } else if (name === 'target_date') {
      const date = dates[0];
      schedule[name] = moment(date).format('YYYY-MM-DD');

      console.log('moment is: ', schedule);
    } else {
      const date = dates[0];
      if (!isTimestamp) {
        schedule[name] = date;
      } else {
        schedule[name] = date.getTime();
      }
    }

    this.setState({ schedule: Object.assign(this.state.schedule, schedule) });
  };

  handleRegion = (selected) => {
    if(isEmpty(selected)) {
      this.setState({
        directBookingPushNoti: false,
        schedule: {
          ...this.state.schedule,
          enable_push_notification: false,
        }
      })
      return;
    }
    this.setState({schedule: {
      ...this.state.schedule,
      region: selected || {},
    }})

    this.getFeatures([`RG_${selected.value}`]);
  }

  render() {
    const { permissionStore, regionStore } = this.props;
    const { schedule, directBookingPushNoti, isSaving } = this.state;

    const datePicker2 = {
      // dateFormat: 'MMM DD, Y',
      placeHolder: 'Message Time',
      enableTime: true,
      altInput: true,
      clickOpens: true,
    };
    const eariestTime = toHoursAndMinutes(this.state.schedule.earliest_pickup_time);
    const latestTime = toHoursAndMinutes(this.state.schedule.latest_pickup_time);

    const isDeniedCreate = permissionStore.isDenied(ACTIONS.BOOKING_SESSIONS.CREATE_DIRECT_BOOKING_SESSION);

    return (
      <div style={{ ...styles.container, ...Styles.box }}>
        <h4 style={{ padding: '20px' }}>Create new Driver Schedule</h4>
        <Box style={styles.row} display={'flex'} alignItems={'center'}>
          <span style={styles.label}>Region</span>
          <span style={styles.inputContainer} data-testid="schedule-create-region-input">
            <AxlAutocomplete
              options={sortBy(regionStore.regions, 'value')}
              onChange={(evt, selected) => this.handleRegion(selected)}
              getOptionLabel={(option) => option.label || "" }
              getOptionSelected = {(option, value) => option.value === value.value}
              value={schedule.region || {}}
              disableClearable
              placeholder="Select region"
            />
          </span>
        </Box>
        {directBookingPushNoti && (
          <div style={styles.row}>
            <span style={styles.label}>Enable Push Notification</span>
            <span style={styles.inputContainer}>
              <AxlCheckbox checked={schedule.enable_push_notification} onChange={this.updateField('enable_push_notification')} data-testid="schedule-create-checkbox-push-noti"/>
            </span>
          </div>
        )}
        <div style={styles.row}>
          <span style={styles.label}>Date</span>
          <span style={styles.inputContainer}>
            <AlxFlatDateInput style={{ width: '100%', boxSizing: 'border-box', margin: 0 }} defaultValue={this.state.schedule.target_date} onChange={this.updateDate('target_date')} data-testid="schedule-create-input-date"/>
          </span>
        </div>
        <div style={styles.row}>
          <div style={styles.label}>Earliest Pickup Time</div>
          <div style={styles.pickupContainer}>
            <Flatpickr
              style={{ width: 200, height: 39, margin: 0, boxSizing: 'border-box' }}
              options={{
                enableTime: true,
                noCalendar: true,
                dateFormat: 'H:i',
                minuteIncrement: 30,
              }}
              value={eariestTime}
              onChange={([date]) => {
                const minuteInput = date.getHours() * 60 + date.getMinutes();
                if (minuteInput > this.state.schedule.latest_pickup_time) {
                  this.setState({ error: 'Earliest pickup time should be before Latest pickup time' });
                } else {
                  this.setState({ schedule: { ...this.state.schedule, earliest_pickup_time: minuteInput }, error: '' });
                }
              }}
              data-testid="schedule-create-earliest-pickup-time"
            />
            <div style={styles.pickupLabel}>Latest Pickup Time</div>
            <Flatpickr
              style={{ width: 200, height: 39, margin: 0, boxSizing: 'border-box' }}
              value={latestTime}
              options={{
                enableTime: true,
                noCalendar: true,
                dateFormat: 'H:i',
                minuteIncrement: 30,
              }}
              onChange={([date]) => {
                const minuteInput = date.getHours() * 60 + date.getMinutes();
                if (minuteInput < this.state.schedule.earliest_pickup_time) {
                  this.setState({ error: 'Earliest pickup time should be before Latest pickup time' });
                } else {
                  this.setState({ schedule: { ...this.state.schedule, latest_pickup_time: minuteInput }, error: '' });
                }
              }}
              data-testid="schedule-create-latest-pickup-time"
            />
          </div>
          {this.state.error && <div style={styles.error}>{this.state.error}</div>}
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Schedule send message</span>
          <span style={styles.inputContainer}>
            <AxlCheckbox defaultValue={this.state.schedule.schedule_send_message} onChange={this.updateField('schedule_send_message')} data-testid="schedule-create-checkbox-send-mes"/>
          </span>
        </div>
        {this.state.schedule.schedule_send_message && (
          <div style={styles.row}>
            <span style={styles.label}>Send message time</span>
            <span style={styles.inputContainer}>
              <AlxFlatDateInput options={datePicker2} theme={{ type: 'main' }} defaultValue={this.state.schedule.send_message_time ? new Date(this.state.schedule.send_message_time) : null} onChange={this.updateDate('send_message_time', true)} data-testid="schedule-create-mes-time"/>
            </span>
          </div>
        )}
        <div style={styles.row}>
          <span style={styles.label}>Name</span>
          <span style={styles.inputContainer} data-testid="schedule-create-input-name">
            <AxlInput style={{ width: '100%' }} defaultValue={this.state.schedule.name} onChange={this.updateField('name')}/>
          </span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Description</span>
          <span style={styles.inputContainer} data-testid="schedule-create-input-desc">
            <AxlInput style={{ width: '100%' }} defaultValue={this.state.schedule.description} onChange={this.updateField('description')}/>
          </span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Communication</span>
          <span style={styles.inputContainer} data-testid="schedule-create-communication">
            <AxlTextArea style={{ width: '100%', height: '180px' }} defaultValue={this.state.schedule.communication} onChange={this.updateField('communication')}/>
          </span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Max Reservation</span>
          <span style={styles.inputContainer} data-testid="schedule-create-max-reservation">
            <AxlInput style={{ width: '100%' }} type="number" defaultValue={this.state.schedule.max_reservation} onChange={this.updateField('max_reservation')}/>
          </span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Token expire in (minutes)</span>
          <span style={styles.inputContainer} data-testid="schedule-create-token-expire">
            <AxlInput style={{ width: '100%' }} type="number" defaultValue={this.state.schedule.ttl} onChange={this.updateField('ttl')}/>
          </span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Can book the second route after (in seconds)</span>
          <span style={styles.inputContainer} data-testid="schedule-create-book-second-route">
            <AxlInput style={{ width: '100%' }} type="number" defaultValue={this.state.schedule.first_break_booking_time} onChange={this.updateField('first_break_booking_time')}/>
          </span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Duration between 2 booking time (in seconds)</span>
          <span style={styles.inputContainer} data-testid="schedule-create-duration-booking-time">
            <AxlInput style={{ width: '100%' }} type="number" defaultValue={this.state.schedule.booking_duration} onChange={this.updateField('booking_duration')}/>
          </span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Enable Driver Bonus</span>
          <span style={styles.inputContainer}>
            <AxlCheckbox defaultValue={this.state.schedule.enable_driver_bonus} onChange={this.updateField('enable_driver_bonus')} data-testid="schedule-create-enable-driver-bonus"/>
          </span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Client IDs (separate with comma, no spaces)</span>
          <span style={styles.inputContainer} data-testid="schedule-create-list-client-id">
            <AxlInput style={{ width: '100%' }} defaultValue={this.state.schedule.client_ids} onChange={this.updateField('client_ids')}/>
          </span>
        </div>
        <div>
          <TooltipContainer title={isDeniedCreate ? PERMISSION_DENIED_TEXT : ''} data-testid="schedule-create-button-save">
            <AxlButton onClick={this.onSave} style={{ width: '200px' }} disabled={isDeniedCreate || Boolean(this.state.error) || isSaving}>
              {isSaving ? <CircularProgress size={24}/> : 'SAVE'}
            </AxlButton>
          </TooltipContainer>
          <Link to={isSaving ? "#" : "/schedule"} style={{ textDecoration: 'none' }} data-testid="schedule-create-button-cancel">
            <AxlButton bg={'red'} style={{ width: '200px' }} disabled={isSaving}>
              CANCEL
            </AxlButton>
          </Link>
        </div>
      </div>
    );
  }
}

export default withRouter(ScheduleCreation);
