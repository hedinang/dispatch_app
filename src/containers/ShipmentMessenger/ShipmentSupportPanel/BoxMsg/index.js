import React from 'react';
import * as M from '@material-ui/core';
import moment from 'moment';
import {
  BoxMsgComponent,
  BoxMsgTime,
  BoxMsgName,
  BoxMsgEvent,
  BoxMsgComponentMe,
  BoxMsgTimeMe,
  BoxMsgNameMe,
  BoxMsgComponentDriver,
  BoxLeaveNoteContainer,
  BoxLeaveNoteTime,
  LeaveNoteIcon,
  BoxFeedbackContainer,
  BoxFeedbackTime,
  BoxBadFeedbackIcon,
  BoxGoodFeedbackIcon,
  BoxBadNoFeedbackIcon,
  BoxGoodNoFeedbackIcon,
} from './styles';
import { EVENT_STATUS_TO_COLORS } from '../../../../constants/event';
import { FEEDBACK_STATUS_TO_COLORS } from '../../../../constants/feedback';
import {toCapitalize} from "../../../../Utils/clipboard";
import {dashboardAPI} from "../../../../stores/api";
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import AxlButton from "../Button";
import _ from 'lodash';
// states

export function BoxMsgTimeline({ children }) {
  return (
    <M.Box width={1} textAlign={'center'}>
      <BoxMsgTime>{children}</BoxMsgTime>
    </M.Box>
  );
}

export function BoxMsgEventComponent({ children, sendAt, ...props }) {
  const status = children.includes('FAILED') ? 'FAILED' : '';
  return (
    <M.Box width={1} textAlign={'center'}>
      <BoxMsgEvent>
        <M.Box
          component={'span'}
          color={EVENT_STATUS_TO_COLORS()[status] || 'primary.textSecondary'}
        >{`${children} - ${moment(sendAt).format('HH:mmA')}`}</M.Box>
      </BoxMsgEvent>
    </M.Box>
  );
}

export function BoxMsgChat(props) {
  const { sendAt, name, author } = props;
  let nameDisplay = toCapitalize(name);
  if (author === 'CUSTOMER') {
    nameDisplay = `Customer ${toCapitalize(name)}`;
  }
  return (
    <M.Box width={1}>
      <M.Grid container direction={'row'} alignItems={'flex-end'}>
        <M.Box padding={1}>
          <M.Grid container alignContent={'flex-end'} style={{ height: '100%' }}>
            <M.Grid xs item>
              <M.Box style={{ width: 30, height: 30 }}>
                {!!props.author && <M.Avatar src={`assets/images/svg/member.svg`} style={{ width: 30, height: 30 }} />}
              </M.Box>
            </M.Grid>
          </M.Grid>
        </M.Box>
        <M.Grid xs item zeroMinWidth>
          <M.Grid container direction={'column'}>
            <BoxMsgComponent>{props.children}</BoxMsgComponent>
            <BoxMsgTime>{moment(sendAt).format('HH:mmA')}</BoxMsgTime>
            <BoxMsgName>{toCapitalize(nameDisplay)}</BoxMsgName>
          </M.Grid>
        </M.Grid>
      </M.Grid>
    </M.Box>
  );
}

export function BoxMsgChatDriver(props) {
  const { sendAt, name, avatar } = props;
  return (
    <M.Box width={1}>
      <M.Grid container direction={'row'} alignItems={'flex-end'}>
        <M.Box padding={1}>
          <M.Grid container alignContent={'flex-end'} style={{ height: '100%' }}>
            <M.Grid xs item>
              <M.Box style={{ width: 30, height: 30 }}>
                {!!props.author && (
                  <M.Avatar src={avatar || `assets/images/svg/member.svg`} style={{ width: 30, height: 30 }} />
                )}
              </M.Box>
            </M.Grid>
          </M.Grid>
        </M.Box>
        <M.Grid xs item zeroMinWidth>
          <M.Grid container direction={'column'}>
            <BoxMsgComponentDriver>{props.children}</BoxMsgComponentDriver>
            <BoxMsgTime>{moment(sendAt).format('HH:mmA')}</BoxMsgTime>
            <BoxMsgName>{toCapitalize(`Driver ${name}`)}</BoxMsgName>
          </M.Grid>
        </M.Grid>
      </M.Grid>
    </M.Box>
  );
}

export function BoxMsgChatMe(props) {
  const { sendAt, name } = props;
  return (
    <M.Box width={1}>
      <M.Grid container direction={'row'} alignItems={'flex-end'}>
        <M.Grid xs item zeroMinWidth>
          <M.Grid container direction={'column'}>
            <BoxMsgComponentMe>{props.children}</BoxMsgComponentMe>
            <BoxMsgTimeMe>{moment(sendAt).format('HH:mmA')}</BoxMsgTimeMe>
            <BoxMsgNameMe>{toCapitalize(name)}</BoxMsgNameMe>
          </M.Grid>
        </M.Grid>
        <M.Box padding={1}>
          <M.Grid container style={{ height: '100%' }}>
            <M.Grid xs item>
              <M.Box style={{ width: 30, height: 30 }}>
                {!!props.author && <M.Avatar src={`assets/images/svg/member.svg`} style={{ width: 30, height: 30 }} />}
              </M.Box>
            </M.Grid>
          </M.Grid>
        </M.Box>
      </M.Grid>
    </M.Box>
  );
}

