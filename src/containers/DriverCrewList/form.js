import React, { useEffect, useMemo, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button, CircularProgress, Grid } from '@material-ui/core';
import { sortBy } from 'lodash';
import { inject } from 'mobx-react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { compose } from 'recompose';
import * as Yup from 'yup';

import { lazyValidation } from '../../Utils/validation';
import AxlAutocomplete from '../../components/AxlAutocomplete';
import AxlTextField from '../../components/AxlTextField';
import TooltipContainer from '../../components/TooltipContainer';
import { ACTIONS } from '../../constants/ActionPattern';
import { PERMISSION_DENIED_TEXT, REQUEST_STATUS_LOADING } from '../../constants/common';
import { toastMessage } from '../../constants/toastMessage';
import { CREW_TYPES } from '../../constants/type';

const FORM_FIELD = {
  REGION: 'region',
  TYPE: 'type',
  NAME: 'name',
  DESCRIPTION: 'description',
}

function DriverCrewForm(props) {
  const { regionStore, permissionStore, driverCrewStore } = props;
  const params = useParams();
  const { crewId } = params;
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);

  const regionList = regionStore.regions;
  const isDenied = permissionStore.isDenied(ACTIONS.DRIVER_CREWS.CREATE_OR_EDIT);

  const validationSchema = Yup.object().shape({
    [FORM_FIELD.REGION]: Yup.lazy(value => lazyValidation('Region', value)),
    [FORM_FIELD.TYPE]: Yup.lazy(value => lazyValidation('Type', value)),
    [FORM_FIELD.NAME]: Yup.lazy(value => lazyValidation('Name', value)),
  });
  const { register, handleSubmit, errors, setValue, reset, control, getValues, watch } = useForm({
    resolver: yupResolver(validationSchema),
    shouldUnregister: false,
  });

  useEffect(() => {
    if (regionList && regionList.length === 0) {
      regionStore.getRegions();
    }
  }, []);

  useEffect(() => {
    if (crewId) {
      setIsLoading(true);
      driverCrewStore.getCrew(crewId, (crew) => {
        setIsLoading(false);
        const findRegion = regionList && regionList.find(region => region.value === crew.region);
        const findType = CREW_TYPES.find(type => type.value === crew.type);

        reset({
          ...crew,
          region: findRegion ? findRegion : crew.region,
          type: findType,
        })
      });
    } else {
      reset({})
    }
  }, [crewId])

  useMemo(() => {
    if(typeof getValues(FORM_FIELD.REGION) === 'object') return;

    const findRegion = regionList && regionList.find(region => region.value === getValues(FORM_FIELD.REGION));
    setValue(FORM_FIELD.REGION, findRegion);
  }, [regionList, getValues(FORM_FIELD.REGION)])

  const renderData = [
    {
      label: 'Region',
      fieldName: FORM_FIELD.REGION,
      componentType: 'autocomplete',
      placeholder: "Select region",
      options: sortBy(regionList, 'value'),
      getOptionLabel: opt => opt.label,
      disabled: regionStore && regionStore.status === REQUEST_STATUS_LOADING,
      getOptionSelected: (option, value) => option.value === value.value,
    },
    {
      label: 'Type',
      fieldName: FORM_FIELD.TYPE,
      componentType: 'autocomplete',
      placeholder: "Select type",
      options: !crewId ? CREW_TYPES.filter(type => !type.hide) : CREW_TYPES,
      getOptionLabel: opt => opt.label,
      getOptionSelected: (option, value) => option.value === value.value,
      disabled: !!crewId,
    },
    {
      label: 'Name',
      fieldName: FORM_FIELD.NAME,
      componentType: 'textfield',
      placeholder: "Name",
    },
    {
      label: 'Description',
      fieldName: FORM_FIELD.DESCRIPTION,
      componentType: 'textfield',
      placeholder: "Description",
      rows: 3,
      multiline: true,
    },
  ]

  const handleSave = (e) => {
    const payload = {
      ...getValues(),
      region: getValues(FORM_FIELD.REGION) && getValues(FORM_FIELD.REGION).value,
      type: getValues(FORM_FIELD.TYPE) && getValues(FORM_FIELD.TYPE).value,
    }

    const { driverCrewStore, driverCrewListStore } = props;
    const cb = (res) => {
      if (!res.ok) {
        toast.error(res && res.data && res.data.message || (crewId ? toastMessage.ERROR_UPDATING : toastMessage.ERROR_SAVING), {containerId: 'main'});
        return;
      }
      toast.success(crewId ? toastMessage.UPDATED_SUCCESS : toastMessage.SAVED_SUCCESS, {containerId: 'main'});
      driverCrewListStore.search();
      history.push('/driver-crews');
    };

    if (crewId) {
      driverCrewStore.editCrew(crewId, payload, cb);
    } else {
      driverCrewStore.createCrew(payload, cb);
    }
  };

  const handleCancel = () => {
    if(driverCrewStore.isSubmitting) return;

    history.push('/driver-crews');
  }

  const handleChange = (val, field) => {
    setValue(field, val ? val : undefined, { shouldValidate: true })
  }

  if(isLoading) return (
    <Box display={'flex'} justifyContent={'center'} alignItems={'center'}><CircularProgress size={24}/></Box>
  )

  return (
    <Grid container spacing={2}>
      {renderData.map(item => {
        const {fieldName, componentType, ...otherProps} = item;
        switch (componentType) {
          case 'autocomplete':
            return (
              <Grid item xs={12} md={item.mdColumn} key={fieldName}>
                <Controller
                  name={fieldName}
                  render={() => (
                    <AxlAutocomplete 
                      {...otherProps} 
                      {...register(fieldName)} 
                      error={errors[fieldName] ? true : false} 
                      helperText={errors[fieldName] && errors[fieldName].message}
                      value={(crewId ? getValues(fieldName) : watch(fieldName)) || null}
                      onChange={(evt, val) => handleChange(val, fieldName)}
                    />
                  )}
                  control={control}
                  defaultValue={{}}
                />
              </Grid>
            )
          case 'textfield': 
            return (
              <Grid item xs={12} md={item.mdColumn} key={fieldName}>
                <Controller
                  name={fieldName}
                  render={() => (
                    <AxlTextField 
                      {...otherProps} 
                      {...register(fieldName)} 
                      error={errors[fieldName] ? true : false} 
                      helperText={errors[fieldName] && errors[fieldName].message}
                      onChange={(evt) => handleChange(evt && evt.target.value, fieldName)}
                      onBlur={(evt)=> handleChange(evt && evt.target.value && evt.target.value.trim(), fieldName)}
                      value={watch(fieldName) || ''}
                    />
                  )}
                  control={control}
                  defaultValue={''}
                />
              </Grid>
            )
        }
      })}

      <Grid item xs={12} style={{display: 'flex', justifyContent: 'flex-end'}}>
        <Button variant='outlined' onClick={handleCancel}>
          Cancel
        </Button>
        <TooltipContainer title={isDenied ? PERMISSION_DENIED_TEXT : ''}>
          <Button disabled={isDenied || driverCrewStore.isSubmitting} onClick={handleSubmit(data => handleSave(data))} variant='contained' style={{backgroundColor: '#76c520', color: '#fff', marginLeft: 8}}>
            {driverCrewStore.isSubmitting ? <CircularProgress size={24} color='inherit'/> : `Save`}
          </Button>
        </TooltipContainer>
      </Grid>
    </Grid>
  )
}

export default compose(inject('permissionStore', 'regionStore', 'driverCrewStore', 'driverCrewListStore'))(DriverCrewForm);