import React, {useState} from 'react';
import {Box, Grid} from "@material-ui/core";
import * as S from './formStyles';
import {AxlMUIModalBox} from "../../components/AxlMUIComponent/AxlMUIBox";
import _ from 'lodash';
import AxlMUIInput from "../../components/AxlMUIComponent/AxMUIInput";
import AxlMUISelect from "../../components/AxlMUIComponent/AxlMUISelect";
import AxlButton from "../../components/AxlMUIComponent/AxlButton";
import {AxlDateInput} from 'axl-reactjs-ui';
import AxlSelect from "../../components/AxlMUIComponent/AxlSelect";

export default function ToastForm({
  loading = false,
  data = null,
  onClose = () => {},
  ...props
}) {
  const [field, setField]               = useState(data);
  // const [loading, setLoading]           = useState(props.loading);
  const FieldsNeedValidate              = ['title','priority','status','action','subject', 'created_ts', 'start_ts', 'end_ts'];
  const isValid                         = field && !FieldsNeedValidate.filter(fieldName => !_.includes(Object.keys(field), fieldName)).length;
  const actionOptions                   = [
    {label: 'SIGN_DRIVER_CONTRACT', value: 'SIGN_DRIVER_CONTRACT' },
    {label: 'UPLOAD_DRIVER_LICENSE_FRONT', value: 'UPLOAD_DRIVER_LICENSE_FRONT' },
    {label: 'UPLOAD_DRIVER_LICENSE_BACK', value: 'UPLOAD_DRIVER_LICENSE_BACK' },
    {label: 'UPLOAD_VEHICLE_INSURANCE_CARD', value: 'UPLOAD_VEHICLE_INSURANCE_CARD' },
    {label: 'UPLOAD_VEHICLE_REGISTRATION_RECORD', value: 'UPLOAD_VEHICLE_REGISTRATION_RECORD' },
    {label: 'DO_SHS_TRAINING', value: 'DO_SHS_TRAINING' },
  ];
  const priorityOptions                 = [
    {label: 'LOW', value: 'LOW' },
    {label: 'MEDIUM', value: 'MEDIUM' },
    {label: 'HIGH', value: 'HIGH' },
    {label: 'CRITICAL', value: 'CRITICAL' },
  ];
  const statusOptions                     = [
    {label: 'UNSEEN', value: 'UNSEEN' },
    {label: 'SEEN', value: 'SEEN' },
    {label: 'HANDLING', value: 'HANDLING' },
    {label: 'HANDLED', value: 'HANDLED' },
  ];
  const createTsOptions                 = {
    dateFormat: 'MMM DD, Y HH:mm:SS A',
    placeHolder: 'Create Time',
    enableTime: true,
    altInput: true,
    clickOpens: true,
    defaultValue: _.get(field, 'created_ts')
  };
  const startTsOptions                 = {
    dateFormat: 'MMM DD, Y HH:mm:SS A',
    placeHolder: 'Create Time',
    enableTime: true,
    altInput: true,
    clickOpens: true,
    defaultValue: _.get(field, 'start_ts')
  };
  const endTsOptions                 = {
    dateFormat: 'MMM DD, Y HH:mm:SS A',
    placeHolder: 'Create Time',
    enableTime: true,
    altInput: true,
    clickOpens: true,
    defaultValue: _.get(field, 'end_ts')
  };

  const onChange = ({target: {name, value}}) => {
    let _field = _.assign({}, field, {[name]: value});
    setField(_field);
  };

  const addNew = () => {
    if(!field) return;

    props.onUpdate(field);
  }

  return <AxlMUIModalBox width={560}>
    <S.Title>{(field && field.id) ? `Edit Toast` : `Add New Toast`}</S.Title>
    <Box>
      <Grid container spacing={1}>
        <Grid item xs>
          <S.FormControl>
            <S.Label>{`Title`} <S.TextRequired>{`*`}</S.TextRequired></S.Label>
            <S.FormControl>
              <AxlMUIInput name={`title`} spacing={0} onChange={onChange} value={_.get(field, 'title')}/>
            </S.FormControl>
          </S.FormControl>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <S.FormControl>
            <S.Label>{`Action`} <S.TextRequired>{`*`}</S.TextRequired></S.Label>
            <AxlSelect
              name={'action'}
              options={actionOptions}
              onChange={onChange}
              value={_.get(field, 'action')} />
          </S.FormControl>
        </Grid>
        <Grid item xs={6}>
          <S.FormControl>
            <S.Label>{`Priority`} <S.TextRequired>{`*`}</S.TextRequired></S.Label>
            <AxlSelect
              name={'priority'}
              options={priorityOptions}
              onChange={onChange}
              value={_.get(field, 'priority')} />
          </S.FormControl>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <S.FormControl>
            <S.Label>{`Status`} <S.TextRequired>{`*`}</S.TextRequired></S.Label>
            <AxlSelect
              name={'status'}
              options={statusOptions}
              onChange={onChange}
              value={_.get(field, 'status')} />
          </S.FormControl>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <S.FormControl>
            <S.Label>{`Subject`} <S.TextRequired>{`*`}</S.TextRequired></S.Label>
            <AxlMUIInput spacing={0} name={'subject'} value={_.get(field, 'subject')} onChange={onChange}/>
          </S.FormControl>
        </Grid>
        <Grid item xs={6}>
          <S.FormControl>
            <S.Label>{`Cause`} <S.TextRequired>{`*`}</S.TextRequired></S.Label>
            <AxlMUIInput spacing={0} name={'cause'} value={_.get(field, 'cause')} onChange={onChange}/>
          </S.FormControl>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <S.FormControl>
            <S.Label>{`Effect`} <S.TextRequired>{`*`}</S.TextRequired></S.Label>
            <AxlMUIInput spacing={0} name={'effect'} value={_.get(field, 'effect')} onChange={onChange}/>
          </S.FormControl>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <S.FormControl>
            <S.Label>{`Create`} <S.TextRequired>{`*`}</S.TextRequired></S.Label>
            <AxlDateInput
              theme={'main'}
              placeHolder={'Create time'}
              displayToday={false}
              name={'created_ts'}
              value={_.get(field, 'created_ts')}
              onChange={(value) => onChange({target: {value: value, name: 'created_ts'}})}
              options={createTsOptions}/>
          </S.FormControl>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <S.FormControl>
            <S.Label>{`Start`} <S.TextRequired>{`*`}</S.TextRequired></S.Label>
            <AxlDateInput
              theme={'main'}
              placeHolder={'Start time'}
              displayToday={false}
              name={'start_ts'}
              value={_.get(field, 'start_ts')}
              onChange={(value) => onChange({target: {value: value, name: 'start_ts'}})}
              options={startTsOptions}/>
          </S.FormControl>
        </Grid>
        <Grid item xs={6}>
          <S.FormControl>
            <S.Label>{`End`} <S.TextRequired>{`*`}</S.TextRequired></S.Label>
            <AxlDateInput
              theme={'main'}
              placeHolder={'End time'}
              displayToday={false}
              name={'end_ts'}
              value={_.get(field, 'end_ts')}
              onChange={(value) => onChange({target: {value: value, name: 'end_ts'}})}
              options={endTsOptions}/>
          </S.FormControl>
        </Grid>
      </Grid>
      <Grid container alignItems={'center'}>
        <Grid item xs />
        <Grid item>
          <Grid container>
            <AxlButton variant={'outlined'} color={"primary.blackSecondary"} onClick={props.onClose}>{`Cancel`}</AxlButton>
            <AxlButton variant={'outlined'}
                       bgcolor={(loading || !isValid) ? 'primary.gray' : 'primary.periwinkle'}
                       color={"primary.white"}
                       onClick={addNew}
                       loading={loading} disabled={loading || !isValid}>{(field && field.id) ? `Edit` : `Add`}</AxlButton>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  </AxlMUIModalBox>
}