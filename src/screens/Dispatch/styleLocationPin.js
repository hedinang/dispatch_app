import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  root: {
    fontFamily: 'AvenirNext',
  },
  text: {
    color: '#7b7b7b',
    fontSize: '14px',
    fontFamily: 'AvenirNext',
    marginTop: 0,

    '&__secondary': {
      color: '#626262',
    },

    '&__italic': {
      color: '#626262',
      fontStyle: 'italic',
    },
  },
  map: {
    width: '100%',
    height: '350px',
  },
  disabled: {
    opacity: 0.5,
    userSelect: 'none',
    pointerEvents: 'none',
  },
  appBar: {
    backgroundColor: 'unset',
    color: '#5a5a5a',
    fontFamily: 'AvenirNext',
    fontWeight: 600,
    boxShadow: 'none',
  },
  muiTabRoot: {
    minWidth: 10,
    padding: '12px 0px',
    marginRight: 32,
    textTransform: 'none',
    fontFamily: 'AvenirNext',
    fontWeight: 600,

    '& .MuiTab-wrapper': {
      alignItems: 'flex-start',
    },

    '&:nth-child(3)': {
      minWidth: 70, 
    },
    '&:nth-child(4)': {
      minWidth: 80, 
    }
  },
  tabPanel: {
    padding: '8px 0',
  }
}));