import React, { useRef, useMemo, useEffect } from 'react';
import * as M from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { debounce } from 'lodash';
import moment from 'moment';
import BoxMsg, { BoxMsgTimeline, BoxMsgChat } from '../BoxMsg';
import _ from 'lodash';
import {NoMessageText, NoMessageContainer} from './styles';
import AxlButton from "../Button";

const useStyles = makeStyles((theme) => ({
  root: {},
  container: {
    height: '100%',
    overflowY: 'scroll',
    boxSizing: 'border-box',
  },
  listItem: {
    padding: '10px 0px',
  },
}));

const returnAuthor = (uid, userId) => {
  if (!uid) return '';
  if (uid.includes('DR')) {
    return 'DRIVER';
  }
  if (uid.includes('CS')) {
    return 'CUSTOMER';
  }
  if (`US_${userId}` === uid) {
    return 'ME';
  }
  if (uid.includes('US')) {
    return 'USER';
  }
};

const _convertLogIntoMessage = (msgs) => {
  let messages = [];
  msgs.map((msg, i) => {
    // show timeline after 30 minutes by miliseconds
    const isInsertTime =
      !!msgs[i + 1] && Date.parse(new Date(msgs[i + 1].ts)) - Date.parse(new Date(msgs[i].ts)) >= 1800000;
    // const is same day
    const isSameDay = !!msgs[i + 1] && moment().isSame(moment(msgs[i + 1].ts), 'day');

    if (isInsertTime) {
      const objMerge = {
        type: 'TIMELINE',
        ts: msgs[i + 1].sendAt,
        message: isSameDay
          ? moment(msgs[i + 1].ts).format('[TODAY], HH:mmA')
          : moment(msgs[i + 1].ts).format('MM/DD/YYYY, HH:mmA'),
      };
      messages = messages.concat(msg, [objMerge]);
    } else {
      messages = messages.concat(msg);
    }
  });

  return messages;
};

const mapMsgToComponentType = (type, author) => {
  if (type === 'NOTE') {
    return 'BoxLeaveNote';
  }
  if (type === 'MESSAGE') {
    if (author === 'ME') {
      return 'BoxMsgChatMe';
    }
    if (author === 'DRIVER') {
      return 'BoxMsgChatDriver';
    }
  }
  if (type === 'EVENT') {
    return 'BoxMsgEventComponent';
  }
  if (type === 'TIMELINE') {
    return 'BoxMsgTimeline';
  }
  if(type ==='FEEDBACK') {
    return 'BoxFeedback';
  }
  return 'BoxMsgChat';
};

const ListBoxChat = (props) => {
  // const messageEndRef = useRef(null);
  const listRef = useRef(null);
  const { listMsg  = [], checkToLoadMore, user = {} } = props;
  const scrollToBottom = () => {
    listRef.current.scrollTop = listRef.current.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
    // debounce(scrollToBottom, 20)();
  }, [listMsg]);

  const finalList = useMemo(() => {
    const _listMsg = listMsg
      .slice()
      .reverse()
      .map((msg) => {
        return {
          id: msg.id,
          ts: msg.sendAt,
          type: msg.type,
          message: msg.body,
          name: _.get(msg, 'sender.name', ''),
          author: returnAuthor(_.get(msg, 'sender.uid'), _.get(user, 'user.id')),
          sendAt: msg.sendAt,
          avatar: _.get(msg, 'sender.avatar'),
          feedbackStatus: _.isEqual(_.get(msg, 'attributes.thumb'), 'true'),
        };
      });
    return _convertLogIntoMessage(_listMsg);
  }, [listMsg, user]);
  const classes = useStyles();

  const onScroll = (event) => {
    if (listRef.current) {
      checkToLoadMore(listRef);
    }
  };

  return (
    <M.Box width={1} height={1} style={{ overflow: 'hidden' }}>
      <M.List className={classes.container} ref={listRef} onScroll={onScroll}>
        {finalList.length ? finalList.map(({ type, message, ...resProps }, id) => (
          <M.ListItem key={id} className={classes.listItem}>
            <BoxMsg component={mapMsgToComponentType(type, resProps.author)} {...resProps} type={type}>
              {message}
            </BoxMsg>
          </M.ListItem>
        )) : <NoMessageContainer>
          <NoMessageText>{`No message`}</NoMessageText>
        </NoMessageContainer>}
      </M.List>
    </M.Box>
  );
};

export default ListBoxChat;
