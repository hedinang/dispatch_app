import React, { Component } from 'react';
import Moment from 'react-moment';
import moment from 'moment-timezone';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { AxlTable } from 'axl-reactjs-ui';

import { GreenButton } from '../../components/Button';
import TooltipContainer from '../../components/TooltipContainer';

import styles from './styles';
import { ACTIONS } from '../../constants/ActionPattern';
import { PERMISSION_DENIED_TEXT } from '../../constants/common';

@inject('assignmentStore', 'scheduleStore', 'permissionStore')
@observer
class ScheduleList extends Component {
  componentDidMount() {
    const { scheduleStore } = this.props;
    scheduleStore.loadSchedules();
  }

  render() {
    const { scheduleStore, permissionStore } = this.props;
    const { schedules } = scheduleStore;

    const isDeniedCreateSchedule = permissionStore.isDenied(ACTIONS.BOOKING_SESSIONS.CREATE_DIRECT_BOOKING_SESSION);

    return (
      <div style={{ ...styles.container }}>
        <div>
          <TooltipContainer title={isDeniedCreateSchedule ? PERMISSION_DENIED_TEXT : ''}>
            <GreenButton disabled={isDeniedCreateSchedule} component={Link} to="/schedule/new" variant="contained" size="large" style={styles.btnCreateSchedule}>NEW SCHEDULE</GreenButton>
          </TooltipContainer>
        </div>
        <div style={styles.list} className={'momentumScroll'}>
          <AxlTable>
            <AxlTable.Header>
              <AxlTable.Row>
                <AxlTable.HeaderCell>Region</AxlTable.HeaderCell>
                <AxlTable.HeaderCell>Date</AxlTable.HeaderCell>
                <AxlTable.HeaderCell>Name</AxlTable.HeaderCell>
                <AxlTable.HeaderCell># Routes</AxlTable.HeaderCell>
                <AxlTable.HeaderCell># Drivers</AxlTable.HeaderCell>
                <AxlTable.HeaderCell>Messaging time</AxlTable.HeaderCell>
                <AxlTable.HeaderCell>Status</AxlTable.HeaderCell>
                <AxlTable.HeaderCell></AxlTable.HeaderCell>
              </AxlTable.Row>
            </AxlTable.Header>
            <AxlTable.Body>
              {schedules &&
                schedules.map((schedule) => (
                  <AxlTable.Row key={schedule.id}>
                    <AxlTable.Cell>{schedule.region}</AxlTable.Cell>
                    <AxlTable.Cell>
                      <Moment interval={0} format={'DD MMM YY'}>
                        {schedule.target_date}
                      </Moment>
                    </AxlTable.Cell>
                    <AxlTable.Cell>{schedule.name}</AxlTable.Cell>
                    <AxlTable.Cell>{schedule.target_assignments.length}</AxlTable.Cell>
                    <AxlTable.Cell>{schedule.target_drivers.length}</AxlTable.Cell>
                    <AxlTable.Cell>{schedule.send_message_time && <span>{moment.tz(schedule.send_message_time, moment.tz.guess()).format('DD MMM hh:mm z')}</span>}</AxlTable.Cell>
                    <AxlTable.Cell>{schedule.status}</AxlTable.Cell>
                    <AxlTable.Cell>
                      <GreenButton component={Link} to={`/schedule/${schedule.id}`} variant="contained" size="large" color="primary" style={{ minWidth: '80px' }}>VIEW</GreenButton>
                    </AxlTable.Cell>
                  </AxlTable.Row>
                ))}
            </AxlTable.Body>
          </AxlTable>
        </div>
      </div>
    );
  }
}

export default ScheduleList;
