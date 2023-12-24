import React, { Component } from 'react';
import {inject, Observer, observer} from "mobx-react";
import {AxlButton, AxlInput, AxlModal, AxlSearchBox} from "axl-reactjs-ui";
// import styles from "./styles";

@inject('wwStore')
@observer
class WorkerNeededUpdate extends Component {
    constructor(props) {
        super(props)
        this.state = {
            workersNeeded: props.value || 0
        }
    }

    onAssignmentIdsChange = (e) => {
        this.setState({workersNeeded: e.target.value});
    };

    onUpdateWokerNeeded = () => {
        const { wwStore, onClose } = this.props
        wwStore.updateWorkerNeeded(this.state.workersNeeded).then(() => {
            onClose && onClose()
        })
    }

    onClose = () => {
        this.props.onClose && this.props.onClose()
    }

    render() {
        const { wwStore } = this.props
        const { loadingShift } = wwStore
        return <div>
            <h3>Change worker Needed</h3>
            Enter the number of workers needed for this shift.
            <div>
                <AxlInput type={`number`} value={this.state.workersNeeded} onChange={this.onAssignmentIdsChange} placeholder={`Enter Worker needed`}  />
            </div>
            <div>
                <AxlButton loading={loadingShift} style={{width: 120}} onClick={this.onUpdateWokerNeeded}>Save</AxlButton>
                <AxlButton loading={loadingShift} bg='black' style={{width: 120}} onClick={this.onClose }>Cancel</AxlButton>
            </div>            
        </div>
    }
}

export default WorkerNeededUpdate;
