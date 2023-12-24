import React, { Component } from 'react';
import _ from 'lodash';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import { inject, observer } from 'mobx-react';
import { AxlButton, AxlModal, AxlCheckbox, AxlInput } from 'axl-reactjs-ui';
import { Button, Tooltip } from '@material-ui/core';
import { ThumbsUpDown as ThumbsUpDownIcon } from '@material-ui/icons';

import VerifyPin from './verifyPin';
import Geofencing from '../../components/Geofencing';
import ShipmentTags from '../../components/ShipmentTags';
import ShipmentInfo from '../../components/ShipmentInfo';
import ShipmentFeedback from '../../components/ShipmentFeedback';

import styles from './styles';
import { images } from '../../constants/images';
import { PERMISSION_DENIED_TEXT } from '../../constants/common';
import { ACTIONS } from '../../constants/ActionPattern';
import AxlDialog from '../../components/AxlDialog';
import SplitRoute from '../../components/SplitRoute';

@inject('assignmentStore', 'shipmentStore', 'userStore', 'permissionStore')
@observer
class ShipmentDetail extends Component {
    constructor(props) {
        super(props)
        const { params } = this.props.match
        const { stopId } = params
        const { shipmentStore } = this.props
        shipmentStore.loadStop(stopId);
        this.state = {
            showShipmentTag: false,
            showShipmentPicture: false,
            showSignaturePicture: false,
            showImageUploadPreView: false,
            showShipmentFeedbackPanel: false,
            showCancelShipmentModal: false,
            cancellingShipment: false,
            cancelShipmentError: '',
            cancelShipmentReasonMsg: '',
            splitAssignmentLabel: '',
            splitRelabelShipment: false,
            showVerify: false,
            isSubmitting: false,
            refreshNoteTs: undefined,
            isSpliting: false,
            newAssignment: {},
        }
    }

