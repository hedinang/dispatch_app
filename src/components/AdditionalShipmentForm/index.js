import React, { Component } from 'react';
import { AxlInput, AxlPanel, AxlButton } from 'axl-reactjs-ui';

// Styles
import styles from './styles'

export default class AdditionalShipmentForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shipmentId: null
    }
  }

  cancel = (e) => {
    console.log('came here: ', this.props);
    const {onCancel} = this.props;
    onCancel();
  };

  addShipment = (e) => {
    const {onAddShipment, assignment} = this.props;
    if (!this.state.shipmentId) return;

    onAddShipment(assignment, this.state.shipmentId);
  };

  handleShipmentId = (e) => {
    this.setState({shipmentId: e.target.value});
  };

  render() {
    const {adding, error} = this.props;

    return <div style={styles.Container}>
      <div style={styles.HeaderTitle}>{`Add Shipment`}</div>
      <AxlPanel>
        <AxlPanel.Row>
          <AxlPanel.Col style={styles.GroupPanel}>
            <div style={styles.GroupField}>
              <div style={styles.Field}>
                <AxlInput value={this.state.shipmentId ? this.state.shipmentId : ''}
                          onEnter={this.addShipment}
                          onChange={this.handleShipmentId}
                          placeholder={`Shipment ID, Tracking Code, Internal ID`}
                          name={`shipment_id`}
                          type={`text`} fluid
                />
              </div>
            </div>
          </AxlPanel.Col>
        </AxlPanel.Row>
        <AxlPanel.Row>
          <AxlPanel.Col>
            <AxlPanel.Row align={`center`}>
              <div style={{...styles.Field, ...styles.FieldButton}}><AxlButton compact bg={`gray`} onClick={this.cancel} style={styles.buttonControl}>{`Cancel`}</AxlButton></div>
              <div style={{...styles.Field, ...styles.FieldButton}}><AxlButton compact bg={`pink`} loading={adding !== undefined ? adding: false} onClick={this.addShipment} style={styles.buttonControl}>{`Load`}</AxlButton></div>
            </AxlPanel.Row>
          </AxlPanel.Col>
        </AxlPanel.Row>
        {error && (
          <div style={{color: 'red', textAlign: 'center', padding: 10, maxWidth: 350}}>
            {error}
          </div>
        )}
      </AxlPanel>
    </div>
  }
}
