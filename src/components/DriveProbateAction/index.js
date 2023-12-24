import React from 'react';
import {AxlSelect, AxlButton, AxlDateInput, AxlInput, AxlSearchBox} from 'axl-reactjs-ui';
import {inject, observer} from "mobx-react";
import { toJS } from 'mobx';
import _ from 'lodash';

import * as S from './styles';
import styles from '../../containers/DriverSuspension/styles';
import { Box, Checkbox, Input, LinearProgress } from '@material-ui/core';
import driverSuspensionType from '../../constants/driverSuspensionType';
import { DriverProbationSearch } from '../DriverProbationSearch';
import { TimeZoneOptions, TimezoneDefault } from '../../constants/timezone';
import DriverProbationInfo from '../DriverProbationSearch/DriverProbationInfo';

export const getDriverCategory = (categories, code) => {
  const findCategory = categories && categories.find(category => category.code === code);
  if(!findCategory) return 'N/A';
  return findCategory.title;
}

@inject('driverSuspensionStore', 'driverListStore', 'driverProbationStore')
@observer
export default class DriveProbateAction extends React.Component {
  constructor(props) {
    super(props);

    const { driverSuspensionStore } = props
    const { result } = driverSuspensionStore && driverSuspensionStore || {}
    const { items } = result || {}
    const suspensions = items ? toJS(items).filter(driverSuspensionStore.isSelected) : []
    const startTime = suspensions.length === 1 ? suspensions[0].start_time : null
    const driverSuspensionIds = driverSuspensionStore && toJS(driverSuspensionStore.selectedItems) || [];
    const driverSuspensions = driverSuspensionStore && driverSuspensionStore.result && driverSuspensionStore.result.items
    let driverIds = driverSuspensions ? driverSuspensions.filter(ds => driverSuspensionIds.includes(ds.id)).map(ds => ds.driver_id): ''
    driverIds = _.uniq(driverIds)
    let allowLoadDriverInfo = false
    if (driverIds.length) {
      driverSuspensionStore.formStore.setField('driver_ids', driverIds)
      allowLoadDriverInfo = true
    }

    this.state = {
      selected: null,
      dateSelected: startTime ? new Date(startTime).toISOString() : null,
      selectedDrivers: driverIds, // only store drivers which are existed
      allowLoadDriverInfo,
      driverIds: driverIds ? driverIds.join(', ') : '',
      probationIdsSelected: driverSuspensionIds,
      probationsSelected: driverSuspensions ? driverSuspensions.filter(ds => driverSuspensionIds.includes(ds.id)) : [],
    }

    this.setDate = this.setDate.bind(this);
    driverSuspensionStore.formStore.setField('timezone', TimezoneDefault);
  }

  componentDidMount() {
    const {driverSuspensionStore, type} = this.props;
    driverSuspensionStore.listProbationEmailTemplate(type);
  }

  send = ({emailTemplateId, driverSuspensionIds, action, type}) => {
    const {driverSuspensionStore} = this.props;
    const that = this;
    const probationIds = this.state.probationIdsSelected;
    const driverIds = this.state.selectedDrivers && this.state.selectedDrivers.map(d => d.id);
    const receiveNumber = driverIds.length;
    
    const isConfirm = window.confirm(`There ${receiveNumber > 1 ? 'are': 'is'} ${receiveNumber} ${receiveNumber > 1 ? 'drivers': 'driver'} who will receive the email (total probations: ${probationIds && probationIds.length}). Would you like trigger emails to them?`);
    if(isConfirm) {
      driverSuspensionStore.sendDisciplinaryEmails({
        'email_template_id': emailTemplateId,
        'ids': probationIds,
        'action': action,
        'type': type,
        'incident_ts': that.state.dateSelected,
        'timezone': driverSuspensionStore.formStore.getField('timezone', TimezoneDefault),
      }, res => {
        if(res.status === 200 || res.ok) {
          that.props.onClose();
        }
      });
    }
  }

  handleSelect = (value) => {
    const {driverSuspensionStore} = this.props;
    const {probationEmails} = driverSuspensionStore;

    if(!!value) {
      const selected = probationEmails.filter(email => email.id === value && email).pop() || null
      this.setState({selected})
    } else {
      this.setState({selected: null})
    }
  }

  setDate(d) {
    this.setState({dateSelected: d.toISOString()});
  }

