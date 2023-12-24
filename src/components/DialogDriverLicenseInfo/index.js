import { Avatar, Box, CircularProgress, DialogContent, DialogTitle, FormHelperText, Grid, IconButton, Link, Typography } from '@material-ui/core'
import React, { Fragment, useState } from 'react'
import { makeStyles } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import _ from 'lodash';
import moment from 'moment';
import clsx from 'clsx';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';

import AxlTextField from '../AxlTextField';
import AxlDatePicker from '../AxlDatePicker';
import AxlButton from '../AxlMUIComponent/AxlButton';
import { toastMessage } from '../../constants/toastMessage';
import { toast } from 'react-toastify';
import { compareData } from '../../Utils/compare';
import { driverLicenseState } from '../../constants/driver';
import AxlUploadFile from '../AxlUploadFile';
import AxlAutocomplete from '../AxlAutocomplete';
import { lazyValidation, validateDate, validateImage } from '../../Utils/validation';

const useStyles = makeStyles((theme) => ({
    dialogTitle: {
      paddingBottom: 0,
    },
    title: {
      color: '#4a4a4a'
    },
    typography: {
      color: '#707070',
      marginBottom: '5px'
    },
    btnLink: {
      color: "#4a90e2",
      fontWeight: 500,
      textDecoration: 'underline',
      fontSize: 14,
      marginLeft: 8
    },
    typographyValue: {
      color: '#4a4a4a',
      fontWeight: 600,
    },
    spanTitle: {
      fontWeight: 500,
      color: '#626262',
      fontSize: 12,
      fontStyle: 'italic',
      fontFamily: 'AvenirNext-italic'
    },
    progress: {
      marginRight: 4,
    },
    highlighted: {
      color: '#6c62f5'
    },
    avatar: {
        minHeight: 192,
        flex: 1,
    },
    avatarImg: {
        objectFit: 'contain',
    },
    avatarContainer: {
        minHeight: 200,
        padding: '4px 0px',
        border: '1px solid rgba(0, 0, 0, 0.23)',
        borderRadius: '4px'
    },
    borderHighlight: {
        border: '1px solid #6c62f5'
    }
}));

const FORM_FIELDS = {
  DRIVER_LICENSE_NUMBER: 'driver_license_number',
  DRIVER_LICENSE_STATE: 'driver_license_state',
  DRIVER_LICENSE_ISSUED_DATE: 'driver_license_issued_date',
  DRIVER_LICENSE_EXPIRED_DATE: 'driver_license_expired_date',
  DRIVER_LICENSE_FRONT_URL: 'driver_license_front_url',
  DRIVER_LICENSE_BACK_URL: 'driver_license_back_url'
}

