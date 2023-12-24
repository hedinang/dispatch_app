import React from 'react'
import { Box, Grid, IconButton, Typography } from '@material-ui/core'
import _ from 'lodash';
import AxlPaperSection from '../../components/Paper/Section';
import AxlPaperRowMetrics from '../../components/AxlPaperRowMetrics';
import AxlPaperMetrics from '../../components/AxlPaperMetrics';

function DriverLifetime({data}) {
    if(_.isEmpty(data)) return null;

    const { lifetime_stop, lifetime_mile, lifetime_route, feedback_counter, hours_worked_qtd, hours_worked_ytd } = data;

    const dataLifetimes = [
        {
            title: 'Total Feedback', 
            value: (<Box>
                <Grid container>
                    <Grid item xs>
                        <IconButton style={{padding: 0}}>
                            <img src={`/assets/images/svg/thumbs_up.svg`} width={14} height={14} />
                            <Box mx={1}><Typography style={{fontWeight: 'bold'}}>{_.get(feedback_counter, 'thumbs_up.formatted', 0)}</Typography></Box>
                        </IconButton>
                    </Grid>
                    <Grid item xs>
                        <IconButton style={{padding: 0}}>
                            <img src={`/assets/images/svg/thumbs_down.svg`} width={14} height={14} />
                            <Box ml={1}><Typography style={{fontWeight: 'bold'}}>{_.get(feedback_counter, 'thumbs_down.formatted', 0)}</Typography></Box>
                        </IconButton>
                    </Grid>
                </Grid>
            </Box>),
        }, 
        {
            title: 'Lifetime Routes', 
            value: _.get(lifetime_route, 'formatted', 0),
        },
        {
            title: 'Lifetime Stops', 
            value: _.get(lifetime_stop, 'formatted', 0),
        },
        {
            title: 'Lifetime Miles', 
            value: _.get(lifetime_mile, 'formatted', 0),
        },
        {
            title: 'Hours Worked QTD', 
            value: _.get(hours_worked_qtd, 'formatted', 0)
        },
        {
            title: 'Hours Worked YTD', 
            value: _.get(hours_worked_ytd, 'formatted', 0)
        },
    ]

    return (
        <AxlPaperMetrics title={'Lifetime'}>
            <AxlPaperSection>
                {dataLifetimes.map((item, idx) => (
                    <AxlPaperRowMetrics title={item.title} value={item.value} key={idx} />
                ))}
            </AxlPaperSection>
        </AxlPaperMetrics>
    )
}

export default DriverLifetime