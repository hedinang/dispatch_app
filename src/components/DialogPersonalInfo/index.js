import { Box, Button, CircularProgress, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, Link, Typography, Tooltip } from '@material-ui/core'
import React, { Fragment, useState } from 'react'
import { makeStyles } from "@material-ui/core";
import EditIcon from '@material-ui/icons/Edit';
import CloseIcon from '@material-ui/icons/Close';
import _ from 'lodash';
import moment from 'moment';
import clsx from 'clsx';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';

import AxlTextField from '../AxlTextField';
import { encryptData } from '../PersonalInfo';
import AxlDatePicker from '../AxlDatePicker';
import AxlSelect from '../AxlSelect';
import AxlButton from '../AxlMUIComponent/AxlButton';
import { toastMessage } from '../../constants/toastMessage';
import { toast } from 'react-toastify';
import { compareData } from '../../Utils/compare';
import { driverLicenseState } from '../../constants/driver';
import AxlAutocomplete from '../AxlAutocomplete';
import { lazyValidation, validateSSN } from '../../Utils/validation';

const optionUnsubscribed = [
  {
    value: true,
    label: 'Yes',
  },
  {
    value: false,
    label: 'No',
  }
]

export const useStyles = makeStyles((theme) => ({
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
      fontFamily: 'AvenirNext',
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
    }
}));

const FORM_FIELDS = {
  FIRST_NAME: 'first_name',
  MIDDLE_NAME: 'middle_name',
  LAST_NAME: 'last_name',
  PHONE_NUMBER: 'phone_number',
  EMAIL: 'email',
  BIRTHDAY: 'birthday',
  SSN: 'ssn',
  STREET: 'street',
  STREET2: 'street2',
  CITY: 'city',
  STATE: 'state',
  ZIPCODE: 'zipcode',
  SMS_UNSUBSCRIBED: 'sms_unsubscribed',
  EMAIL_UNSUBSCRIBED: 'email_unsubscribed',
}

