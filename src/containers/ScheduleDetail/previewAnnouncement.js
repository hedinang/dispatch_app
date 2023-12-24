import React, { useState } from 'react';

import { Avatar, Box, IconButton, Typography, makeStyles } from '@material-ui/core';
import clsx from "clsx";
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import AxlDialog from '../../components/AxlDialog';

const useStyles = makeStyles({
  pre: {
    fontFamily: 'inherit', 
    whiteSpace: 'unset', 
    width: '100%',
    fontSize: '8pt',
    margin: '4px 0',

    '& img': {
      width: '100%'
    }
  },
  show_less: {
    WebkitBoxOrient: 'vertical', 
    WebkitLineClamp: 1,
    lineClamp: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
  },
  avatar: {
    width: 24,
    height: 24
  }
})

const SimulatationAnnouncement = ({ title, content }) => {
  const classes = useStyles();
  const [isViewFull, setIsViewFull] = useState(false);

  const handleViewFull = (val) => {
    setIsViewFull(val);
  }

  const renderContent = () => {
    return (
      <Box bgcolor={'#fff'} 
        borderRadius={4} 
        p={1}
        display={'flex'} 
        flexDirection={'column'} 
        alignItems={'flex-start'} 
        maxHeight={'calc(100vh - 300px)'} 
        overflow={'auto'}
        width={'95%'}
        
        style={{cursor: 'pointer'}}
      >
        <Box display={'flex'} justifyContent={'space-between'} width={'100%'} alignItems={'center'}>
          <Box display={'flex'} alignItems={'center'}>
            <Avatar src='/assets/images/logo.png' classes={{img: classes.avatar}}/>
            <Typography style={{fontSize: '12px', fontWeight: 600, marginLeft: 8}}>Axlehire</Typography>
          </Box>
          <IconButton onClick={() => handleViewFull(!isViewFull)} size='small'>
            {isViewFull ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        <Box fontSize={'12pt'} fontWeight={600}>{title}</Box>
        <pre className={clsx({
          [classes.pre]: true,
          [classes.show_less]: !isViewFull
        })} >{content}</pre> 
      </Box>
    )
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
        justifyContent={'flex-start'}
      >
        {renderContent()}
      </Box>
    </Box>
  );
};

function PreviewAnnouncement({ isOpen, handleClose, content, title}) {
  return (
    <AxlDialog 
      isOpen={isOpen} 
      maxWidth="xs" 
      handleClose={handleClose}
      childrenTitle={`Preview Announcement`} 
      children={<SimulatationAnnouncement content={content} title={title} />}
    />
  );
}

export default PreviewAnnouncement;
