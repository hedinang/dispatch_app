import React, { useState, useEffect } from 'react';
import { get, trim } from 'lodash';
import { toast } from 'react-toastify';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tooltip, FormLabel, Table, TableHead, TableBody, TableRow, TableCell, makeStyles, Checkbox } from '@material-ui/core';
import { images } from '../../constants/images';

import { api } from '../../stores/api';

const useStyles = makeStyles({
  heading: {
    color: '#4a4a4a',
    fontSize: '18px',
    fontFamily: 'AvenirNext-DemiBold',
    marginTop: 0,
    marginBottom: '0.5rem',
  },
  btn: {
    minWidth: 0,
    fontFamily: 'AvenirNext',
    color: '#aaaaaa',
    padding: '4px 6px',
    margin: '0 2px',
    borderRadius: 3,
    backgroundColor: 'rgb(244, 244, 244)',
  },
  icon: {
    width: '20px',
    height: '20px',
    objectFit: 'cover',
  },
  table: {
    marginBottom: '2rem',
  },
  tableHead: {
    backgroundColor: '#dedeff',
  },
  tableCell: {
    color: '#4a4a4a',
    border: '1px solid rgba(0, 0, 0, 0.23)',
  },
  formLabel: {
    color: '#707070',
    fontSize: '14px',
    display: 'block',
    marginBottom: '0.5rem',
    fontFamily: 'AvenirNext-Medium',
  },
  textField: {
    fontSize: '14px',

    '& textarea::placeholder': {
      color: '#9b9b9b',
      fontSize: '12px',
      fontFamily: 'AvenirNext',
      fontWeight: 400,
    },
  },
});

const TARGET_PREFIX = ['AS', 'ST'];

function Geofencing({ targetPrefix, targetID, targetNoteID, onSuccess, ContainerProps, IconProps, selectedStop }) {
  const classes = useStyles();

  const [persist, setPersist] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [geofencing, setGeofencing] = useState(true);
  const [data, setData] = useState(undefined);

  const dialogTitle = targetPrefix === 'AS' ? (geofencing ? 'Disable Assignment Geofencing' : 'Enable Assignment Geofencing') : geofencing ? 'Disable Stop Geofencing' : 'Enable Stop Geofencing';
  const tooltip = geofencing ? 'Disable Geofencing' : 'Enable Geofencing';
  const notePrefix = geofencing ? 'Geofencing disabled with reason' : 'Geofencing enable with reason';
  const headers = ['', 'Data'];
  const rows = [
    { title: 'No. of previous successful dropoffs', value: get(data, 'successfull_dropoff', 'N/A') },
    { title: 'Geofencing accuracy', value: get(data, 'location.accuracy') ? `${(get(data, 'location.accuracy') * 1.09361).toFixed(2)} (yards)` : 'N/A' },
    { title: 'Geofencing boundaries', value: get(data, 'geofence_boundaries') === true ? 'Verified' : 'N/A' },
  ];

  const handleOpenDialog = () => {
    setOpenDialog(true);
    const uri = targetPrefix === 'AS' ? `/assignments/geofencing/${targetID}` : `/assignments/geofencing/stop/${targetID}`;
    api.get(uri).then((response) => {
      if (response.status === 200) setData(response.data);
    });
  };

  const handleCloseDialog = () => {
    setNote('');
    setError('');
    targetPrefix === 'ST' && setPersist(selectedStop.persist)
    setLoading(false);
    setOpenDialog(false);
  };

  const handleChangeNote = (event) => {
    setError('');
    setNote(event.target.value);
  };

  const handleChangePersist = (event) => {
    setError('');
    setPersist(event.target.checked);
  };

  const handleSubmit = () => {
    const content = trim(note);
    if (!content) return setError('This field is required');

    const prefix = targetPrefix === 'ST' ? 'SH' : targetPrefix;

    setLoading(true);
    const text = `${notePrefix}: ${trim(content)}`;
    const body = {
      geofencing: !geofencing,
      persist: persist,
      note: text,
      targetNoteUID: `${prefix}_${targetNoteID}`,
      prefixUID: `${targetPrefix}_${targetID}`
    }

    api.put("/metadata/update-geofencing", body).then((response) => {
      setLoading(false);
      if (response.status !== 200) return toast.error(get(response, 'data.message', 'Something went wrong!'));

      if (typeof onSuccess === 'function') onSuccess();

      setGeofencing(!geofencing);
      setNote('');
      setError('');
      setLoading(false);
      setOpenDialog(false);
    });
  };

  useEffect(() => {
    api.get(`/metadata/${targetPrefix}_${targetID}/DELIVERY`).then((response) => {
      const status = get(response, 'data.geofencing', true);
      setGeofencing(status);
    });

    selectedStop && setPersist(selectedStop.persist)
  }, [targetPrefix, targetID, selectedStop]);

  if (!TARGET_PREFIX.includes(targetPrefix)) return null;

  return (
    <Box display="flex" alignItems="center" {...ContainerProps}>
      <Tooltip title={tooltip}>
        <Button variant="outlined" className={classes.btn} onClick={handleOpenDialog} disableElevation disableRipple {...IconProps}>
          <img className={classes.icon} src={images.icon.geofence} alt="" />
        </Button>
      </Tooltip>
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle disableTypography>
          <h6 className={classes.heading}>{dialogTitle}</h6>
        </DialogTitle>
        <DialogContent>
          <Table size="small" className={classes.table}>
            <TableHead>
              <TableRow className={classes.tableHead}>
                {headers.map((title) => (
                  <TableCell key={title} classes={{ root: classes.tableCell }}>
                    {title}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.title}>
                  <TableCell classes={{ root: classes.tableCell }}>{row.title}</TableCell>
                  <TableCell classes={{ root: classes.tableCell }}>{row.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {targetPrefix === 'ST' &&
            <div>
              <Checkbox checked={persist} onClick={handleChangePersist} style={{ paddingLeft: '0px' }} /> <span>Save current driver dropoff location</span>
            </div>
          }

          <FormLabel error={Boolean(error)} className={classes.formLabel}>
            Geofence Notes
          </FormLabel>
          <TextField type="text" className={classes.textField} multiline minRows={3} fullWidth variant="outlined" placeholder="Reason is required" value={note} onChange={handleChangeNote} error={Boolean(error)} helperText={error} FormHelperTextProps={{ style: { marginLeft: 0 } }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained" color="inherit" disableElevation>
            CANCEL
          </Button>
          <Button variant="contained" color="primary" onClick={handleSubmit} disableElevation disabled={loading}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Geofencing;
