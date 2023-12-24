import React from 'react';
import _ from 'lodash';
import moment from 'moment-timezone';
import { makeStyles } from '@material-ui/core';

const ACTION_MAP = {
  create: 'created the schedule',
  update: 'updated the schedule',
};

const FIELDS = {
  earliest_pickup_time: 'Earliest pickup time',
  latest_pickup_time: 'Latest pickup time',
  minute_to_increment: 'Minute to increment',
};

const useStyles = makeStyles({
  event: {
    color: '#4a4a4a',
    fontFamily: 'AvenirNext',
    position: 'relative',
    fontSize: '12px',
    marginBottom: '4px',
    padding: '0',
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    boxSizing: 'border-box',
  },
  left: {
    '& p': {
      margin: '0',
    },
  },
  ts: {
    color: '#96979a',
    fontSize: '12px',
    fontFamily: 'AvenirNext',
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
  dot: {
    position: 'absolute',
    top: '6px',
    left: '-19px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'rgb(204, 204, 204)',
    cursor: 'pointer',
  },
  changed: {
    margin: 0,
    paddingLeft: '24px',
    fontSize: '12px',
  },
});

function Event({ event, onSelect }) {
  const classes = useStyles();

  const handleSelectEvent = () => {
    if (typeof onSelect === 'function') onSelect(event);
  };

  const renderSubject = (event) => {
    const username = _.get(event, 'subject.attributes.name', '');
    const userID = _.trimStart(_.get(event, 'subject.uid', ''), 'US_');

    return (
      <p>
        User <strong>{username}</strong> [{userID}] {ACTION_MAP[event.action]}
      </p>
    );
  };

  const renderChange = (event) => {
    const from = _.get(event, 'fact', {});
    const to = _.get(event, 'state', {});

    const fieldsChanged = Object.keys(to)
      .map((field) => {
        const title = FIELDS[field] || field;

        if (!from[field]) return { title, description: to[field] };
        if (from[field] && !to[field]) return { title, description: 'deleted' };
        if (from[field] && to[field] && from[field] !== to[field]) return { title, description: `change from ${from[field]} to ${to[field]}` };
      })
      .filter(Boolean);

    return (
      <ul className={classes.changed}>
        {fieldsChanged.map((changed, index) => (
          <li key={index}>
            {changed.title} {changed.description}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={classes.event}>
      <div className={classes.dot} onClick={handleSelectEvent} />
      <div className={classes.left}>
        {renderSubject(event)}
        {renderChange(event)}
      </div>
      <div className={classes.right}>
        <p className={classes.ts}>
          {moment(event.ts).tz(moment.tz.guess()).format('HH:mm:ss A z')}
        </p>
      </div>
    </div>
  );
}

export default Event;
