import React, { Component } from 'react';
import _ from 'lodash';
import { inject, observer, Observer } from 'mobx-react';
import { Route, Switch, Link } from 'react-router-dom';
import { Button, IconButton } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { AxlButton, AxlModal, AxlSearchBox, AxlPanelSlider } from 'axl-reactjs-ui';
import HistoryIcon from '@material-ui/icons/History';

import EventCrew from './events';
import { GreenButton } from '../../components/Button';
import { DriverListComponent } from '../../components/DriverList';
import DriverRemove from '../../components/Driver/DriverRemove';
import TooltipContainer from '../../components/TooltipContainer';

import styles from './styles';
import searchStyles from './searchStyles';
import detailStyles from './detailStyles';
import { ACTIONS } from '../../constants/ActionPattern';
import { PERMISSION_DENIED_TEXT } from '../../constants/common';

@inject('driverCrewListStore', 'driverCrewStore', 'driverListStore', 'userStore', 'permissionStore')
@observer
class DriverCrewDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDialog: false,
      driverSelected: null,
      loading: false,
    };
  }

  componentDidMount() {
    const { driverCrewStore, match } = this.props;
    driverCrewStore.getCrew(match.params.crewId);
  }

  componentDidUpdate(prevProps) {
    const { driverCrewStore } = this.props;
    const { driverCrew } = driverCrewStore;

    if (this.props.match.params.crewId != prevProps.match.params.crewId) {
      driverCrewStore.getCrew(this.props.match.params.crewId);
    }
  }

  changeSearch = (e) => {
    const { driverListStore } = this.props;
    const value = e;

    if (value !== undefined) {
      driverListStore.crew_search.setFilters({
        q: value,
        page: 1,
      });
    }
  };

  search = () => {
    const { driverListStore } = this.props;
    driverListStore.crew_search.search();
  };

  addDrivers = () => {
    const { driverListStore, driverCrewStore } = this.props;
    driverCrewStore.addDrivers(driverListStore.crew_search.selectedItems, () => {
      driverListStore.crew.search();
      this.props.history.push(`/driver-crews/${this.props.match.params.crewId}`);
    });
  };

  openReasonDialog = (item) => () => {
    this.setState({
      openDialog: true,
      driverSelected: item,
    });
  };

  closeReasonDialog = () => {
    this.setState({
      openDialog: false,
      driverSelected: null,
    });
  };

  closePanel = () => {
    this.setState({ showHistoryPanel: false });
  };

  onSuccess = () => {
    const { driverListStore } = this.props;
    this.setState({ openDialog: false, driverSelected: null });
    driverListStore.crew.search();
  };

  render() {
    const { openDialog, driverSelected } = this.state;
    const { driverCrewStore, driverListStore, userStore, permissionStore } = this.props;
    const { driverCrew } = driverCrewStore;

    const isAdminOrHr = userStore.isAdmin || userStore.isHr || userStore.isSuperAdmin;
    const isDeniedAddDriver = permissionStore.isDenied(ACTIONS.DRIVER_CREWS.ADD_DRIVER);
    const isDeniedRemoveDriver = permissionStore.isDenied(ACTIONS.DRIVER_CREWS.REMOVE_DRIVER);

    const renderer = {
      name: (v, item) => `${item.first_name ? item.first_name : ''} ${item.last_name ? item.last_name : ''}`,
      actions:
        isAdminOrHr &&
        !isDeniedRemoveDriver &&
        ((v, item) => (
          <span>
            <i onClick={this.openReasonDialog(item)} style={{ cursor: 'pointer' }} className="fa fa-trash" />
          </span>
        )),
    };

    // need to display loading
    if (!driverCrew) return null;
    // Meaning: cannot add current drivers AND those disqualified because of whatever biz-logic reason
    // In this case: we don't want to add the DSP drivers, i.e. those who work under one or more couriers
    const disqualifiedDriverIds = _.concat(
      driverCrew.drivers,
      (((driverListStore.crew_search || {}).result || {}).drivers || []).filter((d) => d.couriers && d.couriers.length >= 1).map((dr) => dr.id),
    );

    return (
      <div>
        <div style={detailStyles.textWrapper}>
          <div style={detailStyles.btnGroup}>
            <div>
              <GreenButton component={Link} to={`/driver-crews`} variant="contained" size="small">
                <ArrowBackIosIcon fontSize='inherit'/> &nbsp; BACK
              </GreenButton>
              </div>
              <div style={detailStyles.headTitle}>
                <div style={{fontWeight:'bold', padding:'8px'}}>[{driverCrew.region}] - {driverCrew.name}</div>
                <div>{driverCrew.description}</div> 
              </div>
            <div>
              {isAdminOrHr && (
                <TooltipContainer title={isDeniedAddDriver ? PERMISSION_DENIED_TEXT : ''}>
                  <GreenButton disabled={isDeniedAddDriver} component={Link} to={`/driver-crews/${this.props.match.params.crewId}/drivers`} variant="contained" size="small" style={{ minWidth: '180px', marginLeft: '0.5rem' }}>
                    ADD DRIVERS
                  </GreenButton>
                </TooltipContainer>
              )}
              <IconButton size="large" onClick={() => this.setState({ showHistoryPanel: !this.state.showHistoryPanel })} style={{ marginLeft: '0.5rem', padding:'0px' }}>
                <HistoryIcon />
              </IconButton>
            </div>
          </div>
        </div>
        <div style={detailStyles.column2}>
          <div>
            {
              <AxlPanelSlider style={{ ...detailStyles.AxlPanelSliderStyle, display: this.state.showHistoryPanel ? 'block' : 'none' }}>
                <EventCrew crewId={this.props.match.params.crewId} closePanel={this.closePanel} />
              </AxlPanelSlider>
            }
            <DriverListComponent type="crew" baseUrl={`/driver-crews/${this.props.match.params.crewId}/drivers`} renderer={renderer} />
          </div>
          <Switch>
            <Route
              path={`/driver-crews/:crewId/drivers`}
              render={(props) => {
                if (isDeniedAddDriver) return null;

                return (
                  <Observer>
                    {() => (
                      <AxlModal onClose={() => props.history.push(`/driver-crews/${props.match.params.crewId}`)} style={{ width: '1000px', height: '800px', paddingBottom: '60px', paddingLeft: '16px', paddingRight: '16px' }}>
                        <div style={styles.searchBar}>
                          <AxlSearchBox style={styles.searchBox} onChange={this.changeSearch} onEnter={this.search} />
                          <AxlButton onClick={this.search} compact bg={'periwinkle'} style={styles.searchButton}>
                            Search
                          </AxlButton>
                        </div>
                        <div style={searchStyles.container}>
                          <DriverListComponent pagination type="crew_search" renderer={renderer} disabledIds={disqualifiedDriverIds} allowSelect multipleSelect />
                        </div>
                        <div style={{ textAlign: 'center', position: 'absolute', bottom: 0, left: 0, right: 0, height: '55px' }}>
                          {driverListStore.crew_search.selectedItems.length > 0 && <span>{driverListStore.crew_search.selectedItems.length} selected</span>}
                          <TooltipContainer title={isDeniedAddDriver ? PERMISSION_DENIED_TEXT : ''}>
                            <AxlButton compact={true} disabled={driverListStore.crew_search.selectedItems.length < 1 || isDeniedAddDriver} style={{ margin: 0, minWidth: '180px' }} onClick={this.addDrivers}>
                              ADD
                            </AxlButton>
                          </TooltipContainer>
                          <Link to={`/driver-crews/${this.props.match.params.crewId}`}>
                            <AxlButton compact={true} style={{ margin: 0, minWidth: '180px' }} bg={'none'}>
                              Cancel
                            </AxlButton>
                          </Link>
                        </div>
                      </AxlModal>
                    )}
                  </Observer>
                );
              }}
            />
          </Switch>
        </div>

        {openDialog && driverSelected && <DriverRemove open={true} driver={driverSelected} driverCrew={driverCrew} onClose={this.closeReasonDialog} onSuccess={this.onSuccess} />}
      </div>
    );
  }
}

export default DriverCrewDetail;
