import { Box, Chip, CircularProgress, DialogContent, DialogTitle, Grid, IconButton, Link, Typography } from '@material-ui/core'
import React, { Fragment, useEffect, useState } from 'react'
import { makeStyles } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import _ from 'lodash';
import { toast } from 'react-toastify';
import clsx from 'clsx';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';

import AxlButton from '../AxlMUIComponent/AxlButton';
import { toastMessage } from '../../constants/toastMessage';
import AxlSelect from '../AxlSelect';
import AxlAutocomplete from '../AxlAutocomplete';
import { compareData } from '../../Utils/compare';
import AxlTextField from '../AxlTextField';
import { getDirectBookingSession, getTicketBookingSession } from '../../stores/api';

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
      whiteSpace: 'pre',
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
    removeHighlighted: {
      color: '#d0021b',
      textDecorationLine: 'line-through',
    }
}));

const lazyValidation = (field, value) => {
  switch (typeof value) {
    case 'object':
      return Yup.object().shape({
        label: Yup.string(),
        value: Yup.string()
      });
    default:
      return Yup.string().required(`${field} is required`);
  }
}

const FORM_FIELDS = {
  REGIONS: 'regions',
  ACTIVE_REGION: 'active_region',
  CREWS: 'crews',
  BOOKING_SESSIONS: 'booking_sessions',
  DIRECT_BOOKING: 'direct_booking',
  REASON: 'reason',
}

