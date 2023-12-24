import React, { Component } from 'react';
import styles from './styles';

import { AxlInput, AxlPanel, AxlReselect, AxlDateInput, AxlCheckbox, AxlButton } from 'axl-reactjs-ui';
import {inject, observer} from "mobx-react";

@inject('shipmentStore')
@observer
export default class ShipmentPickupForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  save = (e) => {
    const {shipmentStore, shipment, pickup, closeForm} = this.props;
    shipmentStore.updateShipmentPickup(shipment, pickup, () => {
      closeForm()
    }, (error) => {
      this.setState({error: error.message})
    });
  };

  render() {
    const { shipmentStore } = this.props;
    const { shipmentPickupForm, updatingShipmentPickup } = shipmentStore;
    return <div style={styles.Container}>
      <AxlPanel>
        <AxlPanel.Row>
          <AxlPanel.Col style={styles.GroupPanel}>
            <div style={styles.GroupField}>
              <AxlPanel.Row align={`center`}>
                <AxlPanel.Col>
                  <div style={styles.GroupField}>
                    <div style={styles.GroupTitle}>{`Address Line 1`}</div>
                    <div style={styles.Field}><AxlInput value={shipmentPickupForm.getField('address.street', '')} onChange={shipmentPickupForm.handlerInput} placeholder={`Address Line 1`} name={`address.street`} type={`text`} fluid /></div>
                    <div style={styles.GroupTitle}>{`Address Line 2`}</div>
                    <div style={styles.Field}><AxlInput value={shipmentPickupForm.getField('address.street2', '')} onChange={shipmentPickupForm.handlerInput} placeholder={`Address Line 2`} name={`address.street2`} type={`text`} fluid /></div>
                    <AxlPanel.Row>
                      <AxlPanel.Col>
                        <div style={styles.GroupTitle}>{`City`}</div>
                        <div style={styles.Field}><AxlInput value={shipmentPickupForm.getField('address.city', '')} onChange={shipmentPickupForm.handlerInput} placeholder={`City`} name={`address.city`} type={`text`} fluid /></div>
                      </AxlPanel.Col>
                      <AxlPanel.Col>
                        <div style={styles.GroupTitle}>{`State`}</div>
                        <div style={styles.Field}><AxlInput value={shipmentPickupForm.getField('address.state', '')} onChange={shipmentPickupForm.handlerInput} placeholder={`State`} name={`address.state`} type={`text`} fluid /></div>
                      </AxlPanel.Col>
                      <AxlPanel.Col>
                        <div style={styles.GroupTitle}>{`Zipcode`}</div>
                        <div style={styles.Field}><AxlInput value={shipmentPickupForm.getField('address.zipcode', '')} onChange={shipmentPickupForm.handlerInput} placeholder={`Zipcode`} name={`address.zipcode`} type={`text`} fluid /></div>
                      </AxlPanel.Col>
                    </AxlPanel.Row>
                    {/*<div style={styles.GroupTitle}>{`Remark`}</div>*/}
                    {/*<div style={styles.Field}><AxlInput value={pickupStopForm.getField('remark', '')} onChange={pickupStopForm.handlerInput} placeholder={`Remark`} name={`remark`} type={`text`} fluid /></div>*/}
                    {/*<div style={styles.GroupTitle}>{`Actual Departure`}</div>*/}
                    {/*<div style={styles.Field}><AxlDateInput onChange={dropoffStopForm.handlerDateInput('actual_departure_ts')} displayToday={false} options={datePicker1} theme={`main`} /></div>*/}
                    <div style={styles.GroupTitle}>{`Pickup Notes`}</div>
                    <div style={styles.Field}><AxlInput value={shipmentPickupForm.getField('note', '')} onChange={shipmentPickupForm.handlerInput} placeholder={`Pickup Notes`} name={`note`} type={`text`} fluid /></div>
                  </div>
                </AxlPanel.Col>
              </AxlPanel.Row>
            </div>
          </AxlPanel.Col>
        </AxlPanel.Row>
        {this.state.error && <ul style={styles.listError}>
          <li style={styles.errorText}>{this.state.error}</li>
        </ul>}
        <AxlPanel.Row>
          <AxlPanel.Col>
            <AxlPanel.Row align={`flex-end`}>
              <div style={{...styles.Field, ...styles.FieldButton}}><AxlButton compact bg={`gray`} onClick={this.props.closeForm} style={styles.buttonControl}>{`Cancel`}</AxlButton></div>
              <div style={{...styles.Field, ...styles.FieldButton}}><AxlButton loading={updatingShipmentPickup} compact bg={`pink`} onClick={this.save} style={styles.buttonControl}>{`Save`}</AxlButton></div>
            </AxlPanel.Row>
          </AxlPanel.Col>
        </AxlPanel.Row>
      </AxlPanel>
    </div>
  }
}
