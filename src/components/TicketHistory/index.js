import React from "react";
import {useHistory} from "react-router-dom";
import {AxlButton} from "axl-reactjs-ui";

import History from "../../containers/History";

export default function TicketHistory(props) {
  const {match} = props;
  const {id, tid} = match.params;
  const history = useHistory();

  return (
    <div style={{position: 'absolute', right: 0, top: 0, bottom: 0, left: 0}}>
      <div style={{position: 'absolute', right: 0, top: 0, bottom: 0, left: 0, padding: 10, backgroundColor: '#fff'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <span>Ticket History <code>{tid}</code></span>
          <AxlButton compact={true} bg={'black'} circular={true}
                     onClick={() => history.replace(`/ticket-booking/${id}/ticket/${tid}`)}
          >
            Close
          </AxlButton>
        </div>
        <div style={{position: 'absolute', right: 0, top: 50, bottom: 0, padding: '10px', left: 0, overflow: 'auto'}}>
          <History uid={ 'TK_' + tid} />
        </div>
      </div>
    </div>
  );
}