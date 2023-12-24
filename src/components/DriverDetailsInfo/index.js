import { Box, Grid, makeStyles, Tooltip, Typography } from '@material-ui/core'
import React from 'react'
import _ from 'lodash';

import InfoItem from '../InfoItem'

export const useStyles = makeStyles((theme) => ({
    spanActive: {
      fontWeight: 600,
      color: '#76c520',
      fontStyle: 'italic',
      fontFamily: 'AvenirNext-italic'
    },
    spanValue: {
        display: 'inline-block', 
        marginBottom: '4px', 
        fontSize: '14px', 
        wordBreak: 'break-all',
        fontFamily: 'AvenirNext',
        fontWeight: 600,
    },
}));

function DriverDetailsInfo({driverInfo}) {
    const classes = useStyles();
    const pools = _.map(_.get(driverInfo, 'pools', []), p => _.pick(p, ['pool_name', 'description']));
    const regions = _.map(_.get(driverInfo, 'regions', []), p => _.pick(p, ['region_code', 'is_active']));
    const crews = _.map(_.get(driverInfo, 'crews', []), p => _.pick(p, ['name']));
    const activeRegion = regions.filter(rg => rg.is_active).map(rg => rg.region_code).pop();

    return (
        <Grid item container spacing={3}>
            <Grid item xs={12} md={3}>
                <InfoItem title={'POOLS'} content={
                    (!pools || pools.length == 0) ? '-' : 
                        pools.filter(p => p.pool_name).map((p, i) => <Tooltip key={i} title={_.get(p, 'description', '')}>
                        <Typography style={{textTransform: 'uppercase'}} className={classes.spanValue}>{(pools.length > 1 && i > 0) ? ', ' : ''}{_.get(p, 'pool_name')}</Typography>
                        </Tooltip>)
                }/>
            </Grid>  
            <Grid item xs={12} md={3}>
                <InfoItem title={'Regions'} content={
                    <Box display='flex' flexDirection='column' component='span' fontSize={14}>
                        {
                            (!regions || regions.length == 0) ? '-' : _.uniqBy(regions, 'region_code').map((item, idx) => (
                                <Box key={idx} >
                                    <span className={classes.spanValue}>{item.region_code}</span>
                                    {item.region_code === activeRegion && <span className={classes.spanActive}> - Active</span>}
                                </Box>
                            ))
                        }
                    </Box>
                }/>
            </Grid>
            <Grid item xs={12} md={3}>
                <InfoItem title={'Crews'} content={
                    (!crews || crews.length == 0) ? '-' : <Box display='flex' alignItems='flex-start' flexDirection='column' textAlign='left'>
                        {
                            crews.map((item, idx) => (
                                <span className={classes.spanValue} key={idx}>{item.name}</span>
                        ))}
                    </Box>
                }/>
            </Grid>
            <Grid item xs={12} md={3}>
              <div />
            </Grid>
            <Grid item xs={12} md={3}>
              <InfoItem title={'DSP Converted'} content={
                driverInfo && driverInfo.convert_event && driverInfo.convert_event.length > 0 && driverInfo.convert_event[0].fact.dsp_name ?
                  `Converted from ${driverInfo.convert_event[0].fact.dsp_name} to AH drivers` : 'Not converted'
              }/>
            </Grid>
            <Grid item xs={12} md={3}>
              <InfoItem title={'Couriers/DSP'} content={driverInfo.couriers && driverInfo.couriers.map(c => c.company).join() || "-"}/>
            </Grid>
        </Grid>
    )
}

export default DriverDetailsInfo