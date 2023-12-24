import React, { useEffect, useState } from 'react';
import { AxlModal } from 'axl-reactjs-ui';
import api from '../../stores/api';
import NotePopup from '../NotePopup';
import NoteContent from '../NoteContent';
import styles from './styles';

const AssignmentNote = ({ assignmentId, userId, refreshNoteTs }) => {
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
  const loadData = (assignmentId, userId) => {
    api.get(`/notes/AS_${assignmentId}`).then(resp => {
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
    loadData(assignmentId, userId);
  }, [assignmentId, userId]);

  useEffect(() => {
    if (!refreshNoteTs) return;

    loadData(assignmentId, userId);
  }, [refreshNoteTs]);

  const editContent = (content) => {
    api.put(`/notes/AS_${assignmentId}`, content).then(resp => {
      if(resp.ok) {
        loadData(assignmentId, userId);
      }
      setIsShowPopup(false);
    })
  }
  const saveContent = (content) => {
    api.post(`/notes/AS_${assignmentId}`, content).then(resp => {
      if(resp.ok) {
        loadData(assignmentId, userId);
      }
      setIsShowPopup(false);
    })
  }
  return (
    <div style={styles.container}>
      <NoteContent
        title='Assignment Note'
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
            title={isEditForm ? 'Edit Last Assignment Note' : 'Assignment Note'}
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
export default React.memo(AssignmentNote);
