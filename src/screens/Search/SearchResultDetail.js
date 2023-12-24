import React, { Component } from 'react';

import {AxlMiniStopBox, Styles, AxlButton, AxlPanel, AxlModal, AxlPopConfirm} from 'axl-reactjs-ui';
import { inject, observer } from 'mobx-react';
import {Box, IconButton, TextField, Typography} from "@material-ui/core";
import { cloneDeep } from 'lodash';
import PinDropIcon from '@material-ui/icons/PinDrop';
import { saveAs } from 'file-saver';
import { withRouter } from 'react-router-dom';
import moment from 'moment';

import styles from './styles';
import AssignmentMap from '../../components/AssignmentMap/index';
import AssignmentDetail from '../../containers/AssignmentDetail/index';
import ShipmentInfo from '../../components/ShipmentInfo/index'
import AssignmentHistory from '../../components/AssignmentHistory/index';
import { images } from '../../constants/images';
import AxlDialog from '../../components/AxlDialog';
import LocationPin from '../Dispatch/locationPin';
import Tag from '../../components/Driver/Tag';

const updatedAdressAssignmentDays = 2;

@inject('shipmentStore')
@observer
class SearchResultDetail extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showCancelShipmentModal: false,
            cancellingShipment: false,
            cancelShipmentError: '',
            cancelShipmentReasonMsg: '',
            isOpenLocationPin: false,
        }
    }

    back() {
        const { shipmentStore } = this.props
        shipmentStore.selectShipment(null)
    }

    openDispatch(dropoff) {
        const { history, shipmentStore } = this.props
        const { selectedShipment } = shipmentStore
        // False if is null
        if (!dropoff || !dropoff.predicted_arrival_ts) return false;
        let day = moment(dropoff.predicted_arrival_ts).format('YYYY-MM-DD')
        // Push to link
        history.push(`/routes/${day}/all/${selectedShipment.client_id}/${selectedShipment.assignment_id}/stops/${dropoff.id}`)
    }

    downloadPDF = (e) => {
        const {shipmentStore} = this.props;
        const { selectedShipment } = shipmentStore;
        if (!selectedShipment) return;
        shipmentStore.getLabel(selectedShipment.id, 'PDF', (response) => {
          if (response.status === 200) {
            const data = response.data.label;

            const contentType = 'application/pdf';
            const fileName = `order-${selectedShipment.id}-label.pdf`;
            const blob = this.b64toBlob(data, contentType);

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

    cancelShipment = () => {
        const { cancelShipmentReasonMsg } = this.state;
        const { shipmentStore } = this.props
        const { selectedShipment } = shipmentStore;

        if (!selectedShipment || !selectedShipment.id) return;

        if (!cancelShipmentReasonMsg || !cancelShipmentReasonMsg.trim()) {
            this.setState({cancelShipmentError: 'Reason cannot empty!'})
            return;
        }

        this.setState({cancellingShipment: true});
        shipmentStore.cancelShipment(selectedShipment, cancelShipmentReasonMsg, res => {
            if (res.ok) {
                this.hideCancelShipmentModal();
            } else {
                let errorMsg = 'Error Code ' + res.status;
                if (res.data && res.data.message) {
                    errorMsg += ' - ' + res.data.message;
                }
                this.setState({cancelShipmentError: errorMsg})
            }
            this.setState({cancellingShipment: false});
        });
    }

    onReasonChange = (value) => {
        this.setState({
            cancelShipmentReasonMsg: value,
            cancelShipmentError: '',
        })
    }

    cancelShipmentPopup = () => {
        this.setState({showCancelShipmentModal: true});
    }

    hideCancelShipmentModal = () => {
        this.setState({
            showCancelShipmentModal: false,
            cancellingShipment: false,
            cancelShipmentReasonMsg: '',
        });
    }

    openTrackingLink(code) {
        window.open(`https://axlehi.re/${code}`, '_blank')
    }

    handleDialog = (field, val) => {
      this.setState({ [field]: val })
    }

    updatedAddressTag = () => {
        return <div style={{ position: 'absolute', top: -6, right: 10, zIndex: 1, width: '103px', cursor:'pointer'  }}>
            <Tag>{['Updated Address']}</Tag>
        </div>
    }

    render() {
        const { shipmentStore } = this.props
        const { selectedShipment, selectedShipmentAssignment, shipmentSearchResult, shipmentAddressInfo, selectedStop } = shipmentStore
        const isExpiredUpdatedAddress =  moment.tz(selectedShipmentAssignment && selectedShipmentAssignment.assignment.predicted_start_ts, moment.tz.guess()) < moment().subtract(updatedAdressAssignmentDays, "days")
        let stops = selectedShipmentAssignment ? selectedShipmentAssignment.stops : []
        let showingStops = stops.filter(s => s.type === 'DROP_OFF')
        let showingPickUps = stops.filter(s => s.type === 'PICK_UP')
        let labels = selectedShipmentAssignment && selectedShipmentAssignment.shipmentLabels ? selectedShipmentAssignment.shipmentLabels.filter(c => c.shipment_id === selectedShipment.id ) : []
        let label = labels.length > 0 ? labels[0] : null
        let dropoff = showingStops.filter(s => s.shipment_id === selectedShipment.id)[0];
        let pickup = showingPickUps.filter(s => s.shipment_id === selectedShipment.id)[0];
        const {showCancelShipmentModal, cancellingShipment, cancelShipmentReasonMsg, cancelShipmentError, isOpenLocationPin} = this.state;
        const canCancel = !selectedShipment.is_cancelled && selectedShipment.status !== 'DROPOFF_SUCCEEDED';

        const searchResult = shipmentSearchResult.results.find((result) => result.shipment.id === selectedShipment.id);

        // TODO: scroll to selected shipment
        return <div style={{ ...styles.list, ...Styles.box }}>
            <div style={{ textAlign: 'left', padding: '10px' }}>
                <AxlPanel>
                    <AxlPanel.Row align={`center`}>
                        <AxlPanel.Col>
                            <AxlButton bg={`gray`} tiny ico={{ className: 'fa fa-angle-left', style: { fontSize: '25px' } }} onClick={() => this.back()}>{`Back to Search Results`}</AxlButton>
                        </AxlPanel.Col>
                        <AxlPanel.Col flex={0}>
                            <AxlButton disabled={!dropoff} onClick={() => this.openDispatch(dropoff)} tiny bg={'gray'}>{`View in Dispatch`}</AxlButton>
                        </AxlPanel.Col>
                    </AxlPanel.Row>
                </AxlPanel>
            </div>
            <div style={{height: '800px', display: "flex"}}>
                <div style={{ ...styles.panel }}>
                    <div style={{ ...Styles.box, ...styles.innerBox }}>
                        <div style={{ ...styles.boxContent, ...{ top: 0, left: 0, right: 0 } }}>
                            <div style={styles.shipmentList}>
                                { showingStops && showingStops.filter(s => !s._deleted).map((stop) => {
                                    return (<Box position='relative'>
                                        {(selectedShipmentAssignment && !isExpiredUpdatedAddress && selectedShipmentAssignment.updatedAddressMap[stop.shipment_id]
                                            && selectedShipmentAssignment.updatedAddressMap[stop.shipment_id].length > 0) && this.updatedAddressTag()}
                                        <AxlMiniStopBox
                                            key={stop.id}
                                            style={{ margin: '6px 1px 6px 1px', opacity: selectedShipment.id === stop.shipment_id ? 1.0 : 0.5 }}
                                            stop={stop} />
                                    </Box>)
                                }) }
                            </div>
                        </div>
                        <div style={styles.bottomBox}>
                            { selectedShipmentAssignment && selectedShipmentAssignment.assignment && selectedShipmentAssignment.assignment.id && <AssignmentDetail assignmentInfo = { selectedShipmentAssignment } viewOnly={true} style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0}} /> }
                            { !(selectedShipmentAssignment && selectedShipmentAssignment.assignment && selectedShipmentAssignment.assignment.id) && <div style={{ padding: 10 }}>Not routed yet!</div>}
                        </div>
                    </div>
                </div>

                <div style={{ ...styles.panel }}>
                    <div style={{ ...Styles.box, ...styles.innerBox }}>
                        <div style={{ ...styles.boxContent, ...{ top: 0, left: 0, right: 0, bottom: 471 } }}>
                            <AssignmentMap assignment = { selectedShipmentAssignment } shipment = { selectedShipment } />
                            {selectedStop && (
                              <Box position={'absolute'} top={8} left={8} border={'1px solid #525150'} borderRadius={'50%'} bgcolor={'#fff'}>
                                <IconButton onClick={() => this.handleDialog('isOpenLocationPin', true)} size='small'>
                                  <PinDropIcon htmlColor='#2a2444'/>
                                </IconButton>
                              </Box>
                              )}
                        </div>
                        <div style={{ ...styles.bottomBox, ...{height: 420, paddingBottom: 51} }}>
                            <div style = {styles.content}>
                            <ShipmentInfo 
                                label={label} 
                                shipment={selectedShipment} 
                                shipmentHistory={selectedShipment.history} 
                                pickup={pickup} 
                                dropoff={dropoff} 
                                isEdit={false} 
                                history={this.props.history}
                            />
                            </div>
                            <div style={styles.footer} className={'momentumScrollX'}>
                                <AxlButton bg={'white'} compact={true} onClick={ this.downloadPDF } source={images.icon.label}>{`Full Label`}</AxlButton>
                                <div style={{minWidth: '140px'}}>
                                    <AxlButton bg={'white'} compact={true} style={{margin: '0px -1px', padding: '0 0 0 6px', width: '85px'}}>{ selectedShipment.tracking_code }</AxlButton>
                                    <AxlButton onClick={() => this.openTrackingLink(selectedShipment.tracking_code) } bg={'gray'} compact={true} source={images.icon.track} style={{margin: '0px -1px', padding: '0 5px 0 0'}}>&nbsp;</AxlButton>
                                </div>
                                <AxlPopConfirm
                                  trigger={<AxlButton bg={'red'} disabled={!canCancel} compact>{`Cancel`}</AxlButton>}
                                  titleFormat={<div>Cancel this shipment?</div>}
                                  textFormat={<div><strong>Please confirm that you want to cancel this shipment!</strong></div>}
                                  okText={`CONFIRM`}
                                  onOk={() => this.cancelShipmentPopup() }
                                  cancelText={`CANCEL`}
                                  onCancel={() => console.log('onCancel')}
                                />
                                {showCancelShipmentModal && (
                                  <AxlModal onClose={this.hideCancelShipmentModal}>
                                      <Box p={4} style={{minWidth: 500}}>
                                          <Typography variant="h5" align="center">Cancel Shipment Reason</Typography>
                                          <Typography>NOTE: Cancel will stop shipment from being delivered. This should only be done per client request!!!</Typography>
                                          <Typography>If you only want to remove shipment from current route, please use the trash can button.</Typography>
                                          <Box my={2}>
                                              <TextField
                                                multiline
                                                variant="outlined"
                                                rows={5}
                                                fullWidth
                                                disabled={cancellingShipment}
                                                value={cancelShipmentReasonMsg}
                                                onChange={(e) => this.onReasonChange(e.target.value)}
                                              />
                                          </Box>
                                          <Box align="center">
                                              <AxlButton compact bg="gray" style={{width: 150}} onClick={this.hideCancelShipmentModal}>CANCEL</AxlButton>
                                              <AxlButton compact bg="pink" style={{width: 150}}
                                                         onClick={this.cancelShipment}
                                                         loading={cancellingShipment}
                                              >
                                                  CONFIRM
                                              </AxlButton>
                                          </Box>
                                          <Box pt={1.5} align="center">
                                              {cancelShipmentError && <Box style={{color: 'red'}}>{cancelShipmentError}</Box>}
                                          </Box>
                                      </Box>
                                  </AxlModal>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ ...styles.panel, width: '70%' }}>
                    <div style={{ ...styles.innerBox, ...{backgroundColor: 'none', textAlign: 'left'} }}>
                        <AssignmentHistory assignment = {selectedShipmentAssignment} />
                    </div>
                </div>
            </div>
            {isOpenLocationPin && <AxlDialog
              isOpen={isOpenLocationPin}
              children={<LocationPin shipmentAddressInfo={shipmentAddressInfo} selectedStop={selectedStop}/>}
              childrenTitle={'Location Pins'}
              handleClose={() => this.handleDialog('isOpenLocationPin', false)}
            />}
        </div>
    }
}

export default withRouter(SearchResultDetail)

function SliderPrevArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div style={{...styles.arrowButton, ...styles.arrowPrev}} onClick={onClick}><i style={styles.arrowIcon} className='fa fa-angle-left' /></div>
    );
  }
  
function SliderNextArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div style={{...styles.arrowButton, ...styles.arrowNext}} onClick={onClick}><i style={styles.arrowIcon} className='fa fa-angle-right' /></div>
    );
  }
  