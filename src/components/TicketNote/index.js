import React, { useEffect, useState } from 'react';
import { AxlModal } from 'axl-reactjs-ui';
import api from '../../stores/api';
import NotePopup from '../NotePopup';
import NoteContent from '../NoteContent';
import styles from './styles';

const TicketNote = ({ ticketId, userId }) => {
  const [content, setContent] = useState('');

  const [notes, setNotes] = useState([]);
  const [isEnableEdit, setIsEnableEdit] = useState(false);
  const [isEditForm, setIsEditForm] = useState(false);
  const [isShowPopup, setIsShowPopup] = useState(false);

  const addFnc = () => {
    setIsEditForm(false);
    setIsShowPopup(true);
    setContent('');
  }
  const editFnc = () => {
    const lastNote = notes.find(note => note.subject.uid === `US_${userId}`);
    if(lastNote) {
      setIsEditForm(true);
      setContent(lastNote.content);
      setIsShowPopup(true);
    }
  }
  const loadData = (ticketId, userId) => {
    api.get(`/notes/TK_${ticketId}`).then(resp => {
      if (resp.ok) {
        if (resp.data && resp.data.length > 0) {
          setNotes(resp.data);
          const lastNote = resp.data.find(note => note.subject.uid === `US_${userId}`);
          if(lastNote) {
            setIsEnableEdit(true);
          } else {
            setIsEnableEdit(false);
          }
        } else {
          setNotes([]);
        }
      } else {
        setNotes([]);
      }
    });
  };
  useEffect(() => {
    loadData(ticketId, userId)
  }, [ticketId, userId]);
  const editContent = (content) => {
    api.put(`/notes/TK_${ticketId}`, content).then(resp => {
      if(resp.ok) {
        loadData(ticketId, userId);
      }
      setIsShowPopup(false);
    })
  }
  const saveContent = (content) => {
    api.post(`/notes/TK_${ticketId}`, content).then(resp => {
      if(resp.ok) {
        loadData(ticketId, userId);
      }
      setIsShowPopup(false);
    })
  }
  return (
    <div style={styles.container}>
      <NoteContent
        title='Ticket Note'
        notes={notes}
        editFnc={editFnc}
        addFnc={addFnc}
        isEnableEdit={isEnableEdit}
      />
      {isShowPopup && (
        <AxlModal
          onClose={() => {
            setIsShowPopup(false);
          }}
        >
          <NotePopup
            title={isEditForm ? 'Edit Last Ticket Note' : 'Ticket Note'}
            isEditForm={isEditForm}
            content={content}
            closePopup={() => {
              setIsShowPopup(false);
            }}
            saveContent={saveContent}
            editContent={editContent}
          />
        </AxlModal>
      )}
    </div>
  );
};
export default React.memo(TicketNote);
