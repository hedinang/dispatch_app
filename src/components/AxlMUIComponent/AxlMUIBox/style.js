import * as M from '@material-ui/core';
import _ from 'lodash';
import CloseIcon from "@material-ui/icons/Close";
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import React from "react";

export const Container = M.styled(M.Paper)(({theme, ...props}) => ({
  height: '100%',
  width: 388,
  maxWidth: '100%',
  padding: '0',
  boxSizing: 'border-box',
  boxShadow: '-1px 1px 5px 2px rgba(141, 141, 141, 0.24)',
  margin: '0 0 0 1px',
  borderLeft: 'solid 1px #dddddd',
  borderTop: 'solid 1px #dddddd',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

export const Scroll = M.styled(M.Box)(({theme}) => ({
  height: '100%',
  overflowY: 'scroll',
  borderRadius: 0,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  boxSizing: 'border-box'
}));

export const NoScroll = M.styled(M.Box)(({theme}) => ({
  height: '100%',
  overflow: 'hidden',
  borderRadius: 0,
  boxSizing: 'border-box'
}));

export const SimpleBox = M.styled(M.Box)(({theme, square}) => ({
  boxSizing: 'border-box',
  borderRadius: square ? 0 : 5
}));

export const BorderBox = M.styled(SimpleBox)(({theme, ...props}) => ({
  padding: theme.spacing(1),
  border: `1px solid ${_.get(theme.palette, props.borderColor, theme.palette.primary.grayMain)}`,
  backgroundColor: _.get(theme.palette, props.bgcolor, theme.palette.primary.transparent)
}));

export const ModalBox = M.styled(M.Box)(({theme}) => ({
  maxWidth: '100%',
  boxSizing: 'border-box',
  padding: theme.spacing(3),
  borderRadius: 0,
  position: 'relative',
  '&:focus': {outline: 'none'}
}));

export const ButtonIco = M.styled(M.IconButton)(({theme, color}) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  color: color || theme.palette.primary.grayMain,
  zIndex: 1,
}));

export const CloseButton = M.withStyles({})(({color, theme, ...props}) => {
  if(theme === 'main') {
    return <ButtonIco color={color} {...props}>
      <CloseIcon fontSize={`large`} />
    </ButtonIco>
  } else if(theme === 'light') {
    return <CloseLightIcon {...props} />
  } else {
    return <CloseLightIcon {...props} />
  }
});

const CloseLightIcon = M.styled(M.Box)(({theme}) => ({
  width: 25,
  height: 25,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.white,
  border: `1px solid ${theme.palette.primary.black}`,
  position: 'absolute',
  top: 15,
  right: 15,
  zIndex: 1,
  cursor: 'pointer',
  '&::after': {
    content: '""',
    width: 1,
    height: 15,
    display: 'block',
    backgroundColor: theme.palette.primary.black,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 'auto',
    transform: `rotate(45deg)`,
  },
  '&::before': {
    content: '""',
    width: 1,
    height: 15,
    display: 'block',
    backgroundColor: theme.palette.primary.black,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 'auto',
    transform: `rotate(-45deg)`,
  }
}));