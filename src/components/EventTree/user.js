import React, { Component, Fragment } from 'react'
import {inject, observer} from "mobx-react"
import { AxlModal, AxlButton } from 'axl-reactjs-ui';
import DriverProfileInformation from '../DriverProfileInformation';
import DriverProfileRoutingTabs from '../DriverProfileRoutingTabs';
import styles, * as E from "./styles"
import { texts } from '../../styled-components'

class EventUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
          showUser: false
        }
    }

    onShowUser = () => {
        this.setState({showUser: true});
    }
    onHideUser = () => { this.setState({showUser: false}) }
    
    render() {
        const { o } = this.props
        if (!o)
            return <span></span>
        const { showUser } = this.state;
        const {uid, attributes} = o || {}
        const id = uid.split('_')[1]
        const {name, scopes} = attributes || {}

        return <React.Fragment>
            <span onClick={this.onShowUser} style={{padding: 2, cursor: 'pointer'}} title={`ID: ${id}`}>
                <span style={{color: '#888'}}>User</span> {name || id}
            </span>
            {showUser && <AxlModal style={{ padding: 15}} onClose={this.onHideUser}>
                <div style={{display: 'flex'}}>
                    <div style={{width: 80}}>User</div>
                    <div style={texts.label2}>{name}</div>
                </div>
                <div style={{display: 'flex'}}>
                    <div style={{width: 80}}>ID</div>
                    <div style={texts.label2}>{id}</div>
                </div>
                <div style={{display: 'flex'}}>
                    <div style={{width: 80}}>Roles</div>
                    <div style={texts.label2}>{scopes}</div>
                </div>
                <div style={{textAlign: 'center', marginTop: 15}}>
                    <AxlButton style={{width: 100}} tiny={true} onClick={this.onHideUser}>Close</AxlButton>
                </div>
            </AxlModal>}
        </React.Fragment>
    }
}

export default EventUser;
