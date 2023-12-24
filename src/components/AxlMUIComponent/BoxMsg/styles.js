import React from 'react';
import * as M from '@material-ui/core';
import {FEEDBACK_STATUS_TO_COLORS} from '../../../constants/feedback'
import colors from "../../../themes/colors";
import fonts from "../../../themes/fonts";

export const BoxMsgComponent = M.styled(M.Box)(({theme}) => ({
  maxWidth: 482,
  fontFamily: 'AvenirNext-Medium',
  fontSize: 13.5,
  fontWeight: 500,
  color: theme.palette.primary.textSecondary,
  borderRadius: 7.5,
  borderBottomLeftRadius: 0,
  backgroundColor: '#f4f5f4',
  padding: '10px 15px',
  margin: '5px 0',
  wordBreak: 'break-all',
  display: 'inline-block',
  marginRight: 'auto',
  marginleft: 0
}));

export const BoxMsgTime = M.styled(M.Typography)(({theme}) => ({
  fontFamily: 'AvenirNext-Medium',
  fontSize: 10,
  fontWeight: 500,
  letterSpacing: 0.25,
  color: theme.palette.primary.textSecondary,
  lineHeight: 1.3
}));

export const BoxMsgTimeLine = M.styled(BoxMsgTime)(({theme}) => ({
  fontFamily: fonts.MediumItalic,
  color: colors.grayTwelfth,
}));

export const BoxMsgName = M.styled(M.Typography)(({theme}) => ({
  fontFamily: 'AvenirNext-DemiBold',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: 0.29,
  color: theme.palette.primary.textSecondary,
  lineHeight: 1.3,
  textTransform: 'capitalize',
}));

export const BoxMsgEvent = M.styled(M.Typography)(({theme}) => ({
  fontFamily: 'AvenirNext-DemiBold',
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: 0.29,
  color: theme.palette.primary.textSecondary,
  lineHeight: 1.3,
  marginBottom: 5
}));

export const BoxMsgComponentDriver = M.styled(BoxMsgComponent)(({theme}) => ({
  color: theme.palette.primary.textSecondary,
  background: '#e5e4fc',
  display: 'inline-block',
  marginRight: 'auto',
  marginleft: 0
}));

export const BoxMsgComponentMe = M.styled(BoxMsgComponent)({
  color: '#FFFFFF',
  background: '#8178ee',
  borderRadius: 7.5,
  borderBottomRightRadius: 0,
  marginLeft: 'auto',
  marginRight: 0,
  display: 'inline-block'
});

export const BoxMsgComponentImageMe = M.styled(BoxMsgComponent)({
  color: '#FFFFFF',
  background: 'transparent',
  borderRadius: 7.5,
  borderBottomRightRadius: 0,
  marginLeft: 'auto',
  marginRight: 0,
  display: 'inline-block'
});

export const BoxMsgComponentImage = M.styled(BoxMsgComponent)({
  background: 'transparent',
});

export const BoxMsgTimeMe = M.styled(BoxMsgTime)({
  textAlign: 'right'
});

export const BoxMsgNameMe = M.styled(BoxMsgName)({
  textAlign: 'right'
});

export const BoxLeaveNoteContainer = M.styled(M.Box)(({theme}) => ({
  width: 300,
  maxWidth: '100%',
  padding: '13px 22px',
  background: theme.palette.primary.grayEighth,
  border: `1px dotted ${theme.palette.primary.blackThird}`,
  fontFamily: 'AvenirNext-Medium',
  fontSize: 13,
  fontWeight: 500,
  color: theme.palette.primary.blackThird,
  position: 'relative'
}));

export const BoxLeaveNoteTime = M.styled(M.Box)(({theme}) => ({
  fontFamily: 'AvenirNext-DemiBold',
  fontSize: 12,
  fontWeight: 600,
  textAlign: 'center',
  color: theme.palette.primary.blueLight,
  margin: '10px 0 15px'
}));

export const LeaveNoteIcon = M.styled(M.Box)(({theme}) => ({
  width: 25,
  height: 25,
  borderRadius: '50%',
  backgroundSize: '32%',
  backgroundColor: theme.palette.primary.blackThird,
  backgroundImage: `url('/assets/images/svg/mail-attachment-3.svg')`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  position: 'absolute',
  top: 0,
  left: -15,
  bottom: 0,
  margin: 'auto 0'
}));

export const BoxFeedbackContainer = M.styled(BoxLeaveNoteContainer)(({status, theme}) => ({
  border: 'none',
  margin: '0 auto'
}));

export const BoxFeedbackTime = M.styled(BoxLeaveNoteTime)(({theme}) => ({}));

export const BoxGoodFeedbackIcon = M.styled(LeaveNoteIcon)(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.primary.green,
  backgroundImage: `none`
}));

export const BoxGoodNoFeedbackIcon = M.styled(BoxGoodFeedbackIcon)(({theme}) => ({
  left: 0,
  right: 0,
  margin: 'auto'
}));

export const BoxBadFeedbackIcon = M.styled(BoxGoodFeedbackIcon)(({theme}) => ({
  backgroundColor: theme.palette.primary.redSecond,
}));

export const BoxBadNoFeedbackIcon = M.styled(BoxBadFeedbackIcon)(({theme}) => ({
  left: 0,
  right: 0,
  margin: 'auto'
}));