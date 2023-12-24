import React, { Component } from 'react';
import {inject, observer, Observer} from "mobx-react";
import {Route, Switch, Link} from 'react-router-dom';
import _ from 'lodash';
import {AxlButton, AxlModal, AxlSearchBox} from "axl-reactjs-ui";
import {Dialog, DialogTitle, DialogContent, DialogActions, Box, TextField, Button, CircularProgress} from "@material-ui/core";

import {DriverListComponent} from "../../components/DriverList";
import DriverPoolList from "./index";
import styles from "./styles";
import searchStyles from "./searchStyles";
import detailStyles from "./detailStyles";

@inject('driverPoolStore', 'driverListStore', 'userStore')
@observer
class DriverPoolDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDialog: false,
      reason: '',
      driverSelected: null,
      loading: false,
    }
  }

  componentDidMount() {
    const {driverPoolStore, match} = this.props;
    const poolId = match.params.poolId.split("_")[0];
    driverPoolStore.getPool(poolId);
  }

  componentDidUpdate(prevProps) {
    const {driverPoolStore} = this.props;
    const {driverPool} = driverPoolStore;

    if (this.props.match.params.poolId != prevProps.match.params.poolId) {
      driverPoolStore.getPool(this.props.match.params.poolId.split("_")[0]);
    }
  }

  changeSearch = (e) => {
    const {driverListStore} = this.props;
    const value = e;

    if (value !== undefined) {
      driverListStore.pool_search.setFilters({
        q: value,
        page: 1
      });
    }
  };

  search = (e) => {
    const {driverListStore} = this.props;
    driverListStore.pool_search.search();
  };

  addDrivers = (e) => {
    const {driverListStore, driverPoolStore} = this.props;
    driverPoolStore.addDrivers(driverListStore.pool_search.selectedItems, () => {
      driverListStore.pool.search();
      this.props.history.push(`/driver-pools/${this.props.match.params.poolId}`);
    });
  };

  removeDriver = (item) => (e) => {
    const {reason} = this.state;
    const {driverListStore, driverPoolStore} = this.props;
    this.setState({loading: true});
    driverPoolStore.removeDriver(item.id, reason, () => {
      this.setState({loading: false});
      driverListStore.pool.search();
      this.closeReasonDialog();
    });
  };

  openReasonDialog = (item) => () => {
    this.setState({
      openDialog: true,
      reason: '',
      driverSelected: item,
    })
  }

  closeReasonDialog = () => {
    this.setState({
      openDialog: false,
      reason: '',
      driverSelected: null,
    })
  }

  render() {
    const {openDialog, reason, driverSelected, loading} = this.state;
    const {driverPoolStore, driverListStore, userStore} = this.props;
    const {driverPool} = driverPoolStore;
    const {user} = userStore;

    const poolId = this.props.match.params.poolId.split("_")[0];
    const region = this.props.match.params.poolId.split("_")[1];
    const isAdminOrHr = userStore.isAdmin || userStore.isHr || userStore.isLeadDispatcher;
    const renderer = {
      name: (v, item) => `${item.first_name ? item.first_name : ''} ${item.last_name ? item.last_name : ''}`,
      actions: isAdminOrHr && ((v, item) =>
        <span>
          
        </span>)
    };
    

    // need to display loading
    if (!driverPool) return null;
    // Meaning: cannot add current drivers AND those disqualified because of whatever biz-logic reason
    // In this case: we don't want to add the DSP drivers, i.e. those who work under one or more couriers
    const disqualifiedDriverIds = _.concat(
      driverPool.drivers,
      (((driverListStore.pool_search || {}).result || {}).drivers || [])
        .filter(d => d.couriers && d.couriers.length >= 1)
        .map(dr => dr.id)
    );
    return <div style={detailStyles.container}>
      <div style={{...detailStyles.column1}}>
        <div style={detailStyles.itemWrapper}>
          <div style={detailStyles.label}>Name</div>
          <div style={detailStyles.content}>{driverPool.tag}</div>
        </div>
        <div style={detailStyles.itemWrapper}>
          <div style={detailStyles.label}>Description</div>
          <div style={detailStyles.content}>{driverPool.description}</div>
        </div>
        <div style={detailStyles.itemWrapper}>
          <div style={detailStyles.label}>Region</div>
          <div style={detailStyles.content}><b>{region}</b></div>
        </div>
        <div>

          <AxlButton onClick={() => this.props.history.push(`/driver-pools`)} compact={true}>BACK</AxlButton>          
        </div>
      </div>
      <div style={detailStyles.column2}>
        <div>
          <DriverListComponent type='pool' baseUrl={`/driver-pools/${poolId}/regions/${region}/drivers`} renderer={renderer} />
        </div>
        <Switch>
          <Route path={`/driver-pools/:poolId/drivers`} render={ (props) =>
            <Observer>{ () => <AxlModal onClose={() => props.history.push(`/driver-pools/${props.match.params.poolId}`)} style={{width: '1000px', height: '800px', paddingBottom: '60px', paddingLeft: '16px', paddingRight: '16px'}}>
              <div style={styles.searchBar}>
                <AxlSearchBox style={styles.searchBox} onChange={this.changeSearch} onEnter={this.search} />
                <AxlButton onClick={this.search} compact bg={'periwinkle'} style={styles.searchButton}>Search</AxlButton>
              </div>
              <div style={searchStyles.container}>
                <DriverListComponent pagination type='pool_search' renderer={renderer} disabledIds={disqualifiedDriverIds} allowSelect multipleSelect />
              </div>
              <div style={{textAlign: 'center', position: 'absolute', bottom: 0, left: 0, right: 0, height: '55px'}}>
                {driverListStore.pool_search.selectedItems.length > 0 && <span>{driverListStore.pool_search.selectedItems.length} selected</span>}<AxlButton compact={true} disabled={driverListStore.crew_search.selectedItems.length < 1} style={{ margin: 0, minWidth: '180px'}} onClick={this.addDrivers}>ADD</AxlButton>
                <Link to={`/driver-pools/${this.props.match.params.poolId}`}>
                  <AxlButton compact={true} style={{ margin: 0, minWidth: '180px'}} bg={'none'}>Cancel</AxlButton>
                </Link>
              </div>
            </AxlModal>}</Observer>} />
        </Switch>
      </div>

      <Dialog open={openDialog && driverSelected}
              onClose={this.closeReasonDialog}
              PaperProps={{
                style: {minWidth: 500}
              }}
      >
        <DialogTitle>
          <Box align="center">
            <span>Confirm remove driver</span>
            <strong style={{margin: '0 5px'}}>[{driverSelected && driverSelected.id}]</strong>
            <em>{driverSelected && driverSelected.first_name} {driverSelected && driverSelected.last_name}</em>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField label="Reason"
                     variant="outlined"
                     fullWidth
                     multiline
                     rows={5}
                     value={reason}
                     onChange={(e) => this.setState({reason: e.target.value})}
          />
        </DialogContent>
        <DialogActions style={{marginBottom: 10}}>
          {loading && <CircularProgress color="primary" size={24}/>}
          <Button variant="contained" color="secondary" disableElevation onClick={this.closeReasonDialog}>Cancel</Button>
          <Button variant="contained" color="primary" disableElevation
                  disabled={!reason.trim() || loading}
                  onClick={this.removeDriver(driverSelected)}
                  style={{marginRight: 16}}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  }
}

export default DriverPoolDetail;
