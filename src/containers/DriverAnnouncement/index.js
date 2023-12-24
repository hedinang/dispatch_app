import React, { Component } from 'react';

import {Route, Switch, Link} from 'react-router-dom';
import {inject, observer} from "mobx-react";
import { AxlButton, AxlModal } from 'axl-reactjs-ui';
import moment from "moment-timezone";

import styles from './styles';
import {DriverAnnouncementListComponent} from "../../components/DriverAnnouncementList";
import DriverAnnouncementForm from './form';
import { Box } from '@material-ui/core';

const STATUS = {
  SCHEDULED: 'SCHEDULED',
  SENT: 'SENT',
  FAIL: 'FAIL',
  DRAF: 'DRAFT',
  IN_PROGRESS: 'IN_PROGRESS',
}

export const getColorByStatus = (status) => {
  switch (status) {
    case STATUS.SCHEDULED: 
      return '#4a90e2';
    case STATUS.DRAF:
      return '#2a2444';
    case STATUS.SENT: 
      return '#3c8b05'
    case STATUS.FAIL: 
      return '#d0021b'
    case STATUS.IN_PROGRESS:
      return '#fa6724';
    default:
      return '#737273'
  }
}

@inject('driverAnnouncementStore')
@observer
class DriverAnnouncementList extends Component {
  constructor(props) {
    super(props);
    const {driverAnnouncementStore} = this.props;
    driverAnnouncementStore.updateFilters('DEFAULT', {
      page: driverAnnouncementStore.filters && driverAnnouncementStore.filters.page || 1,
      size: 20,
      order_by: driverAnnouncementStore.filters && driverAnnouncementStore.filters.order_by || 'id',
      desc: driverAnnouncementStore.filters && driverAnnouncementStore.filters.desc || true,
    });
  }

  remove = (item) => (e) => {
    const {driverAnnouncementStore} = this.props;
    driverAnnouncementStore.delete(item.id, () => {
      driverAnnouncementStore.search();
    })
  };

  render() {
    const {driverAnnouncementStore} = this.props;
    const { filters, searching, result } = driverAnnouncementStore;
    const renderer = {
      status: (v, item) => <span style={{color: getColorByStatus(v)}}>{
        v === STATUS.SCHEDULED 
        ? <Box color={'#4a90e2'}>
            <Box style={{textTransform: 'uppercase'}} mb={0.5}>{STATUS.SCHEDULED}</Box>
            {item.schedule_time && (<span>({moment.tz(item.schedule_time, item.schedule_timezone).format('M/DD/YYYY hh:mmA z')})</span>)}
          </Box> 
        : v
      }</span>,
      drivers: (drivers, item) => <Link to={`/driver-announcements/${item.id}`}>
        (<strong>{drivers ? drivers.length : 0}</strong>)
      </Link>,
      actions: (v, item) =><span>
        <span style={styles.actionItem}>
          <Link to={`/driver-announcements/${item.id}`}>
            <i style={{cursor: 'pointer'}} className="fa fa-eye"></i>
          </Link>
        </span> |
        <span style={styles.actionItem}>
          <Link to={`/driver-announcements/${item.id}/edit`}>
            <i style={{cursor: 'pointer'}} className="fa fa-edit"></i>
          </Link>
        </span> |
        <span style={styles.actionItem}>
          <i onClick={this.remove(item)} style={{cursor: 'pointer'}} className="fa fa-trash"></i>
        </span>
      </span>
    };

    return <div style={{textAlign: 'left'}}>
      <Link to={'driver-announcements/new'}>
        <AxlButton compact={true}>NEW</AxlButton>
      </Link>
      <DriverAnnouncementListComponent pagination renderer={renderer} />
      <Switch>
        <Route exact path={`/driver-announcements/new`} render={ (props) =>
          <AxlModal style={{width: '1000px', height: '800px', paddingBottom: '60px', paddingLeft: '16px', paddingRight: '16px'}} onClose={() => this.props.history.push(`/driver-announcements`)}>
            <DriverAnnouncementForm {...props} />
          </AxlModal>} />

        <Route exact path={`/driver-announcements/:announcementId/edit`} render={ (props) =>
          <AxlModal style={{width: '1000px', height: '800px', paddingBottom: '60px', paddingLeft: '16px', paddingRight: '16px'}} onClose={() => this.props.history.push(`/driver-announcements`)}>
            <DriverAnnouncementForm {...props} />
          </AxlModal>} />
      </Switch>
    </div>
  }
}

export default DriverAnnouncementList
