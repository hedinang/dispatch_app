import {Box, CircularProgress, Grid, IconButton, Tooltip} from '@material-ui/core'
import React, { useState } from 'react'
import _ from 'lodash';
import moment from 'moment-timezone';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import InfoItem from '../InfoItem';

export const encryptData = (val, all) => {
    if(!val) return '';
    if(val.length <= 4) return val
    if (all) {
      return '*'.repeat(val.length);
    }
    const valStart = '*'.repeat(val.substring(0, val.length - 4).length);
    const valEnd = val.substring(val.length - 4, val.length);
    return valStart + valEnd;
}


function PersonalInfo({driverInfo, matchDrivers}) {
    const [isLoading, setIsLoading] = useState(false);
    const [toggleInfo, setToggleInfo] = useState({
        dob: true,
        ssn: true,
        address: true
    })

    const handleToggleInfo = (name) => {
        setToggleInfo(prev => (
            {
                ...prev,
                [name]: !prev[name]
            }
        ))
    }

    if(isLoading) return <CircularProgress color='primary' thickness={1}/>

  return (
    <Grid container>
        <Grid item container spacing={3}>
            <Grid item xs={12} md={3}>
                <InfoItem 
                    title={'D.O.B'} 
                    content={toggleInfo.dob ? '**/**/****' : (_.get(driverInfo, 'birthday', null) ? moment(driverInfo.birthday, 'YYYY-MM-DD').format("MM/DD/YYYY") : '--/--/----')}
                    icon={matchDrivers && driverInfo.meta && driverInfo.meta.should_be_masked && driverInfo.meta.should_be_masked.includes('birthday') && (toggleInfo.dob ? 
                        <IconButton style={{padding: 0}} aria-label="toggle-dob" onClick={() => handleToggleInfo('dob')} disabled={driverInfo.meta.masked.includes('birthday')}>
                            <VisibilityIcon fontSize='small'/>
                        </IconButton> : 
                        <IconButton style={{padding: 0}} aria-label="toggle-address" onClick={() => handleToggleInfo('dob')}>
                            <VisibilityOffIcon fontSize='small'/>
                        </IconButton>)
                    }
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <InfoItem title={'Phone Number'} content={_.get(driverInfo, 'phone_number', '-')}/>
            </Grid>
            <Grid item xs={12} md={3}>
                <InfoItem title={'E-mail'} content={_.get(driverInfo, 'email', '-')}/>
            </Grid>
            <Grid item xs={12} md={3}>
                <Box>
                    <InfoItem 
                        title={'Address'} 
                        content={
                            toggleInfo.address ? `${_.get(driverInfo, 'home_address.zipcode', '-')}` :
                            driverInfo && driverInfo.home_address && (driverInfo.home_address.street || driverInfo.home_address.street2 || driverInfo.home_address.city || driverInfo.home_address.state || driverInfo.home_address.zipcode) ?
                            `${_.get(driverInfo, 'home_address.street', '-')} ${_.get(driverInfo, 'home_address.street2', '')}, ${_.get(driverInfo, 'home_address.city', '-')}, ${_.get(driverInfo, 'home_address.state', '-')} ${_.get(driverInfo, 'home_address.zipcode', '-')}`
                            : '-'
                        }
                        icon={matchDrivers && driverInfo.meta && driverInfo.meta.should_be_masked && driverInfo.meta.should_be_masked.includes('home_address') && (toggleInfo.address ? 
                            <IconButton style={{padding: 0}} aria-label="toggle-address" onClick={() => handleToggleInfo('address')} disabled={driverInfo.meta.masked.includes('home_address')}>
                                <VisibilityIcon fontSize='small'/>
                            </IconButton> : 
                            <IconButton style={{padding: 0}} aria-label="toggle-address" onClick={() => handleToggleInfo('address')}>
                                <VisibilityOffIcon fontSize='small'/>
                            </IconButton>) 
                        }
                    />
                </Box>
            </Grid>
            
        </Grid>

        <Grid item container spacing={3} style={{marginTop: '8px'}}>
            <Grid item xs={12} md={3}>
                <InfoItem 
                    title={<span>SSN {driverInfo.ssn_verified &&
                      <Tooltip title={`Verified by ${driverInfo.ssn_verified_by}`} placement="top">
                        <CheckCircleIcon color="primary" fontSize="inherit" style={{verticalAlign: "text-top"}} />
                      </Tooltip>}
                    </span>}
                    content={toggleInfo.ssn ? encryptData(_.get(driverInfo, 'ssn', null), true) : encryptData(_.get(driverInfo, 'ssn', null), false)}
                    icon={matchDrivers && driverInfo.meta && driverInfo.meta.should_be_masked && driverInfo.meta.should_be_masked.includes('ssn') && (toggleInfo.ssn ? 
                        <IconButton style={{padding: 0}} aria-label="toggle-ssn" onClick={() => handleToggleInfo('ssn')} disabled={driverInfo.meta.masked.includes('ssn')}>
                            <VisibilityIcon fontSize='small'/>
                        </IconButton> : 
                        <IconButton style={{padding: 0}} aria-label="toggle-ssn" onClick={() => handleToggleInfo('ssn')}>
                            <VisibilityOffIcon fontSize='small'/>
                        </IconButton>) 
                    }
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <InfoItem title={'SMS Unsubscribed'} content={driverInfo.sms_unsubscribed ? 'YES' : 'NO'}/>
            </Grid>
            <Grid item xs={12} md={3}>
                <InfoItem title={'Email Unsubscribed'} content={driverInfo.email_unsubscribed ? 'YES' : 'NO'}/>
            </Grid>
        </Grid>
    </Grid>
  )
}

export default PersonalInfo