import React, { useRef, useState, useEffect } from 'react';
import { makeStyles, createTheme } from '@material-ui/core/styles';
import { AxlButton } from 'axl-reactjs-ui';
import { TextField,  ThemeProvider, Grid, Paper, Select, MenuItem, Button } from '@material-ui/core';
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
  }
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
// const notdCodeList = ['Client Issue', 'Driver Called Out', 'Driver Capacity'];
const NotdPopup = ({ code, note, closePopup, saveAction, reason = [], title }) => {
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
    <ThemeProvider theme={theme}>
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
              {(!code || code === '') && <MenuItem disabled key={''} value={0}>Select {title} NOTD reason code</MenuItem> }
              {reason.map(item => (
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
                placeholder="Enter remark here ...."
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
              onClick={() => saveAction(codeSelect, noteRef.current.value)}
            >{`Save`}</AxlButton>
          </Grid>
        </Grid>
      </div>
    </ThemeProvider>
  );
};
export default React.memo(NotdPopup);
