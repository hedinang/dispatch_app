import { Box, Divider } from '@material-ui/core';
import React from 'react';

function AxlPaperSection({divider, styles, children}) {
  return (
    <React.Fragment>
      <Box sx={styles}>
        {children}
      </Box>
      {!!divider && <Divider/>}
    </React.Fragment>
  );
}

export default AxlPaperSection;