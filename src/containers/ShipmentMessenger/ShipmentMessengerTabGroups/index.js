import React, { Component } from 'react';
import { AxlButton, AxlPopConfirm, AxlModal } from 'axl-reactjs-ui';
import {inject, observer} from "mobx-react";
import _ from 'lodash';
import moment from "moment";
// Utils
import { MESSENGER_TYPE } from '../../../constants/messenger';
import {ASSIGNMENT_STATUS} from "../../../constants/status";
//Styles
import styles, * as E from './styles';
// Components
import MessengerProfilePanel from "../../../screens/Messenger/MessengerProfilePanel";

@inject('messengerStore')
@observer
export default class ShipmentMessengerTabGroups extends Component {

  render() {
    const cloneProps = Object.assign({}, this.props);
    delete cloneProps.active;
    delete cloneProps.children;

    const { messengerStore } = this.props;
    const { topicSelected, closing, opening } = messengerStore;

    if(!topicSelected) return null;

    const props = cloneProps;

    const isOpen = topicSelected && topicSelected.status !== "CLOSED";

    return <div>
      <ActiveTabs {...props} />
      <div>{this.props.children}</div>
    </div>;
  }
}

@inject('messengerStore', 'userStore', 'assignmentStore')
@observer
class ActiveTabs extends Component {

  constructor(props) {
    super(props);
    this.state = {
      solving: false,
      unsolving: false
    }
  }

  openTopic = () => {
    const { messengerStore } = this.props;
    messengerStore.openTopic();
  };

  closeTopic = () => {
    const { messengerStore } = this.props;
    messengerStore.closeTopic();
  };

  push = (url) => {
    if(!url || !this.props.history) return false;

    this.props.history.push(url);
  }

  _handleFollow = (topic) => {
    const { messengerStore } = this.props;

    messengerStore.follow(res => {
      if(res.ok || res.status === 200) {
        messengerStore.externaLloadTopic(topic.id, response => {
          if(response.ok || response.status === 200) {
            if(this.props.actionCallback) {
              this.props.actionCallback('SELF_FOLLOW', response.data);
            };
          }
        });
      }
    })
  }

  _handleUnfollow = (topic) => {
    const { messengerStore } = this.props;

    messengerStore.unfollow(res => {
      if(res.ok || res.status === 200) {
        messengerStore.externaLloadTopic(topic.id, response => {
          if(response.ok || response.status === 200) {
            if(this.props.actionCallback) {
              this.props.actionCallback('SELF_UNFOLLOW', response.data);
            };
          }
        });
      }
    })
  }

  _handleSolved = (topic) => {
    const { messengerStore } = this.props;

    this.setState({solving: true});

    messengerStore.solve(topic.id || null, res => {
      if(res.ok || res.status === 200) {
        this.setState({solving: false});
        messengerStore.externaLloadTopic(topic.id, response => {
          if(response.ok || response.status === 200) {
            if(this.props.actionCallback) {
              this.props.actionCallback('SOLVED', response.data);
            }
          }
        });
      }
    })
  }

  _handleUnsolved = (topic) => {
    const { messengerStore } = this.props;

    this.setState({unsolving: true});

    messengerStore.unsolve(topic.id || null, res => {
      if(res.ok || res.status === 200) {
        this.setState({unsolving: false});
        messengerStore.externaLloadTopic(topic.id, response => {
          if(response.ok || response.status === 200) {
            if(this.props.actionCallback) {
              this.props.actionCallback('UNSOLVED', response.data);
            }
          }
        });
      }
    })
  }

