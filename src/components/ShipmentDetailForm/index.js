import React, { Component } from 'react';
import styles from './styles';

import { AxlInput, AxlPanel, AxlReselect, AxlDateInput, AxlCheckbox, AxlButton } from 'axl-reactjs-ui';
import {inject, observer} from "mobx-react";

@inject('shipmentStore')
@observer
export default class ShipmentDetailForm extends Component {
  render() {
    const { shipment, dropoff, shipmentStore } = this.props;
    const {customer} = shipment;
    const {dropoffStopForm} = shipmentStore;

    const stopStatuses = [
      { label: 'PENDING', value: "PENDING" },
      { label: 'SUCCEEDED', value: "SUCCEEDED" },
      { label: 'FAILED', value: "FAILED" },
      { label: 'REATTEMPT', value: "REATTEMPT" },
    ];

    const dropoffTimeOptions = {
      dateFormat: 'MMM DD, Y HH:mm:ss',
      placeHolder: 'Dropoff Time',
      enableTime: false,
      altInput: true,
      clickOpens: true,
      defaultValue: dropoffStopForm.data.actual_departure_ts ? dropoffStopForm.data.actual_departure_ts : null
    };

    const datePicker1 = {
      dateFormat: 'MMM DD, Y',
      placeHolder: 'Dropoff Time',
      enableTime: false,
      altInput: true,
      clickOpens: true,
    };


    const datePicker2 = {
      dateFormat: 'MMM DD, Y',
      placeHolder: 'Earliest Pickup',
      enableTime: false,
      altInput: true,
      clickOpens: true,
      defaultValue: shipment.pickup_earliest_ts
    }
    const datePicker3 = {
      dateFormat: 'MMM DD, Y',
      placeHolder: 'Latest Pickup',
      enableTime: false,
      altInput: true,
      clickOpens: true,
      defaultValue: shipment.pickup_latest_ts
    }
    const datePicker4 = {
      dateFormat: 'MMM DD, Y',
      placeHolder: 'Earliest Dropoff',
      enableTime: false,
      altInput: true,
      clickOpens: true,
      defaultValue: shipment.dropoff_earliest_ts
    }
    const datePicker5 = {
      dateFormat: 'MMM DD, Y',
      placeHolder: 'Latest Dropoff',
      enableTime: false,
      altInput: true,
      clickOpens: true,
      defaultValue: shipment.dropoff_latest_ts
    };

    const dropoffStatus = dropoffStopForm.data.status ?
      {label: dropoffStopForm.data.status, value: dropoffStopForm.data.status} : null;

    return <div style={styles.Container}>
      <div style={styles.HeaderTitle}>{`Edit Shipment Details`}</div>
      <AxlPanel>
        <AxlPanel.Row>
          <AxlPanel.Col style={styles.GroupPanel}>
            <div style={styles.Title}>{`CUSTOMER INFORMATION`}</div>
            <div style={styles.GroupField}>
              <div style={styles.Field}><AxlInput value={ customer.name } placeholder={`Name`} name={`customer_name`} type={`text`} fluid /></div>
              <div style={styles.Field}><AxlInput value={ customer.email } placeholder={`Email Address`} name={`email`} type={`email`} fluid /></div>
              <div style={styles.Field}><AxlInput value={ customer.phone_number } placeholder={`Phone Number`} name={`phone`} type={`text`} fluid /></div>
            </div>
          </AxlPanel.Col>
          <AxlPanel.Col style={styles.GroupPanel}>
            <div style={styles.Title}>{`STOP INFORMATION`}</div>
            <div style={styles.GroupField}>
              <div style={styles.Field}><AxlReselect value={
                dropoffStatus
              } placeholder="Dropoff Status" onChange={dropoffStopForm.handlerReactSelect("status")} options={stopStatuses} theme={`main`} /></div>
              <div style={styles.Field}><AxlInput onChange={dropoffStopForm.handlerInput} name='remark' value={dropoffStopForm.getField('remark', '')} placeholder={`Dropoff Remark`} type={`text`} fluid /></div>
              <div style={styles.Field}><AxlDateInput onChange={dropoffStopForm.handlerDateInput('actual_departure_ts')} displayToday={false} options={dropoffTimeOptions} theme={`main`} /></div>
            </div>
          </AxlPanel.Col>
        </AxlPanel.Row>
        <AxlPanel.Row>
          <AxlPanel.Col style={styles.GroupPanel}>
            <div style={styles.Title}>{`PICKUP INFORMATION`}</div>
            <div style={styles.GroupTitle}>{`TIME WINDOW`}</div>
            <div style={styles.GroupField}>
              <AxlPanel.Row align={`center`}>
                <AxlPanel.Col><div style={styles.Field}><AxlDateInput options={datePicker2} theme={`main`} /></div></AxlPanel.Col>
                <AxlPanel.Col flex={0}><div style={{...styles.Field, ...styles.labelHours}}>{`< 0.0 HOURS >`}</div></AxlPanel.Col>
                <AxlPanel.Col><div style={styles.Field}><AxlDateInput options={datePicker3} theme={`main`} /></div></AxlPanel.Col>
              </AxlPanel.Row>
            </div>
          </AxlPanel.Col>
          <AxlPanel.Col style={styles.GroupPanel}>
            <div style={styles.Title}>{`DROPOFF INFORMATION`}</div>
            <div style={styles.GroupTitle}>{`TIME WINDOW`}</div>
            <div style={styles.GroupField}>
              <AxlPanel.Row align={`center`}>
                <AxlPanel.Col><div style={styles.Field}><AxlDateInput options={datePicker4} theme={`main`} /></div></AxlPanel.Col>
                <AxlPanel.Col flex={0}><div style={{...styles.Field, ...styles.labelHours}}>{`< 0.0 HOURS >`}</div></AxlPanel.Col>
                <AxlPanel.Col><div style={styles.Field}><AxlDateInput options={datePicker5} theme={`main`} /></div></AxlPanel.Col>
              </AxlPanel.Row>
            </div>
          </AxlPanel.Col>
        </AxlPanel.Row>
        <AxlPanel.Row>
          <AxlPanel.Col>
            <div style={styles.GroupTitle}>{`ADDRESS`}</div>
            <div style={styles.GroupField}>
              <div style={styles.Field}><AxlInput value={shipment.pickup_address.address} placeholder={`Address Line 1`} name={`pickup_address_1`} type={`text`} fluid /></div>
              <div style={styles.Field}><AxlInput value={shipment.pickup_address.address2} placeholder={`Address Line 2`} name={`pickup_address_2`} type={`text`} fluid /></div>
              <AxlPanel.Row>
                <AxlPanel.Col><div style={styles.Field}><AxlInput value={shipment.pickup_address.city} placeholder={`City`} name={`pickup_city`} type={`text`} fluid /></div></AxlPanel.Col>
                <AxlPanel.Col><div style={styles.Field}><AxlInput value={shipment.pickup_address.state} placeholder={`State`} name={`pickup_state`} type={`text`} fluid /></div></AxlPanel.Col>
                <AxlPanel.Col><div style={styles.Field}><AxlInput value={shipment.pickup_address.zipcode} placeholder={`Zipcode`} name={`pickup_zipcode`} type={`text`} fluid /></div></AxlPanel.Col>
              </AxlPanel.Row>
            </div>
          </AxlPanel.Col>
          <AxlPanel.Col>
            <div style={styles.GroupTitle}>{`ADDRESS`}</div>
            <div style={styles.GroupField}>
              <div style={styles.Field}><AxlInput value={shipment.dropoff_address.address2} placeholder={`Address Line 1`} name={`dropoff_address_1`} type={`text`} fluid /></div>
              <div style={styles.Field}><AxlInput value={shipment.dropoff_address.address2} placeholder={`Address Line 2`} name={`dropoff_address_2`} type={`text`} fluid /></div>
              <AxlPanel.Row>
                <AxlPanel.Col><div style={styles.Field}><AxlInput value={shipment.dropoff_address.city} placeholder={`City`} name={`dropoff_city`} type={`text`} fluid /></div></AxlPanel.Col>
                <AxlPanel.Col><div style={styles.Field}><AxlInput value={shipment.dropoff_address.state} placeholder={`State`} name={`dropoff_state`} type={`text`} fluid /></div></AxlPanel.Col>
                <AxlPanel.Col><div style={styles.Field}><AxlInput value={shipment.dropoff_address.zipcode} placeholder={`Zipcode`} name={`dropoff_zipcode`} type={`text`} fluid /></div></AxlPanel.Col>
              </AxlPanel.Row>
            </div>
          </AxlPanel.Col>
        </AxlPanel.Row>
        <AxlPanel.Row>
          <AxlPanel.Col>
            <div style={styles.GroupTitle}>{`NOTES`}</div>
            <div style={styles.Field}><AxlInput value={shipment.pickup_note} placeholder={`Pickup Notes`} name={`pickup_notes`} type={`text`} fluid /></div>
          </AxlPanel.Col>
          <AxlPanel.Col>
            <div style={styles.GroupTitle}>{`NOTES`}</div>
            <div style={styles.Field}><AxlInput value={shipment.dropoff_note} placeholder={`Dropoff Notes`} name={`dropoff_notes`} type={`text`} fluid /></div>
          </AxlPanel.Col>
        </AxlPanel.Row>
        <AxlPanel.Row>
          <AxlPanel.Col>
            <div style={styles.GroupTitle}>{`DELIVERY ITEMS`}</div>
            <div style={styles.Field}><AxlInput value={shipment.delivery_items} placeholder={`Items`} name={`delivery_items`} type={`text`} fluid /></div>
          </AxlPanel.Col>
          <AxlPanel.Col>
            <div style={styles.GroupTitle}>{`Check the required services`.toUpperCase()}</div>
            <div style={styles.GroupField}>
              <AxlPanel.Row>
                <AxlPanel.Col><div style={styles.Field}><AxlCheckbox value={shipment.delivery_proof_photo_required}>{`Photo POD`}</AxlCheckbox></div></AxlPanel.Col>
                <AxlPanel.Col><div style={styles.Field}><AxlCheckbox value={shipment.signature_required}>{`Signature`}</AxlCheckbox></div></AxlPanel.Col>
                <AxlPanel.Col><div style={styles.Field}><AxlCheckbox value={shipment.id_required}>{`Text Enabled`}</AxlCheckbox></div></AxlPanel.Col>
              </AxlPanel.Row>
            </div>
          </AxlPanel.Col>
        </AxlPanel.Row>
        <AxlPanel.Row>
          <AxlPanel.Col></AxlPanel.Col>
          <AxlPanel.Col>
            <AxlPanel.Row align={`flex-end`}>
              <div style={{...styles.Field, ...styles.FieldButton}}><AxlButton compact bg={`gray`} onClick={this.props.onCancel} style={styles.buttonControl}>{`Cancel`}</AxlButton></div>
              <div style={{...styles.Field, ...styles.FieldButton}}><AxlButton compact bg={`pink`} onClick={() => shipmentStore.updateDropoffStop(dropoff)} style={styles.buttonControl}>{`Save`}</AxlButton></div>
            </AxlPanel.Row>
          </AxlPanel.Col>
        </AxlPanel.Row>
      </AxlPanel>
    </div>
  }
}
