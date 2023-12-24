import React, { Component } from 'react';
import { Grid, Checkbox, Divider, FormControlLabel, Typography } from "@material-ui/core";
import {texts} from '../../styled-components';
import ThumbUp from '@material-ui/icons/ThumbUp';
import ThumbDown from '@material-ui/icons/ThumbDown';
import Modal from '@material-ui/core/Modal';
import Box from '@material-ui/core/Box';
import moment from 'moment';
import styles from './styles';


 
class DeliverableAddressInfo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            openPreview: false
        }
    }
    previewImage = (url) => {
        this.setState({
            openPreview: true,
            previewUrl: url
        })
    }

    handleClosePreview = () => {
        this.setState({
            openPreview: false,
            previewUrl: null
        })
    }
    
    render() {
        const { address } = this.props
        if (!address) return <div></div>
        const { uncharted, pin_verified, photos_verified } = address
        return <div style={texts.body}>
                <Divider style={{marginTop: 10, marginBottom: 8}} />
                <div style={texts.label2}>Address Info</div>
                <Grid container>
                    <Grid item xs={6}>
                        <div>
                            <FormControlLabel control={<Checkbox disabled={true} checked={uncharted} />} label="Un-Charted" />
                        </div>
                    </Grid>
                    <Grid item xs={6}>
                        <div>
                            <FormControlLabel control={<Checkbox disabled={true} checked={pin_verified} />} label="Verified Pin" />
                        </div>
                    </Grid>
                </Grid>
                <Divider style={{marginBottom: 8}} />
                <div style={texts.label2}>Verified photos
                </div>
                {(!photos_verified || photos_verified.length == 0) && (
                    <div><Typography>No photo</Typography></div>
                )}
                <Box className='list-items' display={'flex'} justifyContent={'flex-start'} style={{gap: 8}} flexWrap={'wrap'} marginTop={1}>
                    {photos_verified && photos_verified.map(photo => {
                    return <Box key={photo.id} display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'} width={120}>
                        <img src ={photo.signed_url} onClick={() => this.previewImage(photo.signed_url)} width={50} height={50}/>
                        {/* <Close onClick={() => handleClickOpenRemoveImage(photo)}></Close> */}
                        { "uploaded_ts" in photo && "uploaded_by_name" in photo && (
                        <p style={{color: "rgb(136, 136, 136)", fontSize: "0.8em", textAlign: 'center'}}>uploaded at {moment(photo.uploaded_ts).format('MM/DD hh:mmA')} by {photo.uploaded_by_name}</p>
                        )}
                    </Box>  
                    })}
                </Box>
                <Modal
        open={this.state.openPreview}
        onClose={this.handleClosePreview}>
        <Box sx={{...styles.preview, ...styles.modalPreviewImage}}>
          <Box style={{maxHeight: 600,textAlign: "center",overflowY:"scroll"}}>
            <img src={this.state.previewUrl} style={{width:'100%'}}/>
          </Box>
        </Box>
      </Modal>

        </div>
    }
}

export default DeliverableAddressInfo;