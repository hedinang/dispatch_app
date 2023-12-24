import React, { Component } from 'react';
import _ from 'lodash';
import { AxlPanel, AxlTabSimple } from 'axl-reactjs-ui';

import ShipmentHistoryList from '../ShipmentHistoryList';

import styles from './styles';
import AddressHistoryList from "../AddressHistoryList";
import {inject, observer} from "mobx-react";
import { EVENT_TEMPLATE_OWNERS, EVENT_TEMPLATE_TARGETS } from '../../constants/eventTemplate';
import { EventTemplates } from '../EventTemplates';
const { getShipmentEvent } = require("../../stores/api")

const getKey = (event) => (event.category || '') + '.' + (event.type || '') + '.' + (event.action || '');
const eventExcludes = ['ASSIGNMENT.PLANNING.request-redelivery', 'ASSIGNMENT.PLANNING.process-redelivery', 'ASSIGNMENT.PLANNING.add-redelivery'];
export default class ShipmentHistoryInfo extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { shipmentHistory = [], shipment } = this.props;

    return (
      <AxlPanel style={styles.panelContainer}>
        <AxlTabSimple disableRipple={true} titleStyle={{ textAlign: 'center', fontSize: '14px', minWidth: '100px' }} activedTab={0} items={[
          {title: 'Shipment History', component: <ShipmentHistoryTab shipment={shipment} shipmentHistory={shipmentHistory} />},
          {title: 'Billing History', component: <ShipmentBillingHistory shipment={shipment} shipmentHistory={shipmentHistory} />},
          {title: 'Address History', component: <AddressHistoryListContainer shipment={shipment} />},
        ]} />
      </AxlPanel>
    );
  }
}

@inject('shipmentStore')
class ShipmentHistoryTab extends Component {
  componentDidMount() {
    this.props.shipmentStore.getShipmentHistory();
  }

  render() {
    const { shipmentHistory = [], shipment } = this.props;
    const ignoreBillingEvents = Array.isArray(shipmentHistory) ? shipmentHistory.filter((event) => event.type !== 'BILLING') : [];

    return (
      <AxlPanel.Row style={styles.panelContent}>
        <AxlPanel.Col flex={1}>
          <EventTemplates 
            getEventList={getShipmentEvent} 
            historyId= {shipment.id} 
            canSearch={false} 
            targets={[EVENT_TEMPLATE_TARGETS.DISPATCHER_APP]}
            owners={[EVENT_TEMPLATE_OWNERS.SHIPMENT, EVENT_TEMPLATE_OWNERS.ASSIGNMENT]}
            filterEvent={(e) => !eventExcludes.includes(getKey(e))}
            isReverse={false}
          />
        </AxlPanel.Col>
      </AxlPanel.Row>
    );
  }
}

@inject('shipmentStore')
class ShipmentBillingHistory extends Component {
  componentDidMount() {
    this.props.shipmentStore.getShipmentHistory();
  };

  render() {
    const { shipmentHistory = [], shipment } = this.props;
    const billingEventsHistory = Array.isArray(shipmentHistory) ? shipmentHistory.filter((event) => event.type === 'BILLING') : [];

    return (
      <AxlPanel.Row style={styles.panelContent}>
        <AxlPanel.Col flex={1}>
          <ShipmentHistoryList shipment={shipment} shipmentHistory={billingEventsHistory} />
        </AxlPanel.Col>
      </AxlPanel.Row>
    );
  }
}

@inject('messengerStore')
@observer
class AddressHistoryListContainer extends Component {

  componentDidMount() {
    const {messengerStore, shipment} = this.props;
    if(shipment && shipment.dropoff_address) {
      const q = `${_.get(shipment, 'dropoff_address.street', '')} ${_.get(shipment, 'dropoff_address.city', '')} ${_.get(shipment, 'dropoff_address.state', '')} ${_.get(shipment, 'dropoff_address.zipcode', '')}`;
      messengerStore.addressSearchFilter = {
        "from": 0,
        "size": 10,
        "q": q,
        "filters": {},
        "sorts": [
          "-dropoff_earliest_ts"
        ]
      };
      messengerStore.searchAddress();
    }
  }

  render() {
    const {messengerStore} = this.props;
    const {addressSearchResults} = messengerStore;

    return <AddressHistoryList results={addressSearchResults} />;
  }
}
