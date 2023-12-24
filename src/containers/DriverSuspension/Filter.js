import { Box, TextField, withStyles } from '@material-ui/core';
import { Clear, Search } from '@material-ui/icons';
import { AxlDateInput, AxlMultiSelect} from 'axl-reactjs-ui';
import { style } from 'd3';
import { debounce } from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { toast } from "react-toastify";
import { async } from 'validate.js';
import driverSuspensionType from '../../constants/driverSuspensionType';
import { stores } from '../../stores';
import UserStore from '../../stores/User';
import ReasonFilter from './ReasonFilter';

const styles = (theme) => ({
  date: {
    display: 'inline-flex',
    '& > div': {
      width: '200px'
    }
  },
  textField: {
    flex: 'auto',
    '& input': {
      width: '100%',
      height: '46px',
      fontSize: '17px',
      lineHeight: '36px',
      boxSizing: 'border-box',
      borderRadius: '3px',
      padding: '4px 14px 4px 4px',
      outline: 'none',
    },
    '& input::placeholder': {
      fontSize: 15,
      color: '#9b9b9b',
      fontWeight: 'lighter'
    },
    '& input:focus': {
      outline: 'none'
    },
  },
  filterSelect: {
    '& button': {
      width: '140px',
      fontSize: '15px'
    },
    '& span': {
      textTransform: 'lowercase',
      marginLeft: '0px'
    }
  }
});

const downloadActions = [
  {title: 'SUSPENSION', action: () => this.setState({actionShow: 'SUSPENSION'})},
  {title: 'PROBATION', action: () => this.setState({actionShow: 'PROBATION'})},
  {title: 'COMPLIMENT', action: () => this.setState({actionShow: 'COMPLIMENT'})},
]

