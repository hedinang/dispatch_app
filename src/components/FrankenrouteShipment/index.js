import React from "react";
import {Grid, Box, IconButton} from "@material-ui/core";
import {Delete as DeleteIcon, Error as ErrorIcon} from "@material-ui/icons";
import moment from "moment";

import useStyles from "./styles";
import {UNROUTEABLE_STATUSES} from "../../constants/shipment";

function FrankenrouteShipment(props) {
  const classes = useStyles();
  const {shipment, clients, problem, onShowConfirmRemove} = props;
  const client = clients.filter(cl => cl.id === shipment.client_id).pop();
  const company = client ? client.company : shipment.client_id;
  const note = 'PICKUP_FAILED' === shipment.status ? shipment.pickup_note : shipment.dropoff_note;

  return (
    <Box className={classes.wrapper} mb={1}>
      <Grid container spacing={2} justifyContent="space-between" alignItems='center'>
        <Grid item>
          <Box className={classes.title}>Shipment ID</Box>
          <Box className={classes.value}>{shipment.id}</Box>
        </Grid>
        <Grid item>
          <Box className={classes.title}>Client</Box>
          <Box className={classes.value}>{company}</Box>
        </Grid>
        <Grid item>
          <Box className={classes.title}>Delivery Date</Box>
          <Box className={classes.value}>{moment(shipment.dropoff_earliest_ts).format("YYYY-MM-DD")}</Box>
        </Grid>
        <Grid item>
          <Box className={classes.title}>Region</Box>
          <Box className={classes.value}>{shipment.region_code}</Box>
        </Grid>
        <Grid item>
          <Box>
            <IconButton size="small" onClick={() => onShowConfirmRemove(shipment.id)} disabled={!!problem.id}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
      <Box align="left" mt={1}>
        <Box className={classes.title}>Status</Box>
        <Box className={classes.value} style={{color: UNROUTEABLE_STATUSES.includes(shipment.status) ? 'red' : undefined}}>
          {shipment.status} {note && <span style={{color: '#888'}}> - {note}</span>}
        </Box>
      </Box>
      {shipment.unrouteable && (
        <Box className={classes.error} pt={1}>
          <ErrorIcon fontSize="small" style={{verticalAlign: 'bottom'}} />
          <span>This shipment can’t be routed, please remove it!</span>
        </Box>
      )}
    </Box>
  );
}

export default FrankenrouteShipment;