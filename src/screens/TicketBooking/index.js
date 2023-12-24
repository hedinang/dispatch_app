import React from 'react';
import { inject, observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import * as E from './styles';
import styles from './styles';

@inject('bookingStore')
@observer
export default class TicketBookingScreen extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const { bookingStore } = this.props
    bookingStore.loadActiveSessions()
  }

  render() {
    const { bookingStore } = this.props
    const { activeSessions } = bookingStore

    return <E.Container>
      {activeSessions && activeSessions.length > 0 && <div style={{marginBottom: 20}}>
        <h4 style={{paddingBottom: 5, marginBottom: 5}}>Ticket Booking Sessions</h4>
        { activeSessions.map(g => <E.GroupContainer key={g.date}>
          <E.GroupHeader>{g.date}</E.GroupHeader>
          {g.sessions.map(s => {
            const noOfDrivers = (s.attributes && s.attributes.noOfDriver) ? s.attributes.noOfDriver : 0;
            return (
              <div key={s.id}>
                <Link to={`/ticket-booking/BS_${s.id}`} style={{textDecoration: 'none'}}>
                  <div style={{...styles.sessionItem, backgroundColor: noOfDrivers < 15 ? '#ffe7e7' : undefined}}>
                    {s.name}{<span style={{fontSize: 10, marginLeft: 5}}>({noOfDrivers} drivers)</span>}
                  </div>
                </Link>
              </div>
            )
          })}
        </E.GroupContainer>)}
      </div>}
      { !activeSessions || activeSessions.length < 1 && <div style={{marginBottom: 20}}>No active Booking Session</div>}
    </E.Container>
  }
}
