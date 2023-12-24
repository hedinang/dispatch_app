import React, { Component } from 'react';
import styles from './styles';
import moment from 'moment'
import { AxlButton, AxlPanel, AxlModal, AxlPopConfirm } from 'axl-reactjs-ui';
import Moment from "react-moment";
import Rating from 'react-rating';
import DriverProfileInformation from '../DriverProfileInformation'
import DriverProfileRoutingTabs from '../DriverProfileRoutingTabs'
import TicketNote from '../TicketNote';

import _ from 'lodash'

class ActiveDeliveryInfo extends Component {
  gotoAssignment(assignment) {
    if (!assignment) return;
    const clients = assignment.client_ids ? assignment.client_ids.join(',') : 'all'
    window.open(`https://dispatch.axlehire.com/routes/today/${assignment.region_code}/${clients}/${assignment.id}`, "_blank")
  }

  openAssignment(assignment) {
    if (!assignment) return;
    const { history, sid } = this.props
    history.push(`/ticket-booking/${sid}/assignment/${assignment.id}`)
  }

  render() {
    const { activeDelivery } = this.props
    if (!activeDelivery) return <div></div>
    const pickupFailed = activeDelivery.stops.filter(s => s.type === 'PICK_UP').filter(s => s.status === 'FAILED').map(s => s.id)
    const dropoffs = activeDelivery.stops.filter((s) => s.type === 'DROP_OFF').filter(s => pickupFailed.indexOf(s.id) < 0)
    const completed = dropoffs.filter((s) => s.status === 'SUCCEEDED' || s.status === 'FAILED')
    const lastDropoff = completed.length > 0 ? _.sortBy(completed, [(x) => x.actual_departure_ts])[completed.length - 1] : null
    const completedCount = completed.length
    return <div>
        <div>
        <AxlPanel.Row>
          <AxlPanel.Col>
            <AxlPanel.Row>
              <AxlPanel.Col flex={0.5}>
                <div style={styles.label}>{`Label`}</div>
                <div style={styles.text}>{activeDelivery.assignment.label}</div>
              </AxlPanel.Col>
              <AxlPanel.Col flex={1}>
                <div style={styles.label}>{`Progress`}</div>
                <div style={styles.text}>{completedCount} / {dropoffs.length}</div>
              </AxlPanel.Col>
              <AxlPanel.Col flex={1}>
                <div style={styles.label}>{`Tour Cost`}</div>
                <div style={styles.text}>{activeDelivery.assignment.tour_cost}</div>
              </AxlPanel.Col>
              <AxlPanel.Col flex={1}>
                <div style={styles.label}>{`Status`}</div>
                <div style={styles.text}>{activeDelivery.assignment.status}</div>
              </AxlPanel.Col>
              <AxlPanel.Col flex={2}>
                <div style={styles.label}>{`Last Dropoff`}</div>
                <div style={styles.text}>{ lastDropoff && <span>{lastDropoff.status} @ <Moment format={'hh:mmA'}>{lastDropoff.actual_departure_ts}</Moment></span> }</div>
              </AxlPanel.Col>
            </AxlPanel.Row>
          </AxlPanel.Col>
        </AxlPanel.Row>
        </div>      
    </div>
  }
}

class TicketInfo extends Component {
  constructor(props) {
    super(props)
    this.onShowDriverProfile = this.onShowDriverProfile.bind(this);
    this.onHideDriverProfile = this.onHideDriverProfile.bind(this);
    this.gotoAssignment = this.gotoAssignment.bind(this);
    this.openAssignment = this.openAssignment.bind(this);
    this.state = {}
  }

  openAssignment(assignment) {
    if (!assignment) return;
    const { history, sid } = this.props
    history.push(`/ticket-booking/${sid}/assignment/${assignment.id}`)
  }


  onShowDriverProfile = () => {
    if (this.props.driver) {
      this.setState({ showDriverProfile: true })
    }
  }

