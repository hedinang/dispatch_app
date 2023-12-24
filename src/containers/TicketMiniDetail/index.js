import React, { Component } from 'react';
import Moment from 'react-moment';
import { inject, observer } from 'mobx-react';
import { ArrowBackIos as ArrowBackIcon } from '@material-ui/icons';
import { withStyles, Box, Link, Grid, Button, TextField, CircularProgress, DialogTitle, DialogContent, DialogActions, Dialog, InputLabel, Select, FormControl, Checkbox, FormControlLabel } from '@material-ui/core';

import TooltipContainer from '../../components/TooltipContainer';

import styles from './styles';
import { ACTIONS } from '../../constants/ActionPattern';
import { PERMISSION_DENIED_TEXT } from '../../constants/common';
import { NEGATIVE_REASON_CODES, REASON_CODES } from '../../constants/ticket';
@inject('ticketStore', 'userStore', 'permissionStore')
@observer
class TicketMiniDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reason: '',
      reasonCode: '',
      benefit: true,
      voiding: false,
      showDialog: false,
    };
  }

  closeDialog = () => {
    this.setState({ showDialog: false });
  };

  onChangeReasonCode = (e) => {
    this.setState({ reasonCode: e.target.value });
    if (NEGATIVE_REASON_CODES.includes(e.target.value)) {
      this.setState({ benefit: false });
    } else {
      this.setState({ benefit: true });
    }
  };

  onVoidTicket = () => {
    const { reason, reasonCode, benefit } = this.state;
    const { ticketStore, ticket, onBack, reloadData } = this.props;

    if (!reason) return;

    this.setState({ voiding: true });
    ticketStore.voidTicket(ticket.id, reason, reasonCode, benefit).then(() => {
      if (this.props.onUpdate) this.props.onUpdate();
      this.closeDialog();
      onBack(reloadData);
    });
  };

  render() {
    const { reason, reasonCode, benefit, voiding, showDialog } = this.state;
    const { classes, ticket, onBack, permissionStore } = this.props;
    const bookingSessionId = (ticket.attributes && ticket.attributes.session) || '';

    const isDeniedVoid = permissionStore.isDenied(ACTIONS.TICKETS.VOID);

    return (
      <Box p={2} className={classes.container}>
        <Box mb={2} align="left">
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <ArrowBackIcon className={classes.backItem} color="primary" onClick={() => onBack()} fontSize="small" />
              <Link className={classes.backItem} onClick={() => onBack()} underline="always" color="primary">
                Back to Pending Route List
              </Link>
            </Grid>
            <Grid item>
              <Box mx={1} component="span">
                <TooltipContainer title={isDeniedVoid ? PERMISSION_DENIED_TEXT : ''}>
                  <Button disabled={isDeniedVoid} variant="contained" size="small" disableElevation color="secondary" onClick={() => this.setState({ showDialog: true })}>
                    Void
                  </Button>
                </TooltipContainer>
              </Box>
              <Box component="span">
                <Button variant="contained" size="small" target="_blank" disableElevation href={`/ticket-booking/${bookingSessionId}`}>
                  View in booking
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Box align="left">
          <Grid container spacing={2} justifyContent="space-between" alignItems="center">
            <Grid item>
              <Box className={classes.label}>Route Ticket - {ticket.name}</Box>
            </Grid>
            <Grid item>
              <Box className={classes.bold} style={{ color: '#fa6725' }}>
                {ticket.status || 'PENDING'}
              </Box>
            </Grid>
          </Grid>
          <Grid container spacing={2} className={classes.assignmentInfo}>
            <Grid item xs={12} sm={6}>
              <Box py={0.5}>
                <span>Boxes: </span>
                <span className={classes.bold}>
                  {ticket.attributes.shipment_count_min} - {ticket.attributes.shipment_count_max}
                </span>
              </Box>
              <Box py={0.5}>
                <span>Amount: </span>
                <span className={classes.bold}>
                  ${ticket.attributes.tour_cost_min} - ${ticket.attributes.tour_cost_max}
                </span>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box py={0.5}>
                <span>Est. Time Window: </span>
                <span className={classes.bold}>
                  <Moment interval={0} format="hh:mm a">
                    {ticket.target_start_ts}
                  </Moment>{' '}
                  -{' '}
                  <Moment interval={0} format="hh:mm a">
                    {ticket.target_end_ts}
                  </Moment>
                </span>
              </Box>
              <Box py={0.5}>
                <span>Zones: </span>
                <span className={classes.bold} style={{ wordBreak: 'break-all' }}>
                  {ticket.attributes.zones}
                </span>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Dialog open={showDialog} onClose={this.closeDialog} style={{ zIndex: 100000 }} PaperProps={{ style: { minWidth: 500 } }}>
          <DialogTitle align="center">
            <Box>
              <Box>
                <strong>Void Ticket</strong>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box py={1}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Select reason code</InputLabel>
                <Select native value={reasonCode} onChange={this.onChangeReasonCode} label="Select reason code">
                  <option value="" />
                  {REASON_CODES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <TextField label="Reason" multiline rows={5} variant="outlined" fullWidth disabled={voiding} value={reason} onChange={(e) => this.setState({ reason: e.target.value })} />
            <Box>
              <FormControlLabel control={<Checkbox checked={benefit} tabIndex={-1} disableRipple />} label="Add driver to high-priority pool" onChange={(e) => this.setState({ benefit: e.target.checked })} labelPlacement="end" />
            </Box>
          </DialogContent>
          <DialogActions>
            <Box px={2} pb={1}>
              {voiding && (
                <Box px={1} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                  <CircularProgress color="primary" size={24} />
                </Box>
              )}
              <Button color="secondary" variant="contained" disableElevation onClick={this.closeDialog} style={{ marginRight: 15 }}>
                Cancel
              </Button>
              <Button color="primary" disableElevation variant="contained" disabled={!reason || !reasonCode || voiding} onClick={this.onVoidTicket}>
                Void
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
}

export default withStyles(styles)(TicketMiniDetail);
