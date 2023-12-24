import React from 'react';
import { IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import _ from 'lodash';

import { getEvents } from '../../stores/api';
import styles from './styles';
import { EVENT_TEMPLATE_OWNERS, EVENT_TEMPLATE_TARGETS } from '../../constants/eventTemplate';
import { EventTemplates } from '../../components/EventTemplates';

function EventCrews({crewId, closePanel}) {

  return (
    <div>
      <div style={styles.title}>
        <div>{`Driver Crew History`}</div>
        {closePanel && <IconButton onClick={closePanel} size='small'><CloseIcon/></IconButton>}
      </div>

      <EventTemplates
        getEventList={getEvents}
        historyId={`CR_${crewId}`}
        canSearch={false}
        targets={[EVENT_TEMPLATE_TARGETS.DISPATCHER_APP]}
        owners={[EVENT_TEMPLATE_OWNERS.DRIVER_CREW]}
        urlParams={{
          ref: true
        }}
      />
    </div>
  )
}

export default EventCrews