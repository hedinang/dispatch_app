import React from 'react';

import { Box } from '@material-ui/core';

function Info({label, children}) {
  return (
    <Box>
      {label && <Box fontWeight={600} fontSize={'0.8125rem'} mb={0.5}>{label}</Box>}
      {children}
    </Box>
  )
}

export default Info