function DialogPersonalInfo({handleClose, title, data, driverStore, updateData}) {
  const emailRegex = /^[a-zA-Z0-9_+&-]+(\.[a-zA-Z0-9_+&-]+)*@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/;
  const zipcodeRegex= /^[0-9]{5}(?:-[0-9]{4})?$/;

  const validationSchema = Yup.object().shape({
    [FORM_FIELDS.FIRST_NAME]: Yup.lazy(value => lazyValidation('First Name', value)),
    [FORM_FIELDS.LAST_NAME]: Yup.lazy(value => lazyValidation('Last Name', value)),
    [FORM_FIELDS.PHONE_NUMBER]: Yup.lazy(value => lazyValidation('Phone Number', value)),
    [FORM_FIELDS.EMAIL]: Yup.string().required('Email is required').matches(emailRegex, 'Email invalid'),
    [FORM_FIELDS.BIRTHDAY]: Yup.lazy(value => lazyValidation('Birthday', value)),
    [FORM_FIELDS.SSN]: validateSSN(),
    [FORM_FIELDS.STREET]: Yup.lazy(value => lazyValidation('Street', value)),
    [FORM_FIELDS.CITY]: Yup.lazy(value => lazyValidation('City', value)),
    [FORM_FIELDS.STATE]: Yup.lazy(value => lazyValidation('State', value)),
    [FORM_FIELDS.ZIPCODE]: Yup.string().required('Zipcode is required').matches(zipcodeRegex, 'Zipcode invalid'),
  });
  const { register, handleSubmit, errors, setValue, reset, control, getValues, watch } = useForm({
    resolver: yupResolver(validationSchema),
    shouldUnregister: false,
    defaultValues: {
      [FORM_FIELDS.FIRST_NAME]: _.get(data, FORM_FIELDS.FIRST_NAME, ''),
      [FORM_FIELDS.MIDDLE_NAME]: _.get(data, FORM_FIELDS.MIDDLE_NAME, ''),
      [FORM_FIELDS.LAST_NAME]: _.get(data, FORM_FIELDS.LAST_NAME, ''),
      [FORM_FIELDS.PHONE_NUMBER]: _.get(data, FORM_FIELDS.PHONE_NUMBER, ''),
      [FORM_FIELDS.EMAIL]: _.get(data, FORM_FIELDS.EMAIL, ''),
      [FORM_FIELDS.BIRTHDAY]: _.get(data, FORM_FIELDS.BIRTHDAY, undefined),
      [FORM_FIELDS.SSN]: _.get(data, FORM_FIELDS.SSN, ''),
      [FORM_FIELDS.STREET]: _.get(data, 'home_address.street', ''),
      [FORM_FIELDS.STREET2]: _.get(data, 'home_address.street2', ''),
      [FORM_FIELDS.CITY]: _.get(data, 'home_address.city', ''),
      [FORM_FIELDS.STATE]: _.get(data, 'home_address.state', ''),
      [FORM_FIELDS.ZIPCODE]: _.get(data, 'home_address.zipcode', ''),
      [FORM_FIELDS.SMS_UNSUBSCRIBED]: _.get(data, FORM_FIELDS.SMS_UNSUBSCRIBED, false),
      [FORM_FIELDS.EMAIL_UNSUBSCRIBED]: _.get(data, FORM_FIELDS.EMAIL_UNSUBSCRIBED, false),
    },
  });
  const classes = useStyles();
  const [driverInfo, setDriverInfo] = useState(data);
  const [disableEdit, setDisableEdit] = useState({
    ssn: true,
  });
  const [isNext, setIsNext] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const metaNotEditable = driverInfo && driverInfo.meta && driverInfo.meta.not_editable;

  const clearAndEditField = (field) => {
    handleChange('', field);
    setDisableEdit(prev => (
      {
        ...prev,
        [field]: false
      }
    ))
  }

  const handleChange = (val, field) => {
    if (metaNotEditable && driverInfo.meta.not_editable.includes(field)) {
      return;
    }
    if([FORM_FIELDS.BIRTHDAY].includes(field)) {
      setValue(field, val ? val : undefined, { shouldValidate: true });
      return;
    }
    setValue(field, val, { shouldValidate: true });
  }

  const handleNext = (val) => {
    setIsNext(val);
  }

  const handleSave = () => {
    const payload = {
      "first_name": getValues(FORM_FIELDS.FIRST_NAME),
      "middle_name": getValues(FORM_FIELDS.MIDDLE_NAME),
      "last_name": getValues(FORM_FIELDS.LAST_NAME),
      "phone_number": getValues(FORM_FIELDS.PHONE_NUMBER),
      "email": getValues(FORM_FIELDS.EMAIL),
      "street": getValues(FORM_FIELDS.STREET),
      "street2": getValues(FORM_FIELDS.STREET2),
      "city": getValues(FORM_FIELDS.CITY),
      "state": getValues(FORM_FIELDS.STATE),
      "zipcode": getValues(FORM_FIELDS.ZIPCODE),
      "sms_unsubscribed": getValues(FORM_FIELDS.SMS_UNSUBSCRIBED) || false,
      "email_unsubscribed": getValues(FORM_FIELDS.EMAIL_UNSUBSCRIBED) || false,
      "birthday": getValues(FORM_FIELDS.BIRTHDAY) ? moment(getValues(FORM_FIELDS.BIRTHDAY)).format("YYYY-MM-DD") : ''
    }
    
    setIsSaving(true);
    driverStore.updatePersonalInfo(driverInfo.id, payload).then(res => {
      if(res.ok) {
        toast.success(toastMessage.UPDATED_SUCCESS, {containerId: 'main'});
        updateData(res.data);
        handleClose();
      }
      else {
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

  const renderData = [
    {
      label: 'First Name',
      type: 'string',
      mdColumn: 4,
      fieldName: FORM_FIELDS.FIRST_NAME,
      componentType: 'textfield',
    },
    {
      label: 'Middle Name',
      type: 'string',
      mdColumn: 4,
      fieldName: FORM_FIELDS.MIDDLE_NAME,
      componentType: 'textfield',
    },
    {
      label: 'Last Name',
      type: 'string',
      mdColumn: 4,
      fieldName: FORM_FIELDS.LAST_NAME,
      componentType: 'textfield',
    },
    {
      label: 'Phone Number',
      type: 'string',
      fieldName: FORM_FIELDS.PHONE_NUMBER,
      mdColumn: isNext ? 4 : 6,
      componentType: 'textfield',
    },
    {
      label: 'Email',
      type: 'string',
      mdColumn: isNext ? 4 : 6,
      fieldName: FORM_FIELDS.EMAIL,
      componentType: 'textfield',
    },
    {
      mdColumn: isNext ? 4 : 0,
    },
    {
      label: 'D.O.B',
      type: 'string',
      mdColumn: isNext ? 4 : 6,
      fieldName: FORM_FIELDS.BIRTHDAY,
      componentType: 'datepicker',
    },
    {
      label: 'SSN',
      type: 'string',
      mdColumn: isNext ? 4 : 6,
      disabled: disableEdit.ssn,
      masked: true,
      endAdornment:
        metaNotEditable && !driverInfo.meta.not_editable.includes('ssn') && (
          <InputAdornment position="end">
            <Tooltip title="Clear and Edit">
              <IconButton edge="end" size='small' onClick={() => clearAndEditField('ssn')} >
                <EditIcon fontSize='small'/>
              </IconButton>
            </Tooltip>
          </InputAdornment>
        ),
      fieldName: FORM_FIELDS.SSN,
      componentType: 'textfield'
    },
    {
      mdColumn: isNext ? 4 : 0,
    },
    {
      label: 'Address Line 1',
      type: 'string',
      mdColumn: 12,
      fieldName: FORM_FIELDS.STREET,
      componentType: 'textfield'
    },
    {
      label: 'Address Line 2 (optional)',
      type: 'string',
      mdColumn: 12,
      fieldName: FORM_FIELDS.STREET2,
      componentType: 'textfield'
    },
    {
      label: 'City',
      type: 'string',
      fieldName: FORM_FIELDS.CITY,
      mdColumn: 4,
      componentType: 'textfield'
    },
    {
      label: 'State',
      type: 'string',
      mdColumn: 4,
      fieldName: FORM_FIELDS.STATE,
      componentType: 'autocomplete',
      options: driverLicenseState,
    },
    {
      label: 'Zipcode',
      type: 'string',
      mdColumn: 4,
      fieldName: FORM_FIELDS.ZIPCODE,
      componentType: 'textfield'
    },
    {
      label: 'SMS Unsubscribed',
      type: 'string',
      options: optionUnsubscribed,
      mdColumn: isNext ? 4 : 6,
      fieldName: FORM_FIELDS.SMS_UNSUBSCRIBED,
      componentType: 'select',
    },
    {
      label: 'Email Unsubscribed',
      type: 'string',
      options: optionUnsubscribed,
      mdColumn: isNext ? 4 : 6,
      fieldName: FORM_FIELDS.EMAIL_UNSUBSCRIBED,
      componentType: 'select',
    },
    {
      mdColumn: isNext ? 4 : 0,
    },
  ]

  return (
    <Fragment>
        <DialogTitle className={classes.dialogTitle}>
          <Box display='flex' justifyContent='space-between' alignItems='center'>
            <Box>
              <Typography variant="h6" className={classes.title}>{isNext ? 'Confirmation - Edit Personal Info' : title}</Typography>
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
                    const {fieldName, mdColumn, componentType, type, masked, ...otherProps} = item;
                    switch (item.componentType) {
                      case 'datepicker':
                        return (
                          <Grid item xs={12} md={item.mdColumn} key={item.label}>
                            <Controller
                              name={fieldName}
                              render={() => (
                                <AxlDatePicker 
                                  {...otherProps} 
                                  {...register(fieldName)} 
                                  error={errors[fieldName] ? true : false} 
                                  helperText={errors[fieldName] && errors[fieldName].message}
                                  value={(
                                    !watch(fieldName) || watch(fieldName) === '**/**/****') 
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
                                  value={
                                    item.masked && disableEdit[fieldName]
                                    ? encryptData((watch(fieldName) || ''), false)
                                    : (watch(fieldName) || '')} 
                                  onChange={(evt) => handleChange(evt && evt.target.value, fieldName)}
                                  disabled={
                                    [FORM_FIELDS.STREET].includes(fieldName)
                                    ? metaNotEditable && driverInfo.meta.not_editable.includes('home_address')
                                    : (metaNotEditable && driverInfo.meta.not_editable.includes(fieldName) || item.disabled)}
                                  endAdornment={item.endAdornment}
                                  onBlur={(evt)=> handleChange(
                                    fieldName === 'ssn' 
                                    ? (watch(fieldName) || '')
                                    : evt && evt.target.value && evt.target.value.trim(), fieldName)}
                                />
                              )}
                              control={control}
                            />
                          </Grid>
                        )
                      case 'select': 
                        return (
                          <Grid item xs={12} md={item.mdColumn} key={item.label}>
                            <Controller
                              name={fieldName}
                              render={() => (
                                <AxlSelect 
                                  {...otherProps} 
                                  {...register(fieldName)} 
                                  error={errors[fieldName] ? true : false} 
                                  helperText={errors[fieldName] && errors[fieldName].message}
                                  value={watch(fieldName)}
                                  onChange={(evt) => handleChange(evt && evt.target.value, fieldName)}
                                  disabled={metaNotEditable && driverInfo.meta.not_editable.includes(fieldName)}
                                />
                              )}
                              control={control}
                            />
                          </Grid>
                        )
                      case 'autocomplete': 
                        return (
                          <Grid item xs={12} md={item.mdColumn} key={item.label}>
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
                      default:
                        return (
                          item.mdColumn > 0 && <Grid item xs={12} md={item.mdColumn}></Grid>
                        )
                    }
                  })
                }
              </Fragment>
            ) : (
              <Fragment>
                {renderData.map((item, idx) => (
                  <Grid item xs={12} md={item.mdColumn} key={idx}>
                    {item.label && (
                      <Fragment>
                        <Typography className={classes.typography}>{item.label}</Typography>
                        <Typography className={clsx(classes.typographyValue, 
                          !compareData(item.type, 
                            item.componentType === 'datepicker' 
                              ? (data[item.fieldName] ? moment(data[item.fieldName]).format("MM/DD/YYYY") : '') 
                              : (
                                [FORM_FIELDS.STREET, FORM_FIELDS.STREET2, FORM_FIELDS.STATE, FORM_FIELDS.CITY, FORM_FIELDS.ZIPCODE].includes(item.fieldName) 
                                ? _.get(data, `home_address.${item.fieldName}`, undefined)
                                : _.get(data, item.fieldName, [FORM_FIELDS.SMS_UNSUBSCRIBED, FORM_FIELDS.EMAIL_UNSUBSCRIBED].includes(item.fieldName) ? false : undefined)
                              ), 
                            item.componentType === 'datepicker' 
                            ? (getValues(item.fieldName) ? moment(getValues(item.fieldName)).format("MM/DD/YYYY") : '') 
                            : (getValues(item.fieldName) || ([FORM_FIELDS.SMS_UNSUBSCRIBED, FORM_FIELDS.EMAIL_UNSUBSCRIBED].includes(item.fieldName) ? false : undefined))) && classes.highlighted)}>
                          {
                            item.fieldName === 'ssn' 
                            ? encryptData(getValues(item.fieldName), true)
                            : ([FORM_FIELDS.SMS_UNSUBSCRIBED, FORM_FIELDS.EMAIL_UNSUBSCRIBED].includes(item.fieldName) 
                                ? getValues(item.fieldName) ? 'YES' : 'NO'
                                : item.componentType === 'datepicker' ? (!getValues(item.fieldName) ? '-' : moment(getValues(item.fieldName)).format("MM/DD/YYYY")) : (getValues(item.fieldName) || '-')
                            )
                          }
                        </Typography>
                      </Fragment>
                    )}
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
                    onClick={isNext ? () => handleSave() : handleSubmit((submitData) => handleNext(true, submitData))}>{isSaving && <CircularProgress color='primary' size={20} className={classes.progress}/>} {isNext ? 'Save' : 'Next'}</AxlButton>
                </Box>
            </Box>
          </Grid>
        </DialogContent>
    </Fragment>
  )
}

export default DialogPersonalInfo