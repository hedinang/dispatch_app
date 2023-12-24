import React, { Component } from 'react';
import _ from 'lodash';
import {inject, observer} from "mobx-react";
import { Checkbox, FormControlLabel } from '@material-ui/core';
import { AxlInput, AxlPanel, AxlReselect, AxlDateInput, AxlButton } from 'axl-reactjs-ui';

import TooltipContainer from '../TooltipContainer';

import styles from './styles';
import { PERMISSION_DENIED_TEXT } from '../../constants/common';
import { ACTIONS } from '../../constants/ActionPattern';
@inject('shipmentStore', 'permissionStore')
@observer
export default class ShipmentDropoffStatusForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  save = (e) => {
    const { shipmentStore, dropoff, closeForm } = this.props;
    this.setState({error: null});
    shipmentStore.updateDropoffStop(dropoff, () => {
      closeForm();
    }, (resp) => {
      if (resp.errors && resp.errors.length > 0) {
        this.setState({error: resp.errors[0]});
      }
    });
  };

  render() {
    const { shipmentStore, permissionStore, dropoff } = this.props;
    const { dropoffStopForm } = shipmentStore;
    const canDiscard = dropoff && dropoff.attributes && dropoff.attributes.can_discard === 'true'
    const stopStatuses = [
      { label: 'EN_ROUTE', value: "EN_ROUTE", color: '#444' },
      { label: 'READY', value: "READY", color: '#444' },
      { label: 'PENDING', value: "PENDING", color: '#fa6725' },
      { label: 'SUCCEEDED', value: "SUCCEEDED", color: '#4abc4e' },
      { label: 'FAILED', value: "FAILED", color: '#d63031' },
    ].concat(canDiscard ? [{ label: 'DISCARDED', value: "DISCARDED", color: '#000' },] : [])
    const dropoffStatus = dropoffStopForm.data.status ? { label: dropoffStopForm.data.status, value: dropoffStopForm.data.status } : null;
    const dropoffTimeOptions = {
      dateFormat: 'MMM DD, Y HH:mm:SS A',
      placeHolder: 'Dropoff Time',
      enableTime: true,
      altInput: true,
      clickOpens: true,
      defaultValue: dropoffStopForm.data.actual_departure_ts ? dropoffStopForm.data.actual_departure_ts : new Date()
    };
    const isSaveValid = dropoffStopForm.getField('remark', '') !== '';

    const isDeniedEdit = permissionStore.isDenied(ACTIONS.ASSIGNMENTS.EDIT_DROPOFF_STATUS);

    return <div style={styles.Container}>
      <div style={styles.HeaderTitle}>{`Edit dropoff remark`}</div>
      <AxlPanel>
      {this.state.error && <AxlPanel.Row>
          <AxlPanel.Col style={styles.GroupPanel}>
            <AxlPanel.Row align={`center`}>
              <AxlPanel.Col>
                <span style={{color: 'red', paddingLeft: '15px'}}>{this.state.error}</span>
              </AxlPanel.Col>
            </AxlPanel.Row>
          </AxlPanel.Col>
        </AxlPanel.Row>}
        <AxlPanel.Row>
          <AxlPanel.Col style={styles.GroupPanel}>
            <AxlPanel.Row align={`center`}>
              <AxlPanel.Col>
                <div style={styles.GroupTitle}>{`Dropoff Status`}</div>
                <div style={styles.Field}><AxlReselect value={dropoffStatus} placeholder="Shipment Status" onChange={dropoffStopForm.handlerReactSelect("status")} options={stopStatuses} theme={`main`} /></div>
              </AxlPanel.Col>
            </AxlPanel.Row>
          </AxlPanel.Col>
        </AxlPanel.Row>
        <AxlPanel.Row>
          <AxlPanel.Col style={styles.GroupPanel}>
            <div style={styles.GroupTitle}>{`Dropoff Time`}</div>
            <div style={styles.GroupField}>
              <AxlPanel.Row align={`center`}>
                <AxlPanel.Col><div style={styles.Field}><AxlDateInput onChange={dropoffStopForm.handlerDateInput('actual_departure_ts')} displayToday={false} options={dropoffTimeOptions} theme={`main`} /></div></AxlPanel.Col>
              </AxlPanel.Row>
            </div>
          </AxlPanel.Col>
        </AxlPanel.Row>
        <AxlPanel.Row>
          <AxlPanel.Col style={styles.GroupPanel}>
            <div style={styles.GroupTitle}>{`Remark`}</div>
            <div style={{...styles.GroupField, marginBottom: 0}}>
              <AxlPanel.Row align={`center`}>
                <AxlPanel.Col><div style={styles.Field}><AxlInput value={dropoffStopForm.getField('remark', '')} onChange={dropoffStopForm.handlerInput} placeholder={`Remark`} name={`remark`} type={`text`} fluid /></div></AxlPanel.Col>
              </AxlPanel.Row>
            </div>
          </AxlPanel.Col>
        </AxlPanel.Row>

        <AxlPanel.Row>
          <AxlPanel.Col style={{marginLeft: 15, marginBottom: 20}}>
            <FormControlLabel control={<Checkbox name='is_attempt' defaultChecked onChange={dropoffStopForm.handlerCheckbox}/>} label="Driver is attempted" />
          </AxlPanel.Col>
        </AxlPanel.Row>
        <AxlPanel.Row>
          <AxlPanel.Col>
            <AxlPanel.Row align={`flex-end`}>
              <div style={{...styles.Field, ...styles.FieldButton}}><AxlButton compact bg={`gray`} onClick={this.props.closeForm} style={styles.buttonControl}>{`Cancel`}</AxlButton></div>
              <div style={{...styles.Field, ...styles.FieldButton}}>
                <TooltipContainer title={isDeniedEdit ? PERMISSION_DENIED_TEXT : ''}>
                  <AxlButton compact bg={`pink`} onClick={this.save} style={styles.buttonControl} disabled={!isSaveValid || isDeniedEdit} >{`Save`}</AxlButton>
                </TooltipContainer>
              </div>
            </AxlPanel.Row>
          </AxlPanel.Col>
        </AxlPanel.Row>
      </AxlPanel>
    </div>
  }
}
