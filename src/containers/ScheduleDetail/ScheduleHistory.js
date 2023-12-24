import React from 'react';
import _ from 'lodash';
import { useParams } from 'react-router-dom';
import { Drawer, makeStyles } from '@material-ui/core';

import { getEvents } from '../../stores/api';
import { EventTemplates } from '../../components/EventTemplates';
import { EVENT_TEMPLATE_OWNERS, EVENT_TEMPLATE_TARGETS } from '../../constants/eventTemplate';

const useStyles = makeStyles({
  paper: {
    width: '500px',
    padding: '1rem',
    fontFamily: 'AvenirNext',
  },
  heading: {
    textAlign: 'center',
    marginTop: 0,
  },
  line: {
    width: '1px',
    backgroundColor: 'rgb(204, 204, 204)',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  backdrop: {
    position: 'absolute',
    backgroundColor: '#fff',
  },
});

function ScheduleHistory({ onClose }) {
  const classes = useStyles();
  const { id } = useParams();

  return (
    <Drawer anchor="right" open onClose={onClose} classes={{ paper: classes.paper }}>
      <h4 className={classes.heading}>Schedule History</h4>
      <EventTemplates
        getEventList={getEvents}
        historyId={`DB_${id}`}
        canSearch={false}
        targets={[EVENT_TEMPLATE_TARGETS.DISPATCHER_APP]}
        owners={[EVENT_TEMPLATE_OWNERS.DIRECT_BOOKING]}
        isWithoutSecond={false}
        urlParams={{
          rel: true,
          ref: true
        }}
      />
    </Drawer>
  );
}

export default ScheduleHistory;
