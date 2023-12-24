import React from 'react';
import moment from "moment";
import { AxlButton } from 'axl-reactjs-ui';
import {VERBIAGE} from "../../../../constants/verbiage";
import * as SHIPMENT_STATUS from "../../../../constants/shipmentStatus";
import {renderDeliveryTimeAndLabel, translateEvents} from "../../../../Utils/events";
import styles, * as E from './styles';

export default class DeliveryInfo extends React.Component {
  render() {
    const { shipment, events, client, assignment, stop, deliveryTimeAndLabel } = this.props;

    if(!shipment || !events || !client || !deliveryTimeAndLabel) return false;

    const viewInDispatch = `/routes` +
      (assignment ? `/${moment(assignment.predicted_end_ts).format('YYYY-MM-DD')}/all/all/${assignment.id}` : '') +
      ((assignment && stop) ? `/stops/${stop.id}` : '');

    return <E.Container>
      <E.ClientContainer>
        {client.logo_url && <E.ClientAvatarContainer>
          <E.ClientAvatar src={client.logo_url} width={50} />
        </E.ClientAvatarContainer>}
        <E.ClientInfo>
          <E.ClientName>{client.company}</E.ClientName>
          <E.TrackingContainer>
            <E.TrackingText>{`Tracking code: `}<E.TrackingCode href={`${process.env.REACT_APP_TRACKING_URL + '/' + shipment.tracking_code}`} target={`_blank`}>{shipment.tracking_code}</E.TrackingCode></E.TrackingText>
          </E.TrackingContainer>
        </E.ClientInfo>
        <AxlButton compact bg={`pink`}
          onClick={() => this.props.history.push(viewInDispatch)}>{`View in Dispatch`}</AxlButton>
      </E.ClientContainer>
      <E.HR />
      <E.InfoContainerRow>
        <E.InfoContainer flex>
          <E.Label>{`Customer name:`}</E.Label>
          <E.Text>{shipment.customer.name}</E.Text>
          <E.Label>{`Customer email:`}</E.Label>
          <E.Text>{shipment.customer.email}</E.Text>
          <E.Label>{`Customer phone number:`}</E.Label>
          <E.Text>{shipment.customer.phone_number}</E.Text>
        </E.InfoContainer>
        <E.InfoContainer flex>
          <E.Label>{deliveryTimeAndLabel.label}</E.Label>
          <E.Text>{deliveryTimeAndLabel.time}</E.Text>
          <E.Label>{`Delivered to:`}</E.Label>
          <E.Text>{`${shipment.dropoff_address.city}, ${shipment.dropoff_address.state.toUpperCase()}, ${shipment.dropoff_address.zipcode}`}</E.Text>
          {shipment.dropoff_note && <div>
            <E.Label>{`Left at/with:`}</E.Label>
            <E.Text>{shipment.dropoff_note}</E.Text>
          </div>}
        </E.InfoContainer>
      </E.InfoContainerRow>
      <E.HR />
      <E.InfoContainerRow>
        {assignment && <E.InfoContainer flex>
          <E.Label_1>{`Assignment Info`}</E.Label_1>
          <E.Label>{`ID: `}<E.Text inline>{assignment.id}</E.Text></E.Label>
          <E.Label>{`Label: `}<E.Text inline>{assignment.label}</E.Text></E.Label>
          <E.Label>{`Status: `}<E.Text inline>{assignment.status}</E.Text></E.Label>
        </E.InfoContainer>}
        {shipment && <E.InfoContainer flex>
          <E.Label_1>{`Shipment Info`}</E.Label_1>
          <E.Label>{`Id: `}<E.Text inline>{shipment.id}</E.Text></E.Label>
          <E.Label>{`Status: `}<E.Text inline>{shipment.status}</E.Text></E.Label>
        </E.InfoContainer>}
      </E.InfoContainerRow>
    </E.Container>
  }
}