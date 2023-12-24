import { Avatar, Grid, IconButton, makeStyles } from '@material-ui/core'
import React, { Fragment, useState } from 'react'
import _ from 'lodash';
import moment from 'moment';
import clsx from 'clsx';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';

import InforItem from '../InfoItem'
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

function VehicleInfo({vehicleInfo, matchDrivers, driverInfo}) {
  const classes = useStyles();

  const [toggleInfo, setToggleInfo] = useState({
    registration_record_expired_date: true,
    insurance_card_expired_date: true,
  })
  const [imgPreview, setImgPreview] = useState(null);
  const [title, setTitle] = useState(null);

  const handleToggleInfo = (name) => {
    setToggleInfo(prev => (
      {
        ...prev,
        [name]: !prev[name]
      }
    ))
  }

  const handleImgPreview = (title, url) => {
    setImgPreview(url);
    setTitle(title);
  }

  const handleClose = () => {
    setImgPreview(null);
    setTitle(null);
  }

  const renderIcon = (field) => 
    (
      matchDrivers && driverInfo.meta && driverInfo.meta.should_be_masked && driverInfo.meta.should_be_masked.includes(field) && (toggleInfo[field] ? 
      <IconButton style={{padding: 0}} onClick={() => handleToggleInfo(field)} disabled={driverInfo.meta.masked.includes(field)}>
        <VisibilityIcon fontSize='small'/>
      </IconButton> : 
      <IconButton style={{padding: 0}} onClick={() => handleToggleInfo(field)}>
        <VisibilityOffIcon fontSize='small'/>
      </IconButton>)
    )
  const contentDate = (field) => (
    driverInfo.meta && driverInfo.meta.masked && driverInfo.meta.masked.includes(field) 
    ? _.get(vehicleInfo, field, '-') 
    : toggleInfo[field] ? '**/**/****' : (_.get(vehicleInfo, field, null) ? moment(vehicleInfo[field], 'YYYY-MM-DD').format("MM/DD/YYYY") : '--/--/----')
  )

  return (
    <Fragment>
      <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <InforItem title={'Vehicle Info'} content={!vehicleInfo || (vehicleInfo && vehicleInfo.car && (!vehicleInfo.color && !vehicleInfo.car.make && !vehicleInfo.car.model)) ? '-' : `${_.get(vehicleInfo, 'color', '-')} ${_.get(vehicleInfo, 'car.make', '-')} ${_.get(vehicleInfo, 'car.model', '-')}`}/>
          </Grid>
          <Grid item xs={12} md={3}>
            <InforItem title={'license plate'} content={!vehicleInfo || (vehicleInfo && !vehicleInfo.license_state && !vehicleInfo.license_plate) ? '-' : `${_.get(vehicleInfo, 'license_state', '-')} - ${_.get(vehicleInfo, 'license_plate', '-')}`}/>
          </Grid>
          <Grid item xs={12} md={3}>
            <InforItem 
              title={'REGISTRATION CARD EXPIRED DATE'} 
              content={ contentDate('registration_record_expired_date')}
              icon={ renderIcon('registration_record_expired_date') }
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <InforItem 
              title={'INSURANCE CARD EXPIRED DATE'} 
              content={ contentDate('insurance_card_expired_date')}
              icon={ renderIcon('insurance_card_expired_date') }
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <InforItem title={'registration card photo'} content={(
              <Avatar variant="square" src={vehicleInfo && vehicleInfo.registration_record_url} 
                className={clsx(
                  classes.avatar,
                  (matchDrivers || (driverInfo.meta && driverInfo.meta.should_be_masked && driverInfo.meta.should_be_masked.includes('registration_record_url'))) && classes.blurImg
                )} 
                classes={{img: classes.avatarImg}}
                onClick={
                  () => handleImgPreview('Registration Card Photo', (!matchDrivers || (driverInfo && driverInfo.meta && driverInfo.meta.masked && driverInfo.meta.masked.includes('registration_record_url'))) ? null : (vehicleInfo && vehicleInfo.registration_record_url))
                }
                ></Avatar>
            )}/>
          </Grid>
          <Grid item xs={12} md={3}>
            <InforItem title={'insurance card photo'} content={(
              <Avatar variant="square" src={vehicleInfo && vehicleInfo.insurance_card_url} 
              className={clsx(
                classes.avatar, 
                (matchDrivers || (driverInfo.meta && driverInfo.meta.should_be_masked && driverInfo.meta.should_be_masked.includes('insurance_card_url'))) && classes.blurImg
              )} 
              classes={{img: classes.avatarImg}}
              onClick={
                () => handleImgPreview('Insurance Card Photo', (!matchDrivers || (driverInfo.meta && driverInfo.meta.masked && driverInfo.meta.masked.includes('insurance_card_url'))) ? null : (vehicleInfo && vehicleInfo.insurance_card_url))
              }
              ></Avatar>
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

export default VehicleInfo