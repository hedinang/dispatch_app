import React, { Component } from 'react';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import { AxlModal, AxlButton } from 'axl-reactjs-ui';
import PropTypes from 'prop-types';

import DriverProfileInformation from '../DriverProfileInformation';
import DriverProfileRoutingTabs from '../DriverProfileRoutingTabs';
import styles, * as E from './styles';
import { HistoryList } from '../ShipmentHistoryList/HistoryList';
import { getEventAssignments } from '../../stores/api';
import { EVENT_TEMPLATE_OWNERS, EVENT_TEMPLATE_TARGETS } from '../../constants/eventTemplate';
import { getDotColor } from '../../Utils/events';

const getKey = (event) => (event.category || '') + '.' + (event.type || '') + '.' + (event.action || '');
const eventInclude = ['SHIPMENT.PLANNING.un-route', 'STOP.POD.remove', 'SHIPMENT.INBOUND.lock'];
@inject('historyStore', 'driverStore')
@observer
class HistoryListComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      driverData: {},
      showDriverProfile: false,
    };
    this.onShowDriverProfile = this.onShowDriverProfile.bind(this);
  }

  onShowDriverProfile = (driver) => {
    const that = this;

    if (driver && driver.id) {
      this.props.driverStore.get(driver.id, function(res) {
        if (res.status === 200) {
          that.setState({ driverData: res.data, showDriverProfile: true });
        }
      });
    }
  };

  onHideDriverProfile = () => {
    this.setState({ showDriverProfile: false });
  };

  render() {
    const { viewDispatch, isShowTitle = true, disableScroll, closePanel, selectedAssignment } = this.props;
    const { showDriverProfile, driverData } = this.state;

    if (!selectedAssignment) return null;

    const label = selectedAssignment && selectedAssignment.assignment && selectedAssignment.assignment.label;
    return (
      <div style={styles.container}>
        {isShowTitle && (
          <div style={styles.title}>
            <E.Title>{`Assignment ${label} - History`}</E.Title>
            {closePanel && <AxlButton bg={`gray`} compact ico={{ className: 'fa fa-times' }} onClick={closePanel} style={{ marginLeft: 'auto' }} />}
            {viewDispatch && (
              <E.ViewDispatchButton>
                <AxlButton tiny bg={`gray`} onClick={() => this.props.history.push(`/routes/2019-12-31/all/all/185164`)}>{`View in Dispatch`}</AxlButton>
              </E.ViewDispatchButton>
            )}
          </div>
        )}
          <div
            style={
              !disableScroll
                ? styles.items
                : {
                    ...styles.items,
                    overflowY: 'hidden',
                  }
            }
          >
            <div style={styles.innerItems}>
              <div style={styles.line}></div>
              <HistoryList 
                getEventList={getEventAssignments} 
                isSearch={false} 
                historyId={selectedAssignment.assignment && selectedAssignment.assignment.id}
                targets={[EVENT_TEMPLATE_TARGETS.DISPATCHER_APP]}
                owners={[EVENT_TEMPLATE_OWNERS.ASSIGNMENT]}
                getDotColor={getDotColor}
                filterEvent={(e) => e.category === 'ASSIGNMENT' || eventInclude.includes(getKey(e))}
              />
            </div>
          </div>
        {showDriverProfile && driverData && (
          <AxlModal style={styles.modalDriverProfileContainer} onClose={this.onHideDriverProfile}>
            <DriverProfileInformation driver={driverData} />
            <DriverProfileRoutingTabs driver={driverData} onSave={this.onHideDriverProfile} history={this.props.history} />
          </AxlModal>
        )}
      </div>
    );
  }
}

export { HistoryListComponent };

HistoryListComponent.propTypes = {
  viewDispatch: PropTypes.bool,
};

HistoryListComponent.defaultProps = {
  viewDispatch: false,
};
