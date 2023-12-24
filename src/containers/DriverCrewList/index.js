import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Route, Switch, Link } from 'react-router-dom';
import { Typography, Grid, withStyles } from '@material-ui/core';

import DriverCrewForm from './form';
import { GreenButton } from '../../components/Button';
import AxlMultiSelect from '../../components/MultiSelect';
import TooltipContainer from '../../components/TooltipContainer';
import { DriverCrewListComponent } from '../../components/DriverCrewList';

import styles from './styles';
import { ACTIONS } from '../../constants/ActionPattern';
import { PERMISSION_DENIED_TEXT } from '../../constants/common';
import AxlDialog from '../../components/AxlDialog';

const componentStyles = (theme) => ({
  btnNew: {
    '& button': {
      width: '150px !important',
      height: '40px !important',
    },
  },
});

@inject('driverCrewListStore', 'driverCrewStore', 'regionStore', 'permissionStore')
@observer
class DriverCrewList extends Component {
  constructor(props) {
    super(props);
    let params = new URLSearchParams(this.props.history.location.search);
    let regionsStr = params.get('regions');
    let regions = regionsStr ? regionsStr.split(',') : []
    if(this.props.driverCrewListStore && this.props.driverCrewListStore.DEFAULT.filters.regions){
      regions = regionsStr ? regionsStr.split(',') : this.props.driverCrewListStore.DEFAULT.filters.regions
      const urlWithParam = regions.length === 0 ? '/driver-crews' : `/driver-crews?regions=${regions.toString()}`;
      this.props.history.push(urlWithParam);
    }
    this.state = {
      selectedRegions: regions,
    };
  }

  removeCrew = (item) => (e) => {
    const { driverCrewStore, driverCrewListStore } = this.props;
    driverCrewStore.deleteCrew(item.id, () => {
      driverCrewListStore.search();
    });
  };

  setRegions = (e) => {
    const {  driverCrewListStore } = this.props;
    let selected = [];
    if (!e || e.length === 0) {
      this.setState({ selectedRegions: [] });
    } else {
      const regions = e.map((r) => r.value);
      selected = regions;
      this.setState({ selectedRegions: regions });
    }
    const filters = {regions: selected, page: 1 };
    driverCrewListStore.setFilters(filters);
    driverCrewListStore.search();
    const urlWithParam = selected.length === 0 ? '/driver-crews' : `/driver-crews?regions=${selected.toString()}`;
    this.props.history.push(urlWithParam);
  };

  componentDidMount() {
    const { regionStore } = this.props;
    regionStore.init();
  }

  handleCloseDriverCrew = () => {
    const { driverCrewStore } = this.props;
    if(driverCrewStore.isSubmitting) return;

    this.props.history.push(`/driver-crews`)
  }

  render() {
    const { regionStore, permissionStore } = this.props;
    const regionList = regionStore.regions;
    const isDeniedCreateCrew = permissionStore.isDenied(ACTIONS.DRIVER_CREWS.CREATE_OR_EDIT);

    const renderer = {
      drivers: (drivers, item) => (
        <Link to={`/driver-crews/${item.id}`}>
          (<strong>{drivers ? drivers.length : 0}</strong>)
        </Link>
      ),
      actions: (v, item) => (
        <span>
          <span style={styles.actionItem}>
            <Link to={`/driver-crews/${item.id}`}>
              <i style={{ cursor: 'pointer' }} className="fa fa-eye"></i>
            </Link>
          </span>{' '}
          {isDeniedCreateCrew ? null : (
            <React.Fragment>
              <span>|</span>
              <span style={styles.actionItem}>
                <Link to={`/driver-crews/${item.id}/edit`}>
                  <i style={{ cursor: 'pointer' }} className="fa fa-edit"></i>
                </Link>
              </span>
            </React.Fragment>
          )}
        </span>
      ),
    };

    return (
      <div style={{ textAlign: 'left' }}>
        <Grid container spacing={3} style={{ alignItems: 'center', marginBottom: '-5px' }}>
          <Grid item xs={12} sm={6} style={{ display: 'flex' }}>
            <Typography style={{ fontSize: 18, lineHeight: '32px' }}>Filter by</Typography>
            <AxlMultiSelect defaulValue={regionList.filter((option) => this.state.selectedRegions.indexOf(option.value) >= 0)} placeholderButtonLabel="all regions" showValues={false} allowAll={true} onChange={(v) => this.setRegions(v)} placeholder="Search Regions…" options={regionList} style={{ width: '200px' }} />
          </Grid>
          <Grid item xs={12} sm={6} style={{ textAlign: 'right', paddingRight: 10 }}>
            <TooltipContainer title={isDeniedCreateCrew ? PERMISSION_DENIED_TEXT : ''}>
              <GreenButton component={Link} to="driver-crews/new" disabled={isDeniedCreateCrew} variant="contained" size="medium" style={{ width: '120px', marginRight: '3px' }}>
                NEW
              </GreenButton>
            </TooltipContainer>
          </Grid>
        </Grid>

        <DriverCrewListComponent pagination renderer={renderer} regions={this.state.selectedRegions}/>
        <Switch>
          <Route
            exact
            path={`/driver-crews/new`}
            render={(props) => {
              if (isDeniedCreateCrew) return null;

              return (
                <AxlDialog
                  isOpen={true}
                  maxWidth='sm'
                  handleClose={this.handleCloseDriverCrew}
                  childrenTitle={"Create Driver Crew"}
                  children={<DriverCrewForm {...props} />}
                  dividers={false}
                />
              )
            }}
          />

          <Route
            exact
            path={`/driver-crews/:crewId/edit`}
            render={(props) => (
              <AxlDialog
                isOpen={true}
                maxWidth='sm'
                handleClose={this.handleCloseDriverCrew}
                childrenTitle={"Edit Driver Crew"}
                children={<DriverCrewForm {...props} />}
                dividers={false}
              />
            )}
          />
        </Switch>
      </div>
    );
  }
}

export default withStyles(componentStyles)(DriverCrewList);
