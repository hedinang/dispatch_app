import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { AxlButton, AxlModal, AxlInput, AxlTextArea, AxlPanel } from 'axl-reactjs-ui';
import AssignmentMap from '../../components/AssignmentMap/index';
import AssignmentDetail from '../../containers/AssignmentDetail/index';

@inject('ticketStore', 'eventStore', 'bookingStore', 'userStore', 'assignmentStore')
@observer
export default class TicketAssignmentContainer extends Component {
  constructor(props) {
    super(props)
    this.loadAssignment = this.loadAssignment.bind(this)
  }
  componentDidMount() {
    this.loadAssignment()
  }

  loadAssignment() {
    const { id, assignmentStore } = this.props
    assignmentStore.loadAssignment(parseInt(id))
  }

  componentDidUpdate(prevProps) {
    const { assignmentStore } = this.props
    if (prevProps.id !== this.props.id) {
      assignmentStore.loadAssignment(parseInt(this.props.id))
    }
  }

  onRemoveAssignment = () => {
    const {ticketStore, eventStore, bookingStore, bookId, id, history} = this.props;
    const { activeSession } = bookingStore;

    if (!id || !bookId || !activeSession) {
      alert("ID cannot empty.");
      return;
    }

    bookingStore.removeAssignmentFromSession(bookId, id, activeSession.session.id, (res) => {
      if (res.ok) {
        history.replace(`/ticket-booking/BS_${activeSession.session.id}`);
        eventStore.loadEvents('BS_' + activeSession.session.id);
        bookingStore.refreshSession();
      }
    })
  }

  render() {
    const { assignmentStore } = this.props
    const { selectedAssignment } = assignmentStore
    if (!selectedAssignment)
      return <div />

    return <div>
      <div style={{height: '240px'}}>
        <AssignmentMap assignment={selectedAssignment} />
      </div>
      <div>
        <AssignmentDetail assignmentInfo={selectedAssignment} onRemoveAssignmentFromSession={this.onRemoveAssignment} />
      </div>
    </div>
  }
}