export function BoxFeedback(props) {
  const { sendAt, children, feedbackStatus, id } = props;
  let status = 'GOOD_NO_COMMENT';
  const gotItAction = () => {
    if (id) {
      dashboardAPI.post(`/cs/messages/${id}/feedback`).then(res => {});
    }
  };
  if (feedbackStatus) {
    if (!_.isEmpty(children)) {
      status = 'GOOD';
    } else {
      status = 'GOOD_NO_COMMENT';
    }
  } else if (!feedbackStatus) {
    if (!_.isEmpty(children)) {
      status = 'BAD';
    } else {
      status = 'BAD_NO_COMMENT';
    }
  }
  return (
    <M.Box width={1}>
      <M.Box padding={1}>
        <BoxFeedbackTime textAlign={'center'}>{`SHIPMENT RECEIVED FEEDBACK - ${moment(sendAt).format(
          'HH:mmA',
        )}`}</BoxFeedbackTime>
        <FeedbackEntity status={status} gotItAction={gotItAction}>
          {children}
        </FeedbackEntity>
      </M.Box>
    </M.Box>
  );
}

export function FeedbackEntity({ status, children, gotItAction }) {
  switch (status) {
    case 'GOOD':
      return (
        <div>
          <BoxFeedbackContainer style={{ backgroundColor: FEEDBACK_STATUS_TO_COLORS()[status] }}>
            <BoxGoodFeedbackIcon>
              <ThumbUpIcon style={{ fontSize: 15 }} color={'primary'} />
            </BoxGoodFeedbackIcon>
            {children}
          </BoxFeedbackContainer>
          <M.Box textAlign={'center'} padding={2}>
            <AxlButton
              variant="outlined"
              color={'primary.blackThird'}
              noRadius
              onClick={gotItAction}
            >{`GOT IT!`}</AxlButton>
          </M.Box>
        </div>
      );
      break;
    case 'BAD':
      return (
        <div>
          <BoxFeedbackContainer style={{ backgroundColor: FEEDBACK_STATUS_TO_COLORS()[status] }}>
            <BoxBadFeedbackIcon>
              <ThumbDownIcon style={{ fontSize: 15 }} color={'primary'} />
            </BoxBadFeedbackIcon>
            {children}
          </BoxFeedbackContainer>
          <M.Box textAlign={'center'} padding={2}>
            <AxlButton
              variant="outlined"
              color={'primary.blackThird'}
              noRadius
              onClick={gotItAction}
            >{`GOT IT!`}</AxlButton>
          </M.Box>
        </div>
      );
      break;
    case 'GOOD_NO_COMMENT':
      return (
        <BoxFeedbackContainer style={{ backgroundColor: FEEDBACK_STATUS_TO_COLORS()[status] }}>
          <BoxGoodNoFeedbackIcon>
            <ThumbUpIcon style={{ fontSize: 15 }} color={'primary'} />
          </BoxGoodNoFeedbackIcon>
        </BoxFeedbackContainer>
      );
      break;
    case 'BAD_NO_COMMENT':
      return (
        <BoxFeedbackContainer style={{ backgroundColor: FEEDBACK_STATUS_TO_COLORS()[status] }}>
          <BoxBadNoFeedbackIcon>
            <ThumbUpIcon style={{ fontSize: 15 }} color={'primary'} />
          </BoxBadNoFeedbackIcon>
        </BoxFeedbackContainer>
      );
      break;
    default:
      return (
        <BoxFeedbackContainer style={{ backgroundColor: FEEDBACK_STATUS_TO_COLORS()[status] }}>
          <BoxGoodNoFeedbackIcon>
            <ThumbUpIcon style={{ fontSize: 15 }} color={'primary'} />
          </BoxGoodNoFeedbackIcon>
        </BoxFeedbackContainer>
      );
  }
}

export default function BoxMsg(props) {
  let { component, ...restProps } = props;
  const mapStringToComponent = {
    BoxMsgTimeline: BoxMsgTimeline,
    BoxFeedback: BoxFeedback,
    BoxMsgChat: BoxMsgChat,
    BoxMsgChatMe: BoxMsgChatMe,
    BoxMsgChatDriver: BoxMsgChatDriver,
    BoxMsgEventComponent: BoxMsgEventComponent,
  };

  return React.createElement(mapStringToComponent[component] || BoxMsgChat, restProps);
}
