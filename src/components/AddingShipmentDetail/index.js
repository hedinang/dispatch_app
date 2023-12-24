import React from 'react';

import { Box } from '@material-ui/core';
import { AxlButton, AxlInput, AxlPopConfirm } from 'axl-reactjs-ui';
import { inject, observer } from "mobx-react";
import { withRouter } from 'react-router-dom';

import ShipmentDropoffInfo from "./components/ShipmentDropoffInfo";
import ShipmentPickupInfo from "./components/ShipmentPickupInfo";

import styles, * as E from './styles';

const PICKUP_WARNING ="This route was PICKED UP by driver. Please confirm if you still want to add a new box to this route! Driver must come back to the warehouse to take that box";
const DROPOFF_WARNING ="This route already had successful dropoffs. Please be careful because driver must come back to the warehouse to pick up added box.";
@inject('assignmentStore', 'shipmentStore')
@observer
class AddingShipmentDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      shipmentId: ''
    };
  }

  changeShipmentId = (e) => {
    const {shipmentStore} = this.props;
    shipmentStore.getSetPreviewShipmentId(e.target.value);
  };

  getShipment = (e) => {
    const { shipmentStore } = this.props;
    if (!shipmentStore.previewShipmentId) return;

    shipmentStore.getPreviewShipment(shipmentStore.previewShipmentId);
  };


  addShipment = (e) => {
    const {assignmentStore, shipmentStore, history} = this.props;
    const {selectedAssignment} = assignmentStore;
    const {previewShipment, previewShipmentId} = shipmentStore;

    const {addingShipment} = this.props.assignmentStore;
    if (!selectedAssignment || !previewShipment || addingShipment) return;
    assignmentStore.addShipment(selectedAssignment.assignment, previewShipment.id, true, (stops) => {
      shipmentStore.getSetPreviewShipmentId('');
      shipmentStore.cancelPreviewShipment();
      shipmentStore.loadShipment(previewShipment.shipmentId);
      assignmentStore.refreshAssignment(selectedAssignment.assignment.id)
      // assignmentStore.loadAssignments();
      // shipmentStore.selectStop(stops[0]);
      // history.push(`${history.location.pathname}/stops/${stops[1].id}`)
    });
  };

  cancelAddShipment = (e) => {
    this.props.shipmentStore.getSetPreviewShipmentId('');
    this.props.shipmentStore.cancelPreviewShipment()
  };

  closeAddShipmentForm = (e) => {
    this.props.shipmentStore.getSetPreviewShipmentId('');
    this.props.shipmentStore.cancelPreviewShipment();
    if (this.props.closeMe) {
      this.props.closeMe();
    }
  };

  componentWillUnmount() {
    // reset
    this.props.shipmentStore.previewShipment = null;
  }

  renderConfirmButton(previewShipment) {
    const {addingShipment, selectedAssignment} = this.props.assignmentStore;

    const shipmentStatus = previewShipment.status ? previewShipment.status : 'PENDING';
    const shipmentInboundStatus = previewShipment.inbound_status ? previewShipment.inbound_status : 'UN_SCANNED';

    if (['MISSING', 'RECEIVED_DAMAGED'].includes(shipmentInboundStatus)) {
      return
    }

    if (selectedAssignment && selectedAssignment.assignment && "COMPLETED" === selectedAssignment.assignment.status || (selectedAssignment.assignment.region_code !== previewShipment.region_code)) {
      return <AxlButton compact style={styles.control} bg={`bluish`} disabled>{`CONFIRM`}</AxlButton>;
    }

    if (previewShipment.assignment_id && ['DROPOFF_SUCCEEDED', 'PICKUP_SUCCEEDED', 'UNDELIVERABLE', 'UNSERVICEABLE', 'DISPOSABLE', 'INVALID_ADDRESS'].includes(shipmentStatus) ) {
      return <AxlButton compact style={styles.control} bg={`bluish`} disabled>{`CONFIRM`}</AxlButton>;
    }

    //warning picked up and not dropoff
    if (selectedAssignment && selectedAssignment.pickupSucceed > 0) {
      let text = PICKUP_WARNING;
      if(selectedAssignment.dropoffSucceed > 0) {
        text = DROPOFF_WARNING;
      }
      return <AxlPopConfirm
        trigger={<AxlButton loading={addingShipment} compact style={styles.control} bg={`red2`}>{`ADD REDELIVERY`}</AxlButton>}
        titleFormat={<div>{`Route was picked up`}</div>}
        textFormat={<div style={{color: '#fc0000'}}>{text}</div>}
        okText={`CONFIRM`}
        onOk={this.addShipment}
        cancelText={`CANCEL`}
        onCancel={() => console.log('onCancel')} />;

    }

    if(!previewShipment.assignment_id || (previewShipment.assignment_id && ['DROPOFF_FAILED', 'PICKUP_FAILED', 'RETURN_SUCCEEDED'].includes(shipmentStatus))) {
      return <AxlButton loading={addingShipment} onClick={this.addShipment} compact style={styles.control} bg={`bluish`} disabled={addingShipment}>{`ADD REDELIVERY`}</AxlButton>;
    }

    if (previewShipment.assignment_id && ['PENDING', 'GEOCODED', 'CREATED', 'ASSIGNED', 'RESCHEDULED'].includes(shipmentStatus)) {
      return <AxlPopConfirm
        trigger={<AxlButton loading={addingShipment} compact style={styles.control} bg={`red`}>{`MOVE SHIPMENT`}</AxlButton>}
        titleFormat={<div>{`Move Stop`}</div>}
        textFormat={<div>Please confirm you want to move this stop to this route!<br /><strong style={{color: '#422'}}>It will be removed from other route!</strong></div>}
        okText={`CONFIRM`}
        onOk={this.addShipment}
        cancelText={`CANCEL`}
        onCancel={() => console.log('onCancel')} />
    }
  }

  render() {
    const {loadingPreviewShipment, previewShipment, previewShipmentId, previewShipmentError} = this.props.shipmentStore;
    const { selectedAssignment } = this.props.assignmentStore;
    const shipmentStatus = previewShipment && previewShipment.status ? previewShipment.status : 'PENDING';
    const statusColor = shipmentStatus ? styles.Status[shipmentStatus] : styles.Status['DEFAULT'];
    const isPickedUp = selectedAssignment && selectedAssignment.assignment.status !=="COMPLETED" && selectedAssignment.pickupSucceed > 0 && selectedAssignment.dropoffSucceed === 0;
    const isDropoffSucceed = selectedAssignment && selectedAssignment.dropoffSucceed > 0;

    const { assignment, shipments, maxBox, maxVolumic } = selectedAssignment;
    const assignmentVolumic = assignment && assignment.volumic;
    const shipmentVolumic = (previewShipment && previewShipment.volumic) || 1;
    const isOverMaxBox = maxBox && Array.isArray(shipments) && shipments.length >= maxBox;
    const isOverVolumic = assignmentVolumic && maxVolumic && (assignmentVolumic + shipmentVolumic) > maxVolumic;

    const isUnAvailable = isOverMaxBox || isOverVolumic;

    return <E.Container>
      <E.Inner>
        <E.Top>
          <AxlInput type={`text`} value={previewShipmentId} onChange={this.changeShipmentId} onEnter={this.getShipment}  placeholder={`Enter Shipment ID`} style={styles.search} />
          <AxlButton loading={loadingPreviewShipment} onClick={this.getShipment} compact style={styles.control}>{`LOAD`}</AxlButton>
          <AxlButton bg={`gray`} onClick={this.closeAddShipmentForm}  compact style={styles.cancel}>{`CANCEL`}</AxlButton>
        </E.Top>
        <Box overflow={"hidden auto"}>
          <E.WorkloadInformation>
            <span style={styles.assignmentLabel}>Assignment {assignment && assignment.label || ''} Details <code style={styles.assignmentId}>{assignment.id}</code></span>
            <span>Box Count: {assignment.shipment_count} / {maxBox || 'N/A'}</span>
            <span>Volumic: {assignment.volumic} / {maxVolumic || 'N/A'}</span>
          </E.WorkloadInformation>
          {previewShipmentError && <div style={{color: 'red'}}>
            {previewShipmentError}
          </div>}
          {selectedAssignment && selectedAssignment.assignment.status ==="COMPLETED" ? <E.WarningBox>
            We cannot add any box to COMPLETED route.
            </E.WarningBox> :
              isDropoffSucceed && <E.WarningBox>
              {DROPOFF_WARNING}
              </E.WarningBox>
            }
          {isPickedUp && <E.WarningBox>
            {PICKUP_WARNING}
            </E.WarningBox>}
          { previewShipment && previewShipment.id && <E.ShipmentDetailInfo>
            { previewShipment.inbound_status === 'MISSING' && <E.WarningBox>
              Missing shipments cannot be added for redelivery.
              Please use mobile warehouse app to remark shipment as RECEIVED_OK in order to add shipment for redelivery.
            </E.WarningBox> }
            { previewShipment.inbound_status === 'RECEIVED_DAMAGED' && <E.WarningBox>
              Damaged/Leaking shipments cannot be added for redelivery.
              Please use mobile warehouse app to remark shipment as <strong>RECEIVED_OK</strong> in order to add shipment for redelivery.
            </E.WarningBox> }
            { isUnAvailable && <E.WarningBox>
              Over max box/volumic. Please choose other routes in order to add shipment for redelivery.
            </E.WarningBox> }
            <E.StatusText style={{color: statusColor}}>
              <code>{previewShipment.id}</code> {previewShipment.status ? '@ ' + previewShipment.status : ''} {previewShipment.inbound_status ? '@ ' + previewShipment.inbound_status : 'UN_SCANNED'}
              <span> @ wl: {previewShipment.workload}</span>
            </E.StatusText>
            <E.ShipmentDetailPanel>
              <ShipmentPickupInfo pickup={previewShipment} dropoff={previewShipment} shipment={previewShipment} isEdit={false} />
              <ShipmentDropoffInfo pickup={previewShipment} dropoff={previewShipment} shipment={previewShipment} isEdit={false} isOpen />
            </E.ShipmentDetailPanel>
          </E.ShipmentDetailInfo> }
        </Box>
        { previewShipment && previewShipment.id && <E.Controls>
          <AxlButton onClick={this.cancelAddShipment} compact style={styles.control} bg={`gray`}>{`CANCEL`}</AxlButton>
          {this.renderConfirmButton(previewShipment)}
        </E.Controls> }
      </E.Inner>
    </E.Container>
  }
}

export default withRouter(AddingShipmentDetail);
