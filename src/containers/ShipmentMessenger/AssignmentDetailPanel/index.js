import React from 'react';
import * as E from './styles';
import AssignmentMap from "../../../components/AssignmentMap";
import FlyChatPanel from "../../../components/FlyChatPanel";
import {Flex_Item_Full} from "./styles";
import {AxlCollapse, AxlMiniStopBox} from 'axl-reactjs-ui';
import {HistoryListComponent} from "../../../components/HistoryList";
import _ from 'lodash';
import ShipmentList from "../../ShipmentList";
import {inject, observer} from "mobx-react";
import styles from "../../ShipmentList/styles";
import Moment from "react-moment";
import AssignmentSMS from "../../../components/AssignmentSMS";
import AssignmentNote from "../../../components/AssignmentNote";
import {MAP_SHIPMENT_STATUS_TO_COLORS} from "../../../constants/colors";
import Eta from "../../AssignmentDetail/eta";
import {Grid} from "@material-ui/core";
import { convertMeterToMile } from '../../../constants/common';

@inject('messengerStore', 'userStore', 'shipmentStore', 'assignmentStore')
@observer
export default class AssignmentDetailPanel extends React.Component {
  selectStop = (stop) => {
    const {shipmentStore, messengerStore}   = this.props;

    if(stop) {
      shipmentStore.selectStop(stop);
      messengerStore.setStopSelected(stop);
      this.props.onChangePanel('shipmentDetail');
    }
  };

  onEtaUpdated(assignmentId, eta) {
    const { assignmentStore } = this.props
    assignmentStore.updateAssignmentEta(assignmentId, eta)
  }

  render() {
    const {messengerStore, userStore, assignmentStore}   = this.props;
    const { user }                      = userStore;
    const {
      assignmentInfoInTopicSelected,
      filteredShowingStops,
      stopSelected
    }                                   = messengerStore;

    if(!assignmentInfoInTopicSelected) return;

    const {assignment, extra, isPickedUp} = assignmentInfoInTopicSelected || {};
    const {stops, shipmentLabels}         = assignmentInfoInTopicSelected || [];
    const mapLogisticToType               = {'NEXT_DAYS': 'Next-day', 'SAME_DAY': 'Same-day'};
    const statusColor                     = _.defaultTo(MAP_SHIPMENT_STATUS_TO_COLORS[_.get(assignment, 'status', null)], '#bebebe');
    const counter                         = assignment && assignment.shipment_count ? assignment.shipment_count : null;
    const completed_counter               = extra && extra.dropoff_status ? extra.dropoff_status.split('|').filter(a => a === 'DF' || a === 'DS' || a === 'DL' || a === 'DE').length : null;
    const pendingStops                    = stops && stops.filter(s => s.type === 'DROP_OFF' && s.status === 'PENDING') || [];
    const pendingSortedStopBySequence     = pendingStops.sort((a, b) => (a.sequence_id > b.sequence_id) ? 1 : -1);
    const stopNearestDriver               = pendingSortedStopBySequence.length && pendingSortedStopBySequence[0];
    const shipmentInfoByDriverNearest     = (pendingSortedStopBySequence.length && shipmentLabels.length) && shipmentLabels.filter(s => s.shipment_id === stopNearestDriver.shipment_id)[0];

    return (<E.Container>
      <E.MapContainer>
        <AssignmentMap assignment={assignmentInfoInTopicSelected} />
      </E.MapContainer>
      <E.InnerContainer>
        <E.Text_2>{`Assignment Details`}</E.Text_2>
        <E.BoxMargin>
          <E.Flex_Row_Center>
            <E.Flex_Item_Full>
              <E.Text_1>{_.get(assignment, 'label', '-')}</E.Text_1>
              <E.AssignmentIdLabel>{_.get(assignment, 'id', '-')}</E.AssignmentIdLabel>
            </E.Flex_Item_Full>
            <E.Flex_Item_Full>
              <E.Text_3>{`Assignment Status:`}</E.Text_3>
              <E.Text_4 style={{color: statusColor}}>{_.get(assignment, 'status', '-')}</E.Text_4>
            </E.Flex_Item_Full>
          </E.Flex_Row_Center>
        </E.BoxMargin>
        <E.Flex_Row>
          <E.Flex_Item_Full>
            <E.Text_5>
              <E.Label>{`Model: `}</E.Label>
              {_.defaultTo(assignment && mapLogisticToType[assignment.logistic_type], '-')}
            </E.Text_5>
            <E.Text_5>
              <E.Label>{`Volume: `}</E.Label>
              {_.defaultTo((completed_counter && counter) && `${ completed_counter } / ${ counter }`, '-')}
            </E.Text_5>
          </E.Flex_Item_Full>
          <E.Flex_Item_Full>
            <E.Text_5>
              <E.Label>{`Est. Time Window: `}</E.Label>
              <Moment interval={0} format='hh:mm a'>{_.get(assignment, 'predicted_start_ts', '-')}</Moment> - <Moment interval={0} format='hh:mm a'>{_.get(assignment, 'predicted_end_ts', '-')}</Moment>
            </E.Text_5>
            <E.Text_5>
              <E.Label>{`Est. Distance: `}</E.Label>
              {_.defaultTo(assignment && `${convertMeterToMile(assignment.travel_distance)} mi`, '-')}
            </E.Text_5>
            {!isPickedUp && <E.Text_5>
              <E.Label>{`ETA: `}</E.Label>
              <Eta onUpdate={(e) => this.onEtaUpdated(assignment.id, e)} assignmentId={assignment.id} tz={assignment.timezone} />
            </E.Text_5>}
          </E.Flex_Item_Full>
        </E.Flex_Row>
        {(assignment && user) && <E.BoxMargin>
          <AssignmentNote assignmentId={assignment.id} userId={user.id}/>
        </E.BoxMargin>}
        <AxlCollapse header={<E.Text_7>{`Assignment History:`}</E.Text_7>}>
          {assignment && <HistoryListComponent
            baseUrl={`/events/assignments/${assignment.id}`}
            type='assignment' isShowTitle={false} disableScroll />}
        </AxlCollapse>
        <AxlCollapse header={<E.Text_7>{`Shipment List:`}</E.Text_7>}>
          {!!shipmentInfoByDriverNearest && <E.Text_6><i className="fa fa-exclamation-circle" /> {`Driver is currently on shipment ${_.get(shipmentInfoByDriverNearest, 'driver_label', '-')}`}</E.Text_6>}
          {(filteredShowingStops && !!filteredShowingStops.length) && filteredShowingStops && filteredShowingStops.filter(s => !!s.shipment).map((stop) => {
            return <AxlMiniStopBox
              onClick={() => this.selectStop(stop)}
              key={stop.id}
              // style={{opacity: !stopSelected.stop || !stopSelected.stop.id || stopSelected.stop.id === stop.id ? 1.0 : 0.5}}
              stop={stop} />
          })}
        </AxlCollapse>
      </E.InnerContainer>
    </E.Container>);
  }
}