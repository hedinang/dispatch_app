import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import { AxlButton, AxlTable, AxlSearchBox, AxlModal } from 'axl-reactjs-ui';

import styles from './styles';
import TooltipContainer from '../../components/TooltipContainer';
import AssignmentAssign from '../../components/AssignmentAssign';
import { ACTIONS } from '../../constants/ActionPattern';
import { ASSIGN_BTN_TEXT, REASSIGN_BTN_TEXT, UNASSIGN_BTN_TEXT, PERMISSION_DENIED_TEXT, DRIVER_SEARCH_ASSIGNMENT, DRIVER_SEARCH_TICKET } from '../../constants/common';

@inject('driverStore', 'permissionStore')
@observer
class DriverSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      q: '',
      reason: '',
      reasonCode: '',
      selectedDriver: null,
    };
    this.onChange = this.onChange.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onSelectDriver = this.onSelectDriver.bind(this);
    this._renderDriver = this._renderDriver.bind(this);
  }

  onSelectDriver(d) {
    if (d.id !== this.props.driverIdSelected) {
      this.setState({ selectedDriver: d });
    }
  }

  onSearch() {
    if (!this.state.q) return;
    const { driverStore } = this.props;
    this.setState({ selectedDriver: null });
    driverStore.search(this.state.q);
  }

  showUnassignDriver = () => {
    this.setState({ showUnassignDriver: true });
  };

  hideUnassignDriver = () => {
    this.setState({ showUnassignDriver: false });
  };

  updateReasonCode = () => (e) => {
    this.setState({ reasonCode: e });
  };

  updateReason = () => (e) => {
    this.setState({ reason: e });
  };

  updateField = (field) => (e) => {
    this.setState({ [field]: e });
  };

  onSelect() {
    const { selectedDriver, reason, reasonCode, benefit } = this.state;
    this.state.selectedDriver && this.props.onSelect && this.props.onSelect(selectedDriver, reason, reasonCode, benefit);
  }

  _renderDriver(driver, courierDriverMap, blacklisted) {
    const { selectedDriver } = this.state;
    const { disableCourierDriver } = this.props;
    const isSelected = selectedDriver && selectedDriver.id === driver.id;
    let style = isSelected ? styles.selected : {};
    let courierId = '';
    let unassignable = ['SUSPENDED', 'QUIT'].includes(driver.status);
    const unassignableYet = !driver.background_status || driver.background_status.indexOf('APPROVED') < 0;
    const isDriverSelected = (selectedDriver && driver.id === selectedDriver.id) || driver.id === this.props.driverIdSelected;
    if (typeof courierDriverMap[driver.id] != 'undefined' && courierDriverMap[driver.id].length) {
      courierId = courierDriverMap[driver.id].join(', ');
      if (disableCourierDriver) unassignable = true;
      style = styles.dsp;
    }
    if (unassignable) {
      style = styles.suspended;
    }
    if (unassignableYet) {
      style = styles.warning;
    }
    if (isDriverSelected) {
      style = styles.selected;
    }

    if (blacklisted) {
      style = styles.blacklisted;
    }

    return (
      <AxlTable.Row style={{ cursor: unassignable || unassignableYet || blacklisted ? 'not-allowed' : 'pointer' }} onClick={() => (unassignable || unassignableYet || blacklisted ? null : this.onSelectDriver(driver))} key={driver.id}>
        <AxlTable.Cell style={{ ...styles.highlightCell, ...style }}>{driver.id}</AxlTable.Cell>
        <AxlTable.Cell style={{ ...styles.highlightCell, ...style }}>
          {driver.first_name} {driver.last_name}
        </AxlTable.Cell>
        <AxlTable.Cell style={{ ...styles.highlightCell, ...style }}>{driver.status}</AxlTable.Cell>
        <AxlTable.Cell style={{ ...styles.highlightCell, ...style }}>{driver.remark}</AxlTable.Cell>
        <AxlTable.Cell style={{ ...styles.highlightCell, ...style }}>{driver.blacklist_clients_companies}</AxlTable.Cell>
        <AxlTable.Cell style={{ ...styles.highlightCell, ...style }}>{courierId}</AxlTable.Cell>
        <AxlTable.Cell style={style}>{driver.email}</AxlTable.Cell>
        <AxlTable.Cell style={style}>{driver.phone_number}</AxlTable.Cell>
        <AxlTable.Cell style={style}>
          {driver.vehicle_make} {driver.vehicle_model}
        </AxlTable.Cell>
      </AxlTable.Row>
    );
  }

  onChange(e) {
    this.setState({ q: e });
  }

  _isBlacklist(assignment, driver) {
    if (!assignment || !assignment.client_ids || !driver || !driver.blacklist_clients) return false;

    return !!driver.blacklist_clients.map((c) => assignment.client_ids.map((cid) => cid).includes(c.id) && driver.id).filter((d) => d).length;
  }

  render() {
    const { selectedDriver } = this.state;
    const { driverStore, permissionStore, okText, assignment, activeTicket, type } = this.props;
    const { driverSearchResult } = driverStore;
    const { drivers, courier_driver_map } = driverSearchResult;
    const driverName = selectedDriver ? selectedDriver.first_name + ` [${selectedDriver.id}]` : '';

    const blacklisted = this._isBlacklist(assignment, selectedDriver);
    const okTextBtn = okText || ASSIGN_BTN_TEXT;

    let isDenied = false;

    if (okTextBtn === ASSIGN_BTN_TEXT) {
      if (type === DRIVER_SEARCH_ASSIGNMENT) isDenied = permissionStore.isDenied(ACTIONS.ASSIGNMENTS.ASSIGN);
      if (type === DRIVER_SEARCH_TICKET) isDenied = permissionStore.isDenied(ACTIONS.TICKETS.ASSIGN);
    }

    if (okTextBtn === REASSIGN_BTN_TEXT) {
      if (type === DRIVER_SEARCH_ASSIGNMENT) isDenied = permissionStore.isDenied(ACTIONS.ASSIGNMENTS.REASSIGN);
      if (type === DRIVER_SEARCH_TICKET) isDenied = permissionStore.isDenied(ACTIONS.TICKETS.REASSIGN);
    }

    if (okTextBtn === UNASSIGN_BTN_TEXT) {
      if (type === DRIVER_SEARCH_ASSIGNMENT) isDenied = permissionStore.isDenied(ACTIONS.ASSIGNMENTS.UNASSIGN);
      if (type === DRIVER_SEARCH_TICKET) isDenied = permissionStore.isDenied(ACTIONS.TICKETS.UNASSIGN);
    }

    return (
      <Fragment>
        <div style={styles.header}>
          <AxlSearchBox onChange={this.onChange} onEnter={this.onSearch} placeholder="Search Driver By Name or ID" style={{ width: '100%' }} />
        </div>
        <div style={styles.container}>
          {drivers && drivers.length ? (
            <AxlTable>
              <AxlTable.Header>
                <AxlTable.Row>
                  <AxlTable.HeaderCell style={styles.highlightCell}>AxleHire Driver ID</AxlTable.HeaderCell>
                  <AxlTable.HeaderCell style={styles.highlightCell}>Name</AxlTable.HeaderCell>
                  <AxlTable.HeaderCell style={styles.highlightCell}>Status</AxlTable.HeaderCell>
                  <AxlTable.HeaderCell style={styles.highlightCell}>Remark</AxlTable.HeaderCell>
                  <AxlTable.HeaderCell style={styles.highlightCell}>Blacklist Clients</AxlTable.HeaderCell>
                  <AxlTable.HeaderCell style={styles.highlightCell}>DSP ID</AxlTable.HeaderCell>
                  <AxlTable.HeaderCell>Email</AxlTable.HeaderCell>
                  <AxlTable.HeaderCell>Phone</AxlTable.HeaderCell>
                  <AxlTable.HeaderCell>Vehicle</AxlTable.HeaderCell>
                </AxlTable.Row>
              </AxlTable.Header>
              <AxlTable.Body>{drivers && drivers.map((driver) => this._renderDriver(driver, courier_driver_map, this._isBlacklist(assignment, driver)))}</AxlTable.Body>
            </AxlTable>
          ) : (
            <div style={styles.notFound}>NO DRIVERS MATCHED</div>
          )}
          {this.state.showUnassignDriver && (
            <AxlModal onClose={this.hideUnassignDriver} style={styles.modalStyle} containerStyle={styles.modalContainer}>
              <AssignmentAssign text={`${okText ? _.capitalize(okText) : 'Assign'} ${driverName}`} updateReason={this.updateReason()} updateReasonCode={this.updateReasonCode()} updateBenefit={this.updateField('benefit')} activeTicket={activeTicket} onClose={this.hideUnassignDriver} onClick={this.onSelect} />
            </AxlModal>
          )}
        </div>
        <div style={styles.buttons}>
          <AxlButton compact={true} style={{ width: '150px' }} bg={'red'} onClick={() => this.props.onCancel && this.props.onCancel()}>{`CANCEL`}</AxlButton>
          <TooltipContainer title={isDenied ? PERMISSION_DENIED_TEXT : ''}>
            <AxlButton disabled={!this.state.selectedDriver || blacklisted || isDenied} compact={true} style={{ width: '150px' }} onClick={this.showUnassignDriver}>
              {okTextBtn}
            </AxlButton>
          </TooltipContainer>
        </div>
      </Fragment>
    );
  }
}

export default DriverSearch;
