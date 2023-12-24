import React from 'react';
import styles, * as E from './styles';
import { AxlLoading } from 'axl-reactjs-ui';
import {inject, observer} from "mobx-react";
import DeliveryInfo from "./components/DeliveryInfo";
import ShipmentTimeline from "./components/ShipmentTimeline";
import ListShipments from "./components/ListShipments";
import DriverProfileInformation from "../../components/DriverProfileInformation";
import DriverProfileRoutingTabs from "../../components/DriverProfileRoutingTabs";
import CallCenterInfo from "./components/CallCenterInfo";
import {renderDeliveryTimeAndLabel, translateEvents} from "../../Utils/events";
import {VERBIAGE} from "../../constants/verbiage";
import * as SHIPMENT_STATUS from "../../constants/shipmentStatus";
import AssignmentInfo from "./components/AssignmentInfo";

@inject('shipmentStore', 'clientStore', 'driverStore', 'callCenterStore')
@observer
export default class CallCenterContainer extends React.Component {
  constructor(props) {
    super();
    // Defined
    this.DEFINED = {
      UNKNOWN_DRIVER: 1,
      UNKNOWN_RECIPIENT: 2,
      DRIVER: 8,
      RECIPIENT: 9
    }
    // Variables
    const search = window.location.search;
    const params = new URLSearchParams(search);
    this.state = {
      info: {},
      result: false,
      client: null,
      clients: [],
      drivers: [],
      shipment: null,
      shipmentEvents: [],
      splitSeparator: '|'
    };
    this.params = {
      'raw_call_from': params.get('call_from'),
      'call_from': this.formatPhoneNumber(params.get('call_from')),
      'call_to': params.get('call_to'),
      'external_id': params.get('call_session_id') || params.get('external_id'),
      'call_args': params.get('call_args')
    };
  }

  formatPhoneNumber(phoneNumber) {
    if(!phoneNumber) return;

    return phoneNumber.trim().replace(/[^0-9]/gi, '').slice(-10);
  }

  componentDidMount() {
    const that = this;
    const { splitSeparator } = this.state;
    const { shipmentStore, clientStore, driverStore, callCenterStore } = this.props;
    // Generate session
    callCenterStore.generateSession(this.params);
    // Check Driver / client or recipient incomming call
    const agrs = (this.params['call_args'] && this.params['call_args'].split(splitSeparator)) || [];

    if(parseInt(agrs[0]) === this.DEFINED.DRIVER) {
      // Driver incomming
      if(agrs[1]) {
        driverStore.get(parseInt(agrs[1]), res => {
          if(res.status === 200 || res.ok) {
            if(Array.isArray(res.data)) {
              this.setState({drivers: res.data});
            } else {
              this.setState({drivers: [res.data]});
            }
          }
        });
      } else if(this.params.call_from) {
        driverStore.driverSearch(this.params.call_from, (res) => {
          if(res.status === 200 || res.ok) {
            this.setState({drivers: res.data.drivers});
          }
        });
      }
    } else if(parseInt(agrs[0]) === this.DEFINED.UNKNOWN_DRIVER) {
      driverStore.driverSearch(this.params.call_from, (res) => {
        if(res.status === 200 || res.ok) {
          this.setState({drivers: res.data.drivers});
        }
      });
    } else if(parseInt(agrs[0]) === this.DEFINED.RECIPIENT) {
      // Check shipment id?
      if(parseInt(agrs[1])) {
        // Load shipment
        let shipmentId = agrs[1];
        if(process.env.REACT_APP_FIVE9_TEST_SHIPMENT_IDS) {
          if (agrs[1] === process.env.REACT_APP_FIVE9_TEST_SHIPMENT_IDS) {
            shipmentId = process.env.REACT_APP_FIVE9_REAL_SHIPMENT_IDS;
          }
        }
        shipmentStore.loadShipment(parseInt(shipmentId), (res) => {
          if(res.status === 200 || res.ok) {
            this.setState({shipment: res.data});
            if(res.data.client_id){
              clientStore.getClientsInfo([res.data.client_id], (res) => {
                this.setState({client: res.data[0]})
              })
            }
          }
        });
        // Load shipment outbound events
        shipmentStore.getShipmentOutboundEvents(parseInt(shipmentId), (res) => {
          if(res.status === 200 || res.ok) {
            this.setState({shipmentEvents: res.data})
          }
        });
      } else {
        // Load shipment by customer's phone
        if(this.params.call_from) {
          shipmentStore.filter.size = 5;
          shipmentStore.search(this.params.call_from);
        }
      }
    } else if(parseInt(agrs[0]) === this.DEFINED.UNKNOWN_RECIPIENT) {
      // Load shipment by customer's phone
      if(this.params.call_from) {
        shipmentStore.filter.size = 5;
        shipmentStore.search(this.params.call_from);
      }
    }
  }

