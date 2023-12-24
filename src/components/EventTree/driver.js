import React, { Component, Fragment } from 'react'
import {inject, observer} from "mobx-react"
import { AxlModal } from 'axl-reactjs-ui';
import DriverProfileInformation from '../DriverProfileInformation';
import DriverProfileRoutingTabs from '../DriverProfileRoutingTabs';
import styles, * as E from "./styles"

@inject('driverStore')
class EventDriver extends Component {
    constructor(props) {
        super(props);
        this.state = {
          driverData: {},
          showDriverProfile: false
        }
        this.onShowDriverProfile = this.onShowDriverProfile.bind(this);
        this.onHideDriverProfile = this.onHideDriverProfile.bind(this)
    }

    onShowDriverProfile = (driver) => {
        const that = this;

        if (this.state.driverData && this.state.driverData.id) {
            this.setState({showDriverProfile: true});
            return;
        }
    
        if(driver) {
            this.props.driverStore.get(driver, function(res) {
                if(res.status === 200) {
                    that.setState({driverData: res.data, showDriverProfile: true});
                }
            });
        }
    }
    onHideDriverProfile = () => { this.setState({showDriverProfile: false}) }
    
    render() {
        const { o, id } = this.props
        if (!o)
            return <span></span>
        const { showDriverProfile, driverData } = this.state;
        const name = o.attributes && o.attributes.name ? o.attributes.name : ''

        return <React.Fragment>
            <span onClick={() => this.onShowDriverProfile(id)} style={{padding: 2, cursor: 'pointer'}} title={`ID: ${id}`}>
                <span style={{color: '#888'}}>Driver</span> {name || id}
            </span>
            {(showDriverProfile && driverData) && <AxlModal style={styles.modalDriverProfileContainer} onClose={this.onHideDriverProfile}>
                <DriverProfileInformation driver={driverData} />
                <DriverProfileRoutingTabs driver={driverData} onSave={this.onHideDriverProfile} history={this.props.history} />
              </AxlModal>}
        </React.Fragment>
    }
}

export default EventDriver;
