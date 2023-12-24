import { Box, makeStyles } from '@material-ui/core'
import React, { Fragment } from 'react'
import colors from '../../themes/colors'

const useStyles = makeStyles((theme) => ({
  spanValue: {
    display: 'flex', 
    textAlign: 'initial', 
    fontSize: '14px', 
    wordBreak: 'break-all',
    fontFamily: 'AvenirNext',
    fontWeight: 600,
  },
  spanTitle: {
    textTransform: 'uppercase', 
    fontSize: '12px', 
    color: colors.graySecond
  }
}))

function InfoItem({title, content, icon}) {
  const classes = useStyles();

  return (
    <Fragment>
        <Box display={'flex'} justifyContent='flex-start'>
            <span className={classes.spanTitle}>{title}</span>
        </Box>
        <Box display={'flex'} justifyContent='flex-start' mt={1} alignItems='center' textAlign='left'>
            {React.isValidElement(content) ? content : (
                <span className={classes.spanValue}>{content}</span>
            )}
            {React.isValidElement(icon) ? <Box ml={2}>{icon}</Box> : null}
        </Box>
    </Fragment>
  )
}

export default InfoItem