import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { AxlButton, AxlModal, AxlInput, AxlTextArea, AxlPanel } from 'axl-reactjs-ui';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Select, Box, MenuItem, CircularProgress, FormControl, InputLabel, Checkbox, FormControlLabel
} from "@material-ui/core";
import Moment from 'react-moment';
import _ from 'lodash';
import { toast } from 'react-toastify';

import AssignmentMap from '../../components/AssignmentMap/index';
import TicketMap from '../../components/TicketMap';
import TicketInfo from '../../components/TicketInfo';
import DriverSearch from "../DriverSearch";
import TooltipContainer from '../../components/TooltipContainer';

import styles from './styles';
import { NEGATIVE_REASON_CODES, REASON_CODES } from "../../constants/ticket";
import { ACTIONS } from '../../constants/ActionPattern';
import { ASSIGN_BTN_TEXT, REASSIGN_BTN_TEXT, PERMISSION_DENIED_TEXT, DRIVER_SEARCH_TICKET } from '../../constants/common';

@inject('ticketStore', 'eventStore', 'bookingStore', 'userStore', 'permissionStore')
@observer
class TicketDetailContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      delay: 300,
      result: "No result",
      showHistory: false,
      showDialog: false,
      dialogType: '',
      voiding: false,
      driverIdAssign: 0,
      reason: '',
      reasonCode: '',
      benefit: true,
      assigning: false,
      claiming: false,
      isPromotional: true,
      currentReserve: {},
      isLoadingReservation: false,
    };
    this.handleError = this.handleError.bind(this)
    this.onVoidTicket = this.onVoidTicket.bind(this)
    this.onDiscardTicket = this.onDiscardTicket.bind(this)
    this.onUnclaim = this.onUnclaim.bind(this)
    this.onClaim = this.onClaim.bind(this)
    this.manuallyAssign = this.manuallyAssign.bind(this)
    this.onUpdatingPickupTime = this.onUpdatingPickupTime.bind(this)
    this.claimRoute = this.claimRoute.bind(this)
    this.openHistory = this.openHistory.bind(this)
    this.loadTicket = this.loadTicket.bind(this)
    this.onSendMessage = this.onSendMessage.bind(this)
    this.gotoTicket = this.gotoTicket.bind(this)
    this.getCurrentReserve = this.getCurrentReserve.bind(this)
  }

  openHistory() {
    const {id, sid} = this.props;
    this.props.history.replace(`/ticket-booking/${sid}/ticket/${id}/history`);
  }

  componentDidMount() {
    this.loadTicket()
  }

  componentDidUpdate(prevProps) {
    const { ticketStore } = this.props
    if (prevProps.id !== this.props.id) {
      ticketStore.loadTicket(this.props.id)
    }
  }

  componentWillUnmount() {
    const { activeTicket } = this.props.ticketStore;
    if (activeTicket) {
      this.props.onUnselect();
    }
  }

  loadTicket() {
    const { id, ticketStore } = this.props
    ticketStore.loadTicket(id)
  }

  getCurrentReserve() {
    const { id, ticketStore } = this.props
    this.setState({isLoadingReservation: true});
    ticketStore.getCurrentReserve(id).then(r => {
      this.setState({
        currentReserve: r.ok ? r.data : null,
        isLoadingReservation: false
      });
    })
  }

  onChangeReasonCode = (e) => {
    this.setState({reasonCode: e.target.value});
    if (NEGATIVE_REASON_CODES.includes(e.target.value)) {
      this.setState({benefit: false});
    } else {
      this.setState({benefit: true});
    }
  }

  onSendMessage() {
    const { ticketStore, bookingStore, eventStore, id } = this.props
    const { activeDriver } = ticketStore
    const { activeSession } = bookingStore
    bookingStore.sendTicketHolderMessage(this.state.message, activeDriver.id, this.state.isPromotional).then((v) => {
      eventStore.loadEvents('TK_' + id)
      eventStore.loadEvents('BS_' + activeSession.session.id)
    })
    this.setState({ sendingSMS: false })
  }

  manuallyAssign(driver, reason, reasonCode, benefit) {
    if (!driver) return;
    const { ticketStore, id, sid } = this.props;
    ticketStore.assignDriver(id, driver.id, sid, reason, reasonCode, benefit).then((r) => {
      this.setState({
        assigning: false,
        driverId: null
      })
      if (this.props.onUpdate) this.props.onUpdate()
    })
  }

  claimRoute() {
    if (!this.state.assignment_id) return
    const { ticketStore, id, sid } = this.props
    ticketStore.claimRoute(id, this.state.assignment_id, this.state.reason).then((r) => {
      this.setState({
        claiming: false,
        assignment_id: null
      })
      if (this.props.onUpdate) this.props.onUpdate()
      if (r && !r.ok) {
        toast.error(r && r.data && r.data.message || 'Fail to claim route', {containerId: 'main'});
      }
    })
  }

  savePickupTime() {
    const { ticketStore, id } = this.props
    let startTime = this.state.startTime
    ticketStore.setPickupTime(id, startTime, startTime + 1800000).then((r) =>{
      this.setState({setting_pickup: false})
      if (this.props.onUpdate) this.props.onUpdate()
    })
  }

  gotoTicket(t) {
    const { history, sid } = this.props
    history.push(`/ticket-booking/${sid}/ticket/${t.id}`)
  }

  onUpdatingPickupTime() {
    const { ticketStore, timezone, bookingStore } = this.props
    const { activeSession } = bookingStore

    var options = ticketStore.availablePickupTimes(timezone, activeSession.session)
    if (!options || options.length < 1) {
      alert('Too late to update pickup time')
      return
    }
    this.setState({pickup_options: options, setting_pickup: true, startTime: options[0].start})
  }

  onVoidTicket() {
    const { reason, reasonCode, benefit } = this.state;
    const { ticketStore } = this.props;
    const { activeTicket } = ticketStore;
    this.setState({voiding: true});
    ticketStore.voidTicket( activeTicket.id, reason, reasonCode, benefit).then(() => {
      if (this.props.onUpdate) this.props.onUpdate();
      this.closeDialog();
    })
  }

  onDiscardTicket() {
    const { ticketStore, bookingStore, eventStore, id } = this.props
    const { reason, reasonCode, benefit } = this.state;
    const { activeSession } = bookingStore
    const { activeTicket } = ticketStore
    if (!activeTicket || !activeSession || !activeSession.session || !activeTicket.id || !activeSession.session.id) return;
    ticketStore.discardTicket(activeTicket.id, 'BS_' + activeSession.session.id, reason, reasonCode, benefit).then((v) => {
      this.setState({
        reason: '',
        showDialog: false,
        dialogType: '',
      })
      eventStore.loadEvents('BS_' + activeSession.session.id);
      bookingStore.refreshSession();
    })
    this.setState({ sendingSMS: false })
  }

  onClaim() {
    this.getCurrentReserve();
    const {bookingStore, ticketStore} = this.props
    const { activeSession } = bookingStore || {}
    const { activeTicket } = ticketStore
    const { assignments } = activeSession || {}
    const books = activeSession.books.filter((b) => b.id === activeTicket.book)
    if (!books || books.length < 1) return
    const book = books[0]
    const assingment_ids = book.items.map((i) => i.split('_')[1]).map((i) => parseInt(i))
    if (!activeTicket || !activeSession) return;
    const availableAssignments = _.sortBy(assignments.filter((a) => assingment_ids.indexOf(a.id) >= 0)
      .filter((a) => !a.driver_id), [(a) => a.label])
    // console.log(availableAssignments)
    this.setState({
      claiming: true,
      reason: '',
      availableAssignments,
      assignment_id: availableAssignments.length ? availableAssignments[0].id : 0
    })
  }

  onUnclaim() {
    const { reason } = this.state;
    const { ticketStore, eventStore } = this.props;
    ticketStore.unassignTicket(reason).then((r) => {
      eventStore.loadEvents('TK_' + ticketStore.activeTicket.id);
      ticketStore.loadTicket(ticketStore.activeTicket.id)
      if (this.props.onUpdate) this.props.onUpdate();
      this.closeDialog();
    })
  }

  gotoAssignment(assignment) {
    if (!assignment) return;
    const clients = assignment.client_ids ? assignment.client_ids.join(',') : 'all'
    window.open(`https://dispatch.axlehire.com/routes/today/${assignment.region_code}/${clients}/${assignment.id}`, "_blank")
  }

  openDialog = (type) => {
    this.setState({
      reason: '',
      showDialog: true,
      dialogType: type,
    })
  }

  closeDialog = () => {
    this.setState({
      reason: '',
      voiding: false,
      showDialog: false,
      dialogType: '',
    })
  }

  handleError(v) {
    console.log(v)
  }

  getDialogNote(type) {
    switch (type) {
      case 'discard':
        return 'This action will remove the ticket permanently from booking session.';
      case 'void':
        return 'This action will unassign driver from ticket.';
      case 'unclaim':
        return 'This action will unclaim assignment of driver from ticket.';
      default:
        return '';
    }
  }

  handleChangePromotional = (e) => {
    if(!e || !e.target) return;

    const {checked} = e.target;
    this.setState({isPromotional: checked});
  }

  render() {
    const { showDialog, dialogType, reason, voiding, claiming, assigning, reasonCode, benefit, currentReserve, isLoadingReservation } = this.state;
    const { ticketStore, permissionStore, id, userStore, history, sid } = this.props;
    const { activeTicket, activeDriver, otherTickets, otherAssignments, activeAssignment, activeDelivery } = ticketStore;
    if (!activeTicket) return <div></div>
    const isCompleted = activeTicket != null && activeTicket.status === 'COMPLETED';
    const isClaimed = activeTicket != null && activeTicket.status === 'CLAIMED';
    const isClosed = activeTicket != null && (isClaimed || isCompleted);
    const isOpen = !activeTicket.status || activeTicket.status === 'PENDING'  || activeTicket.status === 'IN_PROGRESS' || activeTicket.status === 'READY'
    const isReserving = currentReserve && currentReserve.expired_time;

    const isDeniedAssign = permissionStore.isDenied(ACTIONS.TICKETS.ASSIGN);
    const isDeniedReAssign = permissionStore.isDenied(ACTIONS.TICKETS.REASSIGN);
    const isDeniedDiscard = permissionStore.isDenied(ACTIONS.TICKETS.DISCARD);
    const isDeniedVoid = permissionStore.isDenied(ACTIONS.TICKETS.VOID);
    const isDeniedClaim = permissionStore.isDenied(ACTIONS.TICKETS.CLAIM);
    const isDeniedUnclaim = permissionStore.isDenied(ACTIONS.TICKETS.UNCLAIM);

    return (
      <Fragment>
        <div style={styles.container}>
          { activeTicket && activeTicket !== 'COMPLETED' && <div style={{display: 'flex', justifyContent: 'center', marginBottom: 10, paddingBottom: '10px'}}>
            <div style={{width: '100%', height: 200, maxWidth: '100%'}}>
              { activeAssignment && <AssignmentMap assignment = { activeAssignment } /> }
              { !activeAssignment && <TicketMap ticket = {activeTicket} /> }
            </div>
          </div>}
          <div style={{flex: '1 1 auto', overflow: 'auto'}}>
          <TicketInfo history={ history } sid = {sid} ticket={ activeTicket } driver={activeDriver} assignment = {activeAssignment} activeDelivery={activeDelivery} ticketId={id} userId={userStore.user.id}/>

          { activeDriver && otherTickets && otherTickets.length > 0 && <div>
            <div style={{...styles.label2, ...{borderBottom: 'solid 1px #ccc'}}}>Other tickets by the same driver</div>
            { otherTickets.filter(t => t.attributes.session == activeTicket.attributes.session).map(t => <div style={{cursor: 'pointer'}} key={t.id} onClick={() => this.gotoTicket(t)}>
              <div style={{display: 'flex', padding: '5px 10px', borderBottom: 'solid 1px #eee'}}>
                <div style={{...styles.text, ...{flex: 1, textAlign: 'left'}}}>{t.name}</div>
                <div style={{...styles.status[t.status], ...{fontSize: '0.9em'}}}>{t.status}</div>
              </div>
            </div>)}
          </div>}

          { activeDriver && otherAssignments && otherAssignments.length > 0 && <div style={{marginBottom: 20, marginTop: 20}}>
            <div style={{...styles.label2, ...{borderBottom: 'solid 1px #ccc'}}}>Pending Assignments by driver</div>
            { otherAssignments.map(t => <div style={{cursor: 'pointer'}} key={t.assignment.id} onClick={() => this.gotoAssignment(t.assignment)} >
              <div style={{display: 'flex', padding: '5px 10px', borderBottom: 'solid 1px #eee'}}>
                <div style={{flex: 1, textAlign: 'left'}}>
                  <code>{t.assignment.id}</code> <span style={styles.text}>{t.assignment.label}</span>
                  <span style={{...styles.text,...{marginLeft: 5, color: '#888'}}}>
                    [<Moment format={'MMM DD, hh:mmA'}>{t.assignment.predicted_start_ts}</Moment> - <Moment format={'hh:mmA'}>{t.assignment.predicted_latest_start_ts}</Moment>]
                  </span>
                </div>
                <div style={{...styles.status[t.status], ...{fontSize: '0.9em'}}}>{t.assignment.status}</div>
              </div>
            </div>)}
          </div>}
          </div>
          <div style={{flex: '0 1 auto', height: 40, display: 'flex', backgroundColor: '#efefef', justifyContent: 'center', padding: 4}}>
            { isClosed && !isCompleted && <div style={{flex: 1}}>
              <TooltipContainer title={isDeniedUnclaim ? PERMISSION_DENIED_TEXT : ''}>
                <AxlButton disabled={isDeniedUnclaim} circular={true} compact={true} bg={'black'} block={true} onClick={() => this.openDialog('unclaim') } >Un-Claim</AxlButton>
              </TooltipContainer>
            </div>}
            { !isClosed && activeTicket.holder && <div style={{flex: 1}}>
              <TooltipContainer title={isDeniedClaim ? PERMISSION_DENIED_TEXT : ''}>
                <AxlButton disabled={isDeniedClaim} circular={true} compact={true} bg={'bluish'} block={true} onClick={ this.onClaim } >Claim</AxlButton>
              </TooltipContainer>
            </div>}
            { !activeTicket.holder && <div style={{flex: 1}}>
              <TooltipContainer title={isDeniedAssign ? PERMISSION_DENIED_TEXT : ''}>
                <AxlButton disabled={isDeniedAssign} circular={true} compact={true} bg={'bluish'} block={true} onClick={ () => this.setState({ assigning: true, reason: '' }) } >Assign</AxlButton>
              </TooltipContainer>
            </div>}
            { activeTicket.holder && <div style={{flex: 1}}>
              <TooltipContainer title={isDeniedReAssign ? PERMISSION_DENIED_TEXT : ''}>
                <AxlButton disabled={isDeniedReAssign} circular={true} compact={true} bg={'bluish'} block={true} onClick={ () => this.setState({ assigning: true, reason: '' }) } >ReAssign</AxlButton>
              </TooltipContainer>
            </div>}
            { !isClosed && activeTicket.holder && activeTicket.status !== 'VOIDED' && <div style={{ width: 42 }}>
              <TooltipContainer title={isDeniedVoid ? PERMISSION_DENIED_TEXT : ''}>
                <AxlButton disabled={isDeniedVoid} circular={true} compact={true} bg={'red2'} block={true} onClick={() => this.openDialog('void')} ><i className="fa fa-recycle" title = "VOID" /></AxlButton>
              </TooltipContainer>
            </div>}
            { activeTicket.holder && isOpen && <div style={{width: 42}}>
              <AxlButton block={true} circular={true} compact={true} bg={'black'} onClick={ () => this.onUpdatingPickupTime() }><i className="fa fa-calendar" title="Update ETA" /></AxlButton>
            </div> }
            { activeTicket.holder && activeDriver &&
              <div style={{width: 42}}>
                <AxlButton compact={true} bg={'black'} circular={true} block={true} onClick={() => this.setState({ sendingSMS: true })}><i className="fa fa-commenting" title="Send SMS" /></AxlButton>
              </div>
            }
            <div style={{width: 42}}>
              <AxlButton block={true} circular={true} compact={true} bg={'black'} onClick={ this.loadTicket }><i className="fa fa-refresh" title="Refresh" /></AxlButton>
            </div>
            <div style={{width: 42}}>
              <AxlButton block={true} circular={true} compact={true} bg={'black'} onClick={ this.openHistory }><i className="fa fa-history" title="Show History" /></AxlButton>
            </div>
            { !isClosed && activeTicket.status !== 'VOIDED' && <div style={{ width: 42 }}>
              <TooltipContainer title={isDeniedDiscard ? PERMISSION_DENIED_TEXT : ''}>
                <AxlButton disabled={isDeniedDiscard} circular={true} compact={true} bg={'red2'} block={true} onClick={() => this.openDialog('discard')} ><i className="fa fa-trash" title="DISCARD" /></AxlButton>
              </TooltipContainer>
            </div>}
          </div>
        </div>

        { claiming && <AxlModal onClose={() => this.setState({ claiming: false })} style={{ width: 500, minHeight: 160, maxHeight: 800, padding: 10, paddingBottom: 0, paddingTop: 20 }}>
          <h4>Claiming Assignment for driver</h4>
          {isLoadingReservation && <Box><CircularProgress size={24}/></Box>}
          {!isLoadingReservation && (
            <Fragment>
              { isReserving && (
                <Box color='red'>This ticket is reserving assignment ID {currentReserve.assignment_id} until {new Date(currentReserve.expired_time).toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Box>
              )}
              <div>
                <Box my={1}>
                  <Select native
                          margin="dense"
                          variant="outlined"
                          value={this.state.assignment_id}
                          onChange={(e) => this.setState({assignment_id: parseInt(e.target.value)})}
                  >
                    {this.state.availableAssignments.map((opt) => <option key={opt.id} value={opt.id}>[{opt.id}] {opt.label}</option>)}
                  </Select>
                </Box>
                <TextField variant="outlined"
                          label="Claim Reason"
                          multiline
                          rows={5}
                          fullWidth
                          value={reason}
                          onChange={e => this.setState({reason: e.target.value})}
                />
              </div>
              <div style={{display: 'flex', padding: 10}}>
                <div style={{flex: 1}}><AxlButton disabled={!reason || isReserving} circular={true} compact={true} bg={'bluish'} block={true} onClick={() => this.claimRoute()} >Save</AxlButton></div>
                <div style={{flex: 1}}><AxlButton circular={true} compact={true} bg={'black'} block={true} onClick={() => this.setState({ claiming: false })} >Cancel</AxlButton></div>
              </div>
            </Fragment>
          )}
        </AxlModal>}

        { assigning && (
          <AxlModal onClose={() => this.setState({ assigning: false })} style={{minHeight: 160, maxHeight: 800, padding: 10, paddingBottom: 0, paddingTop: 20 }}>
            <h4>{activeTicket.holder ? 'Reassign' : 'Assign'} Driver Ticket</h4>
            <Box my={1} style={{position: 'relative', minHeight: 700, minWidth: 1000}}>
              <DriverSearch
                type={DRIVER_SEARCH_TICKET}
                onSelect={this.manuallyAssign}
                onCancel={() => this.setState({assigning: false})}
                activeTicket={activeTicket}
                okText={activeTicket.holder ? REASSIGN_BTN_TEXT : ASSIGN_BTN_TEXT}
                driverIdSelected={activeTicket.holder}
                disableCourierDriver={(userStore.user && userStore.user.scopes && userStore.user.scopes.includes('ticket-manager')) ? false : true}
              />
            </Box>
          </AxlModal>
        )}
        { activeTicket.holder && isOpen && this.state.setting_pickup && <AxlModal onClose={() => this.setState({ setting_pickup: false })} style={{ width: 500, minHeight: 160, maxHeight: 800, paddingBottom: 0, paddingTop: 20 }}>
          <div>CHOOSE A PICKUP TIME</div>
          <div>
            <select value={this.state.startTime} onChange={(e) => this.setState({startTime: parseInt(e.target.value)})}>
              {this.state.pickup_options.map((opt) => <option key={opt.start} value={opt.start}>{opt.name}</option>)}
            </select>
          </div>
          <div style={{display: 'flex'}}>
            <div style={{flex: 1}}><AxlButton block={true} circular={true} bg={'black'} onClick={() => this.setState({setting_pickup: false})}>CANCEL</AxlButton></div>
            <div style={{flex: 1}}><AxlButton block={true} circular={true} bg={'bluish'} onClick={() => this.savePickupTime()}>SAVE</AxlButton></div>
          </div>
        </AxlModal> }

        {this.state.sendingSMS && activeDriver && <AxlModal onClose={() => this.setState({ sendingSMS: false })} style={{ width: 600, minHeight: 160, maxHeight: 800, paddingBottom: 0, paddingTop: 20 }}>
          <h4>Sending SMS to {activeDriver.first_name} {activeDriver.last_name}</h4>
          <div>
            <FormControlLabel
              control={<Checkbox color='primary' name='isPromotional' defaultChecked={this.state.isPromotional} onChange={this.handleChangePromotional} />}
              label="Is Promotional"
            />
          </div>
            <div style={{ padding: 15 }}><AxlTextArea style={{ width: '100%', height: 100 }} onChange={(v) => this.setState({ message: v.target.value })} /></div>
            <div style={{ display: 'flex', padding: 10 }}>
              <div style={{ flex: 1 }}>
                <AxlButton block={true} circular={true} onClick={() => this.onSendMessage()} >SEND</AxlButton>
              </div>
              <div style={{ flex: 1 }}>
                <AxlButton block={true} circular={true} bg={'black'} onClick={() => this.setState({ sendingSMS: false })}>Cancel</AxlButton>
              </div>
            </div>
        </AxlModal>}

        <Dialog open={showDialog} onClose={this.closeDialog}>
          <DialogTitle align="center">
            <Box>
              <Box>Are you sure to {dialogType.toUpperCase()} ticket {activeTicket.name}</Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box pb={1}>
              <span style={styles.grayText}>Driver: </span>
              <span>{activeDriver && `${activeDriver.first_name} ${activeDriver.last_name}`}</span>
            </Box>
            <Box pb={1}>
              <span style={styles.grayText}>Note: </span>
              <span style={styles.note}>{this.getDialogNote(dialogType)}</span>
            </Box>
            <Box py={1}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Select reason code</InputLabel>
                <Select
                  value={reasonCode}
                  onChange={this.onChangeReasonCode}
                  label="Select reason code"
                  data-testid="ticket-detail-select-reason-code"
                >
                  {REASON_CODES.map(code => (
                    <MenuItem key={code} value={code}>{code}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <TextField
              label={`${_.capitalize(dialogType)} Reason`}
              multiline
              rows={5}
              variant="outlined"
              fullWidth
              disabled={voiding}
              value={reason}
              onChange={e => this.setState({reason: e.target.value})}
              data-testid="ticket-detail-input-void-reason"
            />
            <Box>
              <FormControlLabel
                  control={<Checkbox checked={benefit} tabIndex={-1} disableRipple />}
                  label="Add driver to high-priority pool"
                  onChange={e => this.setState({benefit: e.target.checked})}
                  labelPlacement="end"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Box px={2} pb={1}>
              {voiding && <Box px={1} style={{display: 'inline-block', verticalAlign: 'middle'}}><CircularProgress color="primary" size={24} /></Box>}
              <Button color="default"
                      variant="outlined"
                      disableElevation
                      onClick={this.closeDialog}
                      style={{marginRight: 15}}
              >
                Cancel
              </Button>
              <Button color="secondary"
                      disableElevation
                      variant="contained"
                      disabled={!reason || !reasonCode || voiding}
                      onClick={dialogType === 'void' ? this.onVoidTicket : dialogType === 'discard' ? this.onDiscardTicket : this.onUnclaim}
              >
                {dialogType}
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      </Fragment>
    )
  }
}

export default TicketDetailContainer;
