import React, { Component } from 'react';
import styles from './styles';
import moment from 'moment'


class TicketBox extends Component {
  render() {
    const { ticket, driver } = this.props
    return <div style={styles.container}>
      <div style={styles.cornerTL}></div>
      <div style={styles.cornerTR}></div>
      <div style={styles.cornerBL}></div>
      <div style={styles.cornerBR}></div>
      <div style={styles.innerContainer}>
        <div style={styles.name}>
          {ticket.name}
          { ticket.holder && <div style={{fontSize: '0.8em', color: '#446', fontWeight: 400, paddingTop: 10}}>
            { driver && <span>{driver.first_name} {driver.last_name}</span> } [{ticket.holder.split('_')[1]}]
          </div> }
        </div>
        <div style={styles.pickupTime}>
          <div style={styles.label}>PICKUP</div>
          <div>
            { ticket.valid_from ? moment(ticket.valid_from).format('h:mm A') : 'N/A' }
          </div>
        </div>
      </div>
    </div>
  }
}

export default TicketBox
