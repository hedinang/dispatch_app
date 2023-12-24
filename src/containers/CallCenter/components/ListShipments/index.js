import React from 'react';
import styles, * as E from "./styles";
import moment from "moment";

export default class ListShipments extends React.Component {
  render() {
    const { history, shipments } = this.props;

    if(!shipments) return null;

    return <E.Container>
      {(shipments && shipments[0] && shipments[0].shipment) && <E.CustomerContainer>
        <div><E.Label_1>{`Customer name:`}</E.Label_1></div>
        <div><E.Text_1>{shipments[0].shipment.customer.name}</E.Text_1></div>
        <div><E.Label_1>{`Customer email:`}</E.Label_1></div>
        <div><E.Text_1>{shipments[0].shipment.customer.email}</E.Text_1></div>
        <div><E.Label_1>{`Customer phone number:`}</E.Label_1></div>
        <div><E.Text_1>{shipments[0].shipment.customer.phone_number}</E.Text_1></div>
      </E.CustomerContainer>}
      <E.HR />
      <E.Inner>
        {shipments.map(({shipment, label, dropoff, pod, client, doc}, i) => <E.Item key={i}
          onClick={() => history.push(`/routes/${moment(shipment.dropoff_earliest_ts).format('YYYY-MM-DD')}/all/all/${shipment.assignment_id}/stops/${dropoff.id}`)}>
          <E.Row>
            <E.ShipmentContainer>
              <div><E.Label>{`Region: `}</E.Label><E.Text>{shipment.region_code}</E.Text></div>
              <div><E.Label>{`Service Level: `}</E.Label><E.Text>{shipment.service_level}</E.Text></div>
              <div><E.Label>{`ID: `}</E.Label><E.Text>{shipment.id}</E.Text></div>
              {(label && label.driver_label) && <div><E.Label>{`Label: `}</E.Label><E.Text>{label.driver_label}</E.Text></div>}
              <div><E.Label>{`Internal ID: `}</E.Label><E.Text>{shipment.internal_id}</E.Text></div>
              <div><E.Label>{`Status: `}</E.Label><E.Text>{shipment.status}</E.Text></div>
            </E.ShipmentContainer>

            <E.AvatarContainer>
              <E.Avatar src={client.logo_url} width={75} />
            </E.AvatarContainer>

            <E.AddressContainer>
              <div><E.Label>{`Pickup address`}</E.Label></div>
              <div><E.Text>{`${shipment.pickup_address.city}, ${shipment.pickup_address.state.toUpperCase()}, ${shipment.pickup_address.zipcode}`}</E.Text></div>
              <div><E.Label>{`Dropoff address`}</E.Label></div>
              <div><E.Text>{`${shipment.dropoff_address.city}, ${shipment.dropoff_address.state.toUpperCase()}, ${shipment.dropoff_address.zipcode}`}</E.Text></div>
            </E.AddressContainer>

            <E.AddressContainer>
              <div><E.Label>{`Dropoff earliest time`}</E.Label></div>
              <div><E.Text>{moment(shipment.dropoff_earliest_ts).format('MM/DD/YYYY')}</E.Text></div>
              <div><E.Label>{`Dropoff latest time`}</E.Label></div>
              <div><E.Text>{moment(shipment.dropoff_earliest_ts).format('MM/DD/YYYY')}</E.Text></div>
            </E.AddressContainer>
          </E.Row>
        </E.Item>)}
      </E.Inner>
    </E.Container>;
  }
}