  render() {
    const { solving, unsolving } = this.state;
    const { userStore, messengerStore, assignmentStore } = this.props;
    const { topicSelected, following, assignmentInfoInTopicSelected } = messengerStore;
    const { selectedAssignment } = assignmentStore;
    const { user } = userStore;
    // Validating
    const isTopicSelected           = !!topicSelected;
    const isTopicOpen               = isTopicSelected && topicSelected.status !== "CLOSED";
    const isAssignmentConversation  = !!(isTopicSelected && topicSelected.ref_type === MESSENGER_TYPE.ASSIGNMENT_CONVERSATION);
    const isGeneralSupport          = !!(isTopicSelected && topicSelected.ref_type === MESSENGER_TYPE.DRIVER_GENERAL_SUPPORT);
    const isAssignment              = (assignmentStore.selectedAssignment && assignmentStore.selectedAssignment.assignment) || (messengerStore.assignmentInfoInTopicSelected && messengerStore.assignmentInfoInTopicSelected.assignment);
    const isCloseTopic              = isTopicOpen && isAssignmentConversation;
    const isReOpenTopic             = !isTopicOpen && isAssignmentConversation;
    const isDriverActive            = !!(assignmentStore.selectedAssignment && assignmentStore.selectedAssignment.assignment && assignmentStore.selectedAssignment.assignment.driver_id) ||
                                      !!(messengerStore.assignmentInfoInTopicSelected && messengerStore.assignmentInfoInTopicSelected.driver && messengerStore.assignmentInfoInTopicSelected.driver.id);
    const isShowFollow              = !following && isCloseTopic && topicSelected.follower_ids && (topicSelected.follower_ids.includes(user.id));
    const isShowUnfollow            = !following && isCloseTopic && topicSelected.follower_ids && (!topicSelected.follower_ids.includes(user.id));
    const isShowSolved              = !solving && isGeneralSupport && user && ['UNSOLVED', 'SOLVING'].includes(topicSelected.situation);
    const isShowUnsolved            = !solving && isGeneralSupport && user && ['SOLVED'].includes(topicSelected.situation);
    const isAssignmentActive        = assignmentInfoInTopicSelected && assignmentInfoInTopicSelected.assignment && (assignmentInfoInTopicSelected.assignment.is_active || (assignmentInfoInTopicSelected.assignment.status === ASSIGNMENT_STATUS.COMPLETED));
    const isDispatchRoute           = window.location.href.match(/\/routes/) && !!window.location.href.match(/\/routes/).length;
    const isMessengerRoute          = window.location.href.match(/\/messenger/) && !!window.location.href.match(/\/messenger/).length;
    // Show is validated
    const isShowAssignmentHistory   = isAssignmentConversation && !!isAssignment && isMessengerRoute;
    const isShowShareFiles          = isAssignmentConversation || isGeneralSupport;
    const isShowMembers             = (isAssignmentConversation || isGeneralSupport) && isTopicOpen;
    const isShowAddUser             = isTopicOpen && isAssignmentConversation;
    const isShowMessengerLink       = isTopicOpen && isAssignmentConversation && isDispatchRoute;
    const isShowDispatchLink        = isAssignmentConversation && !!isAssignment && isMessengerRoute;
    const isShowProfilePanel        = isMessengerRoute && !this.props.assignmentLoading;
    const isShowAssignmentDetail    = isAssignmentConversation && assignmentInfoInTopicSelected && assignmentInfoInTopicSelected.assignment
    // Variables
    const userCounter               = isTopicSelected && _.get(topicSelected, 'follower_ids', []).filter(fid => !topicSelected.protege_ids.includes(fid)).length || 0;
    const dispatchLink              = !!isAssignment ? `/routes` + (isAssignment ? `/${moment(isAssignment.predicted_end_ts).format('YYYY-MM-DD')}/all/all/${isAssignment.id}` : '') : null;
    const messengerLink             = `/messenger/${_.get(messengerStore, 'topicSelected.id', '')}`;
    const filesCounter              = (messengerStore.messengers && messengerStore.messengers.length && messengerStore.messengers.reduce((a, {files}) => a + (files && files.length || 0), 0)) || 0;

    return <E.Container>
      <E.InnerScrollable>
        <E.UserContainer>
          {isShowProfilePanel && <MessengerProfilePanel history={this.props.history} />}
        </E.UserContainer>
        {isShowAssignmentDetail && <AxlButton
          title={`Assignment Details`} compact bg={`greyOne`}
          style={[...styles.buttonWrap, ...styles.buttonCounter]} onClick={() => this.props.onChangePanel('assignmentDetail')}>{`Assignment Details`}</AxlButton>}
        {isShowSolved && <AxlPopConfirm
          custom
          trigger={<AxlButton compact title={`Mark this topic as solved`} bg={`greyOne`} style={[...styles.buttonWrap, ...styles.buttonCounter]}>{`Resolve`}</AxlButton>}
          controls={[
            <AxlButton close-button={true} bg={`whiteBorderGray_1`} style={Object.assign({}, styles.buttonControl, styles.cancleButton)}>{`NO`}</AxlButton>,
            <AxlButton style={styles.buttonControl} onClick={() => this._handleSolved(topicSelected)}>{`YES, resolve this chat`}</AxlButton>
          ]}>
          <E.Title>{`CONFIRMATION`}</E.Title>
          <E.Text>{`Are you sure you want to resolve this chat?`}</E.Text>
        </AxlPopConfirm>}
        {isShowUnsolved &&
          <AxlButton
            title={`Mark this topic as Unsolved`}
            compact bg={`greyOne`}
            onClick={() => this._handleUnsolved(topicSelected)} style={[...styles.buttonWrap, ...styles.buttonCounter]}>{`Unsolved`}</AxlButton>}
        {isShowFollow && <AxlPopConfirm
          main
          trigger={<AxlButton title={`Unfollow this topic`} compact bg={`greyOne`} style={[...styles.buttonWrap, ...styles.buttonCounter]}>{`Unfollow`}</AxlButton>}
          titleFormat={<div>{`CONFIRMATION`}</div>}
          textFormat={<div>{`Are you sure to unfollow this chat?`}</div>}
          okText={`YES, unfollow this chat`}
          onOk={() => this._handleUnfollow(topicSelected)}
          cancelText={`No`}
          onCancel={() => console.log('onCancel')} />}
        {isShowUnfollow && <AxlPopConfirm
          main
          trigger={<AxlButton title={`Follow this topic`} compact bg={`greyOne`} style={[...styles.buttonWrap, ...styles.buttonCounter]}>{`Follow`}</AxlButton>}
          titleFormat={<div>{`CONFIRMATION`}</div>}
          textFormat={<div>{`Are you sure to follow this chat?`}</div>}
          okText={`YES, follow this chat`}
          onOk={() => this._handleFollow(topicSelected)}
          cancelText={`No`}
          onCancel={() => console.log('onCancel')} />}
        {isShowMembers && <AxlButton
        title={`Member list into a topic`}
        source={`/assets/images/svg/member.svg`} compact bg={`greyOne`}
        style={[...styles.buttonWrap, ...styles.buttonCounter]} onClick={() => this.props.onChangePanel('flyChat')}>
        <E.MemberCount>{userCounter}</E.MemberCount>
      </AxlButton>}
        {isShowAddUser && <AxlButton
          title={`Add/Remove user into topic`}
          ico={{className: "fa fa-user-plus"}} compact bg={`greyOne`}
          style={[...styles.buttonWrap, ...styles.buttonCounter]} onClick={() => this.props.onChangePanel('listUser')}>
        </AxlButton>}
        {/*{isShowAssignmentHistory && <AxlButton*/}
        {/*  title={`Assignment history`}*/}
        {/*  ico={{className: 'fa fa-history'}} compact bg={`greyOne`}*/}
        {/*  style={[...styles.buttonWrap, ...styles.buttonCounter]} onClick={() => this.props.onChangePanel('historyPanel')} />}*/}
        <AxlButton
          title={`Share files`}
          source={`/assets/images/copy.png`} compact bg={`greyOne`} style={[...styles.buttonWrap, ...styles.buttonCounter]}
          onClick={() => this.props.onChangePanel('shareFiles')}>
          <E.MemberCount>{filesCounter}</E.MemberCount>
        </AxlButton>
        {isCloseTopic && <AxlPopConfirm
          custom
          trigger={<AxlButton title={`Close topic`} source={`/assets/images/close-chat.png`} compact bg={`greyOne`} style={[...styles.buttonWrap, ...styles.buttonCounter]} />}
          controls={[
            <AxlButton close-button={true} bg={`whiteBorderGray_1`} style={Object.assign({}, styles.buttonControl, styles.cancleButton)}>{`NO`}</AxlButton>,
            <AxlButton style={styles.buttonControl} onClick={() => messengerStore.closeTopic()}>{`YES, close this chat`}</AxlButton>
          ]}>
          <E.Title>{`CONFIRMATION`}</E.Title>
          <E.Text>{`Are you sure to close this chat?`}</E.Text>
        </AxlPopConfirm>}
          {isReOpenTopic && <AxlPopConfirm
          main
          trigger={<AxlButton title={`Reopen topic`} source={`/assets/images/reopen-chat.png`} compact bg={`greyOne`} style={[...styles.buttonWrap, ...styles.buttonCounter]} />}
          titleFormat={<div>{`CONFIRMATION`}</div>}
          textFormat={<div>{`Are you sure you want to reopen this chat?`}</div>}
          okText={`YES, reopen this chat`}
          onOk={() => messengerStore.openTopic()}
          cancelText={`No`}
          onCancel={() => console.log('onCancel')} />}
        {isShowMessengerLink && <AxlButton compact bg={`greyOne`}
          onClick={() => this.push(messengerLink)}
          style={[...styles.buttonWrap, ...styles.buttonCounter]}>{`View in Messenger`}</AxlButton>}
        {isShowDispatchLink && <E.ButtonLinkContainer>
          <E.ButtonLink compact href={dispatchLink} target={`_blank`}
            style={[...styles.buttonWrap, ...styles.buttonCounter]}>{`View in Dispatcher`}</E.ButtonLink>
        </E.ButtonLinkContainer>}
        {isGeneralSupport && <AxlButton title={`Driver's Active Chat`} compact bg={`greyOne`} style={[...styles.buttonWrap, ...styles.buttonCounter]}
                   onClick={() => this.props.onChangePanel('activeChatMini')}>{`Driver's Active Chat`}</AxlButton>}
      </E.InnerScrollable>
    </E.Container>;
  }
}
