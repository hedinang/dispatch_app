import { Box, Button } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { stores } from '../../stores';

function ProbationList(props) {
  const {children, url, driverNumber} = props
  const [show, setShow] = useState(false)
  const [probations, setProbations] = useState({})

  useEffect(() => {
    stores.driverSuspensionStore.setBaseUrl(url)
    stores.driverSuspensionStore.type = 'schedule'
    stores.driverSuspensionStore.search(setProbations)
  }, [driverNumber])

  const handleShow = (e) => {
    setShow(!show)
  }

  const suspensionNumber = Object.keys(probations) && probations.data ? probations.data.count: 0

  return (
    <Box style={{marginTop: 10, backgroundColor:'#887fff1a', padding:15}}>
      There are {suspensionNumber} probation drivers
      {suspensionNumber != 0 && (
        <span style={{paddingLeft:'15px'}}>
          <Button variant="contained" style={{padding: 3}} color="primary" onClick={handleShow}> {show ? 'HIDE': 'SHOW'}</Button> 
        </span> 
      )}
      {show && suspensionNumber!= 0 &&  (
        <Box style={{marginTop: 5}}>{children}</Box>
      )}
    </Box>
  );
}

export default ProbationList;