  render() {
    const { client, drivers, shipment, shipmentEvents, splitSeparator } = this.state;

    const { history, shipmentStore } = this.props;
    const { selectedStop, selectedShipmentAssignment, shipmentSearchResult } = shipmentStore;
    const assignment = selectedShipmentAssignment && selectedShipmentAssignment.assignment || null;
    const stop = selectedStop || null;
    const agrs = (this.params['call_args'] && this.params['call_args'].split(splitSeparator)) || [];
    // milestone
    const translatedEvents = (shipmentEvents.length && translateEvents(shipmentEvents || [], shipment)) || null;
    const milestones = (translatedEvents && translatedEvents.filter(e => VERBIAGE[e.convertedSignal]).map(e => VERBIAGE[e.convertedSignal].milestone)) || null;
    const milestone = (milestones && (milestones[0] || SHIPMENT_STATUS.PROCESSING)) || null;

    if(parseInt(agrs[0]) === this.DEFINED.DRIVER || parseInt(agrs[0]) === this.DEFINED.UNKNOWN_DRIVER) {
      // Driver props
      let title = '';
      let subtitle = 'This driver calls from AxleHire Drive app';
      if(parseInt(agrs[0]) === this.DEFINED.DRIVER) {
        title = parseInt(agrs[1]) ? `Search for Exact Match by Driver ID: ${agrs[1] ? agrs[1] : 'No ID'}` : `Best Guess result by Call From Number ${this.params.call_from}`;
        if (parseInt(agrs[2])) {
            title += ` -- Assignment ID: ${parseInt(agrs[2])}`;
        }
      } else if(parseInt(agrs[0]) === this.DEFINED.UNKNOWN_DRIVER) {
        title = `Search for BEST GUESS by ${this.params.call_from}`;
        subtitle = `This ${parseInt(agrs[1]) === 1 ? 'SAME-DAY' : parseInt(agrs[1]) === 2 ? 'NEXT-DAY' : ''} driver does NOT call from AxleHire Drive app`;
      }
      const driverProps = {
        title: title,
        subtitle: subtitle,
        params: this.params
      };

      if(drivers.length) {
        return <E.DriverProfileContainer>
          <CallCenterInfo {...driverProps} />
          <DriverProfileInformation driver={drivers[0]} />
          <AssignmentInfo assignmentId={parseInt(agrs[2]) || null} />
          <DriverProfileRoutingTabs driver={drivers[0]} isShowAction={false} activeTab={2} />
        </E.DriverProfileContainer>;
      } else {
        return <E.Container>
          <CallCenterInfo {...driverProps} />
          <E.NoResult>{`No Result`}</E.NoResult>
        </E.Container>
      }
    } else if(parseInt(agrs[0]) === this.DEFINED.RECIPIENT || parseInt(agrs[0]) === this.DEFINED.UNKNOWN_RECIPIENT) {
      // Recipient props
      let title = '';
      let subtitle = 'This recipient calls from AxleHire recipient app';
      if(parseInt(agrs[0]) === this.DEFINED.RECIPIENT) {
        title = parseInt(agrs[1]) ? `Search for Exact Match by Shipment ID: ${agrs[1] ? agrs[1] : 'No ID'}` : `Best Guess result by Call From Number ${this.params.call_from}`;
      } else if(parseInt(agrs[0]) === this.DEFINED.UNKNOWN_RECIPIENT) {
        title = `Search for BEST GUESS by ${this.params.call_from}`;
        subtitle = 'This recipient does NOT from AxleHire recipient app'
      }
      const recipientProps = {
        title: title,
        subtitle: subtitle,
        milestone,
        params: this.params
      };

      if(client || (shipmentSearchResult.results && shipmentSearchResult.results.length)) {
        const deliveryTimeAndLabel = ((milestone && translatedEvents && shipment) && renderDeliveryTimeAndLabel(milestone, translatedEvents, shipment)) || null;
        const props = {
          history,
          client,
          stop,
          shipment,
          deliveryTimeAndLabel,
          params: this.params,
          events: shipmentEvents,
          assignment: assignment
        };
        const shipmentsProps = {
          history,
          params: this.params,
          shipments: shipmentSearchResult.results
        };

        return <E.Container>
          <CallCenterInfo {...recipientProps} />
          <DeliveryInfo {...props} />
          <ShipmentTimeline {...props} />
          <ListShipments {...shipmentsProps} />
        </E.Container>
      } else {
        return <E.Container>
          <CallCenterInfo {...recipientProps} />
          <E.NoResult>{`No Result`}</E.NoResult>
        </E.Container>;
      }
    } else {
      return <E.Container><E.NoResult>{`No Result`}</E.NoResult></E.Container>;
    }
  }
}