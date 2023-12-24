import React, { Component } from 'react';
import styles from './styles';

import { AxlInput, AxlPanel, AxlReselect, AxlDateInput, AxlCheckbox, AxlButton } from 'axl-reactjs-ui';
import { inject, observer } from "mobx-react";
import { v4 as uuidv4 } from 'uuid';
import { CircularProgress, FormControl, IconButton, Input, MenuItem, OutlinedInput, Select, TextareaAutosize } from '@material-ui/core';
import { Delete as DeleteIcon } from '@material-ui/icons';
import _ from 'lodash';


const codeInput = (element, remove, handleChange, handeInput, accessCodeTypeMap) => {
  return <div>
    <FormControl size="small" style={styles.AcessForm}>

      <Select
        style={{ width: '600px' }}
        value={element.type}
        onChange={(e) => handleChange(e, element.id)}
        fullWidth placeholder="Code Type" variant="outlined"
      >
        {Array.from(accessCodeTypeMap.keys()).map(key => {
          return <MenuItem key={key} value={key} disabled={accessCodeTypeMap.get(key).disable}>{accessCodeTypeMap.get(key).value}</MenuItem>
        })}
      </Select>

      <OutlinedInput
        onKeyPress={(event) => {
          if (!/^[0-9*#]+$/.test(event.key)) {
            event.preventDefault();
          }
        }}
        value={element.value} onChange={e => handeInput(e, element.id)} fullWidth placeholder="Enter code here..." variant="outlined" />
      <IconButton onClick={() => remove(element)}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </FormControl>
  </div>
}

@inject('shipmentStore')
@observer
export default class ShipmentAccessCodeForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accessCodes: [],
      accessCodeTypeMap: new Map(),
    }
    this.addAccessCode = this.addAccessCode.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handeInput = this.handeInput.bind(this);
    this.remove = this.remove.bind(this);
    this.save = this.save.bind(this)
  }

  componentDidMount() {
    this.prepareData()
  }

  prepareData = () => {
    const { shipmentStore } = this.props;
    // const accessCodes = shipmentStore.shipmentAddressInfo.access_codes

    const accessCodes = Object.entries(shipmentStore.shipmentAddressInfo.access_codes)
      .filter(([key, value]) => value)
      .map(([key, value]) => ({
        id: uuidv4(),
        type: key,
        label: shipmentStore.shipmentAddressInfo.access_code_type[key],
        value: value,
      }));

    this.setState({
      accessCodes: accessCodes,
      accessCodeTypeMap: new Map(Object.keys(shipmentStore.shipmentAddressInfo.access_code_type).map(key => [key, {
        value: shipmentStore.shipmentAddressInfo.access_code_type[key],
        disable: accessCodes.some(e => e.type === key)
      }]))
    })
  }

  save = () => {
    const { shipmentStore, shipment, closeForm } = this.props;
    this.setState({ loading: true })
    shipmentStore.updateAccessCode(shipment, this.state.accessCodes, () => {
      this.setState({ loading: false })
      closeForm()
      shipmentStore.getShipmentAddressInfo()
    });
  };

  addAccessCode = () => {
    const newAccessCodes = [
      ...this.state.accessCodes,
      {
        id: uuidv4(),
        type: '',
        label: '',
        value: '',
      }
    ]
    this.setState(
      { accessCodes: newAccessCodes }
    )
  }

  remove = (element) => {
    const newAccessCodes = this.state.accessCodes.filter(e => e.id !== element.id)
    const newAccessCodeTypeMap = this.state.accessCodeTypeMap
    if(newAccessCodeTypeMap.has(element.type)){
      newAccessCodeTypeMap.get(element.type).disable = false
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
    const accessCode = this.state.accessCodes.find(e => e.id === uuid).type
    if (accessCode) {
      newAccessCodeTypeMap.get(accessCode).disable = false
    }
    newAccessCodes.find(e => e.id === uuid).type = element.target.value
    newAccessCodes.find(e => e.id === uuid).label = this.state.accessCodeTypeMap.get(element.target.value).value

    newAccessCodeTypeMap.get(element.target.value).disable = true
    this.setState(
      {
        accessCodes: newAccessCodes,
        accessCodeTypeMap: newAccessCodeTypeMap
      }
    )
  }

  handeInput = (element, uuid) => {
    const newAccessCodes = this.state.accessCodes
    newAccessCodes.find(e => e.id === uuid).value = element.target.value
    this.setState(
      {
        accessCodes: newAccessCodes,
      }
    )
  }

  render() {
    const { shipmentStore
    } = this.props;

    return <div>
      {this.state.loading ? <CircularProgress /> :
        <div style={styles.Container}>
          <div style={styles.HeaderTitle}>{`Dispatch Override`}</div>
          <AxlPanel>
            <AxlPanel.Row>
              <AxlPanel.Col style={styles.GroupPanel}>
                <AxlPanel.Row align={`center`}>
                  <AxlPanel.Col>
                    <div style={styles.GroupTitle}>{`Codes`}</div>
                    {
                      this.state.accessCodes.map(e => codeInput(e, this.remove, this.handleChange, this.handeInput,
                        this.state.accessCodeTypeMap))
                    }
                    <div style={styles.AccessCodeAdd} onClick={this.addAccessCode}>+ Add new code</div>
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
