import React, { Component } from 'react';
import {Route, Switch, Link, withRouter} from 'react-router-dom';
import { AxlButton, AxlModal, AxlSimpleDropDown } from 'axl-reactjs-ui';
import moment, { localeData } from 'moment';
import styles, {TopSection, Spacer} from './styles';
import {inject, observer} from "mobx-react";
import {toast} from "react-toastify";
import { Box, LinearProgress } from '@material-ui/core';

// Internal
import {DriverSuspensionListComponent} from "../../components/DriverSuspensionList";
import DriverSuspensionForm from './form';
import driverSuspensionType from '../../constants/driverSuspensionType';
import DriveProbateAction from "../../components/DriveProbateAction";
import SuspensionFilter from './Filter';
import DriverDetailContainer from '../DriverDetail';

const getTitleByCode = (categories, code) => {
  const cate = categories.find(cate => cate.code === code)
  if (cate) return cate.title || ''

  return ''
}

@inject('driverSuspensionStore', 'driverStore', 'driverProbationStore', 'userStore')
@observer
class DriverSuspensionList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDriverProbationAction: false,
      showDriverProfile: false,
      showRemoveModal: false,
      selectedItem: null,
      driverData: {},
      actionShow: null,
      loading: false,
      categories: [],
    }

    const {driverStore, driverSuspensionStore, driverProbationStore} = this.props;
    driverStore.getAppealCategoriesByType('probation').then(response => {
      if (response.status === 200 && response.data) {
        const categories = [];
        if (response.data.categories && response.data.categories.length) {
          response.data.categories.map((cate) => {
            categories.push(cate);
          })
          this.setState({categories});
          driverProbationStore.driverCategories = categories;
        }
      }
    });
  }

  onShowRemoveModal = (item) => {
    this.setState({
      showRemoveModal: true,
      selectedItem: item,
    })
  }

  onCloseRemoveModal = () => {
    this.setState({
      showRemoveModal: false,
      selectedItem: null,
    })
  }

  remove = () => {
    const {selectedItem} = this.state;
    const {driverSuspensionStore} = this.props;

    if (!selectedItem || !selectedItem.id) {
      return;
    }

    driverSuspensionStore.delete(selectedItem.id, (res) => {
      if (res.ok) {
        const filterDefault = driverSuspensionStore.DEFAULT.filters
        driverSuspensionStore['schedule'].setFilters(filterDefault)
        driverSuspensionStore.setFilters(filterDefault)
        driverSuspensionStore.search();
        this.onCloseRemoveModal();
        toast.success("Removed successfully!", {containerId: 'main'});
      } else {
        toast.error(res && res.data && res.data.message || "Error while removing probation", {containerId: 'main'});
      }
    })
  };

  showDriverProfile = (driver) => () => { this.setState({driverData: driver, showDriverProfile: true}) }

  onHideDriverProfile = () => { this.setState({showDriverProfile: false}) }

  handleLoading = (loadingState) => { 
    this.setState({loading: loadingState})
  }

  render() {
    const {driverSuspensionStore, history} = this.props;
    const {driverData, showDriverProfile, actionShow, showRemoveModal } = this.state;
    const renderer = {
      driver_id: (v, item) => <a href="#" onClick={this.showDriverProfile(item)}>{v}</a>,
      suspension_type: (v, item) => driverSuspensionType[v],
      category: (v, item) => v ? getTitleByCode(this.state.categories, v): v,
      start_time: (v, item) => v ? moment(v).format('MMM DD, Y HH:mm A') : v,
      end_time: (v, item) => v ? moment(v).format('MMM DD, Y HH:mm A') : v,
      reporter_id: (v, item) => v && item && item.reporter && item.reporter.username ? item.reporter.username : "Unknown reporter",
      reporter_ts: (v, item) => v ? moment(v).format("MMM DD, Y HH:mm A") : 'N/A',
      actions: (v, item) =><span>
        <span style={styles.actionItem}>
          <Link to={`/driver-probations/${item.id}/edit`}>
            <i style={{cursor: 'pointer'}} className="fa fa-edit"></i>
          </Link>
        </span> |
        <span style={styles.actionItem}>
          <i onClick={() => this.onShowRemoveModal(item)} style={{cursor: 'pointer'}} className="fa fa-trash" />
        </span>
      </span>
    };
    const downloadActions = [
      {title: 'SUSPENSION', action: () => this.setState({actionShow: 'SUSPENSION'})},
      {title: 'PROBATION', action: () => this.setState({actionShow: 'PROBATION'})},
      {title: 'COMPLIMENT', action: () => this.setState({actionShow: 'COMPLIMENT'})},
    ]

    return <div style={{textAlign: 'left'}}>
      <Box width={'100%'} style={{display:'flex', marginBottom: 15}}>
        <SuspensionFilter handleListLoading={this.handleLoading}/>
        <Link to={'/driver-probations/new'}>
          <AxlButton compact>ADD NEW</AxlButton>
        </Link>
        <AxlSimpleDropDown anchor={'right'} style={styles.actionDropdown} items={ downloadActions }>
          <AxlButton compact={true}>{`EMAIL ACTION`}</AxlButton>
        </AxlSimpleDropDown>
      </Box>
      <TopSection>
        {(['SUSPENSION', 'PROBATION', 'COMPLIMENT'].indexOf(actionShow) !== -1) && <AxlModal
          onClose={() => {
            driverSuspensionStore.selectedItems = [];
            this.setState({actionShow: null});
            driverSuspensionStore.formStore.setField('driver_ids', []);
          }}
          style={styles.modalContainer}>
          <DriveProbateAction
            type={actionShow}
            onClose={() => {
              this.setState({actionShow: null});
              driverSuspensionStore.formStore.setField('driver_ids', []);
              driverSuspensionStore.selectedItems = [];
              driverSuspensionStore.search();
            }} />
        </AxlModal>}
      </TopSection>
      {this.state.loading && (<LinearProgress></LinearProgress>)}
      <DriverSuspensionListComponent allowSelect multipleSelect pagination renderer={renderer} baseUrl={`${driverSuspensionStore.baseUrl}`}/>
      <Switch>
        <Route exact path={`/driver-probations/new`} render={props => (
          <AxlModal onClose={() => {driverSuspensionStore.formStore.setField('driver_ids', []); history.replace('/driver-probations')}} style={{width: '1000px', height: '650px', paddingBottom: '20px', paddingLeft: '16px', paddingRight: '16px'}}>
            <DriverSuspensionForm {...props} />
          </AxlModal>
        )} />

        <Route exact path={`/driver-probations/:suspensionId/edit`} render={props => (
          <AxlModal onClose={() => history.replace('/driver-probations')} style={{width: '1000px', height: '800px', paddingBottom: '60px', paddingLeft: '16px', paddingRight: '16px'}}>
            <DriverSuspensionForm {...props} />
          </AxlModal>
        )} />
      </Switch>
      {showDriverProfile && (
        <AxlModal style={styles.modalDriverProfileContainer} onClose={this.onHideDriverProfile}>
          <DriverDetailContainer {...this.props} driverId={driverData.driver_id} isHiddenButtonBack={true}/>
        </AxlModal>
      )}
      {showRemoveModal && (
        <AxlModal onClose={this.onCloseRemoveModal} style={{padding: '30px 40px'}}>
          <div>Are you sure to remove this probation?</div>
          <div style={{textAlign: 'center', marginTop: 10}}>
            <AxlButton onClick={this.onCloseRemoveModal} compact bg="greyOne">Cancel</AxlButton>
            <AxlButton onClick={this.remove} bg="red" compact>Remove</AxlButton>
          </div>
        </AxlModal>
      )}
    </div>
  }
}

export default withRouter(DriverSuspensionList);