  onHideDriverProfile = () => {
    this.setState({ showDriverProfile: false })
  }

  gotoAssignment(assignment) {
    if (!assignment) return;
    window.open(`/assignments/${assignment.id}`, "_blank");
  }


  render() {
    const { ticket, driver, assignment, activeDelivery, ticketId, userId } = this.props
    const status = !ticket.holder ? 'UNBOOKED' : (ticket.status || 'PENDING')
    return <div style={styles.container} data-testid="ticket-info-section">
      <div style={{display: 'flex'}}>
        <div style={styles.name}>{ticket.name}</div>
        <div style={{...{fontSize: '15px', fontWeight: 600}, ...styles.status[status]}} data-testid="ticket-info-status">{ status }</div>
      </div>
      <div style={{fontSize: '0.8em', color: '#888', paddingBottom: 20, textAlign: 'left'}} data-testid="ticket-info-id">
        {ticket.id}
      </div>
      <div style={{display: 'flex', marginBottom: 10, textAlign: 'left'}}>
        <div style={{flex: 1}}>
          <div style={styles.label2}>Location </div>
          <div style={styles.text}>{ticket.address.street} {ticket.address.street2}</div>
          <div style={styles.text}>{ticket.address.city}, {ticket.address.state} {ticket.address.zipcode}</div>
        </div>
        <div style={{flex: 1}}>
          <div style={styles.label2}>Time Slot </div>
          <div style={styles.text}>
            {ticket.valid_from ? moment(ticket.valid_from).format('h:mm A') : '-N/A'}
            - {ticket.valid_from ? moment(ticket.valid_to).format('h:mm A') : ''}
          </div>
        </div>
      </div>

      <div style={{display: 'flex', marginBottom: 10}}>
      </div>
      <TicketNote ticketId={ticketId} userId={userId} />
      {driver && <div style={{ textAlign: 'left' }}>
        <div style={styles.label2}>Driver Info</div>
        <AxlPanel.Row>
          <AxlPanel.Col>
            <AxlPanel.Row>
              <AxlPanel.Col flex={0} style={styles.driverPhotoContainer}>
                <div style={styles.photo} onClick={this.onShowDriverProfile} >
                  {(driver && driver.photo) ? <img src={driver.photo} style={styles.driverPhoto} /> : <div style={styles.defaulDriverPhoto} />}
                </div>
                {(this.state.showDriverProfile && driver) && <AxlModal style={styles.modalDriverProfileContainer} onClose={this.onHideDriverProfile}>
                  <DriverProfileInformation driver={driver} />
                  <DriverProfileRoutingTabs driver={driver} onSave={this.onHideDriverProfile} />
                </AxlModal>}
              </AxlPanel.Col>
              <AxlPanel.Col>
                <div style={styles.driverName} data-testid="ticket-info-driver-name">{driver.first_name} {driver.last_name} </div>
                <AxlPanel.Row>
                  <AxlPanel.Col>
                    <AxlPanel.Row>
                      <AxlPanel.Col flex={0}><div style={styles.label}>Phone  </div></AxlPanel.Col>
                      <AxlPanel.Col><div style={styles.text}>{driver.phone_number}</div></AxlPanel.Col>
                    </AxlPanel.Row>
                  </AxlPanel.Col>
                  <AxlPanel.Col>
                    <AxlPanel.Row>
                      <AxlPanel.Col flex={0}><div style={styles.label}>{`Status`}</div></AxlPanel.Col>
                      <AxlPanel.Col><div style={styles.text}>{!driver.status ? '' : driver.status.replace('_', ' ')}</div></AxlPanel.Col>
                    </AxlPanel.Row>
                  </AxlPanel.Col>
                </AxlPanel.Row>
                <AxlPanel.Row>
                  <AxlPanel.Col>
                    <AxlPanel.Row>
                      <AxlPanel.Col flex={0}><div style={styles.label}>{`AHID`}</div></AxlPanel.Col>
                      <AxlPanel.Col><div style={styles.text} data-testid="ticket-info-driver-id">{driver.id}</div></AxlPanel.Col>
                    </AxlPanel.Row>
                  </AxlPanel.Col>
                  <AxlPanel.Col>
                    <AxlPanel.Row>
                      <AxlPanel.Col flex={0}><div style={styles.label}>{`Joined`}</div></AxlPanel.Col>
                      <AxlPanel.Col><div style={styles.text}>{driver.background_decision_ts ? <Moment interval={0} format={'MMM YYYY'}>{driver.background_decision_ts}</Moment> : '-'}</div></AxlPanel.Col>
                    </AxlPanel.Row>
                  </AxlPanel.Col>
                </AxlPanel.Row>
              </AxlPanel.Col>
            </AxlPanel.Row>
          </AxlPanel.Col>
        </AxlPanel.Row>
        { driver.vehicles && driver.vehicles.length > 0 && <div>
          <div style={{...styles.label2, ...{marginTop: 10}}}>Vehicle Info</div>
          { driver.vehicles.map((vehicle) => <div key={vehicle.id}>
            <AxlPanel.Row>
              <AxlPanel.Col>
                  <div style={styles.label}>Type</div>
                  <div style={styles.text}>{ vehicle.car ? vehicle.car.type : '-'}</div>
              </AxlPanel.Col>
              <AxlPanel.Col>
                  <div style={styles.label}>Make</div>
                  <div style={styles.text}>{ vehicle.car ? vehicle.car.make : '-'}</div>
              </AxlPanel.Col>
              <AxlPanel.Col>
                  <div style={styles.label}>Model</div>
                  <div style={styles.text}>{ vehicle.car ? vehicle.car.model : '-'}</div>
              </AxlPanel.Col>
              <AxlPanel.Col>
                <div style={styles.label}>Year</div>
                <div style={styles.text}>{ vehicle.car ? vehicle.car.year : '-'}</div>
              </AxlPanel.Col>
              <AxlPanel.Col>
                  <div style={styles.label}>Color</div>
                  <div style={styles.text}>{vehicle.color}</div>
              </AxlPanel.Col>
            </AxlPanel.Row>
          </div>) }
        </div>}
      </div>}
      { assignment && assignment.assignment && <div style={{textAlign: 'left', marginTop: 10, marginBottom: 10}}>
        <div style={styles.label2}>
          Claimed Assignment <span style={styles.text}>[{assignment.assignment.id}]</span>
          <span onClick={() => this.openAssignment(assignment.assignment) } style={{marginLeft: 10, cursor: 'pointer'}}><i className="fa fa-chevron-circle-right" /></span>
          <span onClick={ () => this.gotoAssignment(assignment.assignment) } style={{marginLeft: 10, cursor: 'pointer'}}><i className="fa fa-arrow-circle-right" /></span>
        </div>
        <ActiveDeliveryInfo sid = {this.props.sid} activeDelivery={assignment} />
      </div>}

      { activeDelivery && (!assignment || assignment.assignment.id !== activeDelivery.assignment.id) && <div style={{textAlign: 'left', marginBottom: 10, marginTop: 10}}>
        <div style={styles.label2}>
          Active Delivery <span style={styles.text}>[{activeDelivery.assignment.id}]</span>
          <span onClick={() => this.openAssignment(activeDelivery.assignment) } style={{marginLeft: 10, cursor: 'pointer'}}><i className="fa fa-chevron-circle-right" /></span>
          <span onClick={() => this.gotoAssignment(activeDelivery.assignment) } style={{marginLeft: 10, cursor: 'pointer'}}><i className="fa fa-arrow-circle-right" /></span>
        </div>
        <ActiveDeliveryInfo sid = {this.props.sid} activeDelivery={activeDelivery} />
      </div>}

    </div>
  }
}

export default TicketInfo
