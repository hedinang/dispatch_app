import React, { Component } from 'react';
import _ from 'lodash';
import { Box, Dialog } from '@material-ui/core'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import moment from 'moment-timezone';
import { inject, observer } from 'mobx-react';
import { AxlPanel, AxlButton } from 'axl-reactjs-ui';

import ShipmentNotd from '../ShipmentNotd';
import TooltipContainer from '../TooltipContainer';
import ShipmentDropoffWhat3WordsInfo from "../ShipmentDropoffWhat3WordsInfo";

import styles from './styles';
import { PERMISSION_DENIED_TEXT } from '../../constants/common';
import { ACTIONS } from '../../constants/ActionPattern';
import QuestionnaireInfo from '../QuestionnaireInfo';
import Tag from '../Driver/Tag';
import {separateObject} from '../../Utils/events'

const showAccessCode = (accessCodes, accessCodeTypes) => {
  return Object.entries(accessCodes).filter(([key, value]) => value)
    .map(([key, value], idx) => <div key={idx}>{accessCodeTypes[key]}: <span style={{ color: '#000' }}>{value}</span></div>)

}

const isNotExistedAccessCode = (shipmentStore) => {
  return shipmentStore &&
    shipmentStore.shipmentAddressInfo &&
    shipmentStore.shipmentAddressInfo.access_codes &&
    !Object.keys(shipmentStore.shipmentAddressInfo.access_codes).find(key => shipmentStore.shipmentAddressInfo.access_codes[key])
}

const showHouseHref = (shipment) => {
  return `https://google.com/maps/?layer=t&q=` + (shipment.dropoff_uncharted ?
    `${shipment.dropoff_address.lat},${shipment.dropoff_address.lng}` :
    `${shipment.dropoff_address.street} ${shipment.dropoff_address.city} ${shipment.dropoff_address.state} ${shipment.dropoff_address.zipcode}`)
}

const showHouseImage = (shipment) => {
  return `/assets/images/${(['COMMERCIAL'].includes(shipment.rdi) ? 'commercial' :
    'residential') + '-' + ([null, 'EASY', undefined].includes(shipment.dropoff_navigation_difficulty) ? 'ok' :
      'not-ok')}.${['COMMERCIAL'].includes(shipment.rdi) ? 'png' : 'svg'}`
}

const showTreeHref = (shipment) => {
  return `https://google.com/maps/?q=&layer=c&cbll=` +
    `${shipment.dropoff_address.lat},${shipment.dropoff_address.lng}`
}

const showTreeImage = (shipment) => {
  return `/assets/images/street-view-${[null, 'EASY', undefined].includes(shipment.dropoff_navigation_difficulty) ? 'ok' : 'not-ok'}.svg`
}

const updatedAdressAssignmentDays = 2;

