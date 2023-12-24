import React from 'react';
import {useMediaQuery} from '@material-ui/core';

const withMediaQuery = () => Component => props => {
  const mediaQuery = {};
  mediaQuery.isMobile = useMediaQuery(theme => theme.breakpoints.down('xs'));
  mediaQuery.isDesktop = useMediaQuery(theme => theme.breakpoints.up('md'));
  mediaQuery.isDownSM = useMediaQuery(theme => theme.breakpoints.down('sm'));
  mediaQuery.isDownMD = useMediaQuery(theme => theme.breakpoints.down('md'));

  return <Component mediaQuery={mediaQuery} {...props} />;
};

export default withMediaQuery;