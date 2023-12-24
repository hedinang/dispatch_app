import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { inject,observer } from 'mobx-react';
import { AxlButton, AxlTextArea, AxlModal } from 'axl-reactjs-ui';
import { Box, Button, TextField, Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText,Tooltip, FormControlLabel, Checkbox } from '@material-ui/core';

import DialogSMSCost from '../../components/DialogSMSCost';
import TicketLineItem from '../../components/TicketLineItem/index';
import ModalAddOrEditTicketBook from '../../components/TicketBookGroup/ModalAddOrEditTicketBook';

import styles from './styles';
import { TICKET_STATUS } from '../../constants/colors';
import { ACTIONS } from '../../constants/ActionPattern';
import { PERMISSION_DENIED_TEXT } from '../../constants/common';
import MenuEnforcer from '../../components/MenuEnforcer';

class OrphanAssignment extends Component {
  render() {
    const {assignment, driver} = this.props
    const driverName = driver == null ? '' : (driver.first_name + ' ' + driver.last_name)
    return <div onClick={() => this.props.onSelect && this.props.onSelect()} key={assignment.id} style={{...styles.list, ...{minHeight: 40, justifyContent: 'center', boxSizing: 'border-box', backgroundColor: '#fffafa'}}}>
      <div style={{display: 'flex', fontSize: '14px'}}>
        <div style={{padding: '2px 4px', flex: 1, textAlign: 'left'}}>
          <div style={{paddingBottom: 4}}><i className={'fa fa-question-circle-o'} /> <code>{assignment.driver_id}</code></div><div>{ driverName }</div>
        </div>
        <div style={{flex: 1, padding: '2px 4px', fontSize: '14px', color: '#222', fontWeight: 500, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>
          <div style={{paddingBottom: 4}}><code style={{fontSize: '0.8em', marginLeft: '5px', border: 'solid 1px #eee', borderRadius: 3}}>{assignment.id}</code></div>
          <div>{assignment.label}</div>
        </div>
        <div style={{padding: '2px 4px', width: '100px', textAlign: 'right'}}>{assignment.status}</div>
      </div>
    </div>
  }
}

const MAX_TICKET_NUMBER_TO_BE_ADD = 50;

@inject('bookingStore', 'eventStore', 'userStore','warehouseStore', 'permissionStore')
@observer
class TicketBookContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sendingSMS: false,
      hidden: false,
      adding: false,
      noOfTicket: 1,
      error: '',
      openAddTicket: false,
      isEditTicketBook: false,
      isPromotional: true,
    }
    this.onSendMessage = this.onSendMessage.bind(this)
    this.onAddAssignments = this.onAddAssignments.bind(this)
  }

  selectTicket(ticket) {
    // if (ticket.assignment) return;
    return this.props.onSelect && this.props.onSelect(ticket)
  }

  selectAssignment(assignment, book) {
    // if (ticket.assignment) return;
    return this.props.onSelectAssignment && this.props.onSelectAssignment(assignment, book)
  }

  clearSMSCost = () => {
    this.setState({SMSCost: null})
  }

  onSendMessage() {
    const { bookingStore, eventStore, book } = this.props
    bookingStore.sendTicketGroupMessage(this.state.message, book.id, this.state.isPromotional).then((v) => {
      eventStore.loadEvents('BS_' + bookingStore.activeSession.session.id)
    })
    this.setState({ sendingSMS: false })
  }

  getEstimatedSMS() {
    const { bookingStore, eventStore, book } = this.props
    bookingStore.getEstimatedTicketGroupMessage(this.state.message, book.id, this.state.isPromotional).then((v) => {
      this.setState({SMSCost: v.data})
    })
  }

  onAddAssignments() {
    const {bookingStore, book} = this.props
    if (!this.state.addingItems) return;

    this.setState({adding: true, error: ''});
    bookingStore.addAssignments(book.id, this.state.addingItems).then(res => {
      if (res.ok) {
        this.setState({adding: false})
      } else {
        const error = res.data ? (res.data.message || res.data.errors) : `Error code ${res.status}`;
        this.setState({error});
      }
    })
  }

  onAddTickets = () => {
    const { bookingStore, eventStore, book } = this.props;
    this.setState({addingTicket: true, error: ''});
    bookingStore.addTickets(this.state.noOfTicket, bookingStore.activeSession.session.id, book.id).then(res => {
      if (res.ok) {
        this.setState({addingTicket: false, openAddTicket: false});
      } else {
        const error = res.data ? (res.data.message || res.data.errors) : `Error code ${res.status}`;
        this.setState({addingTicket: false});
        this.setState({error});
      }
    });
  }

  closeAddAssignment = () => {
    this.setState({ adding: false, addingItems: null, error: '' });
  }

  cancelAddTicket = () => {
    this.setState({openAddTicket: false, noOfTicket: 1, error: ''});
  }

  openAddTicket = () => {
    this.setState({openAddTicket: true, noOfTicket: 1, error: ''});
  }

  onChangeNoOfTicket = (e) => {
    if (e.target.value > MAX_TICKET_NUMBER_TO_BE_ADD * 2) {
      e.preventDefault();
      return;
    }

    this.setState({noOfTicket: e.target.value})
  }

  toPrice = (p) => {
    try {
      if (parseInt(p) === parseFloat(p)) {
        return parseInt(p);
      }

      return parseFloat(p)
    } catch (e) {
      console.log('invalid number of pricing: ', p);
    }

    return p;
  }

  handleEditTicketGroup = () => {
    this.setState({isEditTicketBook:true})
  }

  handleCloseDialog = () => {
    this.setState({isEditTicketBook:false});
  }

  handleChangePromotional = (e) => {
    if(!e || !e.target) return;

    const {checked} = e.target;
    this.setState({isPromotional: checked});
  }

  render() {
    const { drivers, book, selected, selectedAssignment, showClaimed, showUnBooked, showUnClaimed, showCompleted, cando, userStore, warehouseStore, bookingStore, permissionStore } = this.props
    const { isEditTicketBook } = this.state
    if (!book) return;
    const { tickets, assignments } = book
    const openAssignments = assignments.filter(a => !a.driver_id)
    this.driverMap = {}
    const claimedCount = tickets.filter(t => t.status === 'CLAIMED' && t.holder).length
    const completedCount = tickets.filter(t => t.status === 'COMPLETED' && t.holder).length
    if (drivers != null) {
      drivers.forEach(d => {
        this.driverMap['DR_' + d.id] = d
      });
    }
    let booked = _.sortBy(tickets.filter(t => t.holder), [a => a.valid_from])
    let unbooked = _.sortBy(tickets.filter(t => !t.holder), [a => a.book])
    const bookedCount = booked.length
    let unclaimedCount = bookedCount - claimedCount - completedCount
    let unbookedCount = unbooked.length
    let byHolders = _.mapValues(_.groupBy(booked, a => a.holder),
      l => Object.assign({}, {
        holder: this.driverMap[l[0].holder],
        time: l[0].valid_from,
        tickets: l.filter(t => t.status !== 'COMPLETED').filter(t => t.status !== 'CLAIMED').filter(t => showUnClaimed || t.item)
      }));
    this.groups = _.sortBy(byHolders, [a => a.time, a => a.holder ? a.holder.first_name : '']).filter(g => g.tickets && g.tickets.length > 0)
    let claimed = tickets.filter(t => t.item && t.holder)
      .filter(t => showCompleted || t.status !== 'COMPLETED').filter(t => showClaimed || t.status !== 'CLAIMED')
    let claimedGroups = _.values(_.groupBy(claimed, a => a.holder)).map(
      l => Object.assign({}, {
        holder: this.driverMap[l[0].holder],
        time: l[0].valid_from,
        tickets: l
      })).filter(g => g.tickets && g.tickets.length > 0);
    let claimedAssignments = tickets.filter(t => t.item).map(t => t.item).map(t => t.split('_')[1]).map(a => parseInt(a))
    let orphan = book.assignments.filter(a => a.driver_id).filter(a => claimedAssignments.indexOf(a.id) < 0)

    const canAddAssignment = cando.indexOf('add-assignment') >= 0
    const canSMS = cando.indexOf('sms') >= 0

    const isValidAddress = (address) => address && !!address.street && !!address.city && !!address.state && !!address.zipcode && !!address.lat && !!address.lng;

    const isValidAttribute = (attributes) =>
      !!attributes &&
        !!attributes.boundary && attributes.boundary != "" &&
        !!attributes.tour_cost_max && attributes.tour_cost_max != "" && attributes.tour_cost_max != "0" &&
        !!attributes.tour_cost_min && attributes.tour_cost_min != "" && attributes.tour_cost_min != "0" &&
        !!attributes.shipment_count_max && attributes.shipment_count_max != "" && attributes.shipment_count_max != "0" &&
        !!attributes.shipment_count_min && attributes.shipment_count_min != "" && attributes.shipment_count_min != "0";

    const canAddTicket = book && book.address && isValidAddress(book.address) && book.attributes && isValidAttribute(book.attributes);
    const { isAdmin, isLeadDispatcher } = userStore;

    const {warehouses} = warehouseStore;

    const isDeniedAddTicket = permissionStore.isDenied(ACTIONS.TICKETS.CREATE);

    return <Fragment>
      <div data-testid={`booking-group-${book.id}`}>
        <div style={{ display: 'flex', padding: '4px' }}>
          <div style={{ flex: 1, paddingTop: 4, textAlign: 'left', fontSize: '15px' }}>
            <div style={{ display: 'flex' }}>
              <div>
                <span style={{ cursor: 'pointer', width: 16, display: 'inline-block' }} onClick={() => this.setState({ hidden: !this.state.hidden })}>
                  {this.state.hidden && <i className="fa fa-caret-right" />}
                  {!this.state.hidden && <i className="fa fa-caret-down" />}
                </span>
                {book.name}{book.attributes && book.attributes.tour_cost_min && book.attributes.tour_cost_max && <span> (<b>${this.toPrice(book.attributes.tour_cost_min)}</b> - <b>${this.toPrice(book.attributes.tour_cost_max)}</b>)</span>}
              </div>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#ccc', margin: '8px' }}></div>
            </div>

            { tickets && tickets.length > 0 &&
            <div style={{ display: 'flex', fontSize: '0.8em', padding: '4px' }}>
              <div style={{ ...{ flex: 1 }, ...TICKET_STATUS.COMPLETED }}>
                Completed [{completedCount}]
              </div>
              <div style={{ ...{ flex: 1 }, ...TICKET_STATUS.CLAIMED }}>
                Claimed [{claimedCount}]
              </div>
              <div style={{ ...{ flex: 1 }, ...TICKET_STATUS.PENDING }}>
                UnClaimed [{unclaimedCount}]
              </div>
              {unbooked.length > 0 && <div style={{ ...{ flex: 1 }, ...TICKET_STATUS.UNBOOKED }}>
                UnBooked [{unbookedCount}]
              </div>}
            </div>}

          </div>
          { canAddTicket &&
            <Tooltip title={isDeniedAddTicket ? PERMISSION_DENIED_TEXT : 'Add ticket'}>
              <div style={{marginLeft: 6}}>
                <AxlButton disabled={isDeniedAddTicket} compact={true} tiny={true} style={{ margin: 0, padding: 0 }} bg={'black'} circular={true} block={true} onClick={this.openAddTicket}><i className="fa fa-ticket" /></AxlButton>
              </div>
            </Tooltip>
          }
          { canAddAssignment &&
            <Tooltip title="Add assignment">
              <div style={{marginLeft: 6}}>
                <AxlButton compact={true} tiny={true} style={{ margin: 0, padding: 0 }} bg={'black'} circular={true} block={true} onClick={() => this.setState({ adding: true })}><i className="fa fa-plus" /></AxlButton>
              </div>
            </Tooltip>
          }
          { bookedCount > 0 && canSMS &&
            <Tooltip title="Send SMS">
              <div style={{marginLeft: 6}}>
                <AxlButton compact={true} tiny={true} style={{ margin: 0, padding: 0 }} bg={'black'} circular={true} block={true} onClick={() => this.setState({ sendingSMS: true })}><i className="fa fa-commenting" /></AxlButton>
              </div>
            </Tooltip>
          }
          { isAdmin &&
            <Tooltip title="Edit group config">
              <div style={{marginLeft: 6}}>
                <AxlButton compact={true} tiny={true} style={{ margin: 0, padding: 0 }} bg={'black'} circular={true} block={true} onClick={this.handleEditTicketGroup}><i className="fa fa-gear" /></AxlButton>
              </div>
            </Tooltip>
          }
          <MenuEnforcer book={book}/>
        </div>

        {!this.state.hidden &&  <div style={{display: 'flex'}}>
          <div style={{width: 'calc(100% - 100px)'}}>
          {this.groups.map(group => <div key={group.holder ? group.holder.id : 0} style={styles.list}>
            {group.tickets.map((ticket) => <div key={ticket ? ticket.id : 0} style={{ cursor: 'pointer' }} onClick={() => this.selectTicket(ticket)} data-testid={`booking-unclaimed-${ticket ? ticket.id : 0}`}>
            <TicketLineItem canViewDispatch={this.props.canViewDispatch} onClick={() => this.selectTicket(ticket)}
              holder={this.driverMap[ticket.holder]}
              selected={selected}
              ticket={ticket} /></div>)}
            </div>)}
            {!this.state.hidden && showUnBooked && unbooked.length > 0 && <div style={styles.list}>
              <div style={{ fontWeight: 600, paddingTop: 6, paddingBottom: 5, fontSize: '0.9em' }} data-testid={`booking-count-unbook`}>UN-BOOKED [{unbooked.length}]</div>
              {unbooked.map((ticket) => <div key={ticket.id} onClick={() => this.selectTicket(ticket)} data-testid="booking-unbooked-ticket"> <TicketLineItem ticket={ticket} selected={selected} /> </div>)}
            </div>}
          </div>
          <div  style={{width: 1, backgroundColor: '#e4e4e4'}}></div>
          <div style={{width: '100px', justifyItems: 'center', alignItems: 'center'}}>
            { openAssignments.map((a) => <div onClick={() => this.selectAssignment(a, book)} key={a.id} style={{...styles.list, ...{height: 34, justifyContent: 'center', boxSizing: 'border-box', backgroundColor: selectedAssignment === a.id ? '#ffeaea' : '#f4f4f4'}}}>
              <div style={{padding: '8px 6px', fontSize: '13px', color: '#222', fontWeight: 500, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>{a.label}</div>
            </div>) }
          </div>
        </div> }
        {claimedGroups && claimedGroups.map(group => <div key={group.holder.id} style={styles.list}>
            {group.tickets.map((ticket) => <div key={ticket.id} style={{ cursor: 'pointer' }} onClick={() => this.selectTicket(ticket)} data-testid={`booking-claimed-${ticket.id}`}>
            <TicketLineItem canViewDispatch={this.props.canViewDispatch} onClick={() => this.selectTicket(ticket)}
              holder={this.driverMap[ticket.holder]}
              selected={selected}
              ticket={ticket} /></div>)}
            </div>)}

        { orphan.map((a) => <OrphanAssignment onSelect={() => this.selectAssignment(a, book)} assignment={a} driver={this.driverMap['DR_' + a.driver_id]} key={a.id} />) }
      </div>

      {this.state.sendingSMS && <AxlModal onClose={() => this.setState({ sendingSMS: false })} style={{ width: 600, minHeight: 160, maxHeight: 800, paddingBottom: 0, paddingTop: 20 }}>
        <h4>Sending SMS to drivers with {book.name} tickets</h4>
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
      {this.state.adding && <AxlModal onClose={this.closeAddAssignment} style={{ width: 600, minHeight: 160, maxHeight: 800, paddingBottom: 0, paddingTop: 20 }}>
        <h4>Adding assignment to {book.name}</h4>
        <div>Type in the assignment ids (separated by comma or new line) to add</div>
        <div>Please double check assignment Zones before adding!</div>
        <div style={{ padding: 15 }} data-testid="booking-add-assignment-input"><AxlTextArea style={{ width: '100%', height: 100 }} onChange={(v) => this.setState({ addingItems: v.target.value })} /></div>
        <div style={{ display: 'flex', padding: 10 }}>
          <div style={{ flex: 1 }}>
            <AxlButton block={true} circular={true} onClick={() => this.onAddAssignments()} >ADD</AxlButton>
          </div>
          <div style={{ flex: 1 }}>
            <AxlButton block={true} circular={true} bg={'black'} onClick={this.closeAddAssignment}>Cancel</AxlButton>
          </div>
        </div>
        {this.state.error && <Box p={1} mb={1} align="center" style={{color: 'red'}}>{this.state.error}</Box>}
      </AxlModal>}

      <Dialog
        fullWidth={true}
        maxWidth="md"
        open={this.state.openAddTicket} onClose={this.cancelAddTicket} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Add Ticket To {book.name}</DialogTitle>
        <DialogContent>
          <DialogContentText>

          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="no_of_ticket"
            label="Number Of Ticket"
            type="number"
            value={this.state.noOfTicket ? this.state.noOfTicket : ''}
            onChange={this.onChangeNoOfTicket}
            fullWidth
            required
            error={this.state.noOfTicket && this.state.noOfTicket > MAX_TICKET_NUMBER_TO_BE_ADD}
            helperText={`Please add less than ${MAX_TICKET_NUMBER_TO_BE_ADD} tickets`}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={this.cancelAddTicket} color="primary">
            Cancel
          </Button>
          <Button onClick={this.onAddTickets} disabled={this.state.addingTicket || this.state.noOfTicket > MAX_TICKET_NUMBER_TO_BE_ADD} color="primary">
            {this.state.addingTicket ? 'Adding...' : 'Add'}
          </Button>
        </DialogActions>
        {this.state.error && <Box p={1} align="center" style={{color: 'red'}}>{this.state.error}</Box>}
      </Dialog>
      {
        isEditTicketBook && (
          <ModalAddOrEditTicketBook open={isEditTicketBook} handleClose={this.handleCloseDialog} warehouses={warehouses} book={book} bookingStore={bookingStore}/>
        )
      }
      <DialogSMSCost SMSCost={this.state.SMSCost} callbackSmsAction={() => this.onSendMessage()} clearSMSCost={() => this.clearSMSCost()}></DialogSMSCost>
    </Fragment>
  }
}

export default TicketBookContainer
