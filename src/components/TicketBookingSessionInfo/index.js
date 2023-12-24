import React, { Component } from 'react';
import { AxlSimpleDropDown } from 'axl-reactjs-ui';
import styles from './styles';
import Moment from 'react-moment';
import moment from "moment-timezone";

import _ from 'lodash';
import PickupEnforcer from './PickupEnforcer';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {Button, FormControl, FormLabel, TextField} from "@material-ui/core";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import { alpha, makeStyles, withStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Checkbox from '@material-ui/core/Checkbox';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import produce from 'immer';


const useStyles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  table: {
    minWidth: 650,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
  },
});

class BookingSessionInfo extends Component {
  constructor(props) {
    super(props)
    this.openSession = this.openSession.bind(this)
    this.state = {
      openDrivers: false,
      addingDrivers: false,
      selectedCrewIds: [],
      searchedDrivers: [],
      searched: false,
      keyword: ''
    }
  }

  openSession(s) {
    const { history } = this.props
    history.push(`/ticket-booking/BS_${s}`)
  }

  openDriverDialog = () => {
    this.setState({openDrivers: true});
  }

  closeDriverDialog = () => {
    this.setState({openDrivers: false});
  }

  onSearchChange = (e) => {
    this.setState({keyword: e.target.value});
  }

  searchDriverInBS = (e) => {
    const {searchDriver, session} = this.props;
    if (session && session.session) {
      searchDriver(session.session.id, this.state.keyword).then(resp => {
        if (resp.ok) {
          this.setState({searchedDrivers: resp.data, searched: true});
        }
      });
    }
    e.preventDefault();
  }

  toggleSelectCrew = (id) => (e) => {
    const { selectedCrewIds } = this.state;
    this.setState({selectedCrewIds: produce(selectedCrewIds, draftState => {
      if (selectedCrewIds && selectedCrewIds.includes(id)) {
        draftState = selectedCrewIds.filter(item => item !== id);
        return draftState;
      } else {
        draftState.push(id);
      }
    })});
  }

  onAddCrews = () => {
    const { addCrews, getCrews, session } = this.props;

    if (this.state.selectedCrewIds && this.state.selectedCrewIds.length > 0 && session && session.session) {
      this.setState({addingDrivers: true});
      addCrews(session.session.id, this.state.selectedCrewIds).then(resp => {
        this.setState({addingDrivers: false, selectedCrewIds: [], searchedDrivers: [], keyword: '', searched: false});
        getCrews();
        this.closeDriverDialog();
      })
    }
  }

