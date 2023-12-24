import React from 'react';
import {inject, observer} from "mobx-react";
import styles, * as E from './styles';
import moment from "moment-timezone";

@inject('callCenterStore')
@observer
export default class AssignmentInfo extends React.Component {
  componentDidMount() {
    const { callCenterStore, assignmentId } = this.props;
    if(assignmentId && assignmentId !== '') {
      callCenterStore.loadAssignment(assignmentId);
    }
  }

  render() {
    const { callCenterStore } = this.props;
    // const { selectedAssignment } = this.state;
    const { assignmentLoading, selectedAssignment } = callCenterStore;
    const assignment = selectedAssignment && selectedAssignment.assignment || {};

    return selectedAssignment ? <E.Container>
      <E.Inner>
        <E.Title>{`Assignment Detail`}</E.Title>
        <E.Row>
          <E.Col>
            <E.Text_0>{`Assignment ${assignment.label}`} - <E.Text_2>{assignment.id}</E.Text_2></E.Text_0>
            <E.Text_1>{`0 Shipments`}</E.Text_1>
          </E.Col>
          <E.Col>
            <E.Label>{`TIME WINDOWS`}</E.Label>
            <E.Text>{`${moment(assignment.predicted_start_ts).format('HH:mm A')} - ${moment(assignment.predicted_end_ts).format('HH:mm A')}`}</E.Text>
          </E.Col>
          <E.Col>
            <E.Label>{`ZONES`}</E.Label>
            <E.Text>{assignment.zones}</E.Text>
          </E.Col>
          <E.Col_Right>
            <E.ViewDispatchButton href={`/routes/${moment(assignment.predicted_end_ts).format('YYYY-MM-DD')}/all/all/${assignment.id}`} target={`_blank`}>{`View in Dispatch`}</E.ViewDispatchButton>
          </E.Col_Right>
        </E.Row>
      </E.Inner>
    </E.Container> : null;
  }
}