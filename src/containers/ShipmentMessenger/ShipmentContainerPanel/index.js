import React from 'react';
import ShipmentDetailPanel from "../ShipmentDetailPanel";
import * as E from './styles';
import {AxlTabSimple} from 'axl-reactjs-ui';
import ChatBoxContainer from "../ShipmentSupportPanel/ChatBoxContainer";

export default class ShipmentContainerPanel extends React.Component {
  render() {
    const {onChangePanel} = this.props;

    return <E.Container>
      <E.BackButtonContainer>
        <E.BackButton onClick={() => onChangePanel('assignmentDetail')}>{`< Back to Assignment Details`}</E.BackButton>
      </E.BackButtonContainer>
      <E.Inner>
        <AxlTabSimple align={'flex-start'} items={[
          {title: 'SHIPMENT DETAILS', component: <ShipmentDetailPanel onRemoveShipment={this.props.onRemoveShipment} />},
          {title: 'CUSTOMER SUPPORT SHIPMENT CHAT', component: <ChatBoxContainer />},
        ]} />
      </E.Inner>
    </E.Container>;
  }
}