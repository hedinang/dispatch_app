import React from 'react';
import styles from './styles';
import Moment from 'react-moment';
import moment from "moment-timezone";

const STATUS_NAME = {
  IN_PROGRESS: 'On the way',
  READY: 'Arrived'
}

class TicketLineItem extends React.Component {
  constructor(props) {
    super(props)
    this.gotoAssignment = this.gotoAssignment.bind(this)
  }
  gotoAssignment() {
    const { ticket, canViewDispatch } = this.props
    if (!canViewDispatch) return;
    const { assignment } = ticket
    if (!assignment) return;
    const clients = assignment.client_ids ? assignment.client_ids.join(',') : 'all'
    window.open(`https://dispatch.axlehire.com/routes/today/${assignment.region_code}/${clients}/${assignment.id}`, "_blank")
  }

  render () {
    const { ticket, holder, selected } = this.props
    const { assignment } = ticket
    const isSelected = selected === ticket.id
    return <div style={{padding: '8px 8px', fontSize: '15px', height: 34, boxSizing: 'border-box', display: 'flex', justifyContent: 'center', marginTop: 6, backgroundColor: isSelected && '#dfdfdf'}}>
      <div style={{flex: 1, textAlign: 'left', color: '#222', fontWeight: 500, fontSize: '0.9em', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}><img src={`/assets/images/ticket.png`} style={{width: 15}} /> {holder && <span data-testid="holder-name">{ holder.first_name } {holder.last_name}</span>}{!holder && <code style={{padding:0, margin: 0}}>{ticket.id}</code>}</div>
      { !assignment && holder && <div style={{width: '90px', fontSize: '0.8em', color: '#444', fontWeight: 400}}>
        { ticket.valid_to && <span data-testid="eta-valid-to">{moment.tz(ticket.valid_to, moment.tz.guess()).format('h:mma z')}</span>  }
      </div> }
      <div style={{...{width: '80px', fontSize: '0.75em', textAlign: 'right'}, ...styles.status[ticket.status]}}>{ STATUS_NAME[ticket.status] || ticket.status }</div>
      { assignment && <div style={{width: '90px', fontSize: '0.8em', color: '#444', justifyItems: 'center', fontWeight: 400}}>
        <code style={styles.assignment}>{ assignment.label }</code>
      </div>}
    </div>
  }
}

export default TicketLineItem
