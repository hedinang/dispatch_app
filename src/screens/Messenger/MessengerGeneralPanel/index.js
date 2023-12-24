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
import ShipmentMessenger from "../../../containers/ShipmentMessenger";

export default class MessengerGeneralPanel extends React.Component {
  constructor(props) {
    super();
    this.state = {
      _isOpenFlyChat: false,
      _isOpenShareFiles: false
    }
  }

  _handleShowFlyChat = () => {
    this.setState({
      _isOpenShareFiles: false,
      _isOpenFlyChat: !this.state._isOpenFlyChat
    });
  }

  _handleShowShareFiles = () => {
    this.setState({
      _isOpenFlyChat: false,
      _isOpenShareFiles: !this.state._isOpenShareFiles
    });
  }

  _isClearShowState = () => {
    this.setState({
      _isOpenFlyChat: false,
      _isOpenShareFiles: false
    })
  }

  render() {
    const { _isOpenFlyChat, _isOpenShareFiles } = this.state;

    return <E.Container>
      {/*<E.Top>*/}
      {/*  <MessengerProfilePanel />*/}
      {/*  <MessengerTabGroups.MessengerGeneralTabGroups*/}
      {/*    onChangeFlyChat={this._handleShowFlyChat}*/}
      {/*    onChangeShareFiles={this._handleShowShareFiles}*/}
      {/*  />*/}
      {/*</E.Top>*/}
      {/*<E.Main>*/}
      {/*  {_isOpenFlyChat && <FlyChatPanel>*/}
      {/*    <ActiveParticipantChat />*/}
      {/*  </FlyChatPanel>}*/}
      {/*  {_isOpenShareFiles && <FlyChatPanel>*/}
      {/*    <ShareFilesChat />*/}
      {/*  </FlyChatPanel>}*/}
      {/*  /!*<MessengerChatList />*!/*/}
      {/*</E.Main>*/}
      {/*<E.Bottom>*/}
      {/*  <AxlChatForm />*/}
      {/*</E.Bottom>*/}
      <ShipmentMessenger />
    </E.Container>;
  }
}
