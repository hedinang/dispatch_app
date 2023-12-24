import { Avatar, Box, Dialog, DialogContent, DialogTitle, IconButton, makeStyles, Typography } from '@material-ui/core';
import React, { useState } from 'react'
import _ from 'lodash';
import CloseIcon from '@material-ui/icons/Close';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';

const useStyles = makeStyles((theme) => ({
    dialogTitle: {
      paddingBottom: 0,
    },
    title: {
      color: '#4a4a4a'
    },
    avatarPreview: {
      width: 450,
      height: 284,
    },
    avatarPreviewFullScreen: {
      height: '90vh',
      width: '100%'
    },
    avatarImg: {
        objectFit: 'contain',
    },
    iconButton: {
      position: 'absolute',
      top: 0,
      right: 8,
      padding: 6,
      zIndex: 1,
    }
  }));

function PreviewImage({handleClose, title, imgPreview}) {
    const [toggleFullScreen, setToggleFullScreen] = useState(false);
    const classes = useStyles();

    const onClose = () => {
      setToggleFullScreen(false);
      handleClose();
    }

    return (
        <Dialog maxWidth="sm" fullWidth open={!!imgPreview} onClose={onClose} style={{zIndex: 99999}} fullScreen={toggleFullScreen}>
            <DialogTitle className={classes.dialogTitle}>
            <Box display='flex' justifyContent='space-between' alignItems='center'>
                <Box>
                <Typography variant="h6" className={classes.title}>{title}</Typography>
                </Box>
                <IconButton aria-label="close" onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </Box>
            </DialogTitle>

            <DialogContent>
            <Box display='flex' justifyContent='center' alignItems='center' position='relative'>
                <IconButton onClick={() => setToggleFullScreen(!toggleFullScreen)} className={classes.iconButton}>
                {toggleFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon/>}
                </IconButton>
                <Avatar variant="square" src={imgPreview} className={toggleFullScreen ? classes.avatarPreviewFullScreen  : classes.avatarPreview} classes={{img: classes.avatarImg}}/>
            </Box>
            </DialogContent>
        </Dialog>
    )
}

export default PreviewImage