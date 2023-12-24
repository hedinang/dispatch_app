import React, { Fragment, useState } from 'react'
import AxlUploadFile from '../AxlUploadFile';
import AxlDialog from '../AxlDialog';
import { Avatar, Box, Button, CircularProgress, Typography } from '@material-ui/core';

function UploadPOD({isOpen, isUploading, handleClose, handleSave}) {
  const [imagePOD, setImagePOD] = useState(null);
  const configFileSize = process.env.REACT_APP_FILE_SIZE_LIMIT || 15;

  const handleCloseDialog = () => {
    if(isUploading) return;
    setImagePOD(null);
    handleClose();
  }

  const handleUpload = () => {
    handleSave(imagePOD);
  }

  return (
    <AxlDialog 
      isOpen={isOpen}
      handleClose={handleCloseDialog}
      childrenTitle={'Upload POD Image'}
      children={
        <Fragment>
        {imagePOD && (
          <Box display='flex' justifyContent='center' alignItems='center'>
            <Avatar variant="square" src={URL.createObjectURL(imagePOD)} style={{width: '100%', height: '100%'}}/>
          </Box>
        )}
        {!imagePOD && <AxlUploadFile handleChange={e => setImagePOD(e.target.files[0])} subTitle={'Upload here…'} maxSize={configFileSize} fieldName={'image_pod'}/>}
        </Fragment>
      }
      childrenAction={
        <Box display={'flex'} justifyContent={imagePOD ? 'space-between' : 'flex-end'} width={'100%'} mx={1} py={0.5}>
          {imagePOD && (
            <Box display={'flex'} alignItems={'center'}>
              <input type="file" hidden accept="image/png, image/jpeg" onChange={e => setImagePOD(e.target.files[0])} id="upload-file" disabled={isUploading}/>
              <label htmlFor="upload-file">
                <Button variant="outlined" disabled={isUploading} component="span">
                  Change
                </Button>
              </label>
              <Typography style={{marginLeft: 8}}>
                {imagePOD && imagePOD.name}
              </Typography>
            </Box>
          )}
          <Box>
            <Button onClick={handleCloseDialog} style={{marginRight: 8}} disabled={isUploading}>Cancel</Button>
            <Button onClick={handleUpload} variant="contained" color="primary" disabled={!imagePOD || isUploading}>
              {isUploading && <CircularProgress size={24}/>}
              {!isUploading && 'Upload'}
            </Button>
          </Box>
        </Box>
      }
    />
  )
}

export default UploadPOD