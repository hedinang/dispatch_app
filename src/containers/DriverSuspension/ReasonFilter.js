import { TextField, withStyles} from '@material-ui/core';
import { Clear } from '@material-ui/icons';
import React, { useEffect, useState } from 'react';
import { stores } from '../../stores';

const styles = () => ({
  textField: {
    flex: 'auto',
    '& input': {
      height: '30px',
      width: '100%',
      fontSize: '15px',
      padding: '0px 5px'
    },
    '& input::placeholder': {
      fontSize: 14,
      color: '#9b9b9b'
    }
  },
});

function ReasonFilter(props) {
  const [reason, setReason] = useState('')
  const {handleListLoading, classes, reset, driverInfo} = props

  const handleChangeReason = (e) => {
    setReason(e.target.value)
    stores.driverSuspensionStore.filterReason = e.target.value
  }

  function handleResetReason() {
    stores.driverSuspensionStore.filterReason = ''
    setReason('')
    search()
  }

  const handleSubmitReason = (e) => {
    if(e.keyCode == 13) search()
  }

  useEffect(() => {
    if (reset) handleResetReason
  }, [reset])

  const search = () => {
    const filters = {...stores.driverSuspensionStore.filters, reason, page:1}

    if (driverInfo) filters.driver_info = driverInfo

    stores.driverSuspensionStore.setFilters(filters)

    handleListLoading(true)
    stores.driverSuspensionStore.search((resp) => {
      const data = resp.data
      data["total_pages"] = data && data.size ? Math.ceil(data.count / data.size) : 0
      stores.driverSuspensionStore.result = data
      handleListLoading(false)
    });
  }

  return (
    <TextField placeholder="keyword..." variant="outlined" size="small"
      value={reason ? reason: stores.driverSuspensionStore.filterReason}
      InputProps={{
                    endAdornment: (reason || stores.driverSuspensionStore.filterReason) && (
                      <Clear style={{fontSize: 12, cursor:'pointer'}} onClick={handleResetReason}/>
                    ),
                    style: {backgroundColor:'#fff', fontSize: '15px'}
                  }}
      onChange = {handleChangeReason}
      onKeyDown = {handleSubmitReason}
      className={classes.textField}
    />
  );
}

export default withStyles(styles)(ReasonFilter);