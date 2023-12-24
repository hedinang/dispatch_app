import React from 'react';
import * as M from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {withStyles} from "@material-ui/core";

export const Container = M.styled(M.Box)({});
export const FormControl = M.styled(M.FormControl)(({theme}) => ({
  width: '100%',
  boxSizing: 'border-box',
  padding: theme.spacing(2)
}));
export const Select = withStyles((theme) => ({
  root: {},
  select: {},
  outlined: {
    borderRadius: 2.5,
    backgroundColor: '#fafafa',
    border: `solid 0.3px ${theme.palette.primary.graySecond}`,
    padding: theme.spacing(1),
    fontFamily: 'AvenirNext-Medium',
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: -0.12,
    color: theme.palette.text.select,
    '&:focus': {
      borderRadius: 2.5,
      backgroundColor: '#fafafa',
      border: `solid 0.3px ${theme.palette.primary.graySecond}`,
    }
  }
}))(M.Select);
export const MenuItem = M.styled(M.MenuItem)(({theme}) => ({
  fontFamily: 'AvenirNext-Medium',
  fontSize: 13,
  fontWeight: 500,
  letterSpacing: -0.12,
  color: theme.palette.text.select
}));