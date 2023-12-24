import React, { Component } from 'react';
import moment from 'moment';
import { AxlPanel } from 'axl-reactjs-ui';

// Utils

// Styles
import styles from './styles';

export default class ShipmentPickupInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showPanel: this.props.isOpen
    }
  }

  render() {
    const { item, isEdit } = this.props;
    const { pickup, dropoff, shipment } = this.props;
    const COMPLETED = ['SUCCEEDED', 'FAILED'];
    const pickupStatus = (pickup && pickup.status) ? pickup.status : null
    const statusColor = pickupStatus ? styles.Status[pickupStatus] : styles.Status['DEFAULT'];
    const dtFormat = moment(shipment.dropoff_latest_ts).isBefore(moment()) ? 'MM/DD hh:mm A' : 'hh:mm A'

    return  <AxlPanel style={styles.panelContainer}>
      <div style={styles.panelHeader}>
        <div style={styles.panelHeaderTitle}>{`Pickup Info:`}</div>
        <div style={styles.panelHeaderRight}>
          <div style={styles.panelHeaderArrow} onClick={() => this.setState({showPanel: !this.state.showPanel})}><i className={!this.state.showPanel ? 'fa fa-angle-down' : 'fa fa-angle-up'} /></div>
        </div>
      </div>
      {this.state.showPanel && <AxlPanel.Row style={styles.panelContent}>
        <AxlPanel.Col flex={1}>
          <AxlPanel.Row style={styles.row}>
            <AxlPanel.Col>
              <div style={styles.text}>{shipment.pickup_address.street}</div>
              <div style={styles.text}>{shipment.pickup_address.street2}</div>
              <div style={styles.text}>{shipment.pickup_address.city}, {shipment.pickup_address.state} {shipment.pickup_address.zipcode}</div>
            </AxlPanel.Col>
            { shipment.pickup_note && <AxlPanel.Col>
              <div style={styles.noteLabel}>{`NOTES`}</div>
              <div style={styles.noteContent}>{shipment.pickup_note}</div>
            </AxlPanel.Col>}
          </AxlPanel.Row>
        </AxlPanel.Col>
      </AxlPanel.Row>}
    </AxlPanel>
  }
}
