import React, { Component } from 'react';
import moment from 'moment';
import { AxlPanel } from 'axl-reactjs-ui';

// Utils

// Styles
import styles from './styles';

export default class ShipmentDropoffInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showPanel: this.props.isOpen
    }
  }

  render() {
    const { pickup, dropoff, shipment } = this.props;
    const COMPLETED = ['SUCCEEDED', 'FAILED'];

    const dropoffStatus = (dropoff && dropoff.status) ? dropoff.status : null

    const statusColor = dropoffStatus ? styles.Status[dropoffStatus] : styles.Status['DEFAULT'];
    const isHideEdit = shipment.dropoff_access_code || shipment.dropoff_additional_instruction;
    const isDisableAddNote = pickup && dropoff && !(COMPLETED.includes(dropoff.status) && pickup.status === 'SUCCEEDED')
    const isShowAccessCode = isHideEdit || isDisableAddNote
    const dtFormat = moment().diff(shipment.dropoff_latest_ts, 'days') === 0 ? 'hh:mm A' : 'MM/DD hh:mm A';

    return  <AxlPanel style={styles.panelContainer}>
      <div style={styles.panelHeader}>
        <div style={styles.panelHeaderTitle}>Dropoff Info:</div>
        <div style={styles.panelHeaderRight}>
          <div style={styles.panelHeaderArrow} onClick={() => this.setState({showPanel: !this.state.showPanel})}><i className={!this.state.showPanel ? 'fa fa-angle-down' : 'fa fa-angle-up'} /></div>
        </div>
      </div>
      {this.state.showPanel && <AxlPanel.Row style={styles.panelContent}>
        <AxlPanel.Col flex={1}>
          <AxlPanel.Row style={styles.row}>
            <AxlPanel.Col flex={0} style={{...styles.left, ...styles.colCenter, ...styles.colWhite, paddingTop: '3px', marginRight: '5px'}}>
              <a target='_blank' href={`https://google.com/maps/?q=` + (shipment.dropoff_uncharted ?
                  `${shipment.dropoff_address.lat}, ${shipment.dropoff_address.lng}` :
                  `${shipment.dropoff_address.street} ${shipment.dropoff_address.city} ${shipment.dropoff_address.state} ${shipment.dropoff_address.zipcode}`)
              }><img width='30px' height='30px' src={`/assets/images/svg/${['COMMERCIAL'].includes(shipment.rdi) ? 'commercial' : 'residential'}.svg`}/></a>
            </AxlPanel.Col>
            <AxlPanel.Col>
              <div style={styles.text}>
                <span style={{display: 'block'}}>{shipment.dropoff_address.street}</span>
                <span style={{display: 'block'}}>{shipment.dropoff_address.street2}</span>
                <span style={{display: 'block'}}>{shipment.dropoff_address.city} {shipment.dropoff_address.state} {shipment.dropoff_address.zipcode}</span>
              </div>
              <div style={{fontSize: '9px'}}>
                {shipment.dropoff_navigation_difficulty && <span style={{padding: '0 2px', color: `${['EASY'].includes(shipment.dropoff_navigation_difficulty) ? 'green': 'red'}`, border: '1px solid #bdbdbd ', borderRadius: '3px', display: 'inline-block'}}>{shipment.dropoff_navigation_difficulty}</span>}&nbsp;&nbsp;
                {shipment.dropoff_uncharted && <span style={{padding: '0 2px', color: 'orangered', borderRadius: '3px',  border: '1px solid #bdbdbd', display: 'inline-block'}}>UNCHARTED</span>}
              </div>
            </AxlPanel.Col>
            { shipment.dropoff_note && <AxlPanel.Col>
              <div style={styles.noteLabel}>{`NOTES`}</div>
              <div style={styles.noteContent}>{shipment.dropoff_note}</div>
            </AxlPanel.Col>}
          </AxlPanel.Row>
          <AxlPanel.Row>
            <AxlPanel.Col>
              <AxlPanel.Row style={styles.timewindow}>
                <AxlPanel.Col flex={1}>
                  <div style={styles.timeLabel}>{`Time Window:`}</div>
                  <div>{moment(shipment.dropoff_earliest_ts).format(dtFormat)} - {moment(shipment.dropoff_latest_ts).format(dtFormat)}</div>
                </AxlPanel.Col>
                <AxlPanel.Col flex={1}>
                  <div style={styles.timeLabel}>{`ETA:`}</div>
                  <div> { dropoff && dropoff.predicted_departure_ts && <span>{ moment(dropoff.predicted_departure_ts).format(dtFormat) }</span> }</div>
                </AxlPanel.Col>
                {dropoff && dropoff.actual_departure_ts && <AxlPanel.Col flex={1}>
                  <div style={styles.timeLabel}>{`Actual Dropoff:`}</div>
                  <div>{moment(dropoff.actual_departure_ts).format(dtFormat)}</div>
                </AxlPanel.Col>}
              </AxlPanel.Row>
            </AxlPanel.Col>
          </AxlPanel.Row>
        </AxlPanel.Col>
      </AxlPanel.Row>}
    </AxlPanel>
  }
}