    onChangeAssignmentLabel = (e) => {
      if (/[^a-zA-Z0-9-]/g.test(e.target.value)) {
        return;
      }

      this.setState({splitAssignmentLabel: e.target.value.toUpperCase()});
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

    updateDropoffNote(m) {
      console.log(m)
    }

    openTrackingLink(code) {
        window.open(`https://axlehi.re/${code}`, '_blank')
    }

    toggleFeedback = () => {
        this.setState({
            showShipmentTag: false,
            showShipmentFeedbackPanel: !this.state.showShipmentFeedbackPanel
        });
      if(this.state.showShipmentFeedbackPanel) {
        const {feedbackForm} = this.props.shipmentStore;
        feedbackForm.rollbackData();
      }
    }

    toggleTags = () => {
        this.setState({
            showShipmentTag: !this.state.showShipmentTag,
            showShipmentFeedbackPanel: false
        })
    }

    componentWillReceiveProps(nextProps) {
        // Close feedback
        if(this.props.match.params.stopId !== nextProps.match.params.stopId) {
            this.setState({showShipmentFeedbackPanel: false, showShipmentTag: false});
        }
    }

    cancelShipment = () => {
      const { cancelShipmentReasonMsg } = this.state;
      const { shipmentStore, assignmentStore } = this.props
      const { selectedShipment } = shipmentStore;
      const { selectedAssignment } = assignmentStore;

      if (!selectedShipment || !selectedShipment.id) return;

      if (!cancelShipmentReasonMsg || !cancelShipmentReasonMsg.trim()) {
        this.setState({cancelShipmentError: 'Reason cannot empty!'})
        return;
      }

      this.setState({cancellingShipment: true});
      shipmentStore.cancelShipment(selectedShipment, cancelShipmentReasonMsg, res => {
        if (res.ok) {
          this.hideCancelShipmentModal();
          assignmentStore.selectAssignment(selectedAssignment.assignment);
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

    copyTrackingCode(trackingCode) {
      const el = document.createElement('textarea');
      el.value = trackingCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }

    onChangeRelabelShipment = (e) => {
      this.setState({splitRelabelShipment: e.target.checked});
    }

    requestSplitRoute = () => {
      this.setState({showSplitConfirmation: true});
    }

    cancelSplitRoute = () => {
      this.setState({showSplitConfirmation: false});
    }

    splitRoute = () => {
      this.setState({isSubmitting: true});
      const { splitAssignmentLabel, splitRelabelShipment } = this.state;
      const { shipmentStore, assignmentStore, history } = this.props;
      const { selectedAssignment } = assignmentStore;
      const { selectedStop, selectedShipment, splitingRoute } = shipmentStore;
      if (!selectedStop) return;

      const { shipment, label, client, corresponding_stop } = selectedStop;
      if (!shipment) return;

      const assignmentLabel = splitAssignmentLabel && splitAssignmentLabel != '' ?  splitAssignmentLabel :
            selectedAssignment && selectedAssignment.assignment ? selectedAssignment.assignment.label : ''

      const data = {
        assignment_label: assignmentLabel,
        relabel_shipment: this.state.splitRelabelShipment
      };

      shipmentStore.splitRoute(shipment.assignment_id, shipment.id, data, (result) => {
        this.setState({isSubmitting: false});
        if (result.message && result.message.error === 'true') {
          toast.warning(result.message.content, {containerId: 'main'})
        }
        assignmentStore.appendSplitedAssignment(shipment.assignment_id, result.assignment);
        const path = history.location.pathname;
        // process to new path
        const newPath = path.replace(/[\d]+\/stops/ig, `${result.assignment.id}/stops`);
        history.push(newPath);
        this.setState({showSplitConfirmation: false, splitAssignmentLabel: '', splitRelabelShipment: false});
      });
    }

    showVerifyPopup = () => {
      this.setState({showVerifyPopup: true});
    }

    refreshShipmentNotes = () => {
      this.setState({ refreshNoteTs: Date.now() });
    };

    handleCloseSplit = (newAssignmentData) => {
      const { isSpliting } = this.state;
      if(isSpliting) return;
      
      if(!newAssignmentData || _.isEmpty(newAssignmentData)) {
        this.setState({ showSplitConfirmation: false, splitAssignmentLabel: '', splitRelabelShipment: false });
        return;
      }

      const { history } = this.props;
      const path = history.location.pathname;
      const isFromAssignmentDetail = path && path.startsWith('/assignments');
      const newPath = path.replace(/[\d]+\/stops/ig, `${newAssignmentData.id}/stops`);
      if (isFromAssignmentDetail) {
        window.open(newPath, '_self', 'noopener,noreferrer');
      }
      else {
        history.push(newPath);
      }
      this.setState({ showSplitConfirmation: false, splitAssignmentLabel: '', splitRelabelShipment: false });
    }

    render() {
        const { showShipmentFeedbackPanel, showShipmentTag, splitAssignmentLabel, isSubmitting, refreshNoteTs, isSpliting, newAssignment } = this.state;
        const { shipmentStore, history, userStore, assignmentStore, permissionStore } = this.props;
        const { selectedStop, selectedShipment, splitingRoute } = shipmentStore;
        const {selectedAssignment} = assignmentStore;
        if (!selectedStop || !selectedShipment) {
            return (<div></div>);
        }
        const assignmentLabel = splitAssignmentLabel && splitAssignmentLabel != '' ?  splitAssignmentLabel :
          selectedAssignment && selectedAssignment.assignment ? selectedAssignment.assignment.label : ''
        const { shipment, label, corresponding_stop } = selectedStop;
        const shipmentHistory = selectedShipment && selectedShipment.history ? selectedShipment.history : [];
        const canCancel = !selectedShipment.is_cancelled && selectedShipment.status !== 'DROPOFF_SUCCEEDED';

        const geocodeAddresses = selectedStop && selectedStop.geocodeAddresses ? selectedStop.geocodeAddresses : [];
        const pinNumber = geocodeAddresses.length > 0 && geocodeAddresses[0].pin_verified && geocodeAddresses[0].pin_verified == true ? 1 : 0;
        const photoNumber = geocodeAddresses.length > 0 ? geocodeAddresses.reduce((a, b) => {
          const currentPhotoNumber = 'photos_verified' in b ? b.photos_verified.length : 0
          return a + currentPhotoNumber
        }, 0): 0
        const verifyPhotos = geocodeAddresses.length > 0 ? geocodeAddresses.flatMap(a => {
          return 'photos_verified' in a ? a['photos_verified']: []
        }) : []
        const driverPhotos = selectedStop && selectedStop.info && selectedStop.info.images ? selectedStop.info.images : []
        const incidentId = selectedStop && selectedStop.incidentId ? selectedStop.incidentId : null
        const isDeniedSplitRoute = permissionStore.isDenied(ACTIONS.ASSIGNMENTS.SPLIT);
        const isReturnShipment = (shipment && shipment.tags && shipment.tags.includes("RETURN"));
        
        return (<div style={{...styles.container,...this.style}}>
            <div style={styles.body}>
                {(!showShipmentFeedbackPanel && !showShipmentTag) && (<ShipmentInfo
                  match={this.props.match}
                  history={this.props.history}
                  label={label}
                  shipment={shipment}
                  dropoff={selectedStop}
                  pickup={corresponding_stop}
                  shipmentHistory={shipmentHistory}
                  downloadLabel={this.download('PDF')}
                  refreshNoteTs={refreshNoteTs}
                />)}
                {showShipmentFeedbackPanel && <ShipmentFeedback onClose={() => this.setState({showShipmentFeedbackPanel: false})} toggleFeedback={this.toggleFeedback} />}
                {showShipmentTag && <ShipmentTags shipment={selectedShipment} onClose={() => this.setState({showShipmentTag: false})} toggleTags={this.toggleTags} />}
            </div>
            <div style={styles.footer} className={'momentumScrollX'}>
                <Tooltip title="Feedback"><span>
                <AxlButton bg={`${showShipmentFeedbackPanel ? 'borPinkBgWhite' : 'white'}`} compact={true} onClick={this.toggleFeedback}>
                  <ThumbsUpDownIcon style={{fontSize: '20px'}} />
                </AxlButton>
                </span></Tooltip>
                <Tooltip title="Download label"><span>
                <AxlButton bg={'white'} compact={true} onClick={this.download('PDF')} source={images.icon.label}></AxlButton>
                </span></Tooltip>
                <div style={{minWidth: '140px'}}>
                    <AxlButton onClick={() => this.copyTrackingCode(shipment.tracking_code)}
                               bg={'white'} compact={true}
                               style={{margin: '0px -1px', padding: '0 0 0 6px', width: '85px'}}>{ shipment.tracking_code }</AxlButton>
                    <AxlButton onClick={() => this.openTrackingLink(shipment.tracking_code) } bg={'gray'} compact={true} source={images.icon.track} style={{margin: '0px -1px', padding: '0 5px 0 0'}}>&nbsp;</AxlButton>
                </div>
                <Tooltip title="Update shipment tags"><span>
                <AxlButton bg={'white'} compact onClick={this.toggleTags} source={images.icon.tag} />
                </span></Tooltip>

                <div style={{flex: 1}}></div>
                <VerifyPin pinNumber={pinNumber} photoNumber={photoNumber} verifyPhotos={verifyPhotos} driverPhotos={driverPhotos} 
                            geocodedLocation={selectedStop.location} verifiedLocation={geocodeAddresses} incidentId={incidentId} shipmentId={shipment.id} isVerified={pinNumber===1}/>

                {userStore.canSplitRoute && assignmentStore.isNotTheFirstStop(shipment) && assignmentStore.havePendingStop(shipment) && !isReturnShipment && (
                  <Tooltip title={isDeniedSplitRoute ? PERMISSION_DENIED_TEXT : 'Split to new route from this shipment'}>
                    <span>
                      <AxlButton disabled={isDeniedSplitRoute} bg={`white`} compact={true} ico={{className: 'fa fa-scissors'}} onClick={this.requestSplitRoute} />
                    </span>
                  </Tooltip>
                )}
                <Geofencing targetPrefix="ST" targetID={selectedStop.id} targetNoteID={shipment.id} ContainerProps={{ style: { height: '32px', alignItems: 'stretch' } }} IconProps={{ style: { border: 'none', backgroundColor: '#fff' } }} onSuccess={this.refreshShipmentNotes} selectedStop={selectedStop} />

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
            {this.state.showSplitConfirmation && 
              <AxlDialog
                isOpen={this.state.showSplitConfirmation}
                childrenTitle={'Split confirmation'}
                children={
                  <SplitRoute 
                    selectedAssignment={selectedAssignment} 
                    label={label} 
                    assignmentLabel={assignmentLabel}
                    setIsSpliting={(val) => this.setState({ isSpliting: val})}
                    onClose={(data) => this.handleCloseSplit(data)}
                    shipment={shipment}
                    shipmentStore={shipmentStore}
                    assignmentStore={assignmentStore}
                    isSpliting={isSpliting}
                    setNewAssignment={(data) => this.setState({ newAssignment: data || {}})}
                  />
                }
                handleClose={() => this.handleCloseSplit(newAssignment)}
                DialogContentProps={{style: {padding: '16px 0 0'}}}
              />
            }

        </div>)
    }
}

export default ShipmentDetail;
