import React from 'react';
import { Box } from '@material-ui/core';
import _ from 'lodash';

const TITLE_WRAPPER = {
  display: 'flex', 
  justifyContent: 'space-between'
}

const TITLE_STYLE = {
  fontWeight: 'bold',
  width: '100%',
  marginBottom: 15
}

const SUBTITLE_STYLE = {
  fontStyle: 'italic',
  width: '100%'
}

function AxlPaperTitle({title, subTitle, titleWrapperStyle, titleStyle, subTitleStyle}) {
  return (
    <Box sx={{...TITLE_WRAPPER, ...titleWrapperStyle}}>
      {!!title && <Box sx={{...TITLE_STYLE, textAlign:_.isNil(subTitle) ? 'middle': 'inherit', ...titleStyle}}>{title}</Box>}
      {!!subTitle && <Box sx={{...SUBTITLE_STYLE, ...subTitleStyle}}>{subTitle}</Box>}
    </Box>
  );
}

export default AxlPaperTitle;