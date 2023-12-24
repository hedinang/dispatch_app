import React, {useCallback} from 'react';
import moment from 'moment-timezone';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  notdWrapper: {
    borderRadius: '3px',
    cursor: 'pointer',
    paddingTop: '5px'
  },
  title: {
    fontFamily: 'AvenirNext-Bold',
    fontSize: '11px',
    color: '#d0021b',
    width: '100%',
    display:'flex'
  },
  note: {
    fontFamily: 'AvenirNext',
    fontSize: '11px',
    marginTop: 7,
    padding: 10,
    backgroundColor: "#fff",
    wordBreak: 'break-word'
  },
  contentWrapper: {
    overflow: 'hidden',
    width: '100%',
    textAlign: 'left',
  },
  btnWrapper: {
    marginLeft: 'auto'
  },
  editBtn: {
    fontFamily: 'AvenirNext-DemiBold',
    border: 'solid 0.5px #aeaeae',
    background: '#fff',
    borderRadius: '1.5px',
    padding: '2px 12px',
    color: '#aeaeae',
    fontSize: '10px',
    marginLeft: '10px',
    cursor: 'pointer',
  },
}));
const NotdBar = ({ code, note, openFnc, title = 'NOTD Reason Code' }) => {
  const classes = useStyles();
  if (code && code != '') {
    return (
      <div className={classes.notdWrapper} onClick={() => openFnc()}>
        <div className={classes.title}>
          <span>+NOTD: {code}</span>
        </div>
        {note && <div className={classes.note}>{note}</div>}
      </div>
    );
  }
  return (
    <div className={classes.notdWrapper} onClick={() => openFnc()}>
      <div className={classes.title}>
        + {title}
      </div>
    </div>
  );
};


function areEqual(prevProps, nextProps) {
  return (prevProps.code === nextProps.code &&  prevProps.note === nextProps.note);
  /*
  only render when code changes
  */
}
export default React.memo(NotdBar, areEqual);
