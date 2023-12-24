import { Avatar, Grid, IconButton, makeStyles } from '@material-ui/core';
import moment from 'moment';
import React, { Fragment, useState } from 'react'
import _ from 'lodash';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import clsx from 'clsx';

import InfoItem from '../InfoItem';
import { encryptData } from '../PersonalInfo';
import PreviewImage from '../PreviewImage';

const useStyles = makeStyles((theme) => ({
  avatar: {
    maxWidth: 110,
    flex: 1,
    minHeight: 75,
    cursor: 'pointer'
  },
  dialogTitle: {
    paddingBottom: 0,
  },
  title: {
    color: '#4a4a4a'
  },
  avatarPreview: {
    width: 450,
    height: 284,
  },
  avatarImg: {
    objectFit: 'contain',
  },
  blurImg: {
    WebkitFilter: "blur(2px)",
    filter: "blur(2px)"
  }
}));

function DriverLicenseInfo({driverInfo, matchDrivers}) {
  const classes = useStyles();
  const [imgPreview, setImgPreview] = useState(null);
  const [title, setTitle] = useState(null);

  const [toggleInfo, setToggleInfo] = useState({
    driver_license_number: true,
    driver_license_issued_date: true,
    driver_license_expired_date: true,
  })

  const handleImgPreview = (title, url) => {
    setImgPreview(url);
    setTitle(title);
  }

  const handleClose = () => {
    setImgPreview(null);
    setTitle(null);
  }

  const handleToggleInfo = (name) => {
    setToggleInfo(prev => (
      {
        ...prev,
        [name]: !prev[name]
      }
    ))
  }

  return (
    <Fragment>
      <Grid item container spacing={3} >
        <Grid item xs={12} md={3}>
          <InfoItem 
            title={'DL NUMBER'} 
            content={
              driverInfo.meta && driverInfo.meta.masked && driverInfo.meta.masked.includes('driver_license_number') 
              ? _.get(driverInfo, 'driver_license_number', '-') 
              : toggleInfo.driver_license_number ? encryptData(_.get(driverInfo, 'driver_license_number', null)) : (driverInfo.driver_license_number ? driverInfo.driver_license_number : '-')
            }
            icon={
              driverInfo.meta && driverInfo.meta.masked && driverInfo.meta.masked.includes('driver_license_number') 
              ? null
              : matchDrivers && driverInfo.meta && driverInfo.meta.should_be_masked && driverInfo.meta.should_be_masked.includes('driver_license_number') && (toggleInfo.driver_license_number ? 
                <IconButton style={{padding: 0}} onClick={() => handleToggleInfo('driver_license_number')} disabled={driverInfo.meta.masked.includes('driver_license_number')}>
                  <VisibilityIcon fontSize='small'/>
                </IconButton> : 
                <IconButton style={{padding: 0}} onClick={() => handleToggleInfo('driver_license_number')}>
                  <VisibilityOffIcon fontSize='small'/>
                </IconButton>)
            }
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <InfoItem title={'DL STATE'} content={_.get(driverInfo, 'driver_license_state', '-')}/>
        </Grid>
        <Grid item xs={12} md={3}>
          <InfoItem 
            title={'ISSUED DATE'} 
            content={
              driverInfo.meta && driverInfo.meta.masked && driverInfo.meta.masked.includes('driver_license_issued_date') 
              ? _.get(driverInfo, 'driver_license_issued_date', '-') 
              : toggleInfo.driver_license_issued_date ? '**/**/****' : (_.get(driverInfo, 'driver_license_issued_date', null) ? moment(driverInfo.driver_license_issued_date, 'YYYY-MM-DD').format("MM/DD/YYYY") : '--/--/----')
            }
            icon={
              driverInfo.meta && driverInfo.meta.masked && driverInfo.meta.masked.includes('driver_license_issued_date')  
              ? null 
              : matchDrivers && driverInfo.meta && driverInfo.meta.should_be_masked && driverInfo.meta.should_be_masked.includes('driver_license_issued_date') && (toggleInfo.driver_license_issued_date ? 
              <IconButton style={{padding: 0}}onClick={() => handleToggleInfo('driver_license_issued_date')} disabled={driverInfo.meta.masked.includes('driver_license_issued_date')}>
                <VisibilityIcon fontSize='small'/>
              </IconButton> : 
              <IconButton style={{padding: 0}} onClick={() => handleToggleInfo('driver_license_issued_date')}>
                <VisibilityOffIcon fontSize='small'/>
              </IconButton>)
            }
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <InfoItem 
            title={'EXPIRED DATE'} 
            content={
              driverInfo.meta && driverInfo.meta.masked && driverInfo.meta.masked.includes('driver_license_issued_date') 
              ? _.get(driverInfo, 'driver_license_issued_date', '-') 
              : toggleInfo.driver_license_expired_date ? '**/**/****' : (_.get(driverInfo, 'driver_license_expired_date', null) ? moment(driverInfo.driver_license_expired_date, 'YYYY-MM-DD').format("MM/DD/YYYY") : '--/--/----')}
            icon={
              driverInfo.meta && driverInfo.meta.masked && driverInfo.meta.masked.includes('driver_license_issued_date')  
              ? null 
              : matchDrivers && driverInfo.meta && driverInfo.meta.should_be_masked && driverInfo.meta.should_be_masked.includes('driver_license_expired_date') && (toggleInfo.driver_license_expired_date ? 
              <IconButton style={{padding: 0}}onClick={() => handleToggleInfo('driver_license_expired_date')} disabled={driverInfo.meta.masked.includes('driver_license_expired_date')}>
                <VisibilityIcon fontSize='small'/>
              </IconButton> : 
              <IconButton style={{padding: 0}} onClick={() => handleToggleInfo('driver_license_expired_date')}>
                <VisibilityOffIcon fontSize='small'/>
              </IconButton>)
            }
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <InfoItem title={'DL PHOTO (FRONT)'} content={(
            <Avatar variant="square" src={driverInfo.driver_license_front_url} 
            className={clsx(
              classes.avatar, 
              (matchDrivers || (driverInfo.meta && driverInfo.meta.should_be_masked && driverInfo.meta.should_be_masked.includes('driver_license_front_url'))) && classes.blurImg
            )} 
              onClick={() => handleImgPreview('Driver License Photo (Front)', 
              (!matchDrivers || (driverInfo.meta && driverInfo.meta.masked && driverInfo.meta.masked.includes('driver_license_front_url'))) ? null :  driverInfo.driver_license_front_url)} classes={{img: classes.avatarImg}}></Avatar>
          )}/>
        </Grid>
        <Grid item xs={12} md={3}>
          <InfoItem title={'DL PHOTO (BACK)'} content={(
            <Avatar variant="square" src={driverInfo.driver_license_back_url} 
            className={clsx(
              classes.avatar, 
              (!matchDrivers || (driverInfo.meta && driverInfo.meta.should_be_masked && driverInfo.meta.should_be_masked.includes('driver_license_back_url'))) && classes.blurImg
            )}
              onClick={() => handleImgPreview('Driver License Photo (Back)',
              (!matchDrivers || (driverInfo.meta && driverInfo.meta.masked && driverInfo.meta.masked.includes('driver_license_back_url'))) ? null :  driverInfo.driver_license_back_url)
              } classes={{img: classes.avatarImg}}></Avatar>
          )}/>
        </Grid>
      </Grid>

      <PreviewImage
        handleClose={handleClose}
        imgPreview={imgPreview}
        title={title}
      />
    </Fragment>
  )
}

export default DriverLicenseInfo