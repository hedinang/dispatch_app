import React from 'react';
import * as E from './styles';
import AssignmentMap from "../../../components/AssignmentMap";
import {AxlButton} from 'axl-reactjs-ui';
import _ from 'lodash';
import {inject, observer} from "mobx-react";
import {MAP_SHIPMENT_STATUS_TO_COLORS} from "../../../constants/colors";
import ShipmentInfo from "../../../components/ShipmentInfo";
import {saveAs} from "file-saver";
import {images} from "../../../constants/images";

@inject('messengerStore', 'shipmentStore')
@observer
export default class ShipmentDetailPanel extends React.Component {

  download = (format) => (e) => {
    const {shipmentStore} = this.props;
    const { selectedStop } = shipmentStore;
    const { shipment } = selectedStop;

    if (!shipment) return;

    shipmentStore.getLabel(shipment.id, format, (response) => {
      if (response.status === 200) {
        let contentType = 'text/plain';
        let fileName = `order-${shipment.id}-label.txt`;
        let blob;
        const data = response.data.label;
        if (format === 'PDF') {
          contentType = 'application/pdf';
          fileName = `order-${shipment.id}-label.pdf`;
          blob = this.b64toBlob(data, contentType);
        } else if (format === 'PNG') {
          contentType = 'image/png';
          fileName = `order-${shipment.id}-label.png`;
          blob = this.b64toBlob(data, contentType);
        } else {
          blob = new Blob([data], {type: "text/plain;charset=utf-8"});
        }

        saveAs(blob, fileName);
      }
    })
  };

  b64toBlob = (b64Data, contentType='', sliceSize=512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
  };

  copyTrackingCode(trackingCode) {
    const el = document.createElement('textarea');
    el.value = trackingCode;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  openTrackingLink(code) {
    window.open(`https://axlehi.re/${code}`, '_blank')
  }

  render() {
    const {
      messengerStore, shipmentStore
    }                                   = this.props;
    const {
      assignmentInfoInTopicSelected,
      stopSelected
    }                                   = messengerStore;
    const {
      selectedStop, selectedShipment
    }                                   = shipmentStore;
    // console.log(selectedStop)
    if(!selectedStop) return null;

    const {
      shipment, label, client,
      corresponding_stop
    }                                   = selectedStop;
    const {assignment, extra}           = assignmentInfoInTopicSelected || {};
    const {stops, shipmentLabels}       = assignmentInfoInTopicSelected || [];
    const mapLogisticToType             = {'NEXT_DAYS': 'Next-day', 'SAME_DAY': 'Same-day'};
    const statusColor                   = _.defaultTo(MAP_SHIPMENT_STATUS_TO_COLORS[_.get(assignment, 'status', null)], '#bebebe');
    const counter                       = assignment && assignment.shipment_count ? assignment.shipment_count : null;
    const completed_counter             = extra && extra.dropoff_status ? extra.dropoff_status.split('|').filter(a => a === 'DF' || a === 'DS' || a === 'DL' || a === 'DE').length : null;
    const pendingStops                  = stops && stops.filter(s => s.type === 'DROP_OFF' && s.status === 'PENDING') || [];
    const pendingSortedStopBySequence   = pendingStops.sort((a, b) => (a.sequence_id > b.sequence_id) ? 1 : -1);
    const stopNearestDriver             = pendingSortedStopBySequence.length && pendingSortedStopBySequence[0];
    const shipmentInfoByDriverNearest   = (pendingSortedStopBySequence.length && shipmentLabels.length) && shipmentLabels.filter(s => s.shipment_id === stopNearestDriver.shipment_id)[0];
    const shipmentHistory               = selectedShipment && selectedShipment.history ? selectedShipment.history : [];

    return (<E.Container>
      <E.Inner>
        <E.MapContainer>
          <AssignmentMap assignment={assignmentInfoInTopicSelected} shipment={shipment} />
        </E.MapContainer>
        <E.InnerContainer>
          <ShipmentInfo
            onRemoveShipment={this.props.onRemoveShipment}
            label = { label }
            client = { client }
            shipment = { shipment }
            dropoff = { selectedStop }
            pickup={corresponding_stop}
            // match={this.props.match}
            // history={this.props.history}
            shipmentHistory = { shipmentHistory }
            downloadLabel = {this.download('PDF')}
          />
        </E.InnerContainer>
      </E.Inner>
      <E.Footer>
        <AxlButton
          bg={'white'} compact={true}
          onClick={() => this.copyTrackingCode(shipment.tracking_code)}
          style={{margin: '0px -1px', padding: '0 0 0 6px', width: '85px'}}>{shipment.tracking_code }</AxlButton>
        <AxlButton
          onClick={() => this.openTrackingLink(shipment.tracking_code)}
          bg={'gray'} compact={true} source={images.icon.track}
          style={{margin: '0px -1px', padding: '0 5px 0 0'}}>&nbsp;</AxlButton>
      </E.Footer>
    </E.Container>);
  }
}