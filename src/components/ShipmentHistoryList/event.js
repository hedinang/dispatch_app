import React, { Component, Fragment } from 'react';
import { inject } from 'mobx-react';
import styles, * as E from '../HistoryList/styles';
import DriverProfileInformation from '../DriverProfileInformation';
import DriverProfileRoutingTabs from '../DriverProfileRoutingTabs';
import { AxlModal } from 'axl-reactjs-ui';

import { EVENT_OBJECT_TYPES } from '../../constants/event';

@inject('driverStore')
class EventObject extends Component {
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

    if (driver) {
      this.props.driverStore.get(driver, function(res) {
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
    const { obj } = this.props;
    if (!obj) return <span></span>;

    const { uid } = obj;
    const type = uid ? EVENT_OBJECT_TYPES[uid.split('_')[0]] : '';
    const object_id = uid.split('_')[1];
    const { showDriverProfile, driverData } = this.state;
    const name = obj.attributes && obj.attributes.name ? obj.attributes.name : '';
    if (type === 'Driver')
      return (
        <Fragment>
          <E.DriverLink onClick={() => this.onShowDriverProfile(object_id)}>
            {type} <strong style={styles.strong}>{name}</strong> [{object_id}]
          </E.DriverLink>
          {showDriverProfile && driverData && (
            <AxlModal style={styles.modalDriverProfileContainer} onClose={this.onHideDriverProfile}>
              <DriverProfileInformation driver={driverData} />
              <DriverProfileRoutingTabs driver={driverData} onSave={this.onHideDriverProfile} history={this.props.history} />
            </AxlModal>
          )}
        </Fragment>
      );
    return (
      <span>
        {type} <strong style={styles.strong}>{name}</strong> [{object_id}]
      </span>
    );
  }
}

export default EventObject;