function DialogDriverDetailsInfo({handleClose, title, data, driverStore, updateData}) {
  const validationSchema = Yup.object().shape({
    regions: Yup.array().min(1, 'Regions is required'),
    active_region: Yup.lazy(value => lazyValidation('Acitve Region', value)),
    reason: Yup.lazy(value => lazyValidation('Reason', value)),
  });
  const { register, handleSubmit, errors, setValue, reset, control, getValues, watch } = useForm({
    resolver: yupResolver(validationSchema),
    shouldUnregister: false,
  });
  const classes = useStyles();
  const [driverInfo, setDriverInfo] = useState(data);
  const [isNext, setIsNext] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [optRegions, setOptRegions] = useState([]);
  const [optActiveRegions, setOptActiveRegions] = useState([]);
  const [optCrews, setOptCrews] = useState([]);
  const [isLoadingByRegion, setIsLoadingByRegion] = useState(false);
  const [optBookingSessions, setOptBookingSessions] = useState([]);
  const [optDirectBooking, setOptDirectBooking] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    driverStore.getRegions().then(res => {
        if(res.ok) {
            setOptRegions(res.data);
            const regionCodes = _.map(_.get(driverInfo, 'regions', []), p => _.pick(p, ['region_code', 'is_active']));
            const filterByCode = res.data.filter(f => regionCodes.some(s => s.region_code === f.properties.code));
            setValue(FORM_FIELDS.REGIONS, filterByCode);
            setOptActiveRegions(filterByCode.map(f => ({
                value: f.properties.code,
                label: `[${f.properties.code}] ${f.properties.display_name}`,
            })))
            const findActiveRegion = res.data.find(f => regionCodes.some(s => s.region_code === f.properties.code && s.is_active));
            if(findActiveRegion && findActiveRegion.properties) {
                setValue(FORM_FIELDS.ACTIVE_REGION, findActiveRegion.properties.code);
            }
            else {
                setValue(FORM_FIELDS.ACTIVE_REGION, undefined);
            }
        }
        else {
            setOptRegions([])
        }
    }).finally(() => setIsLoading(false));
  }, []);

  const filterSelected = (setOpt, setField, resp, field) => {
    setOpt(resp.data);
    const dataFilter = _.map(_.get(driverInfo, field, []), p => _.pick(p, ['id']));
    setValue(setField, resp.data.filter(f => dataFilter.some(s => s.id === f.id)));
  }

  const fetchByRegion = async () => {
    const strRegions = getValues(FORM_FIELDS.REGIONS) && getValues(FORM_FIELDS.REGIONS).length > 0 ? getValues(FORM_FIELDS.REGIONS).map(sr => sr.properties.code).join(','): '';
    if(!strRegions) {
      setOptCrews([]);
      setValue(FORM_FIELDS.CREWS, []);
      setOptBookingSessions([]);
      setValue(FORM_FIELDS.BOOKING_SESSIONS, []);
      setOptDirectBooking([]);
      setValue(FORM_FIELDS.DIRECT_BOOKING, []);
      return;
    }
    setIsLoadingByRegion(true);
    const [respCrew, respBookingSession, respDirectBooking] = await Promise.all([
      driverStore.getCrewsByRegions(strRegions),
      getTicketBookingSession(strRegions),
      getDirectBookingSession(strRegions),
    ]);

    if(respCrew && respCrew.ok) {
      filterSelected(setOptCrews, FORM_FIELDS.CREWS, respCrew, 'crews');
    }
    else {
      setOptCrews([]);
    }

    if(respBookingSession && respBookingSession.ok) {
      filterSelected(setOptBookingSessions, FORM_FIELDS.BOOKING_SESSIONS, respBookingSession, 'ticket_booking_sessions');
    }
    else {
      setOptBookingSessions([]);
    }

    if(respDirectBooking && respDirectBooking.ok) {
      filterSelected(setOptDirectBooking, FORM_FIELDS.DIRECT_BOOKING, respDirectBooking, 'direct_booking_sessions');
    }
    else {
      setOptDirectBooking([]);
    }
    setIsLoadingByRegion(false);
  }

  useEffect(() => {
    fetchByRegion();
  }, [getValues(FORM_FIELDS.REGIONS)])

  const handleChange = (evt) => {
    if(!evt || !evt.target) return;
    const val = evt.target.value;
    setValue(FORM_FIELDS.ACTIVE_REGION, val, {shouldValidate: true});
  }

  const handleChangeRegions = (val) => {
    setValue(FORM_FIELDS.REGIONS, val, {shouldValidate: true});
    setOptActiveRegions(val.map(ar => ({
        value: ar.properties.code,
        label: `[${ar.properties.code}] ${ar.properties.display_name}`,
    })));

    if(val && !val.some(ar => ar.properties.code === getValues(FORM_FIELDS.ACTIVE_REGION))) {
      setValue(FORM_FIELDS.ACTIVE_REGION, undefined, {shouldValidate: true});
    }
    if(val.length === 1) {
        setValue(FORM_FIELDS.ACTIVE_REGION, val[0].properties && val[0].properties.code, {shouldValidate: true})
    }
  }

  const handleNext = (val, submitData) => {
    setIsNext(val);
  }

  const handleSave = () => {
    const payload = {
      regions: getValues(FORM_FIELDS.REGIONS).map(r => ({
        region_code: r.properties.code,
        is_active: r.properties.code === getValues(FORM_FIELDS.ACTIVE_REGION)
      })),
      crews: getValues(FORM_FIELDS.CREWS).map(c => c.id),
      reason: getValues(FORM_FIELDS.REASON),
      ticket_booking_session_ids: getValues(FORM_FIELDS.BOOKING_SESSIONS).map(c => c.id),
      direct_booking_session_ids: getValues(FORM_FIELDS.DIRECT_BOOKING).map(c => c.id), 
    }

    setIsSaving(true);
    driverStore.updateChangeRegion(driverInfo.id, payload).then(res => {
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

  if(isLoading) return <Box>
    <CircularProgress color='primary' size={20}/>
  </Box>

  const renderData = [
    {
      label: 'Regions',
      type: 'string',
      mdColumn: 12,
      fieldName: FORM_FIELDS.REGIONS,
      componentType: 'autocomplete',
      options: _.sortBy(optRegions, 'properties.code'),
      onChange: (evt, val) => handleChangeRegions(val),
      getOptionLabel: (option) => option.properties ? `[${option.properties.code}] ${option.properties.display_name}` : '',
      multiple: true,
      getOptionSelected: (option, value) => `[${option.properties.code}] ${option.properties.display_name}` === `[${value.properties.code}] ${value.properties.display_name}`,
    },
    {
      label: 'Active Region',
      type: 'string',
      mdColumn: 12,
      fieldName: FORM_FIELDS.ACTIVE_REGION,
      componentType: 'select',
      options: optActiveRegions,
      onChange: (evt) => handleChange(evt),
      disabled: optActiveRegions && optActiveRegions.length < 2,
    },
    {
      label: 'Crews (optional)',
      type: 'string',
      mdColumn: 12,
      fieldName: 'crews',
      componentType: 'autocomplete',
      options: _.sortBy(optCrews, ['region', 'name']),
      onChange: (evt, val) => setValue('crews', val),
      disabled: isLoadingByRegion,
      getOptionDisabled: (option) => !!option.parent_crew_id,
      getOptionLabel: (option) => `[${option.region}] ${option.name}`,
      renderTags: (tagValue, getTagProps) => tagValue.map((option, index) => (
        <Chip
          label={option.name}
          {...getTagProps({index})}
          disabled={!!option.parent_crew_id}
          size='small'
        />
      )),
      multiple: true,
      getOptionSelected: (option, value) => `[${option.region}] ${option.name}` === `[${value.region}] ${value.name}`,
    },
    {
      label: 'Booking session',
      type: 'string',
      mdColumn: 12,
      fieldName: FORM_FIELDS.BOOKING_SESSIONS,
      componentType: 'autocomplete',
      options: optBookingSessions,
      onChange: (evt, val) => setValue(FORM_FIELDS.BOOKING_SESSIONS, val),
      getOptionLabel: (option) => `[${option.region}] ${option.name}`,
      multiple: true,
      limitTags: 3,
      disabled: isLoadingByRegion,
      getOptionSelected: (option, value) => option.id === value.id,
    },
    {
      label: 'Direct booking',
      type: 'string',
      mdColumn: 12,
      fieldName: FORM_FIELDS.DIRECT_BOOKING,
      componentType: 'autocomplete',
      options: optDirectBooking,
      onChange: (evt, val) => setValue(FORM_FIELDS.DIRECT_BOOKING, val),
      getOptionLabel: (option) => `[${option.region}] ${option.name}`,
      multiple: true,
      limitTags: 3,
      disabled: isLoadingByRegion,
      getOptionSelected: (option, value) => option.id === value.id, 
    },
    {
      label: 'Reason',
      type: 'string',
      mdColumn: 12,
      fieldName: 'reason',
      componentType: 'textfield',
      rows: 3,
      multiline: true,
      onChange: (evt) => setValue('reason', evt.target.value, {shouldValidate: true}),
      value: watch('reason'),
    },
  ]

  const mapOriginalBookingSession = data.ticket_booking_sessions && data.ticket_booking_sessions.map(c => ({ name: c.name, region: c.region, id: c.id }));
  const mapDestinationBookingSession = getValues(FORM_FIELDS.BOOKING_SESSIONS) && getValues(FORM_FIELDS.BOOKING_SESSIONS).map(c => ({ name: c.name, region: c.region, id: c.id }));
  const mapOriginalDirectBooking = data.direct_booking_sessions && data.direct_booking_sessions.map(c => ({ name: c.name, region: c.region, id: c.id }));
  const mapDestinationDirectBooking = getValues(FORM_FIELDS.DIRECT_BOOKING) && getValues(FORM_FIELDS.DIRECT_BOOKING).map(c => ({ name: c.name, region: c.region, id: c.id }));
  const formRegions = getValues(FORM_FIELDS.REGIONS);
  const formActiveRegion = getValues(FORM_FIELDS.ACTIVE_REGION);
  const formCrews = getValues(FORM_FIELDS.CREWS);
  const formReason = getValues(FORM_FIELDS.REASON);
  const mapOriginalCrews = data.crews && data.crews.map(c => ({ name: c.name, region: c.region }));
  const mapDestinationCrews = formCrews && formCrews.map(sc => ({ name: sc.name, region: sc.region }));
  const originalRegionCodes = data.regions && data.regions.map(r => r.region_code);
  const originalActiveRegion = data.regions && data.regions.find(f => f.is_active) && data.regions.find(f => f.is_active).region_code;

  return (
    <Fragment>
        <DialogTitle className={classes.dialogTitle}>
          <Box display='flex' justifyContent='space-between' alignItems='center'>
            <Box>
              <Typography variant="h6" className={classes.title}>{isNext ? 'Confirmation - Edit Driver Details Info' : title}</Typography>
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
                    case 'autocomplete': 
                      return (
                        <Grid item xs={12} md={item.mdColumn} key={item.label}>
                          <Controller
                            name={item.fieldName}
                            render={() => (
                              <AxlAutocomplete 
                                {...otherProps} 
                                {...register(item.fieldName)} 
                                error={errors[item.fieldName] ? true : false} 
                                helperText={errors[item.fieldName] && errors[item.fieldName].message}
                                value={watch(item.fieldName) || []}
                              />
                            )}
                            control={control}
                            defaultValue={[]}
                          />
                        </Grid>
                      )
                    case 'select': 
                      return (
                        <Grid item xs={12} md={item.mdColumn} key={item.label}>
                          <Controller
                            name={item.fieldName}
                            render={() => (
                              <AxlSelect 
                                {...otherProps} 
                                {...register(item.fieldName)} 
                                error={errors[item.fieldName] ? true : false} 
                                helperText={errors[item.fieldName] && errors[item.fieldName].message}
                                value={watch(item.fieldName) || {}}
                              />
                            )}
                            control={control}
                            defaultValue={{}}
                          />
                        </Grid>
                      )
                    case 'textfield': 
                      return (
                        <Grid item xs={12} md={item.mdColumn} key={item.label}>
                          <Controller
                            name={item.fieldName}
                            render={() => (
                              <AxlTextField 
                                {...otherProps} 
                                {...register(item.fieldName)} 
                                error={errors[item.fieldName] ? true : false} 
                                helperText={errors[item.fieldName] && errors[item.fieldName].message}
                              />
                            )}
                            control={control}
                            defaultValue={''}
                          />
                        </Grid>
                      )
                  }
                })}
              </Fragment>
            ) : (
              <Fragment>
                <Grid item xs={12}>
                  <Typography className={classes.typography}>Regions</Typography>
                  {formRegions && formRegions.length > 0 && formRegions.map(fr => {
                    if(originalRegionCodes && originalRegionCodes.includes(fr.properties && fr.properties.code)) {
                      return (
                        <Typography 
                          key={fr.properties.code}
                          className={clsx({
                            [classes.typographyValue]: true, 
                            [classes.highlighted]: fr.properties.code === formActiveRegion && formActiveRegion !== originalActiveRegion
                          })} 
                        >
                          {`[${fr.properties.code}] ${fr.properties.display_name} ${fr.properties.code === formActiveRegion ? '- Active' : ''}`}
                        </Typography>
                      )
                    }
                  })}
                  {formRegions && formRegions.length > 0 && formRegions.map(fr => {
                    if(originalRegionCodes && !originalRegionCodes.includes(fr.properties && fr.properties.code)) {
                      return <Typography className={clsx(classes.typographyValue, classes.highlighted)} key={fr.properties.code}>
                        {`[${fr.properties.code}] ${fr.properties.display_name} ${fr.properties.code === formActiveRegion ? '- Active' : ''}`}
                        </Typography>
                    }
                  })}
                  {data.regions && data.regions.map(dt => {
                    if(formRegions && !formRegions.some(s => s.properties.code === dt.region_code)) {
                      const findRegion = optRegions && optRegions.find(fr => fr.properties && fr.properties.code === dt.region_code);
                      return <Typography className={clsx(classes.typographyValue, classes.removeHighlighted)} key={findRegion.properties.code}>
                        {`[${findRegion.properties.code}] ${findRegion.properties.display_name}`}
                      </Typography>
                    }
                  })}
                </Grid>
                <Grid item xs={12}>
                  <Typography className={classes.typography}>Crews</Typography>
                  {mapOriginalCrews && !mapOriginalCrews.length && mapDestinationCrews && !mapDestinationCrews.length ? '-' : (
                    <Fragment>
                      <Typography className={clsx(classes.typographyValue)}>
                        {_.intersectionWith(mapOriginalCrews, mapDestinationCrews, _.isEqual).map(c => `[${c.region}] ${c.name}`).join('\r\n')}
                      </Typography>
                      <Typography className={clsx(classes.typographyValue, classes.highlighted)}>
                        {_.differenceWith(mapDestinationCrews, mapOriginalCrews, _.isEqual).map(c => `[${c.region}] ${c.name}`).join('\r\n')}
                      </Typography>
                      <Typography className={clsx(classes.typographyValue, classes.removeHighlighted)}>
                        {_.differenceWith(mapOriginalCrews, mapDestinationCrews, _.isEqual).map(c => `[${c.region}] ${c.name}`).join('\r\n')}
                      </Typography>
                    </Fragment>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography className={classes.typography}>Booking sessions</Typography>
                  {mapOriginalBookingSession && !mapOriginalBookingSession.length && mapDestinationBookingSession && !mapDestinationBookingSession.length ? '-' : (
                    <Fragment>
                      <Typography className={clsx(classes.typographyValue)}>
                        {_.intersectionWith(mapOriginalBookingSession, mapDestinationBookingSession, _.isEqual).map(c => `[${c.region}] ${c.name}`).join('\r\n')}
                      </Typography>
                      <Typography className={clsx(classes.typographyValue, classes.highlighted)}>
                        {_.differenceWith(mapDestinationBookingSession, mapOriginalBookingSession, _.isEqual).map(c => `[${c.region}] ${c.name}`).join('\r\n')}
                      </Typography>
                      <Typography className={clsx(classes.typographyValue, classes.removeHighlighted)}>
                        {_.differenceWith(mapOriginalBookingSession, mapDestinationBookingSession, _.isEqual).map(c => `[${c.region}] ${c.name}`).join('\r\n')}
                      </Typography>
                    </Fragment>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography className={classes.typography}>Direct booking</Typography>
                  {mapOriginalDirectBooking && !mapOriginalDirectBooking.length && mapDestinationDirectBooking && !mapDestinationDirectBooking.length ? '-' : (
                    <Fragment>
                      <Typography className={clsx(classes.typographyValue)}>
                        {_.intersectionWith(mapOriginalDirectBooking, mapDestinationDirectBooking, _.isEqual).map(c => `[${c.region}] ${c.name}`).join('\r\n')}
                      </Typography>
                      <Typography className={clsx(classes.typographyValue, classes.highlighted)}>
                        {_.differenceWith(mapDestinationDirectBooking, mapOriginalDirectBooking, _.isEqual).map(c => `[${c.region}] ${c.name}`).join('\r\n')}
                      </Typography>
                      <Typography className={clsx(classes.typographyValue, classes.removeHighlighted)}>
                        {_.differenceWith(mapOriginalDirectBooking, mapDestinationDirectBooking, _.isEqual).map(c => `[${c.region}] ${c.name}`).join('\r\n')}
                      </Typography>
                    </Fragment>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography className={classes.typography}>Reason</Typography>
                  <Typography className={clsx(classes.typographyValue, 
                    !compareData('string', '', formReason) && classes.highlighted
                  )}>{formReason || '-'}</Typography>
                </Grid>
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
                    onClick={isNext ? () => handleSave() : handleSubmit(submitData => handleNext(true, submitData))}>
                      {isSaving && <CircularProgress color='primary' size={20} className={classes.progress}/>} {isNext ? 'Save' : 'Next'}
                  </AxlButton>
                </Box>
            </Box>
          </Grid>
        </DialogContent>
    </Fragment>
  )
}

export default DialogDriverDetailsInfo