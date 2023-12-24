import { Avatar, Box, CircularProgress, DialogContent, DialogTitle, FormHelperText, Grid, IconButton, Link, Typography } from '@material-ui/core'
import React, { Fragment, useEffect, useState } from 'react'
import { makeStyles } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import _ from 'lodash';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';

import AxlButton from '../AxlMUIComponent/AxlButton';
import { toastMessage } from '../../constants/toastMessage';
import { compareData } from '../../Utils/compare';
import AxlTextField from '../AxlTextField';
import AxlDatePicker from '../AxlDatePicker';
import AxlUploadFile from '../AxlUploadFile';
import moment from 'moment';
import { driverLicenseState } from '../../constants/driver';
import AxlAutocomplete from '../AxlAutocomplete';
import { lazyValidation, validateDate, validateImage } from '../../Utils/validation';

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

const getOptYears = () => {
  let years = [];
  for (let year = 1990; year <= new Date().getFullYear() + 20; year++) {
    years.push(`${year}`);    
  }
  return years
}

const FORM_FIELDS = {
  VEHICLE_NAME: 'vehicle_name',
  YEAR: 'year',
  LICENSE_PLATE: 'license_plate',
  MAKE: 'make',
  LICENSE_STATE: 'license_state',
  MODEL: 'model',
  COLOR: 'color',
  SUB_MODEL: 'submodel',
  REGISTRATION_RECORD_ISSUED_DATE: 'registration_record_issued_date',
  REGISTRATION_RECORD_EXPIRED_DATE: 'registration_record_expired_date',
  INSURANCE_CARD_ISSUED_DATE: 'insurance_card_issued_date',
  INSURANCE_CARD_EXPIRED_DATE: 'insurance_card_expired_date',
  REGISTRATION_RECORD_URL: 'registration_record_url',
  INSURANCE_CARD_URL: 'insurance_card_url',
}

