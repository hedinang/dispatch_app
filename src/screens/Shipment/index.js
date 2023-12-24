import React, { Component } from 'react';
import { Styles, AxlTabSimple, AxlButton } from 'axl-reactjs-ui';
import styles, * as E from './styles';
import { Box, Grid, Hidden, Button, ThemeProvider, Divider } from "@material-ui/core";
import ShipmentInfo from '../../components/ShipmentInfo';
import {lightTheme} from "../../themes";
import {Tooltip} from "@material-ui/core";
import { images } from '../../constants/images';
import ShipmentFeedback from '../../components/ShipmentFeedback';
import AssignmentMap from '../../components/AssignmentMap/index';

import { inject, observer } from 'mobx-react';
import moment from "moment";
import { saveAs } from 'file-saver';
import { withRouter } from 'react-router-dom';
import CustomerProfileInfo from '../../components/CustomerProfileInfo';
import DeliverableAddressInfo from '../../components/DeliverableAddress';
import EventTree from '../../components/EventTree';
import { toJS } from 'mobx';
import { texts } from '../../styled-components';
import AssignmentDetail from '../../containers/AssignmentDetail/index';
import DeliveryHistory from '../../containers/DeliveryHistory'

@inject('shipmentStore', 'profileStore', 'addressStore', 'assignmentStore')
@observer
class ShipmentScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showFeedBackForm: false
        }
    }

    componentDidMount() {
        const { match, shipmentStore, profileStore, addressStore } = this.props
        const { params } = match || {}
        const { id } = params || {}
        console.log(`selecting ${id}`)
        shipmentStore.loadShipment(id, (s) => {
            shipmentStore.loadShipmentDeliveryGPS()
            if (s.status === 200 && s.data.customer_profile_id) {
                profileStore.loadProfile(s.data.customer_profile_id, (r) => {
                    if (r.status === 200 && r.data.deliverable_address_id) {
                        addressStore.loadAddress(r.data.deliverable_address_id)
                    } else {
                        addressStore.loadAddress(null)
                    }
                })
            } else {
                profileStore.loadProfile(null)
                addressStore.loadAddress(null)
            }
        })
    }

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
    }
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
        const { match, shipmentStore, profileStore, addressStore } = this.props
        const { params } = match || {}
        const { selectedShipment, selectedShipmentAssignment } = shipmentStore;
        const { selectedProfile } = profileStore || {}
        const { deliverableAddress } = addressStore
        if (!selectedShipment) return <div></div>

        let stops = selectedShipmentAssignment ? selectedShipmentAssignment.stops : []
        let showingStops = stops.filter(s => s.type === 'DROP_OFF')
        let showingPickUps = stops.filter(s => s.type === 'PICK_UP')
        let labels = selectedShipmentAssignment && selectedShipmentAssignment.shipmentLabels ? selectedShipmentAssignment.shipmentLabels.filter(c => c.shipment_id === selectedShipment.id ) : []
        let label = labels.length > 0 ? labels[0] : null
        let dropoff = showingStops.filter(s => s.shipment_id === selectedShipment.id)[0];
        let pickup = showingPickUps.filter(s => s.shipment_id === selectedShipment.id)[0];
        let locations = selectedShipment.locations ? selectedShipment.locations : []
        const { history } = selectedShipment || {}
        const events = history ? toJS(history) : []

        return (<ThemeProvider theme={lightTheme}>
            <Box height={'calc(100vh - 120px)'}>
                <Grid container alignItems="stretch" style={{ height: '100%' }} spacing={2} wrap={'nowrap'}>
                    {/* <Grid item xs={4}>
                        <E.Container bgcolor={'primary.grayEleventh'} style={{height: '100%', overflow: 'hidden'}}>
                            <Box height={1} style={{...styles.panel, ...{overflow: 'auto'}}}>
                                <div style={{textAlign: 'right', paddingRight: 6, paddingTop: 6}}>
                                    {!this.state.showHistory && <span style={{cursor: 'pointer', fontSize: '14px'}} onClick={() => this.setState({showHistory: true})}>Open History</span> }
                                    {this.state.showHistory && <span style={{cursor: 'pointer', fontSize: '14px'}} onClick={() => this.setState({showHistory: false})}>Close History</span> }
                                </div>
                                <AssignmentDetailContainer onShowAddingShipment={this.onShowAddingShipment} onShowMessenger={this.onShowMessenger} history={this.props.history} />
                            </Box>
                        </E.Container>
                    </Grid> */}
                    <Grid item xs={4}>
                        <Box height={1} style={{ ...Styles.box, ...styles.panel, ...styles.innerBoxShipment, ...{paddingBottom: 55} }}>
                            <div style={{ ...Styles.box, ...styles.innerBox, ...styles.innerBoxShipment }}>
                                <ShipmentInfo
                                    match={this.props.match} history={this.props.history}
                                    label = { label }
                                    shipment = { selectedShipment }
                                    dropoff = {dropoff}
                                    pickup = {pickup}
                                    isEdit={false}
                                    downloadLabel = {this.download('PDF')}
                                />
                                
                            </div>
                            <div style={styles.footer} className={'momentumScrollX'}>
                                <Tooltip title="Feedback"><span>
                                </span></Tooltip>
                                <Tooltip title="Download label"><span>
                                <AxlButton bg={'white'} compact={true} onClick={this.download('PDF')} source={images.icon.label}></AxlButton>
                                </span></Tooltip>
                                <div style={{minWidth: '140px'}}>
                                    <AxlButton onClick={() => this.copyTrackingCode(selectedShipment.tracking_code)}
                                            bg={'white'} compact={true}
                                            style={{margin: '0px -1px', padding: '0 0 0 6px', width: '85px'}}>{ selectedShipment.tracking_code }</AxlButton>
                                    <AxlButton onClick={() => this.openTrackingLink(selectedShipment.tracking_code) } bg={'gray'} compact={true} source={images.icon.track} style={{margin: '0px -1px', padding: '0 5px 0 0'}}>&nbsp;</AxlButton>
                                </div>
                                <Tooltip title="Update shipment tags"><span>
                                <AxlButton bg={'white'} compact onClick={this.toggleTags} source={images.icon.tag} />
                                </span></Tooltip>

                                <div style={{flex: 1}}></div>

                                {/* <AxlPopConfirm
                                trigger={<AxlButton bg={'red'} disabled={!canCancel} compact>{`Cancel`}</AxlButton>}
                                titleFormat={<div>Cancel this shipment?</div>}
                                textFormat={<div><strong>Please confirm that you want to cancel this shipment!</strong></div>}
                                okText={`CONFIRM`}
                                onOk={() => this.cancelShipmentPopup() }
                                cancelText={`CANCEL`}
                                onCancel={() => console.log('onCancel')}
                                /> */}
                            </div>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box height={1} style={{ ...Styles.box, ...styles.panel, ...styles.innerBox }}>
                            <div style={styles.bottomBox}>
                                <div style={texts.body}>
                                <AxlTabSimple disableRipple={true} titleStyle={{textAlign: 'center'}} activedTab={0} items={[
                                    {title: 'Shipment History', component:<EventTree events={events} />},
                                    {title: 'Delivery History', component: <DeliveryHistory id={selectedShipment.customer_profile_id} />},
                                ]} />
                            </div></div>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box height={1} style={{ ...Styles.box, ...styles.panel, ...styles.innerBox }}>
                            <div style={{ ...styles.boxContent, ...{ top: 0, left: 0, right: 0, height: 240 } }}>
                                <AssignmentMap locations={locations} shipment = { selectedShipment } />
                            </div>
                            <div style={{ position: 'absolute', top: 240, left: 0, right: 0, bottom: 0}}>
                                <div style={styles.bottomBox}>
                                    <div style={{textAlign: 'right'}}>
                                        <a style={texts.link} target='_blank' href={`${process.env.REACT_APP_GEOCODER_URL}/shipments/${selectedShipment.id}`}>Geocoder tool</a>
                                    </div>
                                    <div>
                                        <CustomerProfileInfo profile={selectedProfile} />
                                        <DeliverableAddressInfo address={deliverableAddress} />
                                    </div>
                                    <Divider style={{margin: 10}} />
                                    { !(selectedShipmentAssignment && selectedShipmentAssignment.assignment && selectedShipmentAssignment.assignment.id) && <div style={{...texts.body, ...{padding: 10}}}>
                                        Shipment not routed yet!
                                    </div>}
                                    { selectedShipmentAssignment && selectedShipmentAssignment.assignment.id && <div>
                                        <div style={{...texts.body, ...{display: 'flex', padding: 10}}}>
                                            { label && <div style={{flex: 1}}><span style={texts.label2}>Route Label:</span> { label.driver_label }</div> }
                                            <div style={{textAlign: 'right', flex: 1}}><a style={texts.link} target='_blank' href={`/assignments/${selectedShipmentAssignment.assignment.id}${dropoff ? `/stops/${dropoff.id}` : ''}`}>Open Assignment</a></div>
                                        </div>
                                        { !dropoff && <div style={{...texts.body, ...{display: 'flex', padding: '0px 10px', color: 'red'}}}>Shipment has been removed from route</div>}
                                        <Divider style={{margin: 10}} />
                                        <AssignmentDetail viewOnly={true} assignmentInfo={selectedShipmentAssignment} history={this.props.history} />
                                    </div>}

                                </div>
                            </div>
                        </Box>
                        {/* <ShipmentFeedback /> */}
                    </Grid>
                </Grid>
            </Box>
        </ThemeProvider>)
    }
}

export default withRouter(ShipmentScreen)
