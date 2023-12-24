import React from 'react'
import colors from '../../themes/colors'
import AxlPaperRow from '../Paper/Row'

function AxlPaperRowMetrics({title, value, styles}) {
  return (
    <AxlPaperRow label={title} value={value} styles={{
        root: {
            fontSize: '13.5px',
        },
        label: {
            color: colors.brownishGrey,
        },
        value: {
            fontWeight: 'bold'
        },
        ...styles
    }}/>
  )
}

export default AxlPaperRowMetrics