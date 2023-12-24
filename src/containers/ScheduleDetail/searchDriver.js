import React, { Component } from 'react';
import {inject, Observer, observer} from "mobx-react";
import {Route, Switch, Link} from 'react-router-dom';
import {AxlButton, AxlInput, AxlModal, AxlSearchBox} from "axl-reactjs-ui";
import styles from "./styles";
import {DriverListComponent} from "../../components/DriverList";

@inject('driverListStore', 'scheduleStore', 'driverSuspensionStore')
@observer
class SearchDriver extends Component {
  changeSearch = (e) => {
    const {driverListStore} = this.props;
    const { params } = this.props.match;
    const value = e;

    if (value !== undefined) {
      driverListStore.schedule_search.setFilters({
        q: value,
        page: 1,
        schedule_id: params.id
      });
    }
  };

  search = (e) => {
    const {driverListStore} = this.props;
    const { params } = this.props.match;

    driverListStore.schedule_search.setFilters({
      schedule_id: params.id
    });

    driverListStore.schedule_search.search();
  };

  addDrivers = (e) => {
    const {driverListStore, scheduleStore, driverSuspensionStore} = this.props;
    const { params } = this.props.match;
    if (driverListStore.schedule_search.selectedItems.length > 0) {
      scheduleStore.addDrivers(params.id, driverListStore.schedule_search.selectedItems, (items) => {
        driverSuspensionStore.schedule.search();
        driverListStore.schedule.directAddItems(items);
        this.props.history.push(`/schedule/${params.id}`);
      });
    }
  };

  render() {
    const {driverListStore} = this.props;

    const renderer = {
      name: (v, item) => `${item.first_name ? item.first_name : ''} ${item.last_name ? item.last_name : ''}`,
    };

    const filters = {
      schedule_id: this.props.match.params.id
    }


    const disabledDriverIds = (((driverListStore.schedule_search || {}).result || {}).disableIds || []);


    return <AxlModal style={{width: '1000px', height: '800px', paddingBottom: '60px', paddingLeft: '16px', paddingRight: '16px'}}>
      <div style={styles.searchBar} data-testid="schedule-detail-driver-search">
        <AxlSearchBox style={styles.searchBox} onChange={this.changeSearch} onEnter={this.search}/>
        <AxlButton compact onClick={this.search} bg={'periwinkle'} style={styles.searchButton}>Search</AxlButton>
      </div>
      <div style={{...styles.modalListStyle, top: '50px'}}>
        <DriverListComponent type='schedule_search' renderer={renderer} filters={filters} disabledIds={disabledDriverIds} allowSelect multipleSelect dataTestId="driver-table"/>
      </div>
      <div style={{textAlign: 'center', position: 'absolute', bottom: 0, left: 0, right: 0, height: '55px'}}>
        {driverListStore.schedule_search.selectedItems.length > 0 && <span>{driverListStore.schedule_search.selectedItems.length} selected</span>}<AxlButton compact={true} disabled={driverListStore.schedule_search.selectedItems.length < 1} style={{ margin: 0, minWidth: '180px'}} onClick={this.addDrivers}>ADD DRIVERS</AxlButton>
        <Link to={`/schedule/${this.props.match.params.id}`}>
          <AxlButton style={{ margin: 0, minWidth: '180px'}} bg={'none'} compact={true}>Cancel</AxlButton>
        </Link>
      </div>
    </AxlModal>
  }
}

export default SearchDriver;