@inject('permissionStore', 'shipmentStore', 'assignmentStore')
@observer
export default class ShipmentDropoffInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPanel: this.props.isOpen,
      openUpdatedAddress: false
    }
  }

  updatedAddressTag = (selectedAssignment, shipment) => {
    const isExpiredUpdatedAddress =  moment.tz(selectedAssignment && selectedAssignment.assignment.predicted_start_ts, moment.tz.guess()) < moment().subtract(updatedAdressAssignmentDays, "days")
    const updatedAddressList = selectedAssignment && selectedAssignment.updatedAddressMap && selectedAssignment.updatedAddressMap[shipment.id] && selectedAssignment.updatedAddressMap[shipment.id].length > 0
    return updatedAddressList && !isExpiredUpdatedAddress && (
      <div style={{ display: 'inline-block', whiteSpace: 'nowrap', cursor:'pointer' }} onClick={() => this.setState({ openUpdatedAddress: true })}>
        <Tag fontSize={8}>{['Updated Address']}</Tag>
      </div>
    )
  }
  
  generateAddressHistory = (data) => {
    return data && <div style={{ display: 'flex', flexDirection: 'column', color: 'rgb(74, 74, 74)', fontSize: '12px', fontFamily: 'AvenirNext' }}>
      <div><b>Street:</b> {data.street}</div>
      <div><b>Street2:</b> {data.street2}</div>
      <div><b>City:</b> {data.city}</div>
      <div><b>State:</b> {data.state}</div>
      <div><b>Zipcode:</b> {data.zipcode}</div>
      <div><b>Lat:</b> {data.lat}</div>
      <div><b>Lng:</b> {data.lng}</div>
    </div>
  }

  updatedAddressModal = (updatedAddressList, open, handleClose) => {
    return <Dialog open={open} onClose={handleClose} maxWidth={'sm'} fullWidth>
      <div style={{ padding: '20px', backgroundColor: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>Address Histories</div>
        {updatedAddressList && updatedAddressList.map(updatedAddress => {
          return <div style={{ padding: '20px', backgroundColor: '#f0f0f0', }}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '20px' }}>
              <div>
                <div style={{ marginBottom: '5px', color: 'rgb(150, 151, 154)', fontSize: '12px', fontFamily: 'AvenirNext' }}>
                  <b style={{ color: 'rgb(74, 74, 74)', fontSize: '16px' }}>{updatedAddress.subject.attributes.name}</b> updated via <b style={{ color: 'rgb(74, 74, 74)', fontSize: '16px' }}>{separateObject({ uid: updatedAddress.source }).object_id}</b>:
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '20px' }}>
                  {this.generateAddressHistory(updatedAddress.old_address)}
                  <div style={{ display: 'flex', flexDirection: 'column', alignContent: 'center', justifyContent: 'center' }}>
                    <ArrowForwardIcon />
                  </div>
                  {this.generateAddressHistory(updatedAddress.new_address)}
                </div>
              </div>
              <div>
                <div style={{ marginBottom: '5px', fontSize: '12px', fontFamily: 'AvenirNext' }}> {moment.tz(updatedAddress.ts, moment.tz.guess()).format('M/D/YYYY')}</div>
                <div style={{ marginBottom: '10px', color: 'rgb(150, 151, 154)', fontSize: '12px', fontFamily: 'AvenirNext' }}> {moment.tz(updatedAddress.ts, moment.tz.guess()).format('hh:mm A z')}</div>
              </div>
            </div>


          </div>
        })}
      </div>
    </Dialog>
  }

  render() {
    const { permissionStore, pickup, dropoff, shipment, shipmentStore, assignmentStore } = this.props;
    const { shipmentAddressInfo, selectedShipmentAssignment } = shipmentStore;
    const { selectedAssignment } = assignmentStore;
    const selectedAddressAssignment = selectedShipmentAssignment || selectedAssignment

    const dropoffStatus = (dropoff && dropoff.status) ? dropoff.status : null

    const statusColor = dropoffStatus ? styles.Status[dropoffStatus] : styles.Status['DEFAULT'];
    const isHideEdit = shipment.dropoff_access_code || shipment.dropoff_additional_instruction;
    const isDisableAddNote = true; // pickup && dropoff && !(['SUCCEEDED'].includes(dropoff.status) && ['SUCCEEDED'].includes(pickup.status))
    const isShowAccessCode = isHideEdit || isDisableAddNote
    const dtFormat = moment().diff(shipment.dropoff_latest_ts, 'days') === 0 ? 'hh:mm A z' : 'MM/DD hh:mm A z';
    const isShowEdit = shipment.status === 'GEOCODE_FAILED' || !shipment.assignment_id || (dropoff && dropoff.status !== 'SUCCEEDED' && (!pickup || pickup.status !== 'FAILED') && !dropoff._deleted);

    const isDeniedEdit = permissionStore.isDenied(ACTIONS.ASSIGNMENTS.EDIT_DROPOFF_STATUS);

    const handleClose = ()=>{
      this.setState({openUpdatedAddress: false})
    }

    return <AxlPanel style={styles.panelContainer}>
      <div style={styles.panelHeader}>
        <div style={styles.panelHeaderTitle}>{dropoff ? (dropoff.type[0] + dropoff.type.slice(1).toLowerCase().replace('_', '')) : 'Dropoff'} {dropoff && dropoff.attributes && dropoff.attributes.is_reattempt === 'true' && <span>Reattempt</span>} Info:
          {this.updatedAddressTag(selectedAddressAssignment, shipment)}
        </div>
        <div style={styles.panelHeaderRight}>
          {dropoff && <div style={styles.wrapHeaderEdit}>
            <div style={{ ...styles.panelHeaderStatus, ...{ color: statusColor } }}><span>{dropoff.status} {dropoff.actual_departure_ts && <span> @ {moment.tz(dropoff.actual_departure_ts, moment.tz.guess()).format(dtFormat)}</span>}</span></div>
          </div>}
          {isShowEdit && (
            <div style={styles.panelHeaderButton}>
              <TooltipContainer title={isDeniedEdit ? PERMISSION_DENIED_TEXT : ''}>
                <AxlButton disabled={isDeniedEdit} tiny bg={`white`} onClick={this.props.openForm('DropoffInfo')}>
                  Edit
                </AxlButton>
              </TooltipContainer>
            </div>
          )}
          <div style={styles.panelHeaderArrow} onClick={() => this.setState({ showPanel: !this.state.showPanel })}><i className={!this.state.showPanel ? 'fa fa-angle-down' : 'fa fa-angle-up'} /></div>
        </div>
      </div>
      {this.state.showPanel && <AxlPanel.Row style={styles.panelContent}>
        <AxlPanel.Col flex={1}>
          <AxlPanel.Row style={styles.row}>
            <AxlPanel.Col flex={0} style={{ ...styles.left, ...styles.colCenter, ...styles.colWhite, paddingTop: '3px', marginRight: '5px' }}>
              <div><a target='_blank' href={showHouseHref(shipment)}>
                <img width='30px' height='30px' src={showHouseImage(shipment)} />
              </a></div>
              <div style={{ marginTop: '-8px' }}><a target='_blank' href={showTreeHref(shipment)}>
                <img width='30px' height='30px' src={showTreeImage(shipment)} />
              </a></div>
            </AxlPanel.Col>
            <AxlPanel.Col>
              <div style={styles.text}>
                <span style={{ display: 'block' }}>{shipment.dropoff_address.street}</span>
                <span style={{ display: 'block' }}>{shipment.dropoff_address.street2}</span>
                <span style={{ display: 'block' }}>{shipment.dropoff_address.city} {shipment.dropoff_address.state} {shipment.dropoff_address.zipcode}</span>
              </div>
              <div style={{ fontSize: '9px' }}>
                {shipment.dropoff_navigation_difficulty && <span style={{ padding: '0 2px', color: `${['EASY'].includes(shipment.dropoff_navigation_difficulty) ? 'green' : 'red'}`, border: '1px solid #bdbdbd ', borderRadius: '3px', display: 'inline-block' }}>{shipment.dropoff_navigation_difficulty}</span>}&nbsp;&nbsp;
                {shipment.dropoff_uncharted && <span style={{ padding: '0 2px', color: 'orangered', borderRadius: '3px', border: '1px solid #bdbdbd', display: 'inline-block' }}>UNCHARTED</span>}
              </div>
            </AxlPanel.Col>
            <AxlPanel.Col>

            </AxlPanel.Col>
            {shipment.dropoff_note && <AxlPanel.Col>
              <div style={styles.noteLabel}>{`NOTES`}</div>
              <div style={styles.noteContent}>{shipment.dropoff_note}</div>
            </AxlPanel.Col>}
          </AxlPanel.Row>
          <QuestionnaireInfo questionnaireInfo={shipmentAddressInfo} shipment={shipment}/>
          <ShipmentDropoffWhat3WordsInfo shipment={shipment} showLink={true} />
          <AxlPanel.Row>
            <AxlPanel.Col>
              <AxlPanel.Row style={styles.timewindow}>
                <AxlPanel.Col flex={1}>
                  <div style={styles.timeLabel}>{`Time Window:`}</div>
                  <div>{moment.tz(shipment.dropoff_earliest_ts, moment.tz.guess()).format(dtFormat)} - </div>
                  <div>{moment.tz(shipment.dropoff_latest_ts, moment.tz.guess()).format(dtFormat)}</div>
                </AxlPanel.Col>
                <AxlPanel.Col flex={1}>
                  <div style={styles.timeLabel}>{`ETA:`}</div>
                  <div> {dropoff && dropoff.predicted_departure_ts && <span>{moment.tz(dropoff.predicted_departure_ts, moment.tz.guess()).format(dtFormat)}</span>}</div>
                </AxlPanel.Col>
                {dropoff && dropoff.actual_departure_ts && <AxlPanel.Col flex={1}>
                  <div style={styles.timeLabel}>{`Actual Dropoff:`}</div>
                  <div>{moment.tz(dropoff.actual_departure_ts, moment.tz.guess()).format(dtFormat)}</div>
                </AxlPanel.Col>}
              </AxlPanel.Row>
            </AxlPanel.Col>
          </AxlPanel.Row>
          {/* <AxlPanel.Row>
            <AxlPanel.Col>
              <AxlPanel.Row style={styles.timewindow}>
                <AxlPanel.Col flex={1}>
                  <div style={styles.timeLabel}>{`Address type:`}</div>
                  <div>{shipmentStore.shipmentAddressInfo && shipmentStore.shipmentAddressInfo &&
                    shipmentStore.shipmentAddressInfo['recipient_questionnaire'] &&
                    shipmentStore.shipmentAddressInfo['recipient_questionnaire'].address_type}</div>

                </AxlPanel.Col>
                <AxlPanel.Col flex={1}>
                  <div style={styles.timeLabel}>{`Address characteristic: `}</div>
                  <div>{shipmentStore.shipmentAddressInfo && shipmentStore.shipmentAddressInfo &&
                    shipmentStore.shipmentAddressInfo['recipient_questionnaire'] &&
                    shipmentStore.shipmentAddressInfo['recipient_questionnaire'].address_characteristic &&
                    showAddress_characteristic(shipmentStore.shipmentAddressInfo['recipient_questionnaire'].address_characteristic)}
                  </div>

                </AxlPanel.Col>
                {dropoff && dropoff.actual_departure_ts && <AxlPanel.Col flex={1}>
                  <div style={styles.timeLabel}>{`Actual Dropoff:`}</div>
                  <div>{moment.tz(dropoff.actual_departure_ts, moment.tz.guess()).format(dtFormat)}</div>
                </AxlPanel.Col>}
              </AxlPanel.Row>
            </AxlPanel.Col>
          </AxlPanel.Row> */}
          <AxlPanel.Row>
            <AxlPanel.Col flex={1}>
              <div style={styles.dropoffRemarkContainer}>
                <div style={{ ...styles.dropoffRemarkHeader, ...{ color: statusColor } }}>
                  <div style={styles.dropoffRemarkHeaderStatus}>{`DROPOFF REMARK`}</div>
                  <div style={styles.dropoffRemarkHeaderTime}>{_.capitalize(dropoff ? dropoff.status : '')} {dropoff && dropoff.actual_departure_ts && <span>@ {moment.tz(dropoff.actual_departure_ts, moment.tz.guess()).format(dtFormat)}</span>}</div>
                </div>
                <div style={{ ...styles.dropoffRemarkContent, ...{ borderColor: statusColor } }}>
                  <div style={styles.dropoffRemarkContentText}>{dropoff && dropoff.remark ? dropoff.remark : '-'}</div>
                  {pickup && pickup.status === 'SUCCEEDED' && !dropoff._deleted && (
                    <TooltipContainer title={isDeniedEdit ? PERMISSION_DENIED_TEXT : ''}>
                      <AxlButton disabled={isDeniedEdit} tiny bg={`white`} onClick={this.props.openForm('DropoffStatus')}>
                        Edit
                      </AxlButton>
                    </TooltipContainer>
                  )}
                </div>
              </div>
            </AxlPanel.Col>
          </AxlPanel.Row>

          <AxlPanel.Row>
            <AxlPanel.Col flex={1}>
              <ShipmentNotd shipmentId={shipment.id} />
            </AxlPanel.Col>
          </AxlPanel.Row>
          {isShowAccessCode && <AxlPanel.Row style={{marginBottom: "10px"}}>
            <AxlPanel.Col flex={1}>
              <div style={styles.dropoffAccessContainer}>
                <div style={styles.dropoffAccessContent}>
                  <div style={{ ...styles.dropoffAccessContentText, ...{ cursor: isHideEdit ? 'default' : 'pointer' } }}>
                    <div style={styles.dropoffAccessContentLabel}>
                      <div>{'Additional Instruction'}</div>
                    </div>
                  </div>
                  <AxlButton tiny bg={`white`} onClick={this.props.openForm('Instruction')}>{`Edit`}</AxlButton>
                </div>
                <div style={styles.dropoffAccessContentText}>
                  {shipment.dropoff_additional_instruction && <div style={styles.row}>
                    <span>{shipment.dropoff_additional_instruction}</span>
                  </div>}
                </div>
              </div>
            </AxlPanel.Col>
          </AxlPanel.Row>}
          {isShowAccessCode && <AxlPanel.Row>
            <AxlPanel.Col flex={1}>
              <div style={styles.dropoffAccessContainer}>
                {/* <div style={styles.dropoffAccessContent}>
                  {shipmentStore.shipmentAddressInfo && shipmentStore.shipmentAddressInfo &&
                    shipmentStore.shipmentAddressInfo.access_code_map &&
                    shipmentStore.shipmentAddressInfo.access_code_map &&
                    showAccessCode(shipmentStore.shipmentAddressInfo.access_code_map, shipmentStore.accessCodeTypes)}
                </div> */}
                <div style={styles.dropoffAccessContent}>
                  <div style={{ ...styles.dropoffAccessContentText, ...{ cursor: isHideEdit ? 'default' : 'pointer' } }}>
                    <div style={styles.dropoffAccessContentLabel}>
                      {shipmentStore.shipmentAddressInfo && shipmentStore.shipmentAddressInfo &&
                        shipmentStore.shipmentAddressInfo.access_codes &&
                        shipmentStore.shipmentAddressInfo.access_codes &&
                        showAccessCode(shipmentStore.shipmentAddressInfo.access_codes, shipmentStore.shipmentAddressInfo.access_code_type)}
                    </div>
                    <div style={styles.dropoffAccessContentLabel}>
                      <div>{isNotExistedAccessCode(shipmentStore) && 'Access Code'}</div>
                    </div>
                  </div>
                  <AxlButton tiny bg={`white`} onClick={this.props.openForm('AccessCode')}>{`Edit`}</AxlButton>
                </div>
              </div>
            </AxlPanel.Col>
          </AxlPanel.Row>}
        </AxlPanel.Col>
      </AxlPanel.Row>}
      {this.updatedAddressModal(selectedAddressAssignment && selectedAddressAssignment.updatedAddressMap[shipment.id], this.state.openUpdatedAddress, handleClose)}
    </AxlPanel>
  }
}
