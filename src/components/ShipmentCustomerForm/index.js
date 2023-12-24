import React, { Component } from 'react';
import styles from './styles';

import { AxlInput, AxlPanel, AxlReselect, AxlDateInput, AxlCheckbox, AxlButton } from 'axl-reactjs-ui';
import {inject, observer} from "mobx-react";

@inject('shipmentStore')
@observer
export default class ShipmentCustomerForm extends Component {
  save = (e) => {
    const {shipmentStore, shipment, closeForm} = this.props;
    shipmentStore.updateShipmentCustomer(shipment, () => {
      closeForm();
    });
  };

  render() {
    const { shipment, dropoff, shipmentStore } = this.props;
    const {shipmentCustomerForm} = shipmentStore;

    const { customer } = shipment;

    return <div style={styles.Container}>
      <div style={styles.HeaderTitle}>{`Edit Customer`}</div>
      <AxlPanel>
        <AxlPanel.Row>
          <AxlPanel.Col style={styles.GroupPanel}>
            <div style={styles.GroupField}>
              <div style={styles.Field}><AxlInput value={shipmentCustomerForm.getField('name', '')} onChange={shipmentCustomerForm.handlerInput} placeholder={`Name`} name={`name`} type={`text`} fluid /></div>
              <div style={styles.Field}><AxlInput value={shipmentCustomerForm.getField('email', '')}  onChange={shipmentCustomerForm.handlerInput} placeholder={`Email Address`} name={`email`} type={`email`} fluid /></div>
              <div style={styles.Field}><AxlInput value={shipmentCustomerForm.getField('phone_number', '')}  onChange={shipmentCustomerForm.handlerInput} placeholder={`Phone Number`} name={`phone_number`} type={`text`} fluid /></div>
            </div>
          </AxlPanel.Col>
        </AxlPanel.Row>
        <AxlPanel.Row>
          <AxlPanel.Col></AxlPanel.Col>
          <AxlPanel.Col>
            <AxlPanel.Row align={`flex-end`}>
              <div style={{...styles.Field, ...styles.FieldButton}}><AxlButton compact bg={`gray`} onClick={this.props.closeForm} style={styles.buttonControl}>{`Cancel`}</AxlButton></div>
              <div style={{...styles.Field, ...styles.FieldButton}}><AxlButton compact bg={`pink`} onClick={this.save} style={styles.buttonControl}>{`Save`}</AxlButton></div>
            </AxlPanel.Row>
          </AxlPanel.Col>
        </AxlPanel.Row>
      </AxlPanel>
    </div>
  }
}
