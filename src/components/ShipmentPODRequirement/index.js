import React, {Component} from "react";
import {AxlButton, AxlModal, AxlPanel} from "axl-reactjs-ui";
import {withStyles, Tooltip, Dialog, DialogTitle, DialogContent, Typography, DialogActions } from '@material-ui/core';
import {inject, observer} from "mobx-react";
import Slider from "react-slick";
import moment from "moment-timezone";
import _ from 'lodash';
import { toast } from "react-toastify";
import EmailIcon from '@material-ui/icons/Email';

import {images} from "../../constants/images";
import styles, {style} from './styles';
import UploadPOD from "../UploadPOD";

class PODUploader extends Component {
  render() {
    const { uid } = this.props
    if (!uid) return <span />
    const comps = uid.split('_')
    if (comps[0] === 'CS') return <span>Customer</span>
    if (comps[0] === 'DR') return <span>Driver { comps[1]} </span>
    if (comps[0] === 'US') return <span>User { comps[1]} </span>
    return <span>{uid}</span>
  }
}

@inject('assignmentStore', 'shipmentStore', 'userStore')
@observer
class ShipmentPODRequirement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowPanel: true,
      showShipmentPicture: false,
      showSignaturePicture: false,
      showIdCardPicture: false,
      showImageUploadPreView: false,
      showConfirmPopup: false,
      isUploading: false,
    };
  }

  addImage = (shipmentId) => (file) => {
    const { shipmentStore} = this.props;
    this.setState({ isUploading: true });
    
    shipmentStore.addImage(shipmentId, file, (res) => {
      this.setState({ isUploading: false });
      if(res.ok) {
        this.setState({showImageUploadPreView: false});
        toast.success('Upload image successfully', {containerId: 'main'});
        return;
      }
      if(!res.status) {
        toast.error('Uploaded image is too large or no internet connection', {containerId: 'main'});
        return;
      }
      toast.error(res.data && res.data.message ? res.data.message.split('\r\n').join('\n\n') : 'Upload image failed', {containerId: 'main'});
    });
  };

  parsePDFContent = (content) => {
    const lines = content.split("\n");
    const data = {content};
    if (lines && lines.length > 0) {
      lines.forEach(line => {
        if (line.startsWith("DBB")) {
          const dobString = line.substring(3);
          const dob = new Date(dobString.substring(4), dobString.substring(0, 2), dobString.substring(2, 4));
          data['dob'] = dob;
        }

        if (line.startsWith("DCS") || line.startsWith("DAB") || line.startsWith("DBO") ) {
          data['last_name'] = line.substring(3);
        }

        if (line.startsWith("DAC") || line.startsWith("DBP") || line.startsWith("DCT") ) {
          data['first_name'] = line.substring(3);
        }
      })
    }
    return data;
  }

  removePOD = (img) => {
    const { shipmentStore} = this.props;
    const {selectedStop, selectedShipment, uploadingImage} = shipmentStore;
    shipmentStore.deletePOD(img.id, () => {
      shipmentStore.loadStop(selectedStop.id);
      this.setState({showShipmentPicture: false,showConfirmPopup:false});
    });
  }


  
  render() {
    const {isShowPanel, showShipmentPicture, showSignaturePicture, showIdCardPicture, showImageUploadPreView, isUploading } = this.state;
    const {shipment, shipmentStore, classes} = this.props;
    const {selectedStop, selectedShipment, uploadingImage, shipmentAnnotation} = shipmentStore;

    if (!selectedStop || !selectedShipment) return null;

    const info = selectedStop ? selectedStop.info : null;
    const stop_images = info && info.images ? info.images : [];
    const stop_signatures = info && info.signatures ? info.signatures : [];
    const stop_idcards = info && info.idcards ? info.idcards : [];
    const images_count = info ? stop_images.length : 0;
    const signatures_count = info ? stop_signatures.length : 0;
    const idcards_count = info ? stop_idcards.length : 0;
    const photoRequired = Boolean(selectedShipment.delivery_proof_photo_required);
    const signatureRequired = Boolean(selectedShipment.signature_required);
    const idRequired = Boolean(selectedShipment.id_required);
    const requiredBorderStyle = '1px solid #f5a623';

    const settings = {
      dots: false,
      infinite: false,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      nextArrow: <SliderNextArrow />,
      prevArrow: <SliderPrevArrow />
    };

    return (
      <AxlPanel style={{...styles.panelContainer, ...{paddingBottom: 0}}}>
        <Dialog style={{zIndex: 100000, textAlign:'center'}} fullWidth open={this.state.showConfirmPopup} onClose={() => this.setState({showConfirmPopup: false})} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title">
            <Typography variant="h5" style={styles.popupTitle}>
              CONFIRMATION
            </Typography>
          </DialogTitle>
          <DialogContent>
            Are you sure to delete selected photo?
          </DialogContent>
          <DialogActions style={{marginBottom: 10, display:'block'}}>
            <AxlButton bg={`white`} compact onClick={() => this.setState({showConfirmPopup: false})} style={styles.buttonControl}>{`Cancel`}</AxlButton>
            <AxlButton bg={`red2`} compact onClick={() => this.removePOD(this.state.showConfirmPopup)} style={styles.buttonControl}>{`Delete`}</AxlButton>
          </DialogActions>
        </Dialog>
        {isShowPanel && (
          <div >
            <div style={styles.buttonGroupWrapper} className={classes.buttonWrapper}>
              <div>
                <div style={{ ...styles.rowCenter , ...styles.buttonWrapper }}>
                  <div style={{ ...styles.panelHeaderTitle, ...{ flex: 0, paddingTop: 8 } }}>POD</div>
                  <div>
                    <div>
                    <div style={{border: photoRequired ? requiredBorderStyle : undefined}}>
                        <Tooltip title="View shipment photo">
                          <span>
                            <AxlButton
                              bg={'white'}
                              compact={true}
                              source={images.icon.camera}
                              style={{margin: 0, padding: '0', width: '50px'}}
                              onClick={() => {if (stop_images.length > 0) this.setState({showShipmentPicture: true})}}
                            >
                          <span style={styles.count}>{ images_count }</span>
                            </AxlButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Add photo">
                          <span>
                            <AxlButton bg={'white'}
                                  style={{margin: 0, padding: '0 6px 0 0', width: '32px'}}
                              compact={true}
                                  ico={{className: 'fa fa-plus'}}
                                  onClick={() => this.setState({showImageUploadPreView: true})}
                            >
                              <br />
                            </AxlButton>
                          </span>
                        </Tooltip>

                      </div>
                    </div>
                    {photoRequired && <div style={styles.requiredText}>(required)</div>}
                  </div>
                </div>
                {
                  shipmentAnnotation && shipmentAnnotation.status &&
                  <div style={{ display: 'flex', marginTop: '5px', textAlign:'center' }}><span style={{ transform: 'translate(0, 18%)' }}>POD Status: <a href={`${process.env.REACT_APP_DASHBOARD_URL}/pod-management/${shipment.id}/${shipmentAnnotation.id}`} target='_blank'>{shipmentAnnotation.status}</a></span>
                    <Tooltip title={shipmentAnnotation.last_sent_ts ? `Last sent at ${moment.tz(shipmentAnnotation.last_sent_ts, shipment.timezone).format("MM/DD/YYYY hh:mmA z")}` : 'NOT SENT'}>
                      <div style={{ color: '#ccc' }}>
                        <EmailIcon
                          color={shipmentAnnotation.last_sent_ts ? "primary" : "inherit"}
                          style={{ fontSize: '17px', transform: 'translate(0, 28%)', marginLeft: '4px' }}
                        />
                      </div>
                    </Tooltip>
                  </div>
                }
              </div>
              {Boolean(signatureRequired || signatures_count) && (
                <div>
                  <div style={styles.buttonWrapper}>
                    <Tooltip title="View signature">
                    <div style={{border: signatureRequired ? requiredBorderStyle : undefined}}>
                        <AxlButton bg={'white'} compact={true}
                          source={images.icon.sign}
                                 style={{margin: 0, padding: 0}}
                                 onClick={() => this.setState({showSignaturePicture: true})}
                        >
                        <span style={styles.count}>{ signatures_count }</span>
                        </AxlButton>
                      </div>
                    </Tooltip>
                  </div>
                  {signatureRequired && <div style={styles.requiredText}>(required)</div>}
                </div>
              )}
              {Boolean(idRequired || idcards_count) && (
                <div>
                  <div style={styles.buttonWrapper}>
                    <Tooltip title="View ID card info">
                    <div style={{border: idRequired ? requiredBorderStyle : undefined}}>
                        <AxlButton bg={'white'} compact={true}
                          source={images.icon.idcard}
                                 style={{margin: 0, padding: 0}}
                                 onClick={() => this.setState({showIdCardPicture: true})}
                        >
                        <span style={styles.count}>{ idcards_count }</span>
                        </AxlButton>
                      </div>
                    </Tooltip>
                  </div>
                  {idRequired && <div style={styles.requiredText}>(required)</div>}
                </div>
               )}
            </div>
            
          </div>
        )}
        {(showShipmentPicture && stop_images.length > 0 ) && (
          <AxlModal
            onClose={() => this.setState({showShipmentPicture: false})}
            style={styles.modalStyle}
            containerStyle={styles.modalContainer}
          >
            <div style={styles.wrapImages}>
              {stop_images && <Slider {...settings}>{stop_images.map((img, index) => <div key={index}>
                <div style={{ height: '100%' }}><img src={img.url} style={styles.imageShipment} alt="photo" /></div>
                <div style={{ textAlign: 'left', backgroundColor: 'white', padding: '5px' }}>
                  <span style={{ display: 'inline-block', fontFamily: 'AvenirNext-Medium', color: 'gray', padding: '4px 8px', height: '24px', lineHeight: '24px' }}>ID: {img.id} - Taken at {moment.tz(img._created, moment.tz.guess()).format("MM/DD/YYYY hh:mmA z")}</span>
                  {this.props.userStore.canRemovePhoto && <span style={{ float: 'right' }}><Tooltip title="DELETE POD"><span><AxlButton style={{ margin: 0 }} bg={`gray`} compact ico={{ className: 'fa fa-trash' }} onClick={() => this.setState({ showConfirmPopup: img })} /></span></Tooltip>
                  </span>}
                  {
                    shipmentAnnotation && shipmentAnnotation.pods && shipmentAnnotation.pods.find(e => e.pod_id === img.id) && shipmentAnnotation.pods.find(e => e.pod_id === img.id).status &&
                    <span style={{ display: 'inline-block', fontFamily: 'AvenirNext-Medium', color: 'gray', padding: '4px 8px', height: '24px', lineHeight: '24px' }}>
                      {`Status: ${shipmentAnnotation.pods.find(e => e.pod_id === img.id).status}`}
                    </span>
                  }
                </div>
              </div>)}</Slider>}
            </div>
          </AxlModal>
        )}
        {(showSignaturePicture && stop_signatures.length > 0) && (
          <AxlModal
            onClose={() => this.setState({showSignaturePicture: false})}
            style={styles.modalStyle}
            containerStyle={styles.modalContainer}
          >
            <div style={styles.wrapImages}>
              {stop_signatures && <Slider {...settings}>{stop_signatures.map((img, index) => <div key={index}>
                <div style={{height: 'calc(100% - 20px)', backgroundColor: '#fff'}}>
                  <img src={img.data} style={styles.imageShipment} alt="signature" />
                </div>
                <div style={{textAlign: 'center'}}>
                  <span style={{display: 'inline-block', padding: '4px 8px', backgroundColor: '#eee', borderRadius: '4px', marginTop: '4px'}}>Uploaded By: <PODUploader uid={img.uploader} /></span>
                </div>
              </div>)}</Slider>}
            </div>
          </AxlModal>
        )}
        {(showIdCardPicture && stop_idcards.length > 0) && (
          <AxlModal
            onClose={() => this.setState({showIdCardPicture: false})}
            style={styles.modalStyle}
            containerStyle={styles.modalContainer}
          >
            <div style={styles.wrapImages}>
              {stop_idcards && (
                <Slider {...settings}>
                  {stop_idcards.map((img, index) => {
                    if (!img.data) return null;
                    const info = this.parsePDFContent(img.data);

                    return (
                      <div key={index}>
                        <div style={{height: '100%', backgroundColor: '#fff', padding: 30}}>
                          <table style={{margin: 'auto', borderSpacing: 10, fontSize: 18}}>
                            <tr>
                              <td style={{textAlign: 'right', fontWeight: 'bold'}}>Name:</td>
                              <td style={{textAlign: 'left'}}>{info.first_name || '-'} {info.last_name || '-'}</td>
                            </tr>
                            <tr>
                              <td style={{textAlign: 'right', fontWeight: 'bold'}}>Birthday:</td>
                              <td style={{textAlign: 'left'}}>{info.dob ? moment(info.dob).format("YYYY-MM-DD") : '-'}</td>
                            </tr>
                          </table>
                        </div>
                        <div style={{textAlign: 'center'}}>
                          <span style={{display: 'inline-block', padding: '4px 8px', backgroundColor: '#eee', borderRadius: '4px', marginTop: '4px'}}>Uploaded By: <PODUploader uid={img.uploader} /></span>
                        </div>
                      </div>
                    )
                  })}
                </Slider>
              )}
            </div>
          </AxlModal>
        )}
        {showImageUploadPreView && (
          <UploadPOD 
            isOpen={showImageUploadPreView}
            isUploading={isUploading}
            handleClose={() => this.setState({showImageUploadPreView: false})}
            handleSave={(file) => this.addImage(shipment.id)(file)}
          />
        )}
      </AxlPanel>
    );
  }
}

export default withStyles(style)(ShipmentPODRequirement);

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
