import React, { Component } from 'react';
import styles, * as E from './styles';
import {inject, observer} from "mobx-react";
import { AxlLoading } from 'axl-reactjs-ui';

@inject('messengerStore')
@observer
class MessengerListDispatcher extends Component {
  componentDidMount() {
    const { messengerStore } = this.props;
    messengerStore.getDispatchers();
  }

  handleClickUser(userId) {
    console.log(userId)
  }

  render() {
    const { messengerStore } = this.props;
    const { upserting, followers, topicSelected, dispatchers } = messengerStore;

    return <E.Container>
      <E.Title>{`Dispatcher list`}</E.Title>
      <E.Inner>
        {(dispatchers.length && topicSelected) ?
          <E.Scrollable>
            {messengerStore.dispatchers.map((dispatcher, index) => <ActiveMember followers={(topicSelected && topicSelected.follower_ids) || []} dispatcher={dispatcher} key={index} />)}
          </E.Scrollable> : <E.LoadingContainer><AxlLoading thin={1} color={`#ccc`} size={75} /></E.LoadingContainer>}
      </E.Inner>
      {/*<E.GroupActions>*/}
      {/*  <AxlButton tiny bg={`gray`} style={styles.actionButton}>{`Cancle`}</AxlButton>*/}
      {/*  <AxlButton tiny style={styles.actionButton}>{`Force Follow`}</AxlButton>*/}
      {/*</E.GroupActions>*/}
    </E.Container>;
  }
}

@inject('messengerStore')
@observer
class ActiveMember extends Component {
  constructor(props) {
    super(props);
    this.state = {
      followers: this.props.followers
    }
  }

  _handleClickUser = (e, userId) => {
    const { messengerStore } = this.props;
    const { followers, unFollowers, forceFollow, forceUnfollow } = messengerStore;
    let _followers = this.state.followers
    if(e.target.checked) {
      _followers.push(userId);
      messengerStore.forceFollow([userId]);
    } else {
      _followers = _followers.map(f => f !== userId && f).filter(f => f);
      messengerStore.forceUnfollow([userId]);
    }

    this.setState({followers: _followers})
  }

  render() {
    const { dispatcher } = this.props;

    return <E.ActiveMember>
      <E.Column>
        <E.Avatar>
          <E.AvatarImage />
        </E.Avatar>
        <E.Name>
          <E.UserName>{this.props.dispatcher.username} - <E.CodeId>{this.props.dispatcher.id}</E.CodeId></E.UserName>
        </E.Name>
      </E.Column>
      {dispatcher && <E.CheckBox checked={this.state.followers.indexOf(dispatcher.id) !== -1} type={"checkbox"} onChange={(e) => this._handleClickUser(e, dispatcher.id)} />}
    </E.ActiveMember>;
  }
}

export default {
  MessengerListDispatcher
}