import React, { useRef, useState, useEffect } from 'react';
import { AxlPanel, AxlButton } from 'axl-reactjs-ui';
import './styles.css';
// Styles
import styles from './styles';

const NotePopup = ({ content, closePopup, saveContent, editContent, isEditForm, title }) => {
  const inputRef = useRef('');
  const [isSave, setIsSave] = useState(false);
  const handleChange = () => {
    if (!isSave && inputRef.current.value) {
      setIsSave(true);
    } else if (inputRef.current.value === '') {
      setIsSave(false);
    }
  };
  useEffect(() => {
    inputRef.current.value = content;
  }, []);
  return (
    <div style={styles.container}>
      <div style={styles.headerTitle}>{title}</div>
      <AxlPanel>
        <AxlPanel.Row>
          <AxlPanel.Col style={styles.GroupPanel}>
            <div style={styles.Field}>
              <textarea
                ref={inputRef}
                placeholder="Add note here..."
                name="content"
                onChange={handleChange}
                className={'textField'}
              ></textarea>
            </div>
          </AxlPanel.Col>
        </AxlPanel.Row>
        <AxlPanel.Row>
          <AxlPanel.Col>
            <AxlPanel.Row align={`center`}>
              <div>
                <AxlButton compact bg={`gray`} onClick={closePopup} style={styles.buttonControl}>{`Cancel`}</AxlButton>
              </div>
              <div style={styles.FieldButton}>
                <AxlButton
                  compact
                  bg={`pink`}
                  disabled={!isSave}
                  onClick={() => {
                    if (!isEditForm) {
                      saveContent(inputRef.current.value);
                    } else {
                      editContent(inputRef.current.value);
                    }
                  }}
                  style={styles.buttonControl}
                >{`Save`}</AxlButton>
              </div>
            </AxlPanel.Row>
          </AxlPanel.Col>
        </AxlPanel.Row>
      </AxlPanel>
    </div>
  );
};
export default React.memo(NotePopup);