  addDriver = (probationIds) => {
    const { driverSuspensionStore, driverProbationStore } = this.props;
    const { formStore } = driverSuspensionStore;
    const driverProbations = driverProbationStore && driverProbationStore.result && driverProbationStore.result.items
    const filterDriverIds = driverProbations ? driverProbations.filter(ds => probationIds.includes(ds.id)).map(ds => ds.driver_id): []

    const existedDriverIds = this.state.driverIds ? this.state.driverIds.split(',').map(i => parseInt(i)) : [] 
    const newDriverIds = _.uniq([...existedDriverIds, ...filterDriverIds])
    formStore.setField('driver_ids', newDriverIds);

    const probationIdsSelected = _.uniq([...this.state.probationIdsSelected, ...probationIds]);
    const probationsSelected = _.uniqBy([...this.state.probationsSelected, ...driverProbations.filter(ds => probationIdsSelected.includes(ds.id))], 'id')
    this.setState({
      driverIds: newDriverIds.join(', '),
      selectedDrivers: newDriverIds,
      isDriverListVisible: false,
      allowLoadDriverInfo: true,
      probationIdsSelected,
      probationsSelected,
    })
  }

  changeSearch = (e) => {
    const {driverProbationStore} = this.props;
    const value = e;

    if (value !== undefined) {
      driverProbationStore.setFilters({
        driver_info: value,
        page: 1
      });
    }
  };
  
  search = (e) => {
    const {driverProbationStore} = this.props;
    driverProbationStore.search();
  };

