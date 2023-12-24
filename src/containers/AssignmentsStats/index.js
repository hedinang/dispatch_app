import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import AssignmentChart from '../../components/AssignmentChart/index';

@inject('assignmentStore')
@observer
class AssignmentsStats extends Component {
  render() {
    const { assignmentStore } = this.props
    const { start, assignmentShipmentStats } = assignmentStore;
    return <AssignmentChart date = {start} stats = {assignmentShipmentStats} onCollapse={this.props.onCollapse} />
  }
}

export default AssignmentsStats
