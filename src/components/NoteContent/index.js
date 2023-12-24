import React from 'react';
import styles, { Item, Circle, Text } from './styles';
import moment from 'moment-timezone';
import { makeStyles } from '@material-ui/core/styles';

// import Button from '@material-ui/core/Button';
const useStyles = makeStyles(theme => ({
  root: {
    overflowY: 'auto',
    maxHeight: 120,
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#d8d8d8',
      border: '1px solid transparent',
      borderRadius: '4px',
    },
    '&::-webkit-scrollbar': {
      width: '5px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: '#fff',
    },
  },
}));
const NoteContent = ({ notes, addFnc, editFnc, isEnableEdit, title }) => {
  const classes = useStyles();
  if (notes.length > 0) {
    return (
      <div style={styles.noteWrapper}>
        <div style={styles.contentWrapper}>
          <div style={styles.header}>
            <span style={{ ...styles.showLink, ...{ cursor: 'default' } }}>{title}:</span>
            <div style={styles.btnWrapper}>
              <button style={styles.editBtn} onClick={addFnc}>
                Add
              </button>
              {isEnableEdit && (
                <button style={styles.editBtn} onClick={editFnc}>
                  Edit
                </button>
              )}
            </div>
          </div>
          <div className={classes.root}>
            {notes.map((note, i) => {
              const username = (note.subject.attributes && note.subject.attributes.username) || '';
              return (
                <Item key={i}>
                  <Circle />
                  <Text>{note.content}</Text>
                  <i style={styles.date}>
                    {moment.tz(note.ts, moment.tz.guess()).format("M/D/YYYY H:mm z")} - by {username}
                  </i>
                </Item>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={styles.contentWrapper}>
      <span style={styles.showLink} onClick={addFnc}>
        + {title}
      </span>
    </div>
  );
};
export default React.memo(NoteContent);
