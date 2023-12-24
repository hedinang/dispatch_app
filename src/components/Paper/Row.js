import { Box } from '@material-ui/core';
import React from 'react';

const DEFAULT_STYLE = {
  display: 'flex', 
  justifyContent: 'space-between',
  margin: '15px 0px',
  alignItems: 'center',
}

const LABEL_STYLE = {
  color: '#5a5a5a', 
}

const VALUE_STYLE = {
  color: '#4a4a4a', 
}

function AxlPaperRow({label, value, styles={}}) {
  const {root: rootStyle, label: labelStyle, value: valueStyle} = styles;
  return (
    <Box sx={{...DEFAULT_STYLE, ...rootStyle}}>
      <Box sx={{...LABEL_STYLE, ...labelStyle}}>{label}</Box>
      <Box sx={{...VALUE_STYLE, ...valueStyle}}>{value}</Box>
    </Box>
  );
}

export default AxlPaperRow;