  render() {
    const {selected, dateSelected, isDriverListVisible, probationsSelected, probationIdsSelected} = this.state;
    const {driverSuspensionStore, type, driverListStore, driverProbationStore} = this.props;
    const {probationEmails, formStore} = driverSuspensionStore;
    const options = [{name: 'Select a template', value: ''}];
    if(probationEmails.length) {
      probationEmails.map(email => {
        options.push({
          name: email.id,
          value: email.id
        })
      });
    }
    const driverSuspensionIds = driverSuspensionStore && toJS(driverSuspensionStore.selectedItems) || [];
    const mapActionToType = {
      'SUSPENSION': 'SUSPEND',
      'PROBATION': null,
      'COMPLIMENT': 'PROMOTE_BOOKING_ADVANTAGE',
    };
    const mapTypeToTitle = {
      'SUSPENSION': "🚫️ SUSPENSION",
      'PROBATION': "⚠️ PROBATION",
      'COMPLIMENT': "🙌️ COMPLIMENT",
    }
    const objSender = {
      'emailTemplateId': selected && selected.id || null,
      'driverSuspensionIds': driverSuspensionIds,
      'action': mapActionToType[type] || null,
      'type': type
    };
    const mapTypeToColor = {
      'SUSPENSION': "#ffd4d4",
      'PROBATION': "#f9ecb8",
      'COMPLIMENT': "#efffef",
    };
    const timeOptions = {
      dateFormat: 'MMM DD, Y HH:mm:SS A',
      placeHolder: 'Start time',
      enableTime: true,
      altInput: true,
      clickOpens: true,
      defaultValue: dateSelected
    };

    const renderer = {
      select: (v, item) => <Checkbox checked={driverProbationStore.selectedItems.includes(item.id)} />,
      category: (v, item) => getDriverCategory(driverProbationStore && driverProbationStore.driverCategories, item.category),
      probation_type: (v, item) => driverSuspensionType[item.suspension_type],
    }

    const handleOnChangeDriverId = (e) => {
      const val = e.target.value
      formStore.errors = [];
      const driverIds = val.split(',').map(v => parseInt(v)).filter(v => !isNaN(v)) || []
      formStore.setField('driver_ids', driverIds);
      this.setState({driverIds: val || '' })
      this.setState({allowLoadDriverInfo: false})
    }
    const driverIds = formStore.getField('driver_ids', [])

    return (<S.Container>
      <S.Title bgColor={mapTypeToColor[type]}>{mapTypeToTitle[type]}</S.Title>
      <S.Inner>
        <div>
          <S.Label>Recipients</S.Label>
          <div style={{display:'flex', marginRight:'-4px'}}>
            <div style={{width: '100%'}}>
              <Input name="driver_ids" value={this.state.driverIds} style={styles.inputDriverInfo}
                  placeholder = 'Recipients’ Driver IDs...'
                  inputProps={{ className: 'inputPlaceholder' }} 
                  disableUnderline={true} onChange={handleOnChangeDriverId} onBlur={() => this.setState({allowLoadDriverInfo: true})} disabled/>
            </div>
            <AxlButton bg={`gray`} compact={true} onClick={() => this.setState({isDriverListVisible: !isDriverListVisible})}
                  ico={{className: `fa ${isDriverListVisible ? 'fa-minus-circle' : 'fa-plus-circle'}`}} />
          </div>
        </div>
        {!!driverIds.length && (this.state.allowLoadDriverInfo == true) && <DriverProbationInfo 
          drivers={driverSuspensionStore && driverSuspensionStore.result && driverSuspensionStore.result.items}
          categories={driverProbationStore && driverProbationStore.driverCategories} probations={probationsSelected} />}
        {isDriverListVisible && <div style={styles.chooseDriver}>
          <div style={styles.chooseDriverSearch}>
            <AxlSearchBox placeholder = 'Search by drivers name, ID...' style={styles.searchBox} onChange={this.changeSearch} onEnter={this.search} />
          </div>
          <div style={styles.chooseDriverListContainer}>
            {driverProbationStore.searching && <LinearProgress /> }
            <DriverProbationSearch allowSelect multipleSelect pagination renderer={renderer} baseUrl={`${driverProbationStore.baseUrl}`} disabledIds={probationIdsSelected} />
          </div>
          <div style={styles.chooseDriverBottom}>
            {driverProbationStore.selectedItems.length > 0 && <span style={styles.chooseDriverSelectedText}>{`${driverProbationStore.selectedItems.length} selected`}</span>}
            <AxlButton compact={true} disabled={driverProbationStore.selectedItems.length < 1} style={styles.chooseDriverAction} onClick={() => this.addDriver(driverProbationStore.selectedItems)}>{`ADD`}</AxlButton>
            <AxlButton compact={true} style={styles.chooseDriverAction} bg={'none'} onClick={() => this.setState({isDriverListVisible: false})}>{`Cancel`}</AxlButton>
          </div>
        </div>}

        <div style={{marginTop:15}}>
          <S.Label>Template</S.Label>
          <S.SelectContainer>
            <AxlSelect
              options={options}
              name='type'
              style={{width: '100%', color: '#3b3b3b', fontFamily: 'AvenirNext', fontSize: '14px'}}
              onSelect={this.handleSelect}
              value={this.state.selected} />
          </S.SelectContainer>
        </div>
        {selected ? <div><em>Subject: {selected.subject}</em></div> : null}
        <div style={{border: 'solid 0.5px #c5c5c5', backgroundColor: '#f7f7f7'}}>
          {/* {selected ? <RichTextEditor
                        value={editorSuspensionState}
                        onChange={this.setEditorState}
                        rootStyle={{ margin: 15 }}
                      /> : <S.EmptyReviewContainer dangerouslySetInnerHTML={{__html: `Template preview here`}} />} */}
          {selected ? <S.ReviewContainer dangerouslySetInnerHTML={{__html: selected.html}} /> : 
                      <S.EmptyReviewContainer dangerouslySetInnerHTML={{__html: `Template preview here`}} />}
        </div>
        <Box display={'flex'} justifyContent={'space-between'}>
          <Box width={'50%'} paddingRight={1}>
            <S.Label>{`Start time`}</S.Label>
            <div>
              <AxlDateInput
                onChange = { (d) => this.setDate(d) }
                displayToday={false}
                options={timeOptions}
                theme={`main`} />
            </div>
          </Box>
          <Box width={'50%'} paddingLeft={1}>
          <S.Label>{`Timezone`}</S.Label>
              <div>
                <AxlSelect
                  options={TimeZoneOptions}
                  name='timezone'
                  onSelect={(v) => formStore.setField('timezone', v)}
                  value={formStore.getField('timezone')} 
                  style={{width: '100%', fontFamily: 'AvenirNext', fontSize: '14px', height: '38px', color: "#3b3b3b"}}
                />
              </div>
          </Box>
        </Box>
        <S.ControlContainer>
          <AxlButton bg={`none`} compact style={{minWidth: 120}} onClick={this.props.onClose}>{`Cancel`}</AxlButton>
          <AxlButton disabled={!selected || !this.state.selectedDrivers || !this.state.selectedDrivers.length} compact style={{minWidth: 120}} onClick={() => this.send(objSender)}>{`Send`}</AxlButton>
        </S.ControlContainer>
      </S.Inner>
    </S.Container>);
  }
}