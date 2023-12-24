import React from 'react';
import colors from "../../../themes/colors";
import fonts from "../../../themes/fonts";
import {makeStyles} from "@material-ui/core/styles";
import {Button} from "@material-ui/core";
import * as M from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';

export const SelectButtonContainer = M.styled(M.Box)(({theme}) => ({
  paddingBottom: theme.spacing(0.5),
  borderBottom: `1px solid ${colors.periwinkle}`,
  borderRadius: theme.spacing(0),
  minWidth: 120,
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
}));

export const SelectButton = M.styled('div')(({theme, fontSize}) => ({
  fontFamily: fonts.Bold,
  fontSize: fontSize,
  color: colors.periwinkle,
}));

export const MenuItem = M.styled(M.Box)(({theme}) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  textAlign: 'left',
  cursor: 'pointer',
  paddingRight: theme.spacing(1),
}));

export const Text = M.styled(M.Typography)(({theme}) => ({}));

export const ClearButton = M.withStyles(({theme, spacing}) => ({
  root: {
    padding: spacing(0),
  },
  text: {
    padding: spacing(0),
  },
  label: {},
  textPrimary: {}
}))(ClearIcon);

export default makeStyles(({palette, spacing}) => ({
  root: {
    display: 'flex',
    position: 'relative',
    zIndex: 1,
  },
  popper: {
    position: 'absolute !important',
  },
  paper: {
    marginRight: spacing(2),
  },
  iconButton: {
    padding: spacing(0),
  },
  clearButton: {
    marginLeft: spacing(1),
    marginRight: spacing(1),
  },
  menuList: {
    minWidth: 220,
    maxHeight: '50vh',
    boxSizing: 'border-box',
    overflowY: 'scroll',
  },
  listItem: {
    padding: spacing(0),
  }
}));