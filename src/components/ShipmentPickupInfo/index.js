import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment-timezone';
import { observer, inject } from 'mobx-react';
import { AxlPanel, AxlButton } from 'axl-reactjs-ui';

import TooltipContainer from '../TooltipContainer';

import styles from './styles';
import { PERMISSION_DENIED_TEXT } from '../../constants/common';
import { ACTIONS } from '../../constants/ActionPattern';

@inject('permissionStore')
@observer
export default class ShipmentPickupInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showPanel: this.props.isOpen
    }
  }

  render() {
    const { permissionStore, pickup, dropoff, shipment, isEdit } = this.props;

    const isReattempt = dropoff && dropoff.attributes && dropoff.attributes.is_reattempt === 'true'
    const COMPLETED = ['SUCCEEDED', 'FAILED'];
    const pickupStatus = (pickup && pickup.status) ? pickup.status : null
    const statusColor = pickupStatus ? styles.Status[pickupStatus] : styles.Status['DEFAULT'];
    const dtFormat = moment(shipment.dropoff_latest_ts).isBefore(moment()) ? 'MM/DD hh:mm A z' : 'hh:mm A z'

    const isDeniedEdit = permissionStore.isDenied(ACTIONS.ASSIGNMENTS.EDIT_PICKUP_STATUS);

    return  <AxlPanel style={styles.panelContainer}>
      <div style={styles.panelHeader}>
        <div style={styles.panelHeaderTitle}>{`Pickup Info:`}</div>
        <div style={styles.panelHeaderRight}>
          <div style={styles.wrapHeaderEdit}>
            <div style={{...styles.panelHeaderStatus, ...{color: statusColor}}}><span>{pickupStatus} { pickup && pickup.actual_departure_ts && <span> @ {moment.tz(pickup.actual_departure_ts, moment.tz.guess()).format(dtFormat) }</span> }</span></div>
            {(!COMPLETED.includes(pickupStatus) && isEdit && !dropoff._deleted) && (
              <div style={styles.panelHeaderButton}>
                <TooltipContainer title={isDeniedEdit ? PERMISSION_DENIED_TEXT : ''}>
                  <AxlButton disabled={isDeniedEdit} tiny bg={`white`} onClick={this.props.openForm('PickupInfo')}>
                    Edit
                  </AxlButton>
                </TooltipContainer>
              </div>
            )}
          </div>
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
          <AxlPanel.Row>
            <AxlPanel.Col flex={1}>
              <div style={styles.dropoffRemarkContainer}>
                <div style={{...styles.dropoffRemarkHeader,...{color: statusColor}}}>
                  <div style={styles.dropoffRemarkHeaderStatus}>{`PICKUP REMARK`}</div>
                  {pickupStatus && <div style={styles.dropoffRemarkHeaderTime}>{_.capitalize(pickupStatus)} { pickup && pickup.actual_departure_ts && <span> @ {moment.tz(pickup.actual_departure_ts, moment.tz.guess()).format(dtFormat) }</span>}</div>}
                </div>
                <div style={{...styles.dropoffRemarkContent,...{borderColor: statusColor}}}>
                  <div style={styles.dropoffRemarkContentText}>{(pickup && pickup.remark) ? pickup.remark : '-'}</div>
                  {isEdit && !isReattempt && !dropoff._deleted && (
                    <TooltipContainer title={isDeniedEdit ? PERMISSION_DENIED_TEXT : ''}>
                      <AxlButton disabled={isDeniedEdit} tiny bg={`white`} onClick={this.props.openForm('PickupStatus')}>{`Edit`}</AxlButton>
                    </TooltipContainer>
                  )}
                </div>
              </div>
            </AxlPanel.Col>
          </AxlPanel.Row>
        </AxlPanel.Col>
      </AxlPanel.Row>}
    </AxlPanel>
  }
}
