import React, { Component } from 'react';
import styles from './styles';

import { AxlPanel, AxlCheckbox, AxlButton } from 'axl-reactjs-ui';
import { inject, observer } from "mobx-react";
import { v4 as uuidv4 } from 'uuid';
import { CircularProgress, TextareaAutosize } from '@material-ui/core';
import _ from 'lodash';


@inject('shipmentStore')
@observer
export default class ShipmentDropoffDispatchForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accessCodes: new Map(),
      accessCodeTypeMap: new Map(),
    }

  }

  componentDidMount() {
    this.prepareData()
  }

  prepareData = () => {
    const { shipmentStore } = this.props;
    const accessCodes = shipmentStore.shipmentAddressInfo.access_codes

    const accessCodeMap = Object.keys(accessCodes).reduce((accumulator, key) => {
      if (accessCodes[key]) {
        const uuid = uuidv4()
        accumulator.set(uuid, {
          key: key,
          label: shipmentStore.shipmentAddressInfo.access_code_type,
          value: accessCodes[key],
        })
      }
      return accumulator
    }, new Map())
    this.setState({
      accessCodes: accessCodeMap,
      accessCodeTypeMap: new Map(Object.keys(shipmentStore.shipmentAddressInfo.access_code_type).map(key => [key, {
        value: shipmentStore.shipmentAddressInfo.access_code_type[key],
        disable: Array.from(accessCodeMap.values()).some(e => e.key === key)
      }]))
    })
  }

  save = (e) => {
    const { shipmentStore, shipment, closeForm } = this.props;
    this.setState({ loading: true })
    shipmentStore.updateInstruction(shipment, () => {
      this.setState({ loading: false })
      closeForm()
      shipmentStore.getShipmentAddressInfo()
    });
  };

  addAccessCode = () => {
    const newAccessCodes = this.state.accessCodes
    const uuid = uuidv4()
    newAccessCodes.set(uuid, {
      key: '',
      label: '',
      value: '',
    })
    this.setState(
      { accessCodes: newAccessCodes }
    )
  }

  remove = (element) => {
    const newAccessCodes = this.state.accessCodes
    const newAccessCodeTypeMap = this.state.accessCodeTypeMap
    newAccessCodes.delete(element[0])
    if (element[1].key) {
      newAccessCodeTypeMap.get(element[1].key).disable = false
    }
    this.setState(
      {
        accessCodes: newAccessCodes,
        accessCodeTypeMap: newAccessCodeTypeMap
      }
    )
  }

  handleChange = (element, uuid) => {
    const newAccessCodes = this.state.accessCodes
    const newAccessCodeTypeMap = this.state.accessCodeTypeMap
    if (newAccessCodes.get(uuid).key) {
      newAccessCodeTypeMap.get(newAccessCodes.get(uuid).key).disable = false
    }
    newAccessCodes.get(uuid).key = element.target.value
    newAccessCodes.get(uuid).label = this.state.accessCodeTypeMap.get(element.target.value).value

    if (element.target.value) {
      newAccessCodeTypeMap.get(element.target.value).disable = true
    }
    this.setState(
      {
        accessCodes: newAccessCodes,
        accessCodeTypeMap: newAccessCodeTypeMap
      }
    )
  }

  handeInput = (element, uuid) => {
    const newAccessCodes = this.state.accessCodes
    newAccessCodes.get(uuid).value = element.target.value
    this.setState(
      {
        accessCodes: newAccessCodes,
      }
    )
  }

  render() {
    const { shipmentStore
    } = this.props;
    const { shipmentDropoffForm } = shipmentStore;

    return <div>
      {this.state.loading ? <CircularProgress /> :
        <div style={styles.Container}>
          <div style={styles.HeaderTitle}>{`Dispatch Override`}</div>
          <AxlPanel>
            <AxlPanel.Row>
              <AxlPanel.Col style={styles.GroupPanel}>
                <AxlPanel.Row align={`center`}>
                  <AxlPanel.Col>
                    <div style={styles.GroupTitle}>{`Dispatch Notes`}</div>
                    <div style={styles.Field}>
                      <TextareaAutosize value={shipmentDropoffForm.getField('dropoff_additional_instruction', '')}
                        onChange={shipmentDropoffForm.handlerInput} style={{ width: '100%' }}
                        placeholder={`Add notes here... `} name={`dropoff_additional_instruction`} fluid minRows={3} />
                    </div>
                    <div style={styles.Field}><AxlCheckbox value={shipmentDropoffForm.getField('save_instruction_for_future', false)} onChange={shipmentDropoffForm.handlerCheckbox} name={`save_instruction_for_future`} fluid>Save dispatch notes for future shipments</AxlCheckbox></div>
                  </AxlPanel.Col>
                </AxlPanel.Row>
              </AxlPanel.Col>
            </AxlPanel.Row>
            <AxlPanel.Row>
              <AxlPanel.Col>
                <AxlPanel.Row align={`flex-end`}>
                  <div style={{ ...styles.Field, ...styles.FieldButton }}><AxlButton compact bg={`gray`} onClick={this.props.closeForm} style={styles.buttonControl}>{`Cancel`}</AxlButton></div>
                  <div style={{ ...styles.Field, ...styles.FieldButton }}><AxlButton compact bg={`pink`} onClick={this.save} style={styles.buttonControl}>{`Save`}</AxlButton></div>
                </AxlPanel.Row>
              </AxlPanel.Col>
            </AxlPanel.Row>
          </AxlPanel>
        </div>}
    </div>
  }
}
