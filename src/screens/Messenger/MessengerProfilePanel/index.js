import React from "react";
import moment from "moment";
import {inject, observer} from "mobx-react";
import { AxlModal} from 'axl-reactjs-ui';
// Styles
import styles, * as E from './styles';
// Components
import DriverProfileInformation from "../../../components/DriverProfileInformation";
import DriverProfileRoutingTabs from "../../../components/DriverProfileRoutingTabs";
import _ from 'lodash';
import {TimezoneDefault} from "../../../constants/timezone";

@inject('messengerStore')
@observer
export default class MessengerProfilePanel extends React.Component {

  render() {
    const { messengerStore } = this.props;
    const { topicSelected, assignmentInfoInTopicSelected } = messengerStore;

    if(!assignmentInfoInTopicSelected) return null;

    const driverProps = {
      driver: assignmentInfoInTopicSelected.driver || null
    };
    const clientsProps = {
      driver: assignmentInfoInTopicSelected.driver,
      clients: assignmentInfoInTopicSelected.clients,
      assignment: assignmentInfoInTopicSelected.assignment
    };

    return (topicSelected.ref_type === 'DRIVER_GENERAL_SUPPORT' ? <DriverAvatar {...driverProps} /> : <ClientAvatar {...clientsProps} />);
  }
}

class DriverAvatar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDriverProfile: false
    }
  }

  onShowDriverProfile = () => this.setState({showDriverProfile: true})

  onHideDriverProfile = () => this.setState({showDriverProfile: false})

  render() {
    const { driver } = this.props;
    const { showDriverProfile } = this.state;

    if(!driver) return null;

    const driverData = {
      ...driver
    }

    return <E.ProfileContainer>
      <E.ProfileAvatar>
        <E.DriverProfileImage src={driver.photo || `/assets/images/logo.png`} />
        {(showDriverProfile && driverData) && <AxlModal style={styles.modalDriverProfileContainer} onClose={this.onHideDriverProfile}>
          <DriverProfileInformation driver={driverData} />
          <DriverProfileRoutingTabs driver={driverData} onSave={this.onHideDriverProfile} history={this.props.history} />
        </AxlModal>}
      </E.ProfileAvatar>
      <E.ProfileInfo>
        <E.Title>{`${driver.first_name} ${driver.last_name}`}</E.Title>
        <E.DriverID>{`AHID: ${driver.id}`}</E.DriverID>
      </E.ProfileInfo>
      <div>
        <E.DriverProfileButton onClick={this.onShowDriverProfile}>{`View Driver’s Profile`}</E.DriverProfileButton>
      </div>
    </E.ProfileContainer>
  }
}

class ClientAvatar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDriverProfile: false
    }
  }

  onShowDriverProfile = () => this.setState({showDriverProfile: true})

  onHideDriverProfile = () => this.setState({showDriverProfile: false})

  render() {
    const { driver } = this.props;
    const { showDriverProfile } = this.state;

    if(!driver) return null;

    const driverData = {
      ...driver
    };

    const { clients, assignment } = this.props;

    if(!clients || !driver || !assignment) return null;

    return <E.ProfileContainer>
      <E.ProfileAvatar className={`client-size-${clients.length < 5 ? (clients.length < 0 ? 0 : clients.length) : 4}`}>
        {clients.map((client, id) => {
          if(id > 3) return;

          return <E.ProfileAvatarImage key={id} src={client.logo_url || `/assets/images/logo.png`} />
        })}
      </E.ProfileAvatar>
      <E.ProfileInfo>
        <E.Title>{`${assignment.label} ${moment(assignment.predicted_start_ts).tz(_.defaultTo(assignment.timezone, TimezoneDefault)).format('MM-DD-YYYY')}`}</E.Title>
        <E.DriverID>{`AID: ${assignment.id}`}</E.DriverID>
        <E.SubTitle>
          {`Driver ${driver.first_name} ${driver.last_name}`}
          <E.DriverProfileButton onClick={this.onShowDriverProfile}>{`View Driver’s Profile`}</E.DriverProfileButton>
          {(showDriverProfile && driverData) && <AxlModal style={styles.modalDriverProfileContainer} onClose={this.onHideDriverProfile}>
            <DriverProfileInformation driver={driverData} />
            <DriverProfileRoutingTabs driver={driverData} onSave={this.onHideDriverProfile} history={this.props.history} />
          </AxlModal>}
        </E.SubTitle>
      </E.ProfileInfo>
    </E.ProfileContainer>
  }
}