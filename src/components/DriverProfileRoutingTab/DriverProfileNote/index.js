import { Box, Button, Card, CardContent, CircularProgress, TextField, Typography } from '@material-ui/core';
import { EditOutlined } from '@material-ui/icons';
import produce from 'immer';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify';
import { toastMessage } from '../../../constants/toastMessage';
import { stores } from '../../../stores';
import api from '../../../stores/api';
import { useStyles } from './styles';

function DriverProfileNote({driver}) {
  const [driverNotes, setDriverNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isNewOrEdit, setIsNewOrEdit] = useState(false);
  const [note, setNote] = useState('');
  const [noteId, setNoteId] = useState(null);
  const inputRef = useRef(null);
  const classes = useStyles();
  const [disabledSave, setDisabledSave] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const driverId = `DR_${driver.id}`
    setLoading(true)
    api.get(`/notes/${driverId}`)
      .then(response => {
        setLoading(false);
        setDriverNotes(response.data);
      })
  }, []);

  useEffect(()=> {
    scrollToInput()
  }, [noteId])

  const handleAddNew = () => {
    setIsNewOrEdit(true);
  }

  const handleCancelAddNew = () => {
    setIsNewOrEdit(false);
    setNoteId(null);
    setNote('');
  }

  const handleChangeNote = (e) => {
    const tempValue = e.target && e.target.value;
    setNote(tempValue);

    if(tempValue && tempValue.trim()) {
      setDisabledSave(false)
    }
  }

  const handleSaveNote = () => {
    const driverId = `DR_${driver.id}`
    
    if(!note || !note.trim()) {
      toast.error(toastMessage.CONTENT_INVALID, {containerId: 'main'});
      return;
    }
    setDisabledSave(true);
    setIsSubmitting(true);
    if(!noteId) {
      api.post(`/notes/${driverId}`, note.trim()).then(
        response => {
          if(!response.ok) {
            setDisabledSave(false);
            toast.error(response && response.data && response.data.message || toastMessage.ERROR_SAVING, {containerId: 'main'});
          }
          if(response.ok) {
            const newNote = {
              id: response.data,
              content: note.trim(),
              ts: moment().valueOf(),
              subject: {
                attributes: {
                  username: stores && stores.userStore && stores.userStore.user && stores.userStore.user.name || ''
                }
              }
            }
            setDriverNotes(prev => [newNote, ...prev])
            handleCancelAddNew();
            toast.success(toastMessage.SAVED_SUCCESS, {containerId: 'main'});
          }
          setIsSubmitting(false);
        }
      )
    }
    else {
      api.put(`/notes/${noteId}/edit`, note.trim()).then(
        response => {
          if(!response.ok) {
            setDisabledSave(false);
            toast.error(response && response.data && response.data.message || toastMessage.ERROR_UPDATING, {containerId: 'main'});
          }
  
          if(response.ok) {
            const noteUpdated = produce(driverNotes, draft => {
              const dataIndex = draft.findIndex(d => d.id === noteId);
              if (dataIndex > -1) {
                draft[dataIndex].content = note.trim();
                draft[dataIndex].ts = moment().valueOf();
                draft[dataIndex].subject.attributes.username = stores && stores.userStore && stores.userStore.user && stores.userStore.user.name || '';
                draft.unshift(...draft.splice(dataIndex, 1))
              }
            });
            setDriverNotes(noteUpdated);
            handleCancelAddNew();
            toast.success(toastMessage.UPDATED_SUCCESS, {containerId: 'main'});
          }
          setIsSubmitting(false);
        }
      )
    }
    
  }

  const handleEditDriverNote = (id, content) => {
    setIsNewOrEdit(true);
    setNote(content);
    setNoteId(id);
    scrollToInput();
  }

  const scrollToInput = () => {
    inputRef.current && inputRef.current.scrollIntoView({ behavior: 'smooth' });
  }

  if(loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center'>
        <CircularProgress color="primary" size={24}/>
      </Box>
    )
  }
  
      return (
      <Box display='flex' m={1} flexDirection='column'>
        {
          !isNewOrEdit && (
            <Box display='flex' flexDirection='row-reverse' flex={'1 1 auto'} mb={1}>
              <Button variant="contained" color="primary" onClick={handleAddNew} size="small">Add</Button>
            </Box>
          )
        }
        
        {
          isNewOrEdit && (
            <Box display='flex' flex={'1 1 auto'} mb={1} flexDirection='column' ref={inputRef}>
              <Box flex={'1 1 auto'}>
                <TextField
                  id="multiple-notes"
                  label="Notes"
                  multiline
                  minRows={3}
                  value={note}
                  variant="outlined"
                  fullWidth
                  onChange={handleChangeNote}
                  disabled={isSubmitting}
                />
              </Box>
              <Box display='flex' flexDirection='row' mt={1} justifyContent="end">
                {!isSubmitting && 
                  (<Box mr={1}>
                    <Button onClick={handleCancelAddNew} size="small">Cancel</Button>
                  </Box>)
                }
                <Button variant="contained" color="primary" onClick={handleSaveNote} disabled={disabledSave} size="small" 
                    startIcon={isSubmitting ? <CircularProgress color="primary" size={24}/>: null}>
                      {isSubmitting ? 'Submitting...' : 'Save'}</Button>
              </Box>
            </Box>
          )
        }

        {
          !isNewOrEdit && driverNotes && driverNotes.length === 0 && (
            <Box display='flex' justifyContent='center'>
              <Typography variant="h4">No data found</Typography>
            </Box>
          )
        }
  
        {
          driverNotes && driverNotes.map(item => {
            const convertDate = moment.tz(item.ts, moment.tz.guess()).format("M/D/YYYY H:mm z");
            const username = (item.subject && item.subject.attributes && item.subject.attributes.username) || '';
            return (
              <Box display='flex' flex={'1 1 auto'} key={item.id} mb={1}>
                <Card className={classes.card}>
                  <CardContent className={classes.cardContent}>
                    <Box display='flex' flexDirection='row' justifyContent='space-between' alignItems='center'>
                      <Box style={{width: '100%'}}>
                        <Box display='flex' flexDirection='row' alignItems='center' className={classes.caption}>
                          <Typography variant="caption">{`${convertDate} - by `}</Typography>
                          <Typography variant="caption" className={classes.username}>{`${username}`}</Typography>
                        </Box>
                        <Box display='flex'>
                          <Typography variant="h4" className={classes.content}>{item.content}</Typography>
                          <Box className={`actions`}>
                            <EditOutlined className={classes.cursor} onClick={() => handleEditDriverNote(item.id, item.content)}/>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )
          })
        } 
      </Box>
    )
}

export default DriverProfileNote
