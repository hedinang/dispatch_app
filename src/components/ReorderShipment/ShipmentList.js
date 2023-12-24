import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from "@material-ui/core/Checkbox";
import IconButton from "@material-ui/core/IconButton";
import Moment from "react-moment";
import moment from "moment-timezone";
import colors from "./constant";

const useStyles = makeStyles((theme) => ({
  formLabel: {
    '& .MuiFormControlLabel-label':{
      minWidth: '8px'
    },
    '& .MuiCheckbox-root': {
      paddingRight: 2,
    }
  },
  root: {
    width: "100%",
    borderRadius: "3px",
    boxShadow: "0 2px 4px 0 rgba(155, 155, 155, 0.19)",
    border: "solid 0.5px #cccccc",
    backgroundColor: "#f7f7f7",
    maxHeight: '60vh',
    overflow: 'auto'
  },
  itemRoot: {
    width: "100%",
    boxSizing: "border-box",
    borderRadius: "3px",
    fontSize: "13px",
    boxShadow: "0px 0px 1px #888",
    minHeight: "44px",
    overflow: "hidden",
    cursor: "pointer",
    position: "relative",
    textAlign: "left",
    borderRight: "solid 6px",
    borderRightColor: "#fa6725",
  },
  info: {
    padding: "5px 5px 2px 10px",
    backgroundColor: "white",
    display: "flex",
    color: "#3b3b3b",
  },
  left: {
    flex: "1",
  },
  right: {
    flex: "1",
    fontFamily: "AvenirNext-Medium",
    fontSize: "12px",
    fontWeight: "500",
    "& > div": {
      marginBottom: "5px",
    },
  },
  shipmentLabel: {
    fontFamily: "AvenirNext-Medium",
    fontSize: "12px",
    fontWeight: "bold",
    textAlign: "left",
    color: "#3b3b3b",
    marginBottom: "5px",
  },
  timebox: {
    fontFamily: "AvenirNext-Medium",
    fontSize: "10px",
    fontWeight: "300",
    color: "#55a",
  },
  customerName: {
    fontFamily: "AvenirNext-Bold",
  },
  checkbox: {
    minWidth: "auto",
    "& .MuiIconButton-label": {
      color: "#979797",
    },
  },
}));

export default function ShipmentList({ stops, setStopSelected }) {
  const classes = useStyles();
  const [checked, setChecked] = React.useState([]);
  // const [stopSelected, setStopSelected] = useRecoilState(stopSelectedState);
  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setStopSelected(newChecked);
    setChecked(newChecked);
  };

  return (
    <List className={classes.root}>
      {stops &&
        stops.map((stop) => {
          const value = stop.id;
          const { shipment, label, client, _deleted } = stop;
          const driverLabel = label ? label.driver_label : "-";
          const street = shipment ? shipment.dropoff_address.street : "-";
          const customer_name = shipment ? shipment.customer.name : "";
          const city = shipment ? shipment.dropoff_address.city + ", " + shipment.dropoff_address.state + " " + shipment.dropoff_address.zipcode : "";
          const deletedStyle =
            _deleted || stop.status === "DISCARDED"
              ? { borderTop: "1px solid #d8313280", borderBottom: "1px solid #d8313280", borderLeft: "1px solid #d8313280", borderColor: "#d8313280", boxShadow: "none" }
              : {};
          let deletedContent = null;
          if (_deleted && shipment.inbound_status) {
            switch (shipment.inbound_status) {
              case "MISSING":
                deletedContent = "MISSING";
                break;
              case "RECEIVED_DAMAGED":
                deletedContent = "DAMAGED";
                break;
              case "DUPLICATED":
                deletedContent = "DUPLICATED";
                break;
              default:
                deletedContent = "DELETED";
                break;
            }
          } else if (stop.status === "DISCARDED") {
            deletedContent = "DISCARDED";
          }

          const status = stop.status == "PENDING" ? (shipment.status == "PICKUP_SUCCEEDED" ? "IN_PROGRESS" : "PENDING") : stop.status;
          const isDisabled = stop.status === "FAILED" || stop.status === "SUCCEEDED";
          return (
            <ListItem key={value} role={undefined} dense button onClick={handleToggle(value)} disabled={isDisabled}>
              <ListItemIcon className={classes.checkbox}>
                <FormControlLabel
                    className={classes.formLabel}
                    value="end"
                    control={<Checkbox checked={checked.indexOf(value) !== -1} tabIndex={-1} disableRipple />}
                    label={checked.indexOf(value) !== -1 ? checked.indexOf(value) + 1: ""}
                    labelPlacement="end"
                  />
              </ListItemIcon>
              <div className={classes.itemRoot} style={{ ...colors.statuses[stop.type][status] }}>
                <div className={classes.info}>
                  <div className={classes.left}>
                    <div className={classes.shipmentLabel}>
                      {driverLabel}
                      {"  "}
                      <span className={classes.timebox}>
                        [
                        {moment.tz(shipment.dropoff_earliest_ts, moment.tz.guess()).format("h:mm a z")}
                        -
                        {moment.tz(shipment.dropoff_latest_ts, moment.tz.guess()).format("h:mm a z")}
                        ]
                      </span>
                    </div>
                    <div className={classes.customerName}>{customer_name}</div>
                  </div>
                  <div className={classes.right}>
                    <div>{street}</div>
                    <div>{city}</div>
                  </div>
                </div>
              </div>
            </ListItem>
          );
        })}
    </List>
  );
}
