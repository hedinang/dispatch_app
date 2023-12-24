import React, { Component } from 'react';
import { AxlInput, AxlDateInput, AxlButton } from 'axl-reactjs-ui';
import {inject, observer} from "mobx-react";
import {Box, Grid, Button, DialogActions, CircularProgress, Tooltip} from "@material-ui/core";

import styles from './styles';

@inject('shipmentStore', 'geocodeAddressListStore')
@observer
export default class ShipmentDropoffForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
      geocoding: false,
      geocodeErrorMsg: "",
    };
  }

  changeAddress = (e) => {
    const {shipmentDropoffForm} = this.props.shipmentStore;
    shipmentDropoffForm.handlerInput(e);
    shipmentDropoffForm.setField('address.lat', undefined);
    shipmentDropoffForm.setField('address.lng', undefined);
  }

  geocodeAddress = () => {
    const {shipmentStore, geocodeAddressListStore} = this.props;
    const {shipmentDropoffForm} = shipmentStore;
    const {address} = shipmentDropoffForm.data;

    this.setState({geocodeErrorMsg: '', geocoding: true});
    geocodeAddressListStore.geocode(address, res => {
      if (res.ok && res.data) {
        shipmentDropoffForm.setField('address.lat', res.data.latitude);
        shipmentDropoffForm.setField('address.lng', res.data.longitude);
      } else {
        shipmentDropoffForm.setField('address.lat', undefined);
        shipmentDropoffForm.setField('address.lng', undefined);
        this.setState({geocodeErrorMsg: res.data && res.data.message ? res.data.message : 'Geocode Error'});
      }
      this.setState({geocoding: false})
    })
  }

  save = (e) => {
    const {shipmentStore, shipment, dropoff, closeForm} = this.props;
    shipmentStore.updateShipmentDropoff(shipment, dropoff, () => {
      closeForm();
    }, (error) => {
      this.setState({error: error.message})
    });
  };

  render() {
    const { error, geocodeErrorMsg, geocoding } = this.state;
    const { shipment, dropoff, shipmentStore } = this.props;
    const { shipmentDropoffForm, updatingShipmentDropoff } = shipmentStore;

    const datePicker1 = {
      dateFormat: 'MMM DD, Y HH:mm:SS A',
      placeHolder: 'Earliest Dropoff',
      enableTime: true,
      altInput: true,
      clickOpens: true,
      defaultValue: shipment.dropoff_earliest_ts
    };
    const datePicker2 = {
      dateFormat: 'MMM DD, Y HH:mm:SS A',
      placeHolder: 'Latest Dropoff',
      enableTime: true,
      altInput: true,
      clickOpens: true,
      defaultValue: shipment.dropoff_latest_ts
    };
    const isCannotSave = !shipmentDropoffForm.getField('address.lat', '') || !shipmentDropoffForm.getField('address.lng', '')

    return <Box px={3} pb={1} style={styles.Container}>
      <div style={styles.HeaderTitle}>{`Edit Dropoff`}</div>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <div style={styles.GroupTitle}>{`Address Line 1 (house or building number and street name)`}</div>
          <div style={styles.Field}><AxlInput value={shipmentDropoffForm.getField('address.street', '')} onChange={this.changeAddress} placeholder={`Address Line 1`} name={`address.street`} type={`text`} fluid /></div>
        </Grid>
        <Grid item xs={12}>
          <div style={styles.GroupTitle}>{`Address Line 2 (unit or apartment information)`}</div>
          <div style={styles.Field}><AxlInput value={shipmentDropoffForm.getField('address.street2', '')} onChange={shipmentDropoffForm.handlerInput} placeholder={`Address Line 2`} name={`address.street2`} type={`text`} fluid /></div>
        </Grid>
        <Grid item md={6} lg={4}>
          <div style={styles.GroupTitle}>{`City`}</div>
          <div style={styles.Field}><AxlInput value={shipmentDropoffForm.getField('address.city', '')} onChange={this.changeAddress} placeholder={`City`} name={`address.city`} type={`text`} fluid /></div>
        </Grid>
        <Grid item md={3} lg={4}>
          <div style={styles.GroupTitle}>{`State`}</div>
          <div style={styles.Field}><AxlInput value={shipmentDropoffForm.getField('address.state', '')} onChange={this.changeAddress} placeholder={`State`} name={`address.state`} type={`text`} fluid /></div>
        </Grid>
        <Grid item md={3} lg={4}>
          <div style={styles.GroupTitle}>{`Zipcode`}</div>
          <div style={styles.Field}><AxlInput value={shipmentDropoffForm.getField('address.zipcode', '')} onChange={this.changeAddress} placeholder={`Zipcode`} name={`address.zipcode`} type={`text`} fluid /></div>
        </Grid>
        <Grid item xs={5}>
          <div style={styles.GroupTitle}>{`Latitude`}</div>
          <div style={styles.Field}>
            <AxlInput value={shipmentDropoffForm.getField('address.lat', '-')} disabled type={`text`} fluid />
          </div>
        </Grid>
        <Grid item xs={5}>
          <div style={styles.GroupTitle}>{`Longitude`}</div>
          <div style={styles.Field}>
            <AxlInput value={shipmentDropoffForm.getField('address.lng', '-')} disabled type={`text`} fluid />
          </div>
        </Grid>
        <Grid item xs={2}>
          <Box>
            <Box mb="10px" style={styles.errorText}>{geocodeErrorMsg || '-'}</Box>
            <Button onClick={this.geocodeAddress} disabled={geocoding} variant="contained" color="inherit" fullWidth disableElevation>
              {geocoding ? <CircularProgress color="primary" size={26} style={{marginRight: 5}} /> : "Geocode"}
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <div style={styles.GroupTitle}>{`Dropoff Notes`}</div>
          <div style={styles.Field}><AxlInput value={shipmentDropoffForm.getField('note', '')} onChange={shipmentDropoffForm.handlerInput} placeholder={`Dropoff Notes`} name={`note`} type={`text`} fluid /></div>
        </Grid>
        <Grid item xs={12}>
          <div style={styles.GroupTitle}>{`TIME WINDOW`}</div>
          <Grid container spacing={2}>
            <Grid item md={12} lg={6}>
              <div style={styles.Field}><AxlDateInput onChange={shipmentDropoffForm.handlerDateInput('dropoff_earliest_ts')} displayToday={false} options={datePicker1} theme={`main`} /></div>
            </Grid>
            <Grid item md={12} lg={6}>
              <div style={styles.Field}><AxlDateInput onChange={shipmentDropoffForm.handlerDateInput('dropoff_latest_ts')} displayToday={false} options={datePicker2} theme={`main`} /></div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {error && <Box mr="30px" align="right" style={styles.errorText}>{error}</Box>}
      <DialogActions>
        <div style={{...styles.Field, ...styles.FieldButton}}>
          <AxlButton compact bg={`gray`} onClick={this.props.closeForm} style={styles.buttonControl}>
            Cancel
          </AxlButton>
        </div>
        <Tooltip title="Address must be geocoded in order to save" disableHoverListener={!isCannotSave} disableTouchListener={!isCannotSave} placement="top">
          <div style={{...styles.Field, ...styles.FieldButton}}>
            <AxlButton disabled={isCannotSave} onClick={this.save} loading={updatingShipmentDropoff} compact bg={`pink`} style={styles.buttonControl}>
              Save
            </AxlButton>
          </div>
        </Tooltip>
      </DialogActions>
    </Box>
  }
}
