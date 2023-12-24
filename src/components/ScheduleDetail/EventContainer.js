import React, { useState } from 'react';
import { Dialog, DialogContent, makeStyles } from '@material-ui/core';

import Event from './Event';

const useStyles = makeStyles({
  events: {
    paddingLeft: '1rem',
  },
  title: {
    color: '#666',
    fontSize: '14px',
    fontFamily: 'AvenirNext',
    textTransform: 'uppercase',
    textDecoration: 'underline',
    marginBottom: '1rem',
  },
  json: {
    padding: '1rem',
    backgroundColor: 'rgb(240, 240, 240)',
    whiteSpace: 'pre-wrap',
  },
});

function EventContainer({ date, events }) {
  const classes = useStyles();
  const [selectedEvent, setSelectedEvent] = useState(undefined);

  const handleSelectEvent = (event) => setSelectedEvent(event);

  const handleCloseDialog = () => setSelectedEvent(undefined);

  return (
    <React.Fragment>
      <div key={date} className={classes.events}>
        <div className={classes.title}>{date}</div>
        {events.map((event) => (
          <Event key={event.ts} event={event} onSelect={handleSelectEvent} />
        ))}
      </div>
      <Dialog open={Boolean(selectedEvent)} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogContent>
          <pre className={classes.json}>{JSON.stringify(selectedEvent, null, 4)}</pre>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}

export default EventContainer;
