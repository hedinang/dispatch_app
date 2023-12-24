import React, { useEffect, useState } from 'react';

import { Drawer, makeStyles } from '@material-ui/core';
import {useHistory} from "react-router-dom";
import { compose } from 'recompose';
import { inject } from 'mobx-react';
import _ from 'lodash';

import NavLink from '../NavLink';
import { ACTIONS } from '../../constants/ActionPattern';

const useStyles = makeStyles({
  link: {
    minWidth: 200,
    fontSize: 16,
    color: '#545454',
    fontFamily: 'AvenirNext',
    fontWeight: 500,
    textDecoration: 'none',
    padding: '15px 20px',
    borderBottom: '1px solid #dddddd',
    '&:hover': {
      backgroundColor: '#eae8ff',
    },
    '&.active': {
      position: 'relative',
      backgroundColor: '#eae8ff',
      '&::before': {
        display: 'inline-block',
        width: 3,
        height: 3,
        position: 'absolute',
        left: 0,
        bottom: 0,
        top: 0,
        margin: 'auto',
        backgroundColor: '#000',
      }
    }
  },
  menu: {
    top: props => Math.max(0, 51 - props.offset),
    maxHeight: props => `calc(100% - ${Math.min(0, 51 - props.offset) + Math.max(0, 51 - props.offset)}px)`,
  }
});

const menuItems = [
  { label: 'Dashboard', link: '/dashboard', roles: ['view-dashboard'] },
  // { label: 'Linehauls', link: '/linehauls' },
  { label: 'Dispatch', link: '/routes' },
  { label: 'Booking', link: '/ticket-booking' },
  { label: 'Search', link: '/search' },
  { label: 'Driver Crews', link: '/driver-crews' },
  { label: 'Driver Pools', link: '/driver-pools' },
  { label: 'Drivers', link: '/drivers', roles: ['hr', 'admin'] },
  { label: 'Messenger', link: '/messenger' },
  { label: 'Announcement', link: '/driver-announcements' },
  { label: 'Frankenroute', link: '/frankenroute', roles: ['lead-dispatcher', 'admin'] },
  { label: 'Redelivery', link: '/redelivery/multi' },
  { label: 'Route Schedule', link: '/schedule' },
  { label: 'Addresses', link: '/geocode-addresses', roles: ['super-admin'] },
  { label: 'Driver Probations', link: '/driver-probations', roles: ["admin", "super-admin", "driver-coordinator"] },
  { label: 'Driver Renewal', link: '/driver-renewal', roles: ['super-admin'] },
  { label: 'Clients', link: '/clients', roles: ['super-admin'] },
  { label: 'Driver Rating Config', link: '/driver-rating-config', roles: ['super-admin'] },
];

function AxlLeftSideMenu(props) {
  const {isActive, onClose, permissionStore, userStore, ...restProps} = props;
  const [offset, setOffset] = useState(0);
  const history = useHistory();
  const classes = useStyles({ ...restProps, offset });
  const [userScopes, setUserScopes] = useState([]);

  useEffect(() => {
    const onScroll = () => setOffset(window.pageYOffset);
    window.removeEventListener('scroll', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  
  useEffect(() => {
    const viewDashboard = !permissionStore.isDenied(ACTIONS.VIEW_DASHBOARD) ? 'view-dashboard' : '';
    const {user} = userStore;
    const originalScopes = user && user.scopes || [];
    const scopes = [...originalScopes, viewDashboard];
    setUserScopes(scopes || []);
  },[userStore && userStore.user])
  
  const toggleDrawer = () => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    onClose();
  };
  
  const handleMenuClick = () => {
    onClose();
  }
  
  return (
    <Drawer
      PaperProps={{ className : classes.menu }}
      anchor={'left'}
      open={isActive}
      onClose={toggleDrawer()}
    >
      {menuItems.map((menu) => {
        if(!menu.roles || !!_.intersection(menu.roles, userScopes).length) {
          return (
            <NavLink
              location={history.location}
              key={menu.link}
              className={classes.link}
              to={menu.link}
              otherActive={menu.otherActive}
              onClick={handleMenuClick}
            >
              {menu.label}
            </NavLink>
          );
        }
        return null;
      })}
    </Drawer>
  );
}

export default compose(inject('permissionStore', 'userStore'))(AxlLeftSideMenu);
