import { Box, Typography } from '@material-ui/core';
import React from 'react';
import driverSuspensionType from '../../constants/driverSuspensionType';
import AxlTableContainer from '../AxlTableContainer';

export const getDriverCategory = (categories, code) => {
  const findCategory = categories && categories.find(category => category.code === code);
  if(!findCategory) return 'N/A';
  return findCategory.title;
}

function DriverProbationInfo(props) {
  const {categories, probations} = props  
  const fields = [
    { id: 'id', fieldName: 'driver_id', label: 'ID', isDisableSort: true, },
    { id: 'name', fieldName: 'driver_name', label: 'Name', isDisableSort: true, renderer: (current, item) => (current || 'N/A') },
    { id: 'reason', fieldName: 'reason', label: 'Reason', isDisableSort: true, renderer: (current, item) => (current || 'N/A')},
    { id: 'category', fieldName: 'category', label: 'Category', isDisableSort: true, renderer: (current, item) => (getDriverCategory(categories, current) || 'N/A')},
    { id: 'suspension_type', fieldName: 'suspension_type', label: 'Probation Type', isDisableSort: true, minWidth: '120px', renderer: (current, item) => (driverSuspensionType[current] || 'N/A')},
    { id: 'status', fieldName: 'status', label: 'Status', isDisableSort: true, renderer: (current, item) => (current || 'N/A')},
  ]
  
  return (
    <Box style={{background: '#efefef', height: '100px', overflowY: 'scroll', margin: '9px 2.2px 4px 0', padding: '15px 10px 20px'}}>
      {probations && <Typography align='right' style={{marginBottom: 10}}>Total: {probations.length} probations</Typography>}
      {probations && <AxlTableContainer fields={fields} data={probations} isLoading={false}/>}
      {!probations && <Typography style={{color:'#ff3333'}}>Driver not found!</Typography>}
    </Box>
  );
}

export default React.memo(DriverProbationInfo);