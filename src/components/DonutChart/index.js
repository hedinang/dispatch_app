import { Box } from '@material-ui/core'
import React, { Fragment, useEffect } from 'react'
import c3 from 'c3';
import colors from '../../themes/colors';

function DonutChart({stats}) {
  useEffect(() => {
    const { returned = 0, pending = 0, inprogress = 0, failed = 0, succeeded = 0 } = stats;
    c3.generate({
      transition: {
        duration: 0
      },
      bindto: '#donutChart',
      size: {
        width: 225,
        height: 120
      },
      data: {
        order: null,
        columns: [
          ['pending', pending],
          ['in_progress', inprogress],
          ['failed', failed],
          ['succeeded', succeeded],
          ['returned', returned],
        ],
        type: 'donut',
        colors: {
          pending: colors.orangeTwo,
          in_progress: colors.maize,
          succeeded: colors.greenFive,
          failed: colors.red,
          returned: colors.link,
        },
        names: {
          pending: 'Pending',
          in_progress: 'In Progress',
          succeeded: 'Succeeded',
          failed: 'Failed',
          returned: 'Returned',
        }
      },
      tooltip: {
        grouped: false,
        format: {
          value: (value, ratio, id, index) => `${(ratio * 100).toFixed(1)}% [${value}]`
        }
      },
      donut: {
        label: {
          show: false,
        },
      },
      legend: {
        position: 'right',
      },
      padding: {
        right: 0,
        left: 0,
        top: 0,
        bottom: 10
      }
    });
  }, [stats])
  
  return (
    <Fragment>
      <Box width={'55%'}>
        <span style={{textTransform: 'uppercase', fontSize: '12px', color: colors.graySecond, fontWeight: 500}}>Total shipments</span>
      </Box>
      <Box mt={1} width={'55%'}>
          <span style={{fontSize: '16px', color: colors.blackMain, fontWeight: 'bold'}}>{stats.total}</span>
      </Box>
      <div id='donutChart' style={{display: 'flex'}}/>
    </Fragment>
  )
}

export default DonutChart