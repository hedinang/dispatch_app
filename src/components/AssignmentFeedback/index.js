import React, { useEffect, useState } from 'react';
import { AxlPanel, AxlButton } from 'axl-reactjs-ui';
import IconButton from '@material-ui/core/IconButton';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import api from '../../stores/api';

import styles, * as E from './styles';

const AssignmentFeedback = ({ assignmentId, driverId, closePopup }) => {
  const [isThumbUp, setisThumbUp] = useState(null);
  useEffect(() => {
    api.get(`/assignments/${assignmentId}/feedback`).then(resp => {
      if (resp.ok) {
        if (resp.data) {
          setisThumbUp(!!resp.data.thumb);
        }
      }
    });
  }, [assignmentId])
  const onChangeThumb = () => {
    setisThumbUp(!isThumbUp);
  }
  const saveFeedback = () => {
    api.post(`/assignments/${assignmentId}/feedback`, { thumb: isThumbUp, "driver_id": driverId }).then(resp => {
      closePopup();
    });
  }
  return (
    <E.Container style={styles.container}>
      <div style={styles.headerTitle}>Assignment Feedback</div>
      <AxlPanel>
        <AxlPanel.Row align={`center`} style={styles.iconWrapper}>
          <IconButton aria-label="thumbup" onClick={onChangeThumb}>
            <ThumbUpIcon style={isThumbUp ? { color: '#4abc4e', fontSize: 32 } : { fontSize: 32 }} />
          </IconButton>
          <IconButton aria-label="thumbdown" onClick={onChangeThumb}>
            <ThumbDownIcon style={(isThumbUp === false) ? { color: '#D0021B', fontSize: 32 } : { fontSize: 32 }} />
          </IconButton>
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
                  onClick={() => {
                    saveFeedback();
                  }}
                  style={styles.buttonControl}
                >{`Save`}</AxlButton>
              </div>
            </AxlPanel.Row>
          </AxlPanel.Col>
        </AxlPanel.Row>
      </AxlPanel>
    </E.Container>
  );
};
export default React.memo(AssignmentFeedback);
