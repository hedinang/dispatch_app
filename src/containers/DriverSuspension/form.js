import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import { AxlReselect, AxlSearchBox, AxlButton, AxlInput, AxlDateInput } from 'axl-reactjs-ui';
import styles from './styles';
import {inject, observer} from "mobx-react";
import { Checkbox, Input } from "@material-ui/core";
import probationStyle from './probation.module.css'

// Utils
import driverSuspensionType from '../../constants/driverSuspensionType';

// Components
import { DriverListComponent } from "../../components/DriverList";
import DriverInfo from './DriverInfo';
import { DriverProbationList, DriverProbationListComponent } from '../../components/DriverProbationList';
import { CheckBox } from '@material-ui/icons';
import _ from 'lodash';

@inject('driverSuspensionStore', 'driverListStore', 'driverStore')
@observer
class DriverSuspensionForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDriverListVisible: false,
      categories: [],
      allowLoadDriverInfo: false,
      saving: false,
      driverIds: '',
      selectedDriverIds: [] // store only existed drivers
    }
    
    this.addDriver = this.addDriver.bind(this);

    const {driverStore} = this.props;
    driverStore.getAppealCategoriesByType('probation').then(response => {
      if (response.status === 200 && response.data) {
        const categories = [];
        if (response.data.categories && response.data.categories.length) {
          response.data.categories.map((cate) => {
            categories.push({label: cate.title, value: cate.code});
          })
          this.setState({categories});
        }
      }
    });

  }
  componentDidMount() {
    const {driverSuspensionStore} = this.props;
    const { formStore } = driverSuspensionStore;
    
    formStore.errors = [];
    if (this.props.match.params.suspensionId) {
      driverSuspensionStore.get(this.props.match.params.suspensionId, (suspension) => {
        formStore.data = suspension;
        const driverIds = suspension &&  suspension.driver_id ? [suspension.driver_id]: []
        this.setState({driverIds: driverIds});
        formStore.setField('driver_ids', driverIds);
      })
    } else {
      formStore.data = {};
    }
  }

  save = (e) => {
    this.setState({saving: true})
    const {driverSuspensionStore} = this.props;
    const cb = () => {
      const filterDefault = driverSuspensionStore.DEFAULT.filters
      driverSuspensionStore['schedule'].setFilters(filterDefault)
      driverSuspensionStore.setFilters(filterDefault)
      driverSuspensionStore.search();
      this.props.history.push('/driver-probations');
    };

    if (this.props.match.params.suspensionId) {
      driverSuspensionStore.edit(this.props.match.params.suspensionId, cb);
    } else {
      driverSuspensionStore.create(cb);
    }
    this.setState({saving: false})
  };

  changeSearch = (e) => {
    const {driverListStore} = this.props;
    const value = e;

    if (value !== undefined) {
      driverListStore.schedule_suspension.setFilters({
        q: value,
        page: 1
      });
    }
  };

  search = (e) => {
    const {driverListStore} = this.props;
    driverListStore.schedule_suspension.search();
  };

  addDriver = (driverIds) => {
    const { driverSuspensionStore } = this.props;
    const { formStore } = driverSuspensionStore;

    const existedDriverIds = this.state.driverIds ? this.state.driverIds.split(',').map(i => parseInt(i)) : [] 
    const newDriverIds = _.uniq([...existedDriverIds, ...driverIds])
    formStore.setField('driver_ids', newDriverIds);

    this.setState({
      driverIds: newDriverIds.join(', '),
      selectedDriverIds: newDriverIds,
      isDriverListVisible: false,
      allowLoadDriverInfo: true
    })
  }

  render() {
    const {driverSuspensionStore, driverListStore} = this.props;
    const { formStore, isLoading } = driverSuspensionStore;
    const { isDriverListVisible, categories } = this.state;
    const types = ['black_out', 'limited_reservation', 'reduced_route', 'delayed', 'limited_capacity', 'client_blacklist'];
    const typeOptions = Object.keys(driverSuspensionType).map((t) => {
      return {label: driverSuspensionType[t], value: t}
    });
    const type = formStore.data.suspension_type ? { label: driverSuspensionType[formStore.data.suspension_type], value: formStore.data.suspension_type } : null;
    const category = formStore.data.category ? { label: formStore.data.category, value: formStore.data.category } : null;
    const startTimeOption = {
      dateFormat: 'MMM DD, Y HH:mm:SS A',
      placeHolder: 'Select start time',
      enableTime: true,
      altInput: true,
      clickOpens: true,
      defaultValue: formStore.getField('start_time', null) ? new Date(formStore.getField('start_time', null)) : null
    };

    const endTimeOption = {
      dateFormat: 'MMM DD, Y HH:mm:SS A',
      placeHolder: 'Select end time',
      enableTime: true,
      altInput: true,
      clickOpens: true,
      defaultValue: formStore.getField('end_time', null) ? new Date(formStore.getField('end_time', null)) : null
    };


    const renderer = {
      select: (v, item) => <Checkbox checked={driverListStore.schedule_suspension.selectedItems.includes(item.id)} />,
      name: (v, item) => `${item.first_name ? item.first_name : ''} ${item.last_name ? item.last_name : ''}`
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

    const handleOnChangeProbationType = (e) => {
      formStore.setField('value', '')
      formStore.handlerReactSelect("suspension_type")(e)
    }

    const handleInputChange = (e) => {
      formStore.errors = [];
      formStore.handlerInput(e)
    }

    const handleReactSelect = (e) => {
      formStore.errors = [];
      formStore.handlerReactSelect("category")(e)
    }
    
    // Only create probation for existed drivers
    const setSelectedDrivers = (selectedDrivers) => {
      if (!selectedDrivers || !selectedDrivers.length) {
        this.setState({selectedDriverIds: []})
        return 
      }

      const driverIds = selectedDrivers.map(d => d.id)
      this.setState({selectedDriverIds: driverIds})
      formStore.setField('driver_ids', driverIds)
    }

    const enable = !!(this.state.selectedDriverIds && this.state.selectedDriverIds.length && category && 
                      formStore.getField('reason', '') && type && formStore.getField('start_time') && formStore.getField('end_time'))

    return <div style={styles.container}>
      <h4 style={styles.title}>{this.props.match.params.suspensionId ? `Edit Driver Probation`: 'Create Driver Probation'}</h4>
      <div style={{textAlign: 'left'}}>
        <div style={styles.formWrapper}>
          <div style={styles.formLabel}>{`Driver IDs *`}</div>
          <div>
            <div style={{flexDirection: 'row', display: 'flex', marginRight:'-4px'}}>
              <div style={{flex: 1}}>
                <Input name="driver_ids" value={this.state.driverIds} style={styles.inputDriverInfo}
                  placeholder = 'Add drivers...'
                  inputProps={{ className: 'inputPlaceholder' }} 
                  disabled = {!!this.props.match.params.suspensionId} 
                  disableUnderline={true} onChange={handleOnChangeDriverId} onBlur={() => this.setState({allowLoadDriverInfo: true})}/>
              </div>
              {!!this.props.match.params.suspensionId == false && (
                <AxlButton bg={`gray`} compact={true} onClick={() => this.setState({isDriverListVisible: !isDriverListVisible})} style={styles.buttonControl}
                  ico={{className: `fa ${isDriverListVisible ? 'fa-minus-circle' : 'fa-plus-circle'}`}} />
              )}
            </div>
            {!!driverIds.length && (this.state.allowLoadDriverInfo == true || this.props.match.params.suspensionId) && <DriverInfo cb={setSelectedDrivers} ids={driverIds.join(', ')}></DriverInfo>}
            {isDriverListVisible && <div style={styles.chooseDriver}>
              <div style={styles.chooseDriverSearch}>
                <AxlSearchBox placeholder = 'Search by drivers name, ID...' style={styles.searchBox} onChange={this.changeSearch} onEnter={this.search} />
              </div>
              <div style={styles.chooseDriverListContainer}>
                <DriverProbationListComponent pagination type='schedule_suspension' styles={{td:{padding: '5px 15px'}}} renderer={renderer} allowSelect multipleSelect/>
              </div>
              <div style={styles.chooseDriverBottom}>
                {driverListStore.schedule_suspension.selectedItems.length > 0 && <span style={styles.chooseDriverSelectedText}>{`${driverListStore.schedule_suspension.selectedItems.length} selected`}</span>}
                <AxlButton compact={true} disabled={driverListStore.schedule_suspension.selectedItems.length < 1} style={styles.chooseDriverAction} onClick={() => this.addDriver(driverListStore.schedule_suspension.selectedItems)}>{`ADD`}</AxlButton>
                <AxlButton compact={true} style={styles.chooseDriverAction} bg={'none'} onClick={() => this.setState({isDriverListVisible: false})}>{`Cancel`}</AxlButton>
              </div>
            </div>}
          </div>
        </div>
        <div style={styles.formWrapper}>
          <div style={styles.formLabel}>{`Category *`}</div>
          <div style={styles.categoryWrapper}>
            {categories && <AxlReselect value={category} placeholder="Select category"
                          onChange={handleReactSelect} 
                          options={categories} theme={`main`} />
            }
          </div>
        </div>
        <div style={styles.formWrapper}>
          <div style={styles.formLabel}>Reason *</div>
          <div>
            <AxlInput style={{width: '100%'}} placeholder='Add reason' name='reason' value={formStore.getField('reason', '')} onChange={handleInputChange} />
          </div>
        </div>
        <div style={styles.formWrapper}>
          <div style={styles.formLabel}>Type *</div>
          <div>
            <AxlReselect value={type} placeholder="Select type" onChange={handleOnChangeProbationType} options={typeOptions} theme={`main`} />
          </div>
        </div>
        <div style={styles.formWrapper}>
          <div style={styles.formLabel}>Start Time *</div>
          <div>
            <AxlDateInput displayToday={false} theme={`main`} options={startTimeOption} value={formStore.getField('start_time') ? new Date(formStore.getField('start_time')) : null} onChange={formStore.handlerTimestamp('start_time')} />
          </div>
        </div>
        <div style={styles.formWrapper}>
          <div style={styles.formLabel}>End Time *</div>
          <div>
            <AxlDateInput displayToday={false} theme={`main`} options={endTimeOption} value={formStore.getField('end_time') ? new Date(formStore.getField('end_time')) : null} onChange={formStore.handlerTimestamp('end_time')} />
          </div>
        </div>
        {formStore.getField("suspension_type", null) === 'delayed' && <div style={styles.formWrapper}>
          <div style={styles.formLabel}>Pending Duration (seconds)</div>
          <div>
            <AxlInput type="number" style={{width: '100%'}} value={formStore.getField('value', '')} name='value' onChange={formStore.handlerInput} />
          </div>
        </div>}
        {formStore.getField("suspension_type", null) === 'limited_reservation' && <div style={styles.formWrapper}>
          <div style={styles.formLabel}>Limited Reservation</div>
          <div>
            <AxlInput type="number" style={{width: '100%'}} value={formStore.getField('value', '')} name='value' onChange={formStore.handlerInput} />
          </div>
        </div>}
        {formStore.getField("suspension_type", null) === 'reduced_route' && <div style={styles.formWrapper}>
          <div style={styles.formLabel}>Reduced Route</div>
          <div>
            <AxlInput type="number" style={{width: '100%'}} value={formStore.getField('value', '')} name='value' onChange={formStore.handlerInput} />
          </div>
        </div>}
        {formStore.getField("suspension_type", null) === 'limited_capacity' && <div style={styles.formWrapper}>
          <div style={styles.formLabel}>Limited Capacity (max number of boxes per route)</div>
          <div>
            <AxlInput type="number" style={{width: '100%'}} value={formStore.getField('value', '')} name='value' onChange={formStore.handlerInput} />
          </div>
        </div>}
        {formStore.getField("suspension_type", null) === 'client_blacklist' && <div style={styles.formWrapper}>
          <div style={styles.formLabel}>Client ID</div>
          <div>
            <AxlInput type="number" style={{width: '100%'}} value={formStore.getField('value', '')} name='value' onChange={formStore.handlerInput} />
          </div>
          <div style={{color: '#444', fontSize: '0.9em'}}>
            <span style={{color: '#666'}}>Some common ones: PFE</span>: <strong>120</strong>, Albertsons: <strong>121</strong>, Methodology: <strong>68</strong>, K&L Wines: <strong>97</strong>, BlueApron: <strong>105</strong>
          </div>
        </div>}
        {formStore.getErrors() && formStore.getErrors().length > 0 && <ul>{formStore.getErrors().map((error, index) => <li key={index}>
          <span style={styles.error}>{error}</span>
        </li>)}</ul>}
        <div style={{textAlign: 'center'}}>
          <AxlButton style={styles.chooseDriverAction} disabled={this.state.saving == true || !enable} onClick={ this.save }>{`Save`}</AxlButton>
          <Link to={'/driver-probations'}>
            <AxlButton style={styles.chooseDriverAction} bg={'none'}>{`Cancel`}</AxlButton>
          </Link>
        </div>
      </div>
    </div>
  }
}

export default DriverSuspensionForm
