import React, { Component } from 'react';
import {inject, Observer, observer} from "mobx-react";
import {AxlButton, AxlInput, AxlModal, AxlSearchBox} from "axl-reactjs-ui";
// import styles from "./styles";

@inject('wwStore')
@observer
class LinkDriverDialog extends Component {
    constructor(props) {
        super(props)
        this.state = {
            driverId: props.driverId
        }
    }

    onDriverIdChange = (e) => {
        this.setState({driverId: e.target.value});
    };

    onLinkDriver = () => {
        const { wwStore, onClose, worker } = this.props
        wwStore.linkDriver(worker.id, this.state.driverId).then((d) => {
            onClose && onClose(d)
        })
    }

    onClose = () => {
        this.props.onClose && this.props.onClose()
    }

    render() {
        const { wwStore, worker } = this.props
        const { loadingShift } = wwStore
        return <div>
            <h3>Link Workwhile worker to AxleHire Driver Account</h3>
            Enter driver id to link with WorkWhile worker {worker.name}
            <div style={{margin: 15}}>
                <AxlInput type={`number`} value={this.state.driverId} onChange={this.onDriverIdChange} placeholder={`Enter Driver Id`}  />
            </div>
            <div>
                <AxlButton loading={loadingShift} style={{width: 120}} onClick={this.onLinkDriver}>Save</AxlButton>
                <AxlButton loading={loadingShift} bg='black' style={{width: 120}} onClick={this.onClose }>Cancel</AxlButton>
            </div>            
        </div>
    }
}

export default LinkDriverDialog;
