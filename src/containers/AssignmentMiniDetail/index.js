import React, { Component } from 'react';
import clsx from 'clsx';
import Moment from 'react-moment';
import { inject, observer } from 'mobx-react';
import { AxlMiniStopBox, AxlModal } from 'axl-reactjs-ui';
import { withStyles, Box, Link, Grid, Button } from '@material-ui/core';
import { ArrowBackIos as ArrowBackIcon } from '@material-ui/icons';

import AssignmentNote from '../../components/AssignmentNote';
import AssignmentNotd from '../../components/AssignmentNotd';
import AssignmentAssign from '../../components/AssignmentAssign';
import TooltipContainer from '../../components/TooltipContainer';

import styles from './styles';
import { convertMeterToMile } from '../../constants/common';
import { ACTIONS } from '../../constants/ActionPattern';
import { PERMISSION_DENIED_TEXT } from '../../constants/common';

@inject('assignmentStore', 'userStore', 'messengerStore', 'permissionStore')
@observer
class AssignmentMiniDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showUnassignDriver: false,
      reason: '',
    };

    const { shipments, stops, clients, shipmentLabels } = props.assignmentInfo;
    this.stops = stops
      .filter((st) => st.type === 'DROP_OFF')
      .map((st) => {
        st.shipment = shipments.filter((sh) => sh.id === st.shipment_id).shift();
        st.client = clients ? clients.filter((cl) => cl.id === st.client_id).shift() : null;
        st.label = shipmentLabels ? shipmentLabels.filter((lb) => lb.shipment_id === st.shipment_id).shift() : null;

        return st;
      });
  }

  hideUnassignDriver = () => {
    this.setState({ showUnassignDriver: false });
  };

  updateReason = () => (e) => {
    this.setState({ reason: e });
  };

  onUnAssignDriver() {
    const { reason } = this.state;
    if (!reason) return;
    const { assignmentStore, assignmentInfo, messengerStore, onBack, reloadData } = this.props;
    const { assignmentSummeries } = assignmentStore;
    const topicSelectedId = (assignmentSummeries[assignmentInfo.assignment.id] && assignmentSummeries[assignmentInfo.assignment.id].topic_id) || null;

    assignmentStore.unassign(assignmentInfo, reason).then((r) => {
      if (r.ok) {
        onBack(reloadData);
        // unfollow driver into a topic
        if (assignmentInfo.assignment && assignmentInfo.assignment.driver_id) {
          if (topicSelectedId) {
            messengerStore.topicSelectedId = topicSelectedId;
            messengerStore.driverUnfollow(assignmentInfo.assignment.driver_id);
          }
        }
      }
    });
  }

  render() {
    const { showUnassignDriver } = this.state;
    const { assignmentInfo, onBack, classes, userStore, permissionStore } = this.props;
    const { assignment, shipments, driver } = assignmentInfo;
    const { user } = userStore;
    const status = assignment.status || 'PENDING';

    const unAssignOptions = {
      props: {
        bg: 'none',
        tiny: true,
      },
      onClick: () => {
        this.hideUnassignDriver();
        this.onUnAssignDriver();
      },
      text: `Unassign Driver - [${driver.id}] ${driver.first_name} ${driver.last_name}`,
      title: 'Unassign Driver',
    };

    const isDeniedUnassign = permissionStore.isDenied(ACTIONS.ASSIGNMENTS.UNASSIGN);

    return (
      <Box p={2} className={classes.container}>
        <Box mb={2}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <ArrowBackIcon className={classes.backItem} color="primary" onClick={() => onBack()} fontSize="small" />
              <Link className={classes.backItem} onClick={() => onBack()} underline="always" color="primary">
                Back to Pending Route List
              </Link>
            </Grid>
            <Grid item>
              <Box mx={1} component="span">
                <TooltipContainer title={isDeniedUnassign ? PERMISSION_DENIED_TEXT : ''} arrow>
                  <Button disabled={isDeniedUnassign} variant="contained" size="small" disableElevation color="secondary" onClick={() => this.setState({ showUnassignDriver: true })}>
                    Unassign
                  </Button>
                </TooltipContainer>
              </Box>
              <Box component="span">
                <Button variant="contained" size="small" target="_blank" disableElevation href={`/assignments/${assignment.id}`}>
                  View in dispatch
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Box className={classes.infoContainer}>
          <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
            <Grid item>
              <Box component="span" className={classes.label}>
                {assignment.label}
              </Box>
              <code className={classes.code}>{assignment.id}</code>
            </Grid>
            <Grid item>
              <Box>Assignment Status</Box>
              <Box className={clsx(classes.bold, classes[status.trim().toLowerCase()])}>{status}</Box>
            </Grid>
          </Grid>
          <Grid container spacing={2} className={classes.assignmentInfo}>
            <Grid item xs={12} sm={6}>
              <Box py={0.5}>
                <span>Type: </span>
                <span className={classes.bold}>{shipments[0].service_level}</span>
              </Box>
              <Box py={0.5}>
                <span>Volume: </span>
                <span className={classes.bold}>{shipments.length}</span>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box py={0.5}>
                <span>Est. Time Window: </span>
                <span className={classes.bold}>
                  <Moment interval={0} format="hh:mm a">
                    {assignment.predicted_start_ts}
                  </Moment>{' '}
                  -{' '}
                  <Moment interval={0} format="hh:mm a">
                    {assignment.predicted_end_ts}
                  </Moment>
                </span>
              </Box>
              <Box py={0.5}>
                <span>Est. Distance: </span>
                <span className={classes.bold}>
                  {convertMeterToMile(assignment.travel_distance)} {`mi`}
                </span>
              </Box>
            </Grid>
          </Grid>
          <Box py={1}>
            <AssignmentNote assignmentId={assignment.id} userId={user.id} />
          </Box>
          <Box py={1}>
            <AssignmentNotd assignmentId={assignment.id} />
          </Box>
        </Box>
        <Box>
          <Box pb={1} align="left" className={classes.bold}>
            Shipment List:
          </Box>
          <Box p={2} className={classes.shipmentList}>
            {this.stops.map((stop) => (
              <AxlMiniStopBox onClick={() => null} key={stop.id} stop={stop} />
            ))}
          </Box>
        </Box>
        {showUnassignDriver && (
          <AxlModal onClose={this.hideUnassignDriver} style={styles.modalStyle} containerStyle={styles.modalContainer}>
            <AssignmentAssign {...unAssignOptions} updateReason={this.updateReason()} onClose={this.hideUnassignDriver} />
          </AxlModal>
        )}
      </Box>
    );
  }
}

export default withStyles(styles)(AssignmentMiniDetail);