  render() {
    const {classes} = this.props;
    const { session, others, crews, isAdmin, isLeadDispatcher } = this.props
    const items = _.flatMap(others, o => o.sessions)
      .filter(s => session === null || s === null || s.id !== session.session.id)
      .map(s => Object.assign({}, {title: s.name, action: () => this.openSession(s.id)}))

    if (!session) return <div></div>
    const unbook = session.tickets.filter(t => !t.holder).length
    const claimed = session.tickets.filter(t => t.status === 'CLAIMED').length
    const completed = session.tickets.filter(t => t.status === 'COMPLETED').length
    const unclaimed = session.tickets.filter(t => t.holder && t.status !== 'CLAIMED' && t.status !== 'COMPLETED').length
    const reserved = _.uniq(session.tickets.filter(t => t.holder && (t.valid_from || t.status === 'CLAIMED' || t.status === 'COMPLETED')).map(t => t.holder)).length
    const unreserved = (session.drivers ? session.drivers.length : 0) - reserved
    return <div style={styles.container}>
      <div>
        <AxlSimpleDropDown anchor={'left'} style={{zIndex: 10000, width: '240px'}} items={ items }><i style={{ color: '#828282', cursor: 'pointer', fontSize: 14, marginRight: 8}} className={'fa fa-bars'} /></AxlSimpleDropDown>
        <span style={styles.title}>{ session.session.name }</span>
      </div>
      <div style={{display: 'flex', alignContent: 'center', paddingBottom: 5, fontSize: '0.9em', color: '#888'}}>
        <div style={{flex: 1}}>
          Delivery Date
        </div>
        <div style={{flex: 1}}>
          Booking Time
        </div>
      </div>
      <div style={{display: 'flex', alignContent: 'center', paddingBottom: 5}}>
        <div style={{flex: 1}}>
          <Moment format={'MMM DD'}>{session.session.target_date}</Moment>
        </div>
        <div style={{flex: 1}}>
          <span>{moment.tz(session.session.booking_start_time, moment.tz.guess()).format('MMM DD hh:mmA z')}</span> 
        </div>
      </div>
      <div style={{paddingBottom: 5, borderTop: 'solid 1px #eee'}}>
        <div style={{display: 'flex'}}>
          <div style={{flex: 1, paddingTop: 10}}>Tickets: <b>{ session.tickets.length }</b></div>
          <div style={{flex: 1, paddingTop: 10}}>
            Booking limit: <b>{ session.session.max_reservation }</b>
          </div>
        </div>
      </div>
      <div style={{paddingBottom: 5, borderTop: 'solid 1px #eee'}}>
        <div style={{display: 'flex'}}>
          <div style={{...{flex: 1, paddingTop: 10}, ...styles.status.COMPLETED}}><b>{ completed }</b> Completed</div>
          <div style={{...{flex: 1, paddingTop: 10}, ...styles.status.CLAIMED}}><b>{ claimed }</b> Claimed</div>
        </div>
        <div style={{display: 'flex'}}>
          <div style={{...{flex: 1, paddingTop: 10}, ...styles.status.PENDING}}><b>{ unclaimed }</b> Unclaimed</div>
          <div style={{...{flex: 1, paddingTop: 10}, ...{color: '#c00'}}}><b>{ unbook }</b> Unbooked</div>
        </div>
      </div>
      <div style={{display: 'flex', borderTop: 'solid 1px #eee'}}>
        <div style={{flex: 1, paddingTop: 10}}><b>{ session.drivers ? session.drivers.length : 0 }</b>/{(isAdmin || isLeadDispatcher) &&
            <a href="#javascript" onClick={this.openDriverDialog}>{session && session.session ? session.session.subjects.length : '0'}</a>}
          {!(isAdmin || isLeadDispatcher) &&
              <span>{session && session.session ? session.session.subjects.length : '0'}</span>}
          &nbsp;Drivers</div>
        <div style={{flex: 1, paddingTop: 10}}><b>{ unreserved }</b> Unreserved</div>
      </div>
      <div style={{display: 'flex', borderTop: 'solid 1px #eee'}}>
        <div style={{flex: 1, paddingTop: 10}}>
          <PickupEnforcer session={session} sessionId={session && session.session ? session.session.id : null} />
        </div>
      </div>
      <Dialog open={this.state.openDrivers} fullWidth={true}
              maxWidth={'md'} onClose={this.closeDriverDialog} aria-labelledby="form-dialog-title">
        <AppBar position="static">
          <Toolbar>
            <IconButton
                edge="start"
                className={classes.menuButton}
                color="inherit"
                aria-label="open drawer"
            >
              <MenuIcon />
            </IconButton>
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <form onSubmit={this.searchDriverInBS}>
                <InputBase
                    placeholder="Search drivers by driver ID in the booking session"
                    onChange={this.onSearchChange}
                    value={this.state.keyword}
                    fullWidth
                    classes={{
                      root: classes.inputRoot,
                      input: classes.inputInput,
                    }}
                    inputProps={{ 'aria-label': 'search' }}
                />
              </form>
            </div>
          </Toolbar>
        </AppBar>
        {/*<DialogTitle id="form-dialog-title">Subscribe</DialogTitle>*/}
        <DialogContent>
          {this.state.searched && this.state.searchedDrivers && this.state.searchedDrivers.length > 0 && <DialogContentText>
            <TableContainer component={Paper}>
              <Table className={classes.table} size="small" aria-label="a dense table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Email</TableCell>
                    <TableCell align="right">Phone</TableCell>
                    <TableCell align="right">Skills</TableCell>
                    <TableCell align="right">Can Book</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {this.state.searchedDrivers && this.state.searchedDrivers.map((d) => (
                      <TableRow key={d.email}>
                        <TableCell component="th" scope="row">
                          {d.first_name} {d.last_name}
                        </TableCell>
                        <TableCell align="right">{d.email}</TableCell>
                        <TableCell align="right">{d.phone_number}</TableCell>
                        <TableCell align="right">{d.skills}</TableCell>
                        <TableCell align="right">can book <strong>({d.limit})</strong> total tickets starting at <strong>{moment.tz(d.booking_start_time, moment.tz.guess()).format('MMM DD hh:mmA z')}</strong></TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContentText>}
          {this.state.searched && (!this.state.searchedDrivers || this.state.searchedDrivers.length <= 0) && <DialogContentText>No Drivers!</DialogContentText>}
          {crews && crews.length > 0 && <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">Select pools to add</FormLabel>
            <FormGroup>
              {crews.map(crew => <FormControlLabel
                  key={crew.id}
                  control={<Checkbox checked={this.state.selectedCrewIds.includes(crew.id)} onChange={this.toggleSelectCrew(crew.id)} name={crew.id} />}
                  label={`${crew.name} (${crew.no_of_drivers_in}/${crew.no_of_drivers})`} disabled={crew.no_of_drivers_in === crew.no_of_drivers}
              />)}
            </FormGroup>
            <FormHelperText>Please be patient because it may take a long time to add drivers in pools to this booking session!</FormHelperText>
          </FormControl>}
        </DialogContent>
        <DialogActions>
          <Button onClick={this.closeDriverDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={this.onAddCrews} color="primary" disabled={this.state.addingDrivers}>
            {this.state.addingDrivers ? 'Adding drivers...' : `Add Drivers`}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  }
}

export default withStyles(useStyles)(BookingSessionInfo)