import React, { useEffect, useState } from 'react';
import { get } from 'lodash';
import { toast } from 'react-toastify';
import { Box, Button, CircularProgress, TextField, makeStyles } from '@material-ui/core';
import {  addNoteBillingDisposition, editNoteBillingDisposition, getNotesBillingDisposition } from '../../stores/api';

const useStyles = makeStyles({
  label: {
    marginTop: 0,
  },
});

function BillingNote({ handleClose, data }) {
  const classes = useStyles();
  const [billingList, setBillingList] = useState([]);

  const [note, setNote] = useState(null);
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [isSubmit, setIsSubmit] = useState(false);
  const billingID = data.id;

  const updateBillingDispositionState = (text) => {
    setBillingList(billingList.map((item) => (item.id === data.id ? { ...item, note: text } : item)));
  };

  useEffect(() => {
      getNotesBillingDisposition(`LH_${billingID}`).then((res) => {
        if (res.status === 200) {
          const [latestNote] = res.data;
          setNote(latestNote);
          setContent(latestNote ? latestNote.content : '');
        }
      });
    }, []);

  const handleChangeNote = (evt) => {
    setError(null);
    setContent(evt.target.value);
  };

  const handleSubmit = () => {
    const text = content.trim();
    if (!text) return setError('This field is required');

    setIsSubmit(true);
    addNoteBillingDisposition(`LH_${billingID}`, text).then((response) => {
      setIsSubmit(false);
      if (response.status !== 200) return toast.error(get(response, 'data.message', "Update Failed"));

      updateBillingDispositionState(text);
      toast.success("Added successfully");
      handleClose();
    });
  };

  return (
    <Box>
      <Box>
        <p className={classes.label}>To update, please type in the field below</p>
        <TextField id="note" variant="outlined" placeholder="Add note here..." minRows={3} multiline fullWidth value={content} onChange={handleChangeNote} error={Boolean(error)} helperText={error || ''} />
      </Box>
      <Box display="flex" mt={2} justifyContent="flex-end" style={{ gap: '16px' }}>
        <Button variant="contained" color="default" onClick={handleClose} disabled={isSubmit} disableElevation>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={isSubmit || Boolean(error)} disableElevation>
          {isSubmit ? <CircularProgress color="primary" size={20} /> : 'note.id' ? 'Update' : 'Submit'}
        </Button>
      </Box>
    </Box>
  );
}

export default BillingNote;