function SuspensionFilter(props) {
  const initialState = {reason: '', category:[], suspension_type: [], reporter_id: [], reporter_ts: null, start_time: null, end_time: null}
  const userStore = new UserStore()
  const [adminAccounts, setAdminAccounts] = useState([])
  const [categoryOptions, setCategoryOptions] = useState([])
  const [state, dispatch] = useReducer(reducer, initialState)
  const [isLoading, setIsLoading] = useState(false)
  const {handleListLoading, classes} = props
  const [driverInfo, setDriverInfo] = useState('')
  const [resetReason, setResetReason] = useState(false)

  useEffect(() => {
    userStore.getUserByAnyRoles({'roles': 'admin, super-admin, driver-coordinator'}, (data) => {
        setAdminAccounts(data.map(d => {return {label:d.username, value: d.id}}))
    })
    stores.driverStore.getAppealCategoriesByType('probation').then(response => {
      if (response.status === 200 && response.data) {
        const categories = [];
        if (response.data.categories && response.data.categories.length) {
          response.data.categories.map((cate) => {
            // categories.push({label: cate.title, value: cate.code});
            categories.push({label: cate.title, value: cate.code});
          })
          setCategoryOptions(categories)
        }
      }
    });
  }, [])
  
  useEffect(() => {
    if (state.start_time && state.end_time) {
      if (moment(state.end_time).isBefore(state.start_time)) {
        toast.warning('Start time should be before end time', {containerId: 'main'})
      }
    }
  }, [state.start_time, state.end_time])

  function reducer(state, action) {
    switch (action.type) {
      case 'update':
        return {...state, [action.key]:action.value}
      
      case 'reset':
        stores.driverSuspensionStore.setFilters({...stores.driverSuspensionStore.filters, [action.key]: initialState[action.key]});
        return {...state, [action.key]: initialState[action.key]}

      case 'reset_start_end_time':
        return {...state, start_time: initialState.start_time, end_time: initialState.end_time}
    
      default:
        break;
    }
  }

  const typeOptions = Object.keys(driverSuspensionType).map((k) => {
    return {label: driverSuspensionType[k], value: k}
  });
  
  const debounceInput = useCallback(debounce(() => {
    setIsLoading(false)
  }, 1000), [])

  const handleChangeInput = (key, value, type='update') => {
    if (!!value === false) {
      dispatch({key, value, type:'reset'})  
    } else {
      dispatch({key, value, type})
    }
    setIsLoading(true)
    debounceInput()
  }

  const handleSelectedChange = (key, value) => {
    if (!value || value.length == 0) {
      dispatch({key, value:null, type:'reset'})
      return
    }
    dispatch({key, value: value.map(v => v.value), type: 'update'})
  }

  const handleChangeDate = (key, value) => {
    if (value) {
      const date = moment(value).format('YYYY-MM-DD')
      dispatch({key, value: date, type:'update'})
    } else {
      if (key === 'reporter_ts') {
        stores.driverSuspensionStore.setFilters({...stores.driverSuspensionStore.filters, report_ts_end: null, report_ts_start: null});
      }
      dispatch({key, value, type:'reset'})
    }
  }
  
  const search = (resetDriverInfo = false, resetReason = false) => {
    if (isLoading) return

    const filters = {}
    Object.keys(state).forEach(key => {
      if (!!state[key] !== false && state[key].length != 0) {
        filters[key] = state[key]
      }
    })
    if (state.reporter_ts) {
      filters["report_ts_start"] = moment.tz(state.reporter_ts, moment.tz.guess()).startOf('day').unix()*1000
      filters["report_ts_end"] = moment.tz(state.reporter_ts, moment.tz.guess()).endOf('day').unix()*1000
    }
    if (state.start_time) {
      filters["start_time"] = moment.tz(state.start_time, moment.tz.guess()).startOf('day').unix()*1000
    }
    if (state.end_time) {
      filters["end_time"] = moment.tz(state.end_time, moment.tz.guess()).endOf('day').unix()*1000
    }

    filters.driver_info = resetDriverInfo ? '' : driverInfo

    const finalFilters= {...stores.driverSuspensionStore.filters, ...filters, page: 1}

    if (resetReason) delete finalFilters.reason

    stores.driverSuspensionStore.setFilters(finalFilters)
    stores.driverSuspensionStore.filters = finalFilters

    handleListLoading(true)
    stores.driverSuspensionStore.search((resp) => {
      const data = resp.data
      data["total_pages"] = data && data.size ? Math.ceil(data.count / data.size) : 0
      stores.driverSuspensionStore.result = data
      handleListLoading(false)
    });
  }

  useEffect(()=> {
    search()
  }, [...Object.values(state), isLoading])

  const handleChangeDriverInfo = (e) => {
    setDriverInfo(e.target.value)
  }

  function handleResetDriverInfo() {
    setDriverInfo('')
    search(true)
  }

  const handleSubmitDriverInfo = (e) => {
    if(e.keyCode == 13) search()
  }

  const handleResetFilterReason = () => {
    setResetReason(true)
    stores.driverSuspensionStore.filterReason = ''
    search(false, true)
  }

  useEffect(() => {
    const categories = <Box className={classes.filterSelect}>
                        <AxlMultiSelect
                          defaulValue={categoryOptions.filter(option => state.category.indexOf(option.value) >= 0)}
                          placeholderButtonLabel="all categories"
                          placeholder="Search Categories..."
                          allowAll={true}
                          options={categoryOptions}
                          onChange={(v) => {handleSelectedChange('category', v)}}
                          style={{width:'100%', margin:'0px'}}
                          multiple
                        />
                      </Box>

    const probationType = <Box className={classes.filterSelect}>
                            <AxlMultiSelect
                              defaulValue={typeOptions.filter(option => state.suspension_type.indexOf(option.value) >= 0)}
                              placeholderButtonLabel="all types"
                              placeholder="Search Types..."
                              allowAll={true}
                              options={typeOptions}
                              onChange={(v) => {handleSelectedChange('suspension_type', v)}}
                              style={{width:'100%', margin:'0px'}}
                              multiple
                            />
                          </Box>
    
    const reportedBy =  <Box className={classes.filterSelect}>
                          <AxlMultiSelect
                            defaulValue={adminAccounts.filter(option => state.reporter_id.indexOf(option.value) >= 0)}
                            placeholderButtonLabel="all reporters"
                            placeholder="Search Reporters..."
                            allowAll={true}
                            options={adminAccounts}
                            onChange={(v) => {handleSelectedChange('reporter_id', v)}}
                            style={{width:'100%', margin:'0px'}}
                            multiple
                          />
                        </Box>

    const reportedAt = <Box style={{marginLeft:'-10px'}}>
                        <AxlDateInput
                          id='reporter_ts'
                          clear="true"
                          onChange={(date) => {handleChangeDate('reporter_ts', date)}}
                          bg='red'
                          background='red'
                          options={{
                            defaultValue: state.reporter_ts ? moment(state.reporter_ts).toDate() : null,
                            defaultDate: state.reporter_ts ? moment(state.reporter_ts).toDate(): 'today',
                            dateFormat: 'MMM DD, Y',
                            placeHolder: 'all dates',
                            enableTime: false,
                            altInput: true,
                            clickOpens: false,
                            disableMobile: true
                          }}
                        />
                      </Box>
    const startTime = <Box style={{marginLeft:'-10px'}}>
                        <AxlDateInput
                          id="start_time"
                          arrow
                          clear="true"
                          onChange={(date) => {handleChangeDate('start_time', date)}}
                          options={{
                            defaultValue: state.start_time ? moment(state.start_time).toDate() : null,
                            defaultDate: state.start_time ? moment(state.start_time).toDate(): 'today',
                            dateFormat: 'MMM DD, Y',
                            placeHolder: 'all dates',
                            enableTime: false,
                            altInput: true,
                            clickOpens: false,
                            disableMobile: true
                          }}
                      />     
                      </Box>                 
      const endTime = <Box style={{marginLeft:'-10px'}}>
                        <AxlDateInput
                          id="end_time"
                          arrow
                          clear="true"
                          onChange={(date) => {handleChangeDate('end_time', date)}}
                          options={{
                            defaultValue: state.end_time ? moment(state.end_time).toDate() : null,
                            defaultDate: state.end_time ? moment(state.end_time).toDate(): 'today',
                            dateFormat: 'MMM DD, Y',
                            placeHolder: 'all dates',
                            enableTime: false,
                            altInput: true,
                            clickOpens: false,
                            disableMobile: true
                          }}
                        />
                      </Box>
    stores.driverSuspensionStore.setFieldFilterComponents({
                                                          category: {component: categories, resetFilter: () => handleSelectedChange('category', [])},
                                                          suspension_type: {component: probationType, resetFilter: () => handleSelectedChange('suspension_type', [])},
                                                          reporter_id: {component: reportedBy, resetFilter: () => handleSelectedChange('reporter_id', [])},
                                                          reporter_ts: {component: reportedAt, resetFilter: () => handleChangeDate('reporter_ts', '')},
                                                          start_time: {component: startTime, resetFilter: () => handleChangeDate('start_time', '')},
                                                          end_time: {component: endTime, resetFilter: () => handleChangeDate('end_time', '')},
                                                          reason: {component: <ReasonFilter handleListLoading={handleListLoading} driverInfo={driverInfo} reset={resetReason}/>, resetFilter: handleResetFilterReason}
                                                          })
  }, [...Object.values(state), adminAccounts, categoryOptions])

  return (
    <TextField variant="outlined" size="small" 
      value={driverInfo}
      InputLabelProps={{style: {fontSize: 40}}}
      placeholder='Search by driver name, driver ID, email...'
      className={classes.textField}
      InputProps={{
        startAdornment: <Search />,
        endAdornment: !!driverInfo && (
          <Clear style={{fontSize: 17, cursor:'pointer'}} onClick={handleResetDriverInfo}/>
        ),
        style: {backgroundColor:'#fff', fontSize: '17px'}
      }}
      onChange = {handleChangeDriverInfo}
      onKeyDown = {handleSubmitDriverInfo}
    />
  );
}

export default withStyles(styles)(SuspensionFilter);