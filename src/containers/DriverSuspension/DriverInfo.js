import { Box, Grid, LinearProgress, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { stores } from '../../stores';

function DriverInfo(props) {
  const {ids, cb} = props
  const [infos, setInfos] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!ids) return
    
    const storedInfos = stores.driverListStore.getStore("schedule_suspension")
    if (storedInfos && storedInfos.result && storedInfos.result.items) {
      const intIds = ids.split(',').map(id => parseInt(id))
      const storedInfo = storedInfos.result.items.filter(i => intIds.includes(i.id))

      if (storedInfo && storedInfo.length && storedInfo.length == intIds.length) {
        setInfos(storedInfo)
        if (cb) cb(storedInfo)
        return
      }
    }

    setIsLoading(true)
    stores.driverStore.getExtraInfo(ids, result => {
      setIsLoading(false)
      if (result.ok) {
        setInfos(result.data)

        if (cb) cb(result.data)
      }
    })
  }, [ids])
  
  const getDriverName = (info) => {
    let driverName = ''
    if (info && isLoading == false) {
      driverName = info.first_name ? info.first_name : ''
      if (info.last_name) driverName = `${driverName} ${info.last_name}`
    }
    return driverName
  }
  
  return (
    <Box style={{background: '#efefef', height: '70px', overflowY: 'scroll', margin: '9px 2.2px 4px 0', padding: '15px 10px 20px'}}>
      {isLoading && <LinearProgress />}
      {infos && isLoading == false && infos.length && <Typography align='right' style={{marginBottom: 10}}>Total: {infos.length} recipients</Typography>}
      {infos && isLoading == false && infos.map((info, i) => (
          <Grid container key={info.id} style={{fontSize: 12, marginBottom: 8, color:'#727272'}}>
            <Grid item xs={3}>
                <strong>{i+1}. Name: </strong> {getDriverName(info) || 'N/A'}
            </Grid>
            <Grid item xs={3}><strong> Status: </strong> {info.status || 'N/A'}</Grid>
            <Grid item xs={3}>
              <strong> Background status: </strong>{info.background_status || 'N/A'}
            </Grid>
            {info.couriers && info.couriers.length > 0 && <Grid item xs={3}>
                                                <React.Fragment>
                                                    <strong> Couriers: </strong>
                                                    {info.couriers.map(c => c.company).join(', ')}
                                                </React.Fragment>
            </Grid >}
          </Grid>
        ))
      }
      {infos == null && ids && isLoading == false && <Typography style={{color:'#ff3333'}}>Driver not found!</Typography>}
    </Box>
  );
}

export default React.memo(DriverInfo);