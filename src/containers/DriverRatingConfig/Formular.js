import { Box, Divider } from '@material-ui/core';
import React from 'react';

function Formular({numberator, denominator}) {
  const styles = {
    height: 187,
    padding: '14px 16px',
    backgroundColor: '#f4f3ff',
    textAlign: 'center',
    fontSize: 13,
    color: '#4a4a4a',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }
  
  if (!denominator) {
    styles.height = 40
  }

  return (
    <Box sx={styles}>
      <Box sx={{fontWeight: 600}}>
        <Box sx={{margin: '5px 10px'}}>{numberator}</Box>
        {!!denominator && (
          <React.Fragment>
            <Box sx={{with: '100%', display:'flex', justifyContent:'center'}}>
            <Box>=</Box>
            <Box sx={{width:'100%', margin:10}}>
              <Divider width={'100%'} style={{color:'#979797', fontWeight:600}}/>
            </Box>
          </Box>
          <Box sx={{margin: '5px 10px'}}>{denominator}</Box>  
          </React.Fragment>
        )}
      </Box>
      
    </Box>
  );
}

export default Formular;