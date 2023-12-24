import React, { Component } from 'react';
import styles, * as E from './styles';
import {inject, observer} from "mobx-react";
import { AxlLoading } from 'axl-reactjs-ui';

@inject('messengerStore', 'assignmentStore')
@observer
export default class ActiveParticipantChat extends Component {
  componentDidMount() {
    this.props.messengerStore.getDispatchers();
  }

  render() {
    const { messengerStore } = this.props;
    const { dispatchers, userListing, topicSelected } = messengerStore;
    const ActiveParticipants = topicSelected && ( (topicSelected.protege_ids && topicSelected.follower_ids && topicSelected.protege_ids.length &&
      topicSelected.follower_ids.map(uid => topicSelected.protege_ids.indexOf(uid) === -1 && uid).filter(uid => uid)
    ) || topicSelected.follower_ids ) || 0;

    return <E.Container>
      <E.Title>{`Active participants in Chat`}</E.Title>
      <E.Inner>
        {!userListing ?
          <E.Scrollable>
            {!!ActiveParticipants && ActiveParticipants.map((userId, index) => {
              const user = dispatchers.map(d => d.id === userId && d).filter(d => d)[0];
              if(user) {
                return <ActiveMember user={user} key={index}/>
              }
            })}
          </E.Scrollable> : <E.LoadingContainer><AxlLoading /></E.LoadingContainer>}
      </E.Inner>
    </E.Container>;
  }
}

class ActiveMember extends Component {
  render() {
    const { user } = this.props;

    return <E.ActiveMember>
      <E.Avatar>
        <E.AvatarImage />
      </E.Avatar>
      <E.Name>{user.username}</E.Name>
    </E.ActiveMember>;
  }
}