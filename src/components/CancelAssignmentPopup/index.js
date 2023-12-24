import React, { useRef, useState, useEffect } from 'react';
import { AxlButton } from 'axl-reactjs-ui';
import { makeStyles, createTheme , Dialog, DialogTitle, DialogContent, Typography, ThemeProvider, Grid, Select, MenuItem,TextField } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
  },
  selectBtn: {
    padding: '8px 30px 8px 10px',
    fontSize: '13px',
  },
  whiteBtn: {
    minWidth: "70px",
  },
  saveBtn: {
    minWidth: "70px",
  },
  textField: {
    "& textarea::placeholder": {
      fontSize: "13px"
    }
  },
  container: {
      backgroundColor: '#f4f4f4',
      borderRadius: '4px',
      marginBottom: '10px',
      padding: '5px',
      border: '1px solid #d0021b',
  },

  
}));
const theme = createTheme({
  palette: {
    primary: {
      main: '#737273',
    },
    text: {
      primary: '#4f4c75',
    },
  },
  overrides: {
    MuiInputBase: {
      root: {
        color: '#737273',
        width: '100%',
        fontSize:'13px',
      },
    },
    MuiFormLabel: {
      root: {
        fontSize:'13px',
        color: '#737273'
      }
    },
    MenuItem: {
      selected: {
        color: '#4f4c75'
      }
    }
  },
});

const CancelAssignmentPopupContent = ({ code, note, closePopup, saveAction, reasonList = [] }) => {
  const noteRef = useRef('');
  const [codeSelect, setCodeSelect] = useState(0);
  const [isSave, setIsSave] = useState(false);
  useEffect(() => {
    if(note) {
      noteRef.current.value = note;
    }
    if(code) {
      setCodeSelect(code)
      setIsSave(true);
    }
  }, []);

  const handleChangeSelect = e => {
    setCodeSelect(e.target.value);
    setIsSave(true);
  };
  const classes = useStyles();
  return (

      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Select
              classes={{ root: classes.selectBtn }}
              variant="outlined"
              id="notd-code"
              value={codeSelect}
              onChange={handleChangeSelect}
            >
              {<MenuItem disabled key={''} value={0}>Select cancellation reason code</MenuItem> }
              {reasonList.map(item => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12}>
            <div>
              <TextField
                label="Notes"
                variant="outlined"
                fullWidth
                multiline
                placeholder="Enter remarks here ...."
                rows={5}
                id="standard-start-adornment"
                inputRef={noteRef}
                classes={{root: classes.textField}}
              />
            </div>
          </Grid>
          <Grid item xs={12} style={{textAlign: 'right'}}>
            <AxlButton
              compact={true}
              style={{minWidth: 70}}
              disableElevation
              onClick={() => closePopup()}
              bg={'gray'}
            >{`Cancel`}</AxlButton>
            <AxlButton
              disabled={!isSave}
              compact={true}
              style={{minWidth: 70}}
              disableElevation
              co
              onClick={() => saveAction(codeSelect, noteRef.current.value)}
            >{`Save`}</AxlButton>
          </Grid>
        </Grid>
      </div>
  );
};

const CancelAssignmentPopup = ({open, closePopup, saveAction, reasonList = [], title }) => {
  return (
    <ThemeProvider theme={theme}>    
      <Dialog open={open} fullWidth onClose={closePopup} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">
          <Typography >
            {title}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <CancelAssignmentPopupContent title={title} reasonList={reasonList} closePopup={closePopup} saveAction={saveAction} />
        </DialogContent>
      </Dialog>    
    </ThemeProvider>      
  );
}

export default React.memo(CancelAssignmentPopup);
