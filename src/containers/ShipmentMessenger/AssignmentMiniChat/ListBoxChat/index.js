import React, { useRef, useMemo, useEffect } from 'react';
import * as M from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { debounce } from 'lodash';
import moment from 'moment';
// import { useRecoilValue } from 'recoil';
import BoxMsg, { BoxMsgTimeline, BoxMsgChat } from '../../../../components/AxlMUIComponent/BoxMsg';
// import { userState } from './state';
import {MESSENGER_TYPE} from "../../../../constants/messenger";
import _ from 'lodash';
import {Box, CardMedia} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {},
  container: {
    height: '100%',
    overflowY: 'scroll',
    boxSizing: 'border-box',
    paddingLeft: 16,
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
        ts: msgs[i + 1].ts,
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
  // console.log('1. ', type, author)
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
    if (author === 'USER') {
      return 'BoxMsgChat';
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
  if(type ==='NEW_MASSAGE_IMAGE') {
    if (author === 'ME') {
      return 'BoxMsgImageMe';
    } else {
      return 'BoxMsgImage';
    }
  }
  return 'BoxMsgChat';
};

const ListBoxChat = (props) => {
  // const messageEndRef = useRef(null);
  const listRef = useRef(null);
  const { listMsg, checkToLoadMore = () => {}, user } = props;


  const scrollToBottom = () => {
    listRef.current.scrollTop = listRef.current.scrollHeight;
  };

  const findUser = (id) => {
    if(!id) return null;

    const usersCached = JSON.parse(sessionStorage.getItem(`${process.env.REACT_APP_SESSION_STORAGE_PREFIX}-USERS`));
    const isUser = usersCached.value.filter(user => user.id === parseInt(id));

    if(isUser) {
      return _.get(isUser, '[0]')
    } else {
      return null;
    }
  };

  const findUserName = (id) => {
    if(!id) return null;

    const isUser = findUser(id);
    if(isUser) {
      return `${_.get(isUser, 'role')} - ${_.get(isUser, 'username')}`
    } else {
      return id;
    }
  };

  const convertMessengerType = (type) => {
    switch (type) {
      case MESSENGER_TYPE.ASSIGNMENT_CONVERSATION:
      case MESSENGER_TYPE.DRIVER_GENERAL_SUPPORT:
        return "MESSAGE";
        break;
      case "TIMELINE":
      case "PICK_UP":
      case "DROP_OFF":
      case "ASSIGNMENT":
      case "CLOSE_TOPIC":
      case "SOLVE_TOPIC":
      case "FOLLOW_TOPIC":
      case "UNSOLVE_TOPIC":
      case "UNFOLLOW_TOPIC":
      case "FORCED_FOLLOW_TOPIC":
      case "FORCED_UNFOLLOW_TOPIC":
        return "TIMELINE";
        break;
      case "NEW_MASSAGE_IMAGE":
        return "NEW_MASSAGE_IMAGE";
        break;
      default:
        return null;
        break;
    }
  }

  const convertMessage = (msg) => {
    if(msg.files && msg.files.length) {
      return <Box>
        {msg.files.map((file, idx) => <Box key={idx} my={0.5}>
          <img src={file.url || file.href} width={50} />
        </Box>)}
      </Box>
    } else {
      return msg.body;
    }
  }

  useEffect(() => {
    scrollToBottom();
    // debounce(scrollToBottom, 20)();
  }, [listMsg]);

  const finalList = useMemo(() => {
    let _listMsg = listMsg
      .slice()
      // .reverse()
      .map((msg) => {
        return {
          id: msg.id,
          ts: msg.ts,
          type: convertMessengerType(msg.type || msg.ref_type),
          message: convertMessage(msg),
          name: findUserName(_.get(msg, 'sender')),
          // author: returnAuthor(parseInt(_.get(msg, 'sender')), _.get(user, 'user.id')),
          author: _.isEqual(user.id, parseInt(_.get(msg, 'sender'))) ? 'ME': 'USER',
          sendAt: msg.sendAt,
          avatar: _.get(findUser(msg.sender), "info.avatar_url") || _.get(findUser(msg.sender), "photo"),
          // feedbackStatus: msg?.attributes?.thumb === 'true',
        }
      });
    _listMsg = _.sortBy(_listMsg, ['ts']);

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
        {finalList.map(({ type, message, ...resProps }, id) => (
          <M.ListItem key={id} className={classes.listItem}>
            <BoxMsg component={mapMsgToComponentType(type, resProps.author)} {...resProps} type={type}>
              {message}
            </BoxMsg>
          </M.ListItem>
        ))}
        {/* <div ref={messageEndRef}></div> */}
      </M.List>
    </M.Box>
  );
};

export default ListBoxChat;
