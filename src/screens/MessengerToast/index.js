import React from 'react';
import _ from "lodash";
import {ToastContainerStyled} from "../../components/Toast";
import moment from "moment";
import {inject, observer} from "mobx-react";
import {MESSENGER_TYPE} from "../../constants/messenger";

@inject('messengerStore', 'userStore', 'assignmentStore')
@observer
export default class MessengerToast extends React.Component {
  onClick = () => {
    const {payload, history, assignmentStore} = this.props;
    const firebaseLiveTimeAttribute     = 'data.firebase-messaging-msg-data.data';
    const firebaseBackgroundAttribute   = 'data';
    const firebaseDataAttributes        = _.get(payload, firebaseLiveTimeAttribute, null) ||
                                          _.get(payload, firebaseBackgroundAttribute, null);
    const refType                       = _.get(firebaseDataAttributes, 'messenger_ref_type');
    const msgRefId                      = _.get(firebaseDataAttributes, 'messenger_ref_id');
    const msgTopicId                    = _.get(firebaseDataAttributes, 'messenger_topic_id');
    const isDispatchRoute               = window.location.href.match(/\/routes/) && !!window.location.href.match(/\/routes/).length;
    const isMessengerRoute              = window.location.href.match(/\/messenger/) && !!window.location.href.match(/\/messenger/).length;

    if(refType === MESSENGER_TYPE.ASSIGNMENT_CONVERSATION) {
      if (isDispatchRoute) {
        assignmentStore.loadAssignment(parseInt(msgRefId), (res) => {
          if ((res.status === 200 || res.ok) && res.data.assignment) {
            const dateTime = moment(res.data.assignment.predicted_start_ts).format("YYYY-MM-DD");
            this.props.assignmentStore.setDate(dateTime);
            this.props.assignmentStore.loadAssignments();
            history.push(`/routes/${dateTime}/all/all/${res.data.assignment.id}`);
          }
        });
      } else if(isMessengerRoute) {
        if(this.props.onChangeTab) {
          this.props.onChangeTab(2);
        }
        if(this.props.handleTopicSelected) {
          this.props.handleTopicSelected(msgTopicId);
        }
        history.push(`/messenger/${msgTopicId}`);
      } else {
        return false;
      }
    } else if(refType === MESSENGER_TYPE.DRIVER_GENERAL_SUPPORT) {
      if(this.props.onChangeTab) {
        this.props.onChangeTab(1);
      }
      history.push(`/messenger/${msgTopicId}`);
      if(this.props.handleTopicSelected) {
        this.props.handleTopicSelected(msgTopicId);
      }
    } else {
      return false;
    }

  }

  render() {
    const {payload} = this.props;
    const firebaseLiveTimeAttribute     = 'data.firebase-messaging-msg-data.data';
    const firebaseBackgroundAttribute   = 'data';
    const firebaseDataAttributes        = _.get(payload, firebaseLiveTimeAttribute, null) ||
                                        _.get(payload, firebaseBackgroundAttribute, null);
    const messengerAction               = _.get(firebaseDataAttributes, 'action');
    const refType                       = _.get(firebaseDataAttributes, 'messenger_ref_type');
    const msgTopicName                  = _.get(firebaseDataAttributes, 'messenger_topic_name');
    const msgSectionName                = _.get(firebaseDataAttributes, 'messenger_topic_situation');

    // Toast
    const title = {
      'ASSIGNMENT_CONVERSATION': `ACTIVE${_.defaultTo(msgSectionName && (' - ' + msgSectionName), '')}`,
      'DRIVER_GENERAL_SUPPORT': `GENERAL${_.defaultTo(msgSectionName && (' - ' + msgSectionName), '')}`,
    };
    const topicInfo = {
      'ASSIGNMENT_CONVERSATION': msgTopicName,
      'DRIVER_GENERAL_SUPPORT': 'Driver ' + msgTopicName,
    }
    const body = {
      'NEW_MESSAGE': <div>New message from <b>{topicInfo[refType]}</b></div>,
      'CLOSE_MESSENGER_TOPIC': <div><b>{`${topicInfo[refType]}'s`}</b> topic has been closed</div>,
      'NEW_SOLVED_TOPICS': <div><b>{`${topicInfo[refType]}'s`}</b> topic has been resolved</div>,
      'OPEN_MESSENGER_TOPIC': <div><b>{`${topicInfo[refType]}'s`}</b> topic has been opened</div>,
      'REOPEN_MESSENGER_TOPIC': <div><b>{`${topicInfo[refType]}'s`}</b> topic has been reopened</div>,
      'NEW_ATTENDED_TOPICS': <div>NEW_ATTENDED_TOPICS</div>,
      'NEW_UNATTENDED_TOPICS': <div>NEW_UNATTENDED_TOPICS</div>,
      'NEW_SOLVING_TOPICS': <div>NEW_SOLVING_TOPICS</div>,
      'NEW_UNSOLVED_TOPICS': <div><b>{`${topicInfo[refType]}'s`}</b> topic is unsolved</div>,
      'FORCE_FOLLOW': <div>There’s a change in followers for <b>{`${topicInfo[refType]}'s topic.`}</b></div>,
      'CHANGE_FOLLOWERS_MESSENGER_TOPIC': <div>There’s a change in followers
        for <b>{`${topicInfo[refType]}'s topic.`}</b></div>,
    };

    return <ToastContainerStyled
      onClick={this.onClick}
      title={title[refType]}>{body[messengerAction]}</ToastContainerStyled>
  }
}