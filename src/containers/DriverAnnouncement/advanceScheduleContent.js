import React from 'react';

import { Box, FormHelperText, Grid, Typography } from '@material-ui/core';
import moment from 'moment-timezone';

import AxlSelect from '../../components/AxlSelect';
import AxlDateTimePicker from '../../components/AxlDateTimePicker';

const TimezoneOptions = [
  { key: '1', value: 'America/Chicago', label: 'Chicago' },
  { key: '2', value: 'America/Denver', label: 'Denver' },
  { key: '3', value: 'America/Los_Angeles', label: 'Los Angeles' },
  { key: '4', value: 'America/New_York', label: 'New York' },
  { key: '5', value: 'America/Phoenix', label: 'Phoenix' },
];

function AdvanceScheduleContent({timezone, handleChange, schedule, isEdit, originScheduleTime, originScheduleTimezone, error}) {
  const formatScheduleTime = originScheduleTime && moment.tz(originScheduleTime, originScheduleTimezone).format('M/DD/YYYY hh:mmA z');
  
  return (
    <Box>
      {isEdit 
      ? <Box>
        <Box color={'#4a90e2'} mb={1}>{`Currently scheduled on ${formatScheduleTime || 'N/A'}`}</Box>
        <Box display={'flex'} flexDirection={'column'} lineHeight={1.3} mb={2}>
          <span>To edit schedule, please select a new time/date and click “Schedule”.</span>
          <span>To remove current schedule, please click “Remove Schedule”.</span>
        </Box>
      </Box> 
      : (
        <Typography style={{marginBottom: 16}}>Please select a schedule to send this announcement</Typography>
      )}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <AxlDateTimePicker
            format={'M/dd/yyyy HH:mm'}
            value={schedule}
            onChange={(val) => handleChange('schedule', val)}
            label={'Date & Time'}
            placeholder={'Select date & time'}
            ampm={false}
          />
          {!!error.schedule && <FormHelperText error={true} style={{marginLeft: 8}}>{error.schedule}</FormHelperText>}
        </Grid>
        <Grid item xs={6}>
          <AxlSelect
            options={TimezoneOptions}
            name='timezone'
            onChange={(evt) => handleChange('timezone', evt.target && evt.target.value)}
            value={timezone} 
            style={{width: '100%', fontFamily: 'AvenirNext', fontSize: '14px', height: '38px', color: "#3b3b3b"}}
            label={'Timezone'}
            placeholder={'Select timezone'}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default AdvanceScheduleContent