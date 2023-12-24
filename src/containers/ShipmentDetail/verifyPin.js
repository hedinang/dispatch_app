import { Tooltip, Typography } from "@material-ui/core";
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Modal from '@material-ui/core/Modal';
import CloseIcon from '@material-ui/icons/Close';
import { AxlModal } from "axl-reactjs-ui";
import React, { useState } from 'react';
import Slider from "react-slick";
import MapIcon from './images/map.png';
import VerifiedPinIcon from './images/verified-pin-icon.png';
import Map from './map';
import styles from './styles';
import './verify.css';

function VerifyPin(props) {
  const {pinNumber, photoNumber, verifyPhotos, driverPhotos, geocodedLocation, verifiedLocation, incidentId, shipmentId, isVerified} = props
  const [openPhoto, setOpenPhoto] = useState(false)
  const [openPin, setOpenPin] = React.useState(false);
  const handleOpenPhoto = () => {
    if (photoNumber == 0) {
      return
    }
    setOpenPhoto(true)
  }

  const handleOpenPin = () => {
    setOpenPin(true)
  }
  const handleClosePin = () => setOpenPin(false);
  const [selectedImage, setSelectedImage] = useState('map')
  const incidentUrl = incidentId ? `${process.env.REACT_APP_GEOCODER_URL}/incident/wrong-dropoff-location/${incidentId}` : 
                                    `${process.env.REACT_APP_GEOCODER_URL}/shipments/${shipmentId}`

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

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <SliderNextArrow />,
    prevArrow: <SliderPrevArrow />,
    className: "verify-slider",
  };
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 700,
    bgcolor: 'background.paper',
    boxShadow: 24,
    padding: '32px 60px',
    border: '2px solid #fff'
  };

  return (
    <React.Fragment>
        <div style={styles.verify}>
          <span style={{borderRight: '1px solid rgb(244 244 244)', height: '32px', display:'inline-block',paddingRight: '10px',}}>
            <Tooltip title="Verify Address Tool"><Link target="_blank" href={incidentUrl} style={{color: '#989798'}}><i className={'fa fa-flag'}></i></Link></Tooltip>
          </span>
          <span style={{paddingLeft: '10px',cursor: 'pointer'}}>
            <Tooltip title="Number of pin">
              <Box display={'inline-block'} paddingRight={0.5}>
                <i className={'fa fa-map-pin'} style={{color:'#8f8b8b', paddingRight: 4}} onClick={handleOpenPin}/>
                <span>{pinNumber}</span>
              </Box>
            </Tooltip>
            <Tooltip title="Number of verified photos">
              <Box display={'inline-block'}>
                <i className={'fa fa-image'} style={{color:'#8f8b8b', paddingRight: 4}} onClick={handleOpenPhoto}/>
                <span>{photoNumber}</span>
              </Box>
            </Tooltip>
          </span>
        </div>
     {openPhoto && (
       <div className="verify-modal"> 
          <AxlModal
            onClose={() => {setOpenPhoto(false)}}
            style={styles.modalVerifyStyle}
            containerStyle={styles.modalContainer}
            > 
            <Grid container spacing={2}>
              <Grid item xs={5}>
                <div className="wrapper-slide">
                  { driverPhotos.length == 0 && (
                    <Typography style={{textAlign: 'center',fontSize: '18px', position:'absolute', width:'100%', marginTop:'50%'}}>
                      No photo
                    </Typography>
                  )}
                  { driverPhotos && (
                    <Slider {...settings}>{driverPhotos.map((img, index) => <div key={index}>
                      <div style={{height: '100%'}}><img src={img.url} style={styles.imageShipment} alt="Driver's photo" /></div>
                      </div>)}
                    </Slider>
                  )}
                  <strong className="title">Driver's Photos</strong>
                </div>
              </Grid>
              <Grid item xs={2}/>
              <Grid item xs={5}>
                  <div className="wrapper-slide">
                    { verifyPhotos.length == 0 && (
                      <Typography style={{textAlign: 'center',fontSize: '18px', position:'absolute', width:'100%', marginTop:'50%'}}>
                        No photo
                      </Typography>
                    )}
                    { verifyPhotos && (
                      <Slider {...settings} style={styles.verifySlider}>{verifyPhotos.map((img, index) => <div key={index}>
                        <div style={{height: '100%'}}><img src={img.signed_url} style={styles.imageShipment} alt="Verified's photo" /></div>
                        </div>)}
                      </Slider>
                    )}
                    <strong className="title">Verified's Photos</strong>
                  </div>
              </Grid>
            </Grid>
          </AxlModal>
       </div>
     )}

    <Modal
      open={openPin}
      onClose={handleClosePin}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <IconButton onClick={handleClosePin} style={{position:'absolute', top: 0, right: 0, color:'#d8d8d8'}}>
          <CloseIcon fontSize='large'/>
        </IconButton>
        <Typography id="modal-modal-title" variant="h6" component="h2" style={{marginBottom: 25}}>
          Address Verified Pins/Images
        </Typography>
        <Box style={styles.verifedContent}>
          {selectedImage == 'map' ? (
            <Map geocodedLocation={geocodedLocation} verifiedLocation={verifiedLocation.length > 0 ? verifiedLocation[0]: {latitude:0, longitude: 0}} isVerified = {isVerified}></Map>
          ): (
            <img src={selectedImage} style={{maxWidth:'100%',maxHeight:'100%', margin: '0px auto', display:'block'}}/>
          )}
          
        </Box>

        <Box style={{width: '100%', marginTop: 15, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <Box style={styles.verfiedImageItem} onClick={() => setSelectedImage('map')}>
            <img src={MapIcon} style={styles.verfiedImage} alt="map icon" />
          </Box>
          {verifyPhotos.map((img, index) => 
            <Box key={index} style={styles.verfiedImageItem} onClick={() => setSelectedImage(img.signed_url)}>
              <img src={img.signed_url} style={styles.verfiedImage} alt="Verified's photo" />
              <img src={VerifiedPinIcon} style={styles.verfiedImageIcon}/>
            </Box>
          )}
        </Box>
        <Box style={{textAlign:'center', marginTop: 50}}>
          <Link target="_blank" href={incidentUrl} style={styles.verfiedLink}>Go to Address Verify Tool</Link>
        </Box>
      </Box>
    </Modal>
    </React.Fragment>
  );
}

export default React.memo(VerifyPin);