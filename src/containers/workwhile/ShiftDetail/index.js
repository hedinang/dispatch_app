import React, { Component } from 'react';
import { AxlTable, AxlButton, AxlLoading, AxlModal, AxlInput } from 'axl-reactjs-ui';
import DriverProfileInformation from '../../../components/DriverProfileInformation';
import DriverProfileRoutingTabs from '../../../components/DriverProfileRoutingTabs';
import styles from './styles';
import Moment from 'react-moment';
import moment from "moment-timezone";
import WorkerNeededUpdate from './worker_needed';
import LinkDriverDialog from './link_driver';

import { inject, observer } from 'mobx-react';
import { Link, withRouter } from "react-router-dom";
@inject('wwStore')
@observer
class ShiftDetail extends Component {
    constructor(props) {
        super(props)
        this.state = {
            showDriverProfile: false,
            driverData: null,
            assignmentIds: null,
            addingAssignment: false,
            showingPositionAbout: false,
            udpatingWorkerNeeded: false,
            linkingDriver: false,
            linkingWorkerId: null,
        }
    }
    componentDidMount() {
        const { wwStore, match } = this.props
        const { params } = match || {};
        const { id } = params || {}
        wwStore.getShift(id)
    }

    onToggleShowPositionAbout = () => {
        this.setState({showingPositionAbout: !this.state.showingPositionAbout})
    }

    goback = () => {
        const { history } = this.props
        history.push('/schedule/workwhile')
    }

    showDriver = (d) => {
        this.setState({
            showDriverProfile: true,
            driverData: d
        })
    }

    onHideDriverProfile = () => {
        this.setState({
            showDriverProfile: false,
            driverData: null
        })
    }

    onStartLinkingDriver = (worker) => {
        this.setState({
            linkingDriver: true,
            linkingWorker: worker
        })
    }

    onLikingDriverDone = (data) => {
        this.setState({
            linkingDriver: false,
            linkingWorkerId: null
        })

        if (data) {
            const { wwStore } = this.props
            wwStore.refreshShift()
        }
    }

    onStartUpdatingWorkerNeeded = () => {
        this.setState({
            udpatingWorkerNeeded: true,
        })
    }

    onStopUpdatingWorkerNeeded = () => {
        this.setState({
            udpatingWorkerNeeded: false,
        })
    }

    onStartAddingAssignment = () => {
        this.setState({
            addingAssignment: true,
            assignmentIds: null
        })
    }

    onStopAddingAssignment = () => {
        this.setState({
            addingAssignment: false,
            assignmentIds: null
        })
    }

    onAddAssignment = () => {
        const { wwStore } = this.props
        const {assignmentIds} = this.state
        wwStore.addAssignment(assignmentIds.split(',').map(a => parseInt(a))).then(r => {
            if (r) this.onStopAddingAssignment()
        })
    }

    onAssignmentIdsChange = (e) => {
        this.setState({assignmentIds: e.target.value});
    };

    render() {
        const { wwStore } = this.props
        const { currentShift } = wwStore
        const { shift, assignments } = currentShift || {}
        const { location, position, workItems, workersNeeded, loadingShift } = shift || {}
        return <div>
            <div>
                <AxlButton style={{ width: '200px' }} onClick={this.goback}>Back</AxlButton>
            </div>
            { loadingShift && <div><AxlLoading /></div>}
            <div style={{ ...styles.container }}>
            { shift && <div>
                <div style={styles.header}>Workwhile Shift Info</div>
                <div>ID: {shift.id}</div>
                <div>Start: <Moment interval={0} format={'MMM DD, hh:mm A'}>{shift.startsAt}</Moment></div>
                <div>End: <Moment interval={0} format={'MMM DD, hh:mm A'}>{shift.endsAt}</Moment></div>
                <div>Worker Needed: <span style={{cursor: 'pointer'}} onClick={this.onStartUpdatingWorkerNeeded}>{workersNeeded}</span> <span style={{marginLeft: 20}}>Booked: {workItems ? workItems.length : 0}</span></div>
                <div>Payment: ${shift.payLumpSum}</div>
            </div>}
            { location && <div>
                <div style={styles.header}>Location</div>
                <div>{ location.name } - {location.address.street}, {location.address.city}, {location.address.state} {location.address.zip}</div>
            </div> }
            { position && <div>
                <div style={styles.header}>Position</div>
                <div>{ position.name } <span onClick={this.onToggleShowPositionAbout} style={{cursor: 'pointer', fontWeight: 300, fontSize: '0.9em', color: '#336'}}>({this.state.showingPositionAbout ? 'Hide' : 'Show'} Detail)</span></div>
                { this.state.showingPositionAbout && <div style={{marginTop: 5, color: '#444', fontWeight: 300, fontSize: '0.9em', lineHeight: 1.5}}>{position.about}</div> }
            </div> }
            <div style={{display: 'flex', marginTop: 20}}>
                <div style={{flex: 3}}>
                    <div style={styles.header}>Workers</div>
                    { workItems && <div style={{minWidth: 400}}>
                        <AxlTable>
                            <AxlTable.Header>
                                <AxlTable.Row>
                                    <AxlTable.HeaderCell>ID</AxlTable.HeaderCell>
                                    <AxlTable.HeaderCell>Name</AxlTable.HeaderCell>
                                    <AxlTable.HeaderCell>Phone Number</AxlTable.HeaderCell>
                                    <AxlTable.HeaderCell>AxleHire Account</AxlTable.HeaderCell>
                                    <AxlTable.HeaderCell>Status</AxlTable.HeaderCell>
                                </AxlTable.Row>
                            </AxlTable.Header>
                            <AxlTable.Body>
                                { workItems.map(item => <AxlTable.Row key={item.id}>
                                    <AxlTable.Cell>{item.worker.id}</AxlTable.Cell>
                                    <AxlTable.Cell>{item.worker.name}</AxlTable.Cell>
                                    <AxlTable.Cell>{item.worker.phoneNumber}</AxlTable.Cell>
                                    <AxlTable.Cell>
                                        { item.driver && <span onClick={() => this.showDriver(item.driver)} style={{cursor: 'pointer'}}>{item.worker.internal_id}</span>}
                                        <span style={{fontSize: '0.9em', color: '#338', cursor: 'pointer', marginLeft: 10}} onClick={() => this.onStartLinkingDriver(item.worker)}>(Link)</span>
                                    </AxlTable.Cell>
                                    <AxlTable.Cell>
                                        {item.status}
                                    </AxlTable.Cell>
                                </AxlTable.Row>)}
                            </AxlTable.Body>
                        </AxlTable>
                        </div>
                    }
                </div>
                <div style={{marginLeft: 10, flex: 2}}>
                    <div style={styles.header}>Assignments <AxlButton onClick={this.onStartAddingAssignment} tiny>Add Assignment</AxlButton></div>
                    { (!assignments || assignments.length < 1) &&<div>No Assignment</div> }
                    { assignments && assignments.length > 0 && <div style={{minWidth: 200}}>
                        <AxlTable>
                        <AxlTable.Header>
                            <AxlTable.Row>
                                <AxlTable.HeaderCell>ID</AxlTable.HeaderCell>
                                <AxlTable.HeaderCell>Label</AxlTable.HeaderCell>
                                <AxlTable.HeaderCell>Shipment</AxlTable.HeaderCell>
                                <AxlTable.HeaderCell>Driver</AxlTable.HeaderCell>
                                <AxlTable.HeaderCell>Status</AxlTable.HeaderCell>
                                <AxlTable.HeaderCell></AxlTable.HeaderCell>
                            </AxlTable.Row>
                        </AxlTable.Header>
                        <AxlTable.Body>
                            { assignments.map(item => <AxlTable.Row key={item.id}>
                                <AxlTable.Cell>{item.id}</AxlTable.Cell>
                                <AxlTable.Cell>{item.label}</AxlTable.Cell>
                                <AxlTable.Cell>{item.shipment_count}</AxlTable.Cell>
                                <AxlTable.Cell>{item.driver_id}</AxlTable.Cell>
                                <AxlTable.Cell>{item.status}</AxlTable.Cell>
                                <AxlTable.Cell><Link target={'_blank'} to={`/routes/today/${item.region_code}/0/${item.id}`} >OPEN</Link></AxlTable.Cell>
                            </AxlTable.Row>)}
                        </AxlTable.Body>
                    </AxlTable>
                    </div>}
                </div>
            </div>
            </div>

            {this.state.showDriverProfile && <AxlModal style={styles.modalDriverProfileContainer} onClose={this.onHideDriverProfile}>
                <DriverProfileInformation driver={this.state.driverData} />
                <DriverProfileRoutingTabs driver={this.state.driverData} onSave={this.onHideDriverProfile} />
            </AxlModal>}

            {this.state.addingAssignment && <AxlModal style={styles.modalDriverProfileContainer} onClose={this.onStopAddingAssignment}>
                <h3>Add Assignments</h3>
                Enter Assignment Ids to add to this shift.
                <div>
                    <AxlInput type={`text`} value={this.state.assignmentIds} onChange={this.onAssignmentIdsChange} onEnter={this.getShipment}  placeholder={`Enter Assignment ID`} style={styles.search} />
                </div>
                <div>
                    <AxlButton style={{width: 120}} onClick={this.onAddAssignment}>Add</AxlButton>
                    <AxlButton bg='black' style={{width: 120}} onClick={this.onStopAddingAssignment}>Cancel</AxlButton>
                </div>
            </AxlModal>}

            {this.state.udpatingWorkerNeeded && <AxlModal style={styles.modalDriverProfileContainer} onClose={this.onStopUpdatingWorkerNeeded}>
                <WorkerNeededUpdate onClose={this.onStopUpdatingWorkerNeeded} value={workersNeeded} />
            </AxlModal>}
            {this.state.linkingDriver && <AxlModal style={styles.modalDriverProfileContainer} onClose={this.onLikingDriverDone}>
                <LinkDriverDialog onClose={this.onLikingDriverDone} worker={this.state.linkingWorker} />
            </AxlModal>}

        </div>
    }
}

export default withRouter(ShiftDetail)
