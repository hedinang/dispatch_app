import React from 'react';
import { AxlChatForm } from 'axl-reactjs-ui';
//Styles
import styles, * as E from './styles';
import MessengerTabGroups from "../MessengerTabGroups";
import MessengerProfilePanel from '../MessengerProfilePanel';
import MessengerChatList from "../MessengerChatList";
import ShipmentMessengerTabGroups from "../../../containers/ShipmentMessenger/ShipmentMessengerTabGroups";
import FlyChatPanel from "../../../components/FlyChatPanel";
import ActiveParticipantChat from "../../../components/ActiveParticipantChat";
import ShareFilesChat from "../../../components/ShareFilesChat";
import {HistoryListComponent} from "../../../components/HistoryList";
import AssignmentMap from "../../../components/AssignmentMap";
import MessengerActiveTab from "../MessengerActiveTab";

export default class MessengerActivePanel extends React.Component {
  constructor(props) {
    super();
    this.state = {
      _isOpenFlyChat: false,
      _isOpenShareFiles: false,
      _isOpenHistoryPanel: false
    }
  }

  _handleShowFlyChat = () => {
    this.setState({
      _isOpenShareFiles: false,
      _isOpenHistoryPanel: false,
      _isOpenFlyChat: !this.state._isOpenFlyChat
    });
  }

  _handleShowShareFiles = () => {
    this.setState({
      _isOpenFlyChat: false,
      _isOpenHistoryPanel: false,
      _isOpenShareFiles: !this.state._isOpenShareFiles
    });
  }

  _handleShowHistoryPanel = () => {
    this.setState({
      _isOpenFlyChat: false,
      _isOpenShareFiles: false,
      _isOpenHistoryPanel: !this.state._isOpenHistoryPanel
    })
  }

  _isClearShowState = () => {
    this.setState({
      _isOpenFlyChat: false,
      _isOpenShareFiles: false,
      _isOpenHistoryPanel: false,
    })
  }

  componentWillUnmount() {
    this._isClearShowState()
  }

  render() {
    const { _isOpenFlyChat, _isOpenShareFiles, _isOpenHistoryPanel } = this.state;

    return <E.Container>
      <E.Top>
        <MessengerProfilePanel />
        <MessengerTabGroups
          onChangeFlyChat={this._handleShowFlyChat}
          onChangeShareFiles={this._handleShowShareFiles}
          onChangeHistoryPanel={this._handleShowHistoryPanel}
        />
      </E.Top>
      <E.Main>
        {_isOpenFlyChat && <FlyChatPanel>
          <ActiveParticipantChat />
        </FlyChatPanel>}
        {_isOpenShareFiles && <FlyChatPanel>
          <ShareFilesChat />
        </FlyChatPanel>}
        {_isOpenHistoryPanel && <FlyChatPanel styleContainer={styles.historyPanelStyle}>
          <E.MapContainer>
            <AssignmentMap />
          </E.MapContainer>
          <E.HistoryPanelDetailContainer>
            <HistoryListComponent baseUrl={`/events/assignments/185092`} type='assignment' {...this.props} viewDispatch={true} />
          </E.HistoryPanelDetailContainer>
        </FlyChatPanel>}
        <MessengerChatList />
      </E.Main>
    </E.Container>;
  }
}
