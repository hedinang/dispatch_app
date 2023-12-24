import React from 'react';
import { AxlChatBox } from 'axl-reactjs-ui';
//Styles
import styles, * as E from './styles';

export default class MessengerChatList extends React.Component {
  render() {
    return <E.Container>
      <E.Scrollable>
        <E.SubTitle>{`ASSIGNMENT ACTIVATED - TODAY, 8:05AM `}</E.SubTitle>
        <E.SubTitle>{`10:05AM`}</E.SubTitle>
        <AxlChatBox />
        <AxlChatBox float profile theme={`me`} />
        <AxlChatBox />
        <AxlChatBox float profile theme={`me`} />
        <AxlChatBox />
        <AxlChatBox />
        <E.SubTitle>{`AA PICKUP COMPLETED - TODAY 9:05 AM`}</E.SubTitle>
        <E.SubTitle>{`AA-1 DROPOFF SUCCESSFULL - TODAY 9:40AM`}</E.SubTitle>
        <E.SubTitle>{`10:05AM`}</E.SubTitle>
        <AxlChatBox />
        <AxlChatBox float profile theme={`me`} />
        <AxlChatBox float profile theme={`me`} />
        <E.SubTitle>{`10:05AM`}</E.SubTitle>
        <AxlChatBox float profile theme={`me`} />
        <AxlChatBox float profile theme={`me`} />
        <AxlChatBox />
        <AxlChatBox />
        <AxlChatBox />
        <E.SubTitle>{`10:05AM`}</E.SubTitle>
        <AxlChatBox />
        <AxlChatBox />
        <AxlChatBox theme={`me`} />
      </E.Scrollable>
    </E.Container>;
  }
}