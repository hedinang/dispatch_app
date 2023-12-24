import { Box, IconButton, makeStyles, Typography } from '@material-ui/core';
import React from 'react'
import CloseIcon from '@material-ui/icons/Close';
import _ from 'lodash';

import { EVENT_TEMPLATE_OWNERS, EVENT_TEMPLATE_TARGETS } from '../../constants/eventTemplate';
import { EventTemplates } from '../EventTemplates';

const useStyles = makeStyles((theme) => ({
    title: {
      color: '#4a4a4a',
      fontSize: 13,
    },
}));

function HistoryEventDriver({driverID, driverStore, handleClose, title}) {
    if(!driverID) return null;

    const classes = useStyles();
    
    return (
        <Box p={1.5}>
            <Box display='flex' justifyContent='space-between' alignItems='center'>
                <Typography variant="h6" className={classes.title}>{title}</Typography>
                {handleClose && 
                    <IconButton aria-label="close" onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                }
            </Box>
            <EventTemplates
                getEventList={driverStore && driverStore.getEventDriver}
                historyId={driverID}
                targets={[EVENT_TEMPLATE_TARGETS.DISPATCHER_APP]}
                owners={[EVENT_TEMPLATE_OWNERS.DRIVER]}
            />
        </Box>
    )
}

export default HistoryEventDriver