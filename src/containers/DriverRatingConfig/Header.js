import React from 'react';
import { Box, Button, MenuItem, Select, Typography } from '@material-ui/core';
import { KeyboardArrowLeft } from '@material-ui/icons';
import { Link } from 'react-router-dom';

function Header({driverType, handleChangeDriverType: handleChangeDriverTypeProp}) {
  const handleChangeDriverType = (e) => {handleChangeDriverTypeProp(e)}

  return (
    <Box sx={{position:'relative', width: '100%', marginBottom: 50, display: 'flex'}}>
        <Button
          variant="contained"
          style={{border: '1px solid #ccc', backgroundColor: '#f4f4f4', color:'#8d8d8d', boxShadow:'none', padding: '5px 35px'}}
          startIcon={<KeyboardArrowLeft style={{marginRight:'-8px'}} />}>
          <Link to='/drivers' style={{color:'#8d8d8d', textDecoration:'none', fontWeight:'normal', fontFamily:'AvenirNext'}}>Back to Drivers Tab</Link>
        </Button>
        <Typography variant='h1' style={{width: '100%', color:'#626262', fontSize: 35, fontWeight: 600, paddingTop: 0, lineHeight: '35px', fontFamily:'AvenirNext'}} align='center'>Performance Calculations For {driverType == 'IC' ? 'IC Driver': 'DSP Driver'}</Typography>
        
        <Box>
          <Select
            id="select-driver-type"
            value={driverType}
            style={{fontSize:16}}
            onChange={handleChangeDriverType}>
            <MenuItem value='IC'>IC driver</MenuItem>
            <MenuItem value='DSP'>DSP driver</MenuItem>
          </Select>
        </Box>
    </Box>
  );
}

export default Header;