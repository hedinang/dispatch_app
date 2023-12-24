import React from 'react';
import { Box } from '@material-ui/core';
import AxlPaperTitle from './Title';
import PropTypes from 'prop-types';

const MAIN_CONTENT_STYLE = {
  border: '1px solid #ccc',
  borderRadius: 5,
  padding: 15
}

AxlPaper.propTypes = {
  styles: PropTypes.shape({
    root: PropTypes.object,
    titleWrapper: PropTypes.object,
    title: PropTypes.object,
    subTitle: PropTypes.object,
    mainContent: PropTypes.object
  })
};

function AxlPaper({title, subTitle, children, styles={}}) {
  const {root, titleWrapper: titleWrapperStyle, title: titleStyle, subTitle: subTitleStyle, mainContent: mainContentStyle} = styles
  
  return (
    <Box sx={{...root}}>
      <AxlPaperTitle title={title} subTitle={subTitle} titleWrapperStyle={titleWrapperStyle} titleStyle={titleStyle} subTitleStyle={subTitleStyle}/>
      <Box sx={{...MAIN_CONTENT_STYLE, ...mainContentStyle}}>
        {children}
      </Box>
    </Box>
  );
}

export default AxlPaper;