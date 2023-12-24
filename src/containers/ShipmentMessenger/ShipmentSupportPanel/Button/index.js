import React from 'react';
import * as M from '@material-ui/core';
import _ from 'lodash';
import {useTheme} from "@material-ui/core";
import * as S from './styles';

const Button = M.styled(M.Button)(({theme}) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  lineHeight: '1.3em'
}));

export default function AxlButton(props){
  const { icon, tooltip, spacing = 1, padding, noRadius, color, bgcolor, loading = false, ...cloneProps } = props;
  const theme = useTheme();
  const customizeStyle = {
    padding: padding || theme.spacing(1),
    color: _.get(theme.palette, color) || 'inherit',
    backgroundColor: _.get(theme.palette, bgcolor) || 'inherit',
    ...(noRadius ? ({borderRadius: 0}) : {}),
    ...(props.variant === 'outlined' ? ({
      border: `1px solid ${_.get(theme.palette, color)}`
    }) : {}),
    ...(icon ? ({
      minWidth: 'auto',
      position: 'relative',
      padding: padding || '8px 10px'
    }) : {minWidth: cloneProps.minWidth || 80})
}

  return <M.Box component={`span`} padding={spacing}>
    {props.tooltip ? (
        <M.Tooltip style={{minWidth: icon ? 'auto' : 80}} {...tooltip}>
          <Button style={customizeStyle} {...cloneProps}>
            {loading ? <M.CircularProgress size={15} thickness={2} /> : cloneProps.children}
          </Button>
        </M.Tooltip>
      ) : (<Button style={customizeStyle} {...cloneProps}>
        {loading ? <M.CircularProgress size={15} thickness={2} /> : cloneProps.children}
    </Button>)
    }

  </M.Box>
}