function DialogVehicleInfo({handleClose, title, data, driverStore, updateData, driverID, vehicleNumber, driverInfo}) {
  const configFileSize = process.env.REACT_APP_FILE_SIZE_LIMIT || 15;
  const validationSchema = Yup.object().shape({
    [FORM_FIELDS.VEHICLE_NAME]: Yup.lazy(value => lazyValidation('Vehicle Name', value)),
    [FORM_FIELDS.YEAR]: Yup.lazy(value => lazyValidation('Year', value)),
    [FORM_FIELDS.LICENSE_PLATE]: Yup.lazy(value => lazyValidation('License Plate', value)),
    [FORM_FIELDS.MAKE]: Yup.lazy(value => lazyValidation('Make', value)),
    [FORM_FIELDS.LICENSE_STATE]: Yup.lazy(value => lazyValidation('License Plate State', value)),
    [FORM_FIELDS.MODEL]: Yup.lazy(value => lazyValidation('Model', value)),
    [FORM_FIELDS.COLOR]: Yup.lazy(value => lazyValidation('Color', value)),
    [FORM_FIELDS.REGISTRATION_RECORD_ISSUED_DATE]: Yup.date().nullable().default(null).required('Issued Date is required'),
    [FORM_FIELDS.REGISTRATION_RECORD_EXPIRED_DATE]: validateDate(true, 'Expired Date', FORM_FIELDS.REGISTRATION_RECORD_ISSUED_DATE, 'Expired Date cannot be before Issued Date', true),
    [FORM_FIELDS.INSURANCE_CARD_ISSUED_DATE]: Yup.date().nullable().default(null).required('Issued Date is required'),
    [FORM_FIELDS.INSURANCE_CARD_EXPIRED_DATE]: validateDate(true, 'Expired Date', FORM_FIELDS.INSURANCE_CARD_ISSUED_DATE, 'Expired Date cannot be before Issued Date', true),
    [FORM_FIELDS.REGISTRATION_RECORD_URL]: validateImage(true, 'Registration Card Photo', configFileSize),
    [FORM_FIELDS.INSURANCE_CARD_URL]: validateImage(true, 'Insurance Card Photo', configFileSize),
  });

  const { register, handleSubmit, errors, setValue, reset, control, getValues, watch } = useForm({
    resolver: yupResolver(validationSchema),
    shouldUnregister: false,
    defaultValues: {
      [FORM_FIELDS.VEHICLE_NAME]: _.get(data, FORM_FIELDS.VEHICLE_NAME, ''),
      [FORM_FIELDS.YEAR]: _.get(data, 'car.year', ''),
      [FORM_FIELDS.LICENSE_PLATE]: _.get(data, FORM_FIELDS.LICENSE_PLATE, ''),
      [FORM_FIELDS.MAKE]: _.get(data, 'car.make', ''),
      [FORM_FIELDS.LICENSE_STATE]: _.get(data, FORM_FIELDS.LICENSE_STATE, ''),
      [FORM_FIELDS.MODEL]: _.get(data, 'car.model', ''),
      [FORM_FIELDS.COLOR]: _.get(data, 'color', ''),
      [FORM_FIELDS.SUB_MODEL]: _.get(data, 'car.submodel', ''),
      [FORM_FIELDS.REGISTRATION_RECORD_ISSUED_DATE]: _.get(data, FORM_FIELDS.REGISTRATION_RECORD_ISSUED_DATE, undefined),
      [FORM_FIELDS.REGISTRATION_RECORD_EXPIRED_DATE]: _.get(data, FORM_FIELDS.REGISTRATION_RECORD_EXPIRED_DATE, undefined),
      [FORM_FIELDS.INSURANCE_CARD_ISSUED_DATE]: _.get(data, FORM_FIELDS.INSURANCE_CARD_ISSUED_DATE, undefined),
      [FORM_FIELDS.INSURANCE_CARD_EXPIRED_DATE]: _.get(data, FORM_FIELDS.INSURANCE_CARD_EXPIRED_DATE, undefined),
      [FORM_FIELDS.REGISTRATION_RECORD_URL]: data[FORM_FIELDS.REGISTRATION_RECORD_URL] || null,
      [FORM_FIELDS.INSURANCE_CARD_URL]: data[FORM_FIELDS.INSURANCE_CARD_URL] || null,
    },
  });

  const classes = useStyles();
  const [vehicleInfo, setVehicleInfo] = useState(data);
  const [isNext, setIsNext] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [optMakes, setOptMakes] = useState([]);
  const [optModels, setOptModels] = useState([]);
  const [optSubModels, setOptSubModels] = useState([]);
  const metaNotEditable = driverInfo && driverInfo.meta && driverInfo.meta.not_editable;

  useEffect(() => {
    if(!getValues(FORM_FIELDS.YEAR)) return;

    setIsLoading(true);
    driverStore.getCars(
      getValues(FORM_FIELDS.YEAR),
      getValues(FORM_FIELDS.MAKE),
      getValues(FORM_FIELDS.MODEL),
      getValues(FORM_FIELDS.SUB_MODEL),
    ).then(res => {
      if(res.ok ) {
        setOptMakes(_.without(_.map(_.unionBy(res.data, 'make'), (obj) => obj.make), undefined));
        setOptModels(_.without(_.map(_.unionBy(res.data, 'model'), (obj) => obj.model), undefined));
        setOptSubModels(_.without(_.map(_.unionBy(res.data, 'submodel'), (obj) => obj.submodel), undefined));
      }
      else {
        setOptMakes([]);
        setOptModels([]);
        setOptSubModels([]);
      }
    }).finally(() => setIsLoading(false));
  }, [watch(FORM_FIELDS.YEAR), watch(FORM_FIELDS.MAKE), watch(FORM_FIELDS.MODEL), watch(FORM_FIELDS.SUB_MODEL)]);

  const handleChange = (val, field) => {
    if (metaNotEditable && driverInfo.meta.not_editable.includes(field)) {
      return;
    }

    if(field === FORM_FIELDS.YEAR) {
      setValue(field, val, { shouldValidate: true });
      setValue(FORM_FIELDS.MAKE, null);
      setValue(FORM_FIELDS.MODEL, null);
      setValue(FORM_FIELDS.SUB_MODEL, null);
      return;
    }

    if(field === FORM_FIELDS.MAKE) {
      setValue(field, val, { shouldValidate: true });
      setValue(FORM_FIELDS.MODEL, null);
      setValue(FORM_FIELDS.SUB_MODEL, null);
      return;
    }

    if(field === FORM_FIELDS.MODEL) {
      setValue(field, val, { shouldValidate: true });
      setValue(FORM_FIELDS.SUB_MODEL, null);
      return;
    }
    setValue(field, val, { shouldValidate: true });
  }

  const handleNext = (val) => {
    setIsNext(val);
  }

  const handleRemoveImg = (field) => {
    setValue(field, null, { shouldValidate: true })
  }

  const handleSave = () => {
    const formData = new FormData();
    const FORMAT_DATE_YYYYMMDD = "YYYY-MM-DD";
    formData.append('vehicle_name', getValues(FORM_FIELDS.VEHICLE_NAME) || '');
    formData.append('license_plate', getValues(FORM_FIELDS.LICENSE_PLATE) || '');
    formData.append('license_state', getValues(FORM_FIELDS.LICENSE_STATE) || '');
    formData.append('year', getValues(FORM_FIELDS.YEAR) || '');
    formData.append('make', getValues(FORM_FIELDS.MAKE) || '');
    formData.append('model', getValues(FORM_FIELDS.MODEL) || '');
    formData.append('sub_model', getValues(FORM_FIELDS.SUB_MODEL) || '');
    formData.append('color', getValues(FORM_FIELDS.COLOR) || '');
    formData.append('registration_record_issued_date', getValues(FORM_FIELDS.REGISTRATION_RECORD_ISSUED_DATE) ? moment(getValues(FORM_FIELDS.REGISTRATION_RECORD_ISSUED_DATE)).format(FORMAT_DATE_YYYYMMDD) : '');
    formData.append('registration_record_expired_date', getValues(FORM_FIELDS.REGISTRATION_RECORD_EXPIRED_DATE) ? moment(getValues(FORM_FIELDS.REGISTRATION_RECORD_EXPIRED_DATE)).format(FORMAT_DATE_YYYYMMDD) : '');
    formData.append('insurance_card_issued_date', getValues(FORM_FIELDS.INSURANCE_CARD_ISSUED_DATE) ? moment(getValues(FORM_FIELDS.INSURANCE_CARD_ISSUED_DATE)).format(FORMAT_DATE_YYYYMMDD) : '');
    formData.append('insurance_card_expired_date', getValues(FORM_FIELDS.INSURANCE_CARD_EXPIRED_DATE) ? moment(getValues(FORM_FIELDS.INSURANCE_CARD_EXPIRED_DATE)).format(FORMAT_DATE_YYYYMMDD) : '');
    formData.append('registration', getValues(FORM_FIELDS.REGISTRATION_RECORD_URL));
    formData.append('insurance', getValues(FORM_FIELDS.INSURANCE_CARD_URL));

    setIsSaving(true);
    driverStore.updateDriverVehicle(driverID, vehicleInfo.id, formData).then(res => {
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

        const {errors, message} = res.data;
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
      label: 'Vehicle Name',
      type: 'string',                    
      mdColumn: 6,
      componentType: 'textfield',
      fieldName: FORM_FIELDS.VEHICLE_NAME,
    },
    {
      label: 'Year',
      type: 'string',                    
      mdColumn: 6,
      componentType: 'autocomplete',
      options: getOptYears(),
      fieldName: FORM_FIELDS.YEAR,
      getOptionLabel: (opt) => `${opt}`,
      getOptionSelected: (opt, value) => opt === `${value}`,
    },
    {
      label: 'License Plate',
      type: 'string',                    
      mdColumn: 6,
      componentType: 'textfield',
      fieldName: FORM_FIELDS.LICENSE_PLATE,
    },
    {
      label: 'Make',
      type: 'string',                    
      disabled: optMakes.length === 0 || isLoading || !getValues(FORM_FIELDS.YEAR) || (metaNotEditable && driverInfo.meta.not_editable.includes('car.make')),
      options: optMakes,
      mdColumn: 6,
      componentType: 'autocomplete',
      fieldName: FORM_FIELDS.MAKE,
    },
    {
      label: 'License Plate State',
      type: 'string',                    
      options: driverLicenseState,
      mdColumn: 6,
      componentType: 'autocomplete',
      fieldName: FORM_FIELDS.LICENSE_STATE,
    },
    {
      label: 'Model',
      type: 'string',
      mdColumn: 6,
      componentType: 'autocomplete',
      options: optModels,
      disabled: optModels.length === 0 || isLoading || !getValues(FORM_FIELDS.MAKE) || (metaNotEditable && driverInfo.meta.not_editable.includes('car.model')),
      fieldName: FORM_FIELDS.MODEL,
    },
    {
      label: 'Color',
      type: 'string',
      mdColumn: 6,
      componentType: 'textfield',
      fieldName: FORM_FIELDS.COLOR,
    },
    {
      label: 'Sub-model (optional)',
      type: 'string',
      mdColumn: 6,
      componentType: 'autocomplete',
      options: optSubModels,
      disabled: optSubModels.length === 0 || isLoading || !getValues(FORM_FIELDS.MODEL) || (metaNotEditable && driverInfo.meta.not_editable.includes('car.submodel')),
      fieldName: FORM_FIELDS.SUB_MODEL,
    },
    {
      label: 'Registration Card Issued Date',
      type: 'string',
      mdColumn: 6,
      componentType: 'datepicker',
      fieldName: FORM_FIELDS.REGISTRATION_RECORD_ISSUED_DATE,
    },
    {
      label: 'Registration Card Expired Date',
      type: 'string',
      mdColumn: 6,
      componentType: 'datepicker',
      fieldName: FORM_FIELDS.REGISTRATION_RECORD_EXPIRED_DATE,
    },
    {
      label: 'Insurance Card Issued Date',
      type: 'string',
      mdColumn: 6,
      componentType: 'datepicker',
      fieldName: FORM_FIELDS.INSURANCE_CARD_ISSUED_DATE,
    },
    {
      label: 'Insurance Card Expired Date',
      type: 'string',
      mdColumn: 6,
      componentType: 'datepicker',
      fieldName: FORM_FIELDS.INSURANCE_CARD_EXPIRED_DATE,
    },
    {
      label: 'Registration Card Photo',
      type: 'string',
      mdColumn: 6,
      componentType: isNext ? 'view-img' : 'edit-img',
      fieldName: FORM_FIELDS.REGISTRATION_RECORD_URL,
    },
    {
      label: 'Insurance Card Photo',
      type: 'string',
      mdColumn: 6,
      componentType: isNext ? 'view-img' : 'edit-img',
      fieldName: FORM_FIELDS.INSURANCE_CARD_URL,
    }
  ]

  return (
    <Fragment>
        <DialogTitle className={classes.dialogTitle}>
          <Box display='flex' justifyContent='space-between' alignItems='center'>
            <Box>
              <Typography variant="h6" className={classes.title}>{isNext ? `Confirmation - Edit Vehicle ${vehicleNumber} Info` : title}</Typography>
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
                {renderData.map(item => {
                  const {fieldName, mdColumn, componentType, type,  ...otherProps} = item;
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
                                        <Avatar variant="square" src={typeof watch(fieldName) === 'string' ? watch(fieldName) : URL.createObjectURL(watch(fieldName))} className={classes.avatar} classes={{img: classes.avatarImg}}/>
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
                })}
              </Fragment>
            ) : (
              <Fragment>
                {renderData.map((item, idx) => item.componentType !== 'view-img' ? (
                  <Grid item xs={12} md={item.mdColumn} key={idx}>
                    <Typography className={classes.typography}>{item.label}</Typography>
                    <Typography className={clsx(classes.typographyValue, 
                      !compareData(item.type, 
                      item.componentType === 'datepicker' ? (data[item.fieldName] ? moment(data[item.fieldName]).format("MM/DD/YYYY") : '') : (
                        [FORM_FIELDS.YEAR, FORM_FIELDS.MAKE, FORM_FIELDS.MODEL, FORM_FIELDS.SUB_MODEL].includes(item.fieldName) 
                        ? _.get(data, `car.${item.fieldName}`, undefined)
                        : _.get(data, item.fieldName, undefined)
                      ), 
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
                    onClick={isNext ? () => handleSave() : handleSubmit((submitData) => handleNext(true, submitData))}>{isSaving && <CircularProgress color='primary' size={20} className={classes.progress}/>} {isNext ? 'Save' : 'Next'}</AxlButton>
                </Box>
            </Box>
          </Grid>
        </DialogContent>
    </Fragment>
  )
}

export default DialogVehicleInfo