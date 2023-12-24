import React from 'react';

import { Box, makeStyles } from '@material-ui/core';

import AxlDialog from '../../components/AxlDialog';

const useStyles = makeStyles({
  pre: {
    fontFamily: 'inherit', 
    whiteSpace: 'unset', 
    width: '100%',
    fontSize: '10pt',

    '& img': {
      width: '100%'
    }
  }
})

const SimulatationAnnouncement = ({ title, content, notiType, emailSubject }) => {
  const classes = useStyles();
  const renderContent = () => {
    return (
      <Box bgcolor={'#fff'} 
        borderRadius={4} 
        px={2} 
        py={4} 
        display={'flex'} 
        flexDirection={'column'} alignItems={'center'} 
        maxHeight={'calc(100vh - 300px)'} 
        overflow={'auto'}
        maxWidth={'100%'}
      >
        <Box fontSize={'14pt'} fontWeight={600} mb={'1rem'}>{notiType === 'email' ? emailSubject : title}</Box>
        <pre className={classes.pre} dangerouslySetInnerHTML={{ __html: content }} />
      </Box>
    )
  }

  if(['email'].includes(notiType)) {
    return renderContent();
  }

  return (
    <Box bgcolor={'#000'} p={1} borderRadius={25}>
      <Box bgcolor={'#bbbaba'} 
        borderRadius={20} 
        p={1} 
        height={'calc(100vh - 200px)'} 
        maxHeight={700} pt={2.5}
        overflow={'auto'} 
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        justifyContent={'center'}
      >
        {renderContent()}
      </Box>
    </Box>
  );
};

function PreviewHTMLAnnouncement({ isOpen, handleClose, content, title, notiType, emailSubject }) {
  return (
    <AxlDialog 
      isOpen={isOpen} 
      maxWidth="xs" 
      handleClose={handleClose}
      childrenTitle={`Preview HTML for Announcement`} 
      children={<SimulatationAnnouncement content={content} title={title} notiType={notiType} emailSubject={emailSubject}/>}
    />
  );
}

export default PreviewHTMLAnnouncement;
