import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import styles from './styles';
import HistoryEvent from '../../components/HistoryEvent'

@inject('eventStore')
@observer
class History extends Component {
  constructor(props) {
    super(props)
    this.state = {
    };
    const { eventStore, uid } = this.props
    eventStore.loadEvents(uid)
  }

  EXCLUDED_ACTIONS = [
    "book", "unbook", "claim", "unclaim", "assign", "unassign", "reassign"
  ];

  componentWillReceiveProps(props) {
    const { eventStore, uid } = this.props
    if (props.uid === uid) return
    eventStore.loadEvents(props.uid)
  }

  render() {
    const { eventStore, height, uid } = this.props
    const events = eventStore.eventsFor(uid)

    if (!events) return null;

    const filteredEvents = events.filter(e => uid.startsWith("BS_") ? !this.EXCLUDED_ACTIONS.includes(e.action) : true);

    return (
      <div style={{...styles.container, ...(height ? {maxHeight: height} : {}) }}>
        <div>{ filteredEvents.map((e) => <HistoryEvent key={e.id} event={e} />) }</div>
      </div>
    )
  }
}

export default History;