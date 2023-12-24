import React, { Component } from 'react';
import { AxlMainMenu } from 'axl-reactjs-ui';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import { ACTIONS } from './constants/ActionPattern';

@inject('userStore', 'lnfStore', 'permissionStore')
@observer
class MainMenu extends Component {
  constructor(props) {
    super(props);
    this.onMenuSelect = this.onMenuSelect.bind(this);
    this.state = {
      currentPath: this.props.location.pathname.split('/')[1],
    };
  }
  onMenuSelect(item) {
    this.props.history.push(item.path);
  }

  render() {
    const { userStore, lnfStore, permissionStore } = this.props;
    const { open, currentPath } = lnfStore;
    const { user } = userStore;
    const current = currentPath ? currentPath.split('/')[1] : null;
    const isDeniedViewDashboard = permissionStore.isDenied(ACTIONS.VIEW_DASHBOARD);

    const mainMenuItems = [
      // { value: 'linehauls', name: 'Linehauls', path: '/linehauls' },
      { value: 'routes', name: 'Dispatch', path: '/routes' },
      { value: 'ticket-booking', name: 'Booking', path: '/ticket-booking' },
      { value: 'search', name: 'Search', path: '/search' },
      { value: 'driver-crews', name: 'Driver Crews', path: '/driver-crews' },
      { value: 'driver-pools', name: 'Driver Pools', path: '/driver-pools' },
      { value: 'messenger', name: 'Messenger', path: '/messenger' },
      { value: 'driver-announcements', name: 'Announcement', path: '/driver-announcements' },
    ];

    const isAdmin = user && user.scopes && user.scopes.includes('admin');
    const isHr = user && user.scopes && user.scopes.includes('hr');
    if (isAdmin || isHr) mainMenuItems.push({ value: 'drivers', name: 'Drivers', path: '/drivers' });
    if (!isDeniedViewDashboard) mainMenuItems.unshift({ value: 'dashboard', name: 'Dashboard', path: '/dashboard' });

    return <AxlMainMenu onSelect={(item) => this.onMenuSelect(item)} items={mainMenuItems} current={current} open={open} center/>;
  }
}

export default withRouter(MainMenu);