function DialogDriverLicenseInfo({handleClose, title, data, driverStore, updateData}) {
  const configFileSize = process.env.REACT_APP_FILE_SIZE_LIMIT || 15;
  const validationSchema = Yup.object().shape({
    [FORM_FIELDS.DRIVER_LICENSE_NUMBER]: Yup.lazy(value => lazyValidation('Driver License Number', value)),
    [FORM_FIELDS.DRIVER_LICENSE_EXPIRED_DATE]: validateDate(false, 'Driver License Expired Date', FORM_FIELDS.DRIVER_LICENSE_ISSUED_DATE, "Expired Date cannot be before Issued Date", true),
    [FORM_FIELDS.DRIVER_LICENSE_FRONT_URL]: validateImage(false, 'Driver License Photo (Front)', configFileSize),
    [FORM_FIELDS.DRIVER_LICENSE_BACK_URL]: validateImage(false, 'Driver License Photo (Back)', configFileSize),
  });
  const { register, handleSubmit, errors, setValue, reset, control, getValues, watch } = useForm({
    resolver: yupResolver(validationSchema),
    shouldUnregister: false,
    defaultValues: _.pick(data, [
      FORM_FIELDS.DRIVER_LICENSE_NUMBER, 
      FORM_FIELDS.DRIVER_LICENSE_STATE,
      FORM_FIELDS.DRIVER_LICENSE_ISSUED_DATE,
      FORM_FIELDS.DRIVER_LICENSE_EXPIRED_DATE,
      FORM_FIELDS.DRIVER_LICENSE_FRONT_URL,
      FORM_FIELDS.DRIVER_LICENSE_BACK_URL,
    ]),
  });
  const classes = useStyles();
  const [driverInfo, setDriverInfo] = useState(data);
  const [isNext, setIsNext] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const metaNotEditable = driverInfo && driverInfo.meta && driverInfo.meta.not_editable;

  const handleChange = (val, field) => {
    if (metaNotEditable && driverInfo.meta.not_editable.includes(field)) {
      return;
    }

    if([FORM_FIELDS.DRIVER_LICENSE_NUMBER].includes(field)) {
      setValue(field, val, { shouldValidate: true })
      return
    }
    setValue(field, val ? val : undefined, { shouldValidate: true })
  }

  const handleNext = (val) => {
    setIsNext(val);
  }

  const handleSave = () => {
    const formData = new FormData();
    formData.append('driver_license_number', (getValues(FORM_FIELDS.DRIVER_LICENSE_NUMBER) || ''));
    formData.append('driver_license_state', (getValues(FORM_FIELDS.DRIVER_LICENSE_STATE) || ''));
    formData.append('driver_license_issued_date', getValues(FORM_FIELDS.DRIVER_LICENSE_ISSUED_DATE) ? moment(getValues(FORM_FIELDS.DRIVER_LICENSE_ISSUED_DATE)).format("YYYY-MM-DD") : '');
    formData.append('driver_license_expired_date', getValues(FORM_FIELDS.DRIVER_LICENSE_EXPIRED_DATE) ? moment(getValues(FORM_FIELDS.DRIVER_LICENSE_EXPIRED_DATE)).format("YYYY-MM-DD") : '');
    formData.append('front_photo', getValues(FORM_FIELDS.DRIVER_LICENSE_FRONT_URL));
    formData.append('back_photo', getValues(FORM_FIELDS.DRIVER_LICENSE_BACK_URL));

    setIsSaving(true);
    driverStore.updateDriverLicense(driverInfo.id, formData).then(res => {
      if(res.ok) {
        toast.success(toastMessage.UPDATED_SUCCESS, {containerId: 'main'});
        updateData(res.data);
        handleClose();
      }
      else {
        if(!res.status) {
          toast.error(toastMessage.ERROR_UPDATING, {containerId: 'main'});
          return;
        }
        
        if(res.status === 304) {
          toast.warn('Data is not changed', {containerId: 'main'});
          return;
        }

        const {errors, message} = res && res.data;
        if(errors) {
          toast.error(errors.join('\n\n'), {containerId: 'main'});
          return;
        }
        if(message) {
          toast.error(message.split('\r\n').join('\n\n'), {containerId: 'main'});
          return;
        }
        toast.error(toastMessage.ERROR_UPDATING, {containerId: 'main'});
      }
    }).finally(() => setIsSaving(false));
  }

  const handleRemoveImg = (field) => {
    setValue(field, null, { shouldValidate: true });
  }

  const renderData = [
    {
      label: 'DL Number',
      type: 'string',                    
      mdColumn: 6,
      componentType: 'textfield',
      fieldName: FORM_FIELDS.DRIVER_LICENSE_NUMBER,
    },
    {
      label: 'DL State',
      type: 'string',                    
      options: driverLicenseState,
      mdColumn: 6,
      componentType: 'autocomplete',
      fieldName: FORM_FIELDS.DRIVER_LICENSE_STATE,
      getOptionSelected: (option, value) => option === value,
    },
    {
      label: 'Issued Date',
      type: 'string',                    
      mdColumn: 6,
      componentType: 'datepicker',
      fieldName: FORM_FIELDS.DRIVER_LICENSE_ISSUED_DATE,
    },
    {
      label: 'Expired Date',
      type: 'string',                    
      mdColumn: 6,
      componentType: 'datepicker',
      fieldName: FORM_FIELDS.DRIVER_LICENSE_EXPIRED_DATE,
    },
    {
      label: 'Driver License Photo (Front)',
      type: 'string',                    
      mdColumn: 6,
      componentType: isNext ? 'view-img' : 'edit-img',
      fieldName: FORM_FIELDS.DRIVER_LICENSE_FRONT_URL,
    },
    {
      label: 'Driver License Photo (Back)',
      type: 'string',                    
      mdColumn: 6,
      componentType: isNext ? 'view-img' : 'edit-img',
      fieldName: FORM_FIELDS.DRIVER_LICENSE_BACK_URL,
    }
  ]

  return (
    <Fragment>
        <DialogTitle className={classes.dialogTitle}>
          <Box display='flex' justifyContent='space-between' alignItems='center'>
            <Box>
              <Typography variant="h6" className={classes.title}>{isNext ? 'Confirmation - Edit Driver License Info' : title}</Typography>
              {isNext && <span className={classes.spanTitle}>Please review the info again before you save it. Updated information is highlighted.</span>}
            </Box>
            {handleClose && 
              <IconButton aria-label="close" onClick={handleClose} disabled={isSaving}>
                <CloseIcon />
              </IconButton>
            }
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {!isNext ? (
              <Fragment>
                {
                  renderData.map(item => {
                    const {fieldName, mdColumn, componentType, type,  ...otherProps} = item;
                    switch (item.componentType) {
                      case 'datepicker':
                        return (
                          <Grid item xs={12} md={item.mdColumn} key={item.label}>
                            <Box>
                              <Controller
                                name={fieldName}
                                render={() => (
                                  <AxlDatePicker 
                                    {...otherProps} 
                                    {...register(fieldName)} 
                                    error={errors[fieldName] ? true : false} 
                                    helperText={errors[fieldName] && errors[fieldName].message}
                                    value={
                                      (!watch(fieldName) || watch(fieldName) === '**/**/****') 
                                      ? null 
                                      : new Date(watch(fieldName).replace(/-/g, '/'))
                                    }
                                    onChange={(evt, val) => handleChange(val, fieldName)}
                                    disabled={metaNotEditable && driverInfo.meta.not_editable.includes(fieldName)}
                                    format={"MM/dd/yyyy"}
                                  />
                                )}
                                control={control}
                              />
                            </Box>
                          </Grid>
                        )
                      case 'textfield': 
                        return (
                          <Grid item xs={12} md={item.mdColumn} key={item.label}>
                            <Controller
                              name={fieldName}
                              render={() => (
                                <AxlTextField 
                                  {...otherProps} 
                                  {...register(fieldName)} 
                                  error={errors[fieldName] ? true : false} 
                                  helperText={errors[fieldName] && errors[fieldName].message}
                                  onChange={(evt) => handleChange(evt && evt.target.value, fieldName)}
                                  disabled={metaNotEditable && driverInfo.meta.not_editable.includes(fieldName)}
                                  onBlur={(evt)=> handleChange(evt && evt.target.value && evt.target.value.trim(), fieldName)}
                                  value={watch(fieldName)}
                                />
                              )}
                              control={control}
                            />
                          </Grid>
                        )
                      case 'autocomplete': 
                        return (
                          <Grid item xs={12} md={6} key={item.label}>
                            <Controller
                              name={fieldName}
                              render={() => (
                                <AxlAutocomplete 
                                  {...otherProps} 
                                  {...register(fieldName)} 
                                  error={errors[fieldName] ? true : false} 
                                  helperText={errors[fieldName] && errors[fieldName].message}
                                  value={watch(fieldName)}
                                  onChange={(evt, val) => handleChange(val, fieldName)} 
                                  disabled={metaNotEditable && driverInfo.meta.not_editable.includes(fieldName)}
                                />
                              )}
                              control={control}
                            />
                          </Grid>
                        )
                      case 'edit-img':
                        return (
                          <Grid item xs={12} md={6} key={item.label}>
                            <Controller
                              name={fieldName}
                              render={() => (
                                <Box>
                                  <Box display='flex' justifyContent='space-between' alignItems='center' minHeight={30}>
                                    <Typography className={classes.typography}>{item.label}</Typography>
                                    {
                                      watch(fieldName) && <IconButton size='small' onClick={() => handleRemoveImg(fieldName)}
                                      disabled={metaNotEditable && driverInfo.meta.not_editable.includes(fieldName)}
                                      >
                                        <DeleteOutlineIcon/>
                                      </IconButton>
                                    }
                                  </Box>
                                  {watch(fieldName) && (
                                    <Box display='flex' justifyContent='center' alignItems='center' className={classes.avatarContainer}>
                                      <Avatar 
                                        variant="square" 
                                        src={typeof watch(fieldName) === 'string' ? watch(fieldName) : URL.createObjectURL(watch(fieldName))} 
                                        className={classes.avatar} classes={{img: classes.avatarImg}}
                                      />
                                    </Box>
                                  )}
                                  {!watch(fieldName) && 
                                    <AxlUploadFile 
                                    handleChange={(evt) => handleChange(evt && evt.target.files[0], fieldName)} 
                                    subTitle={'Upload here…'}
                                    disabled={metaNotEditable && driverInfo.meta.not_editable.includes(fieldName)}
                                    maxSize={configFileSize}
                                    fieldName={fieldName}
                                    />
                                  }
                                  {errors[fieldName] && errors[fieldName].message && <FormHelperText error={true} style={{marginLeft: 14, marginTop: 4}}>{errors[fieldName].message}</FormHelperText>}
                                </Box>
                              )}
                              control={control}
                            />
                            
                          </Grid>
                        )
                    }
                  })
                }
              </Fragment>
            ) : (
              <Fragment>
                {renderData.map((item, idx) => item.componentType !== 'view-img' ? (
                  <Grid item xs={12} md={item.mdColumn} key={idx}>
                    <Typography className={classes.typography}>{item.label}</Typography>
                    <Typography className={clsx(classes.typographyValue, 
                      !compareData(item.type, 
                      item.componentType === 'datepicker' ? (data[item.fieldName] ? moment(data[item.fieldName]).format("MM/DD/YYYY") : '') : _.get(data, item.fieldName, undefined), 
                      item.componentType === 'datepicker' ? (getValues(item.fieldName) ? moment(getValues(item.fieldName)).format("MM/DD/YYYY") : '') : (getValues(item.fieldName) || undefined)) && classes.highlighted)}>
                      {
                        item.componentType === 'datepicker' ? (!getValues(item.fieldName) ? '-' : moment(getValues(item.fieldName)).format("MM/DD/YYYY")) : (getValues(item.fieldName) || '-')
                      }
                    </Typography>
                  </Grid>
                ) : (
                    <Grid item xs={12} md={item.mdColumn} key={idx}>
                      <Typography className={classes.typography}>{item.label}</Typography>
                      <Box display='flex' justifyContent='center' alignItems='center' 
                        className={clsx(classes.avatarContainer, !compareData(item.type, _.get(data, item.fieldName, null), getValues(item.fieldName)) && classes.borderHighlight)}>
                          {!getValues(item.fieldName) && <Typography>N/A</Typography>}
                          {getValues(item.fieldName) && (
                              <Avatar variant="square" src={typeof getValues(item.fieldName) === 'string' ? getValues(item.fieldName) : URL.createObjectURL(getValues(item.fieldName))} className={classes.avatar} classes={{img: classes.avatarImg}}/>
                          )}
                      </Box>
                    </Grid>
                ))}
              </Fragment>
            )}

            <Box display='flex' justifyContent={isNext ? 'space-between' : 'flex-end'} flex={1} mt={5} mb={3} alignItems="center">
                {isNext && <Box>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => handleNext(false)}
                    className={classes.btnLink}
                    disabled={isSaving}
                  >
                    Back to Edit
                  </Link>
                </Box>}
                <Box>
                  <AxlButton variant="outlined" color={"color.graySeventh"} onClick={handleClose} disabled={isSaving}>Cancel</AxlButton>
                  <AxlButton 
                    variant="outlined"
                    color={`color.white`}
                    bgcolor={`color.greenThird`} 
                    disabled={isSaving}
                    onClick={isNext ? () => handleSave() : handleSubmit(submitData => handleNext(true, submitData))}>{isSaving && <CircularProgress color='primary' size={20} className={classes.progress}/>} {isNext ? 'Save' : 'Next'}</AxlButton>
                </Box>
            </Box>
          </Grid>
        </DialogContent>
    </Fragment>
  )
}

export default DialogDriverLicenseInfo