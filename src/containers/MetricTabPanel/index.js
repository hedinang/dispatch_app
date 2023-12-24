import { Box, CircularProgress, Grid } from '@material-ui/core'
import React, { useState } from 'react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom';
import _ from 'lodash';

import DriverCycle from '../DriverCycle'
import DriverRatings from '../DriverRatings';
import DriverLifetime from '../DriverLifetime';

function MetricTabPanel(props) {
    const { driverStore, driver } = props;
    const params = useParams();
    const id = params.id || driver.id;
    const [isLoading, setIsLoading] = useState(false);
    const [metricsInfo, setMetricsInfo] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        driverStore.getPerformanceByDriverID(id).then(res => {
            if(res.ok) {
                setMetricsInfo(res.data);
            }
            else {
                setMetricsInfo(null);
            }
            setIsLoading(false);
        })
    }, [id]);

    if(isLoading) return <Box display={'flex'} flex={1} justifyContent="center" alignItems='center'><CircularProgress color='primary' thickness={1}/></Box>
    
  return (
    <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
            <DriverCycle data={metricsInfo} />
        </Grid>
        <Grid item xs={12} md={4}>
            <DriverRatings data={metricsInfo} driverInfo={driver} setMetricsInfo={setMetricsInfo}/>
        </Grid>
        <Grid item xs={12} md={4}>
            <DriverLifetime data={metricsInfo}/>
        </Grid>
    </Grid>
  )
}

export default MetricTabPanel