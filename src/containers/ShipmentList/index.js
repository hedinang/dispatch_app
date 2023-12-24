import React, { Component } from 'react';
import { AxlSearchBox, AxlMiniStopBox } from 'axl-reactjs-ui';
import styles from './styles';
import { inject, observer } from 'mobx-react';
import { IconButton, Box } from '@material-ui/core';
import CloseOutlined from '@material-ui/icons/ArrowLeftTwoTone';
import Tag from '../../components/Driver/Tag';
import moment from 'moment-timezone';

const updatedAdressAssignmentDays = 2;

@inject('assignmentStore', 'shipmentStore')
@observer
class ShipmentList extends Component {
    selectStop(stop) {
        this.props.onSelectStop && this.props.onSelectStop(stop)
    }

    updateTimer = null

    componentDidMount() {
        const { assignmentStore } = this.props;
        assignmentStore.filter = "";
        this.updateTimer = setInterval(() => {
            const { assignmentStore } = this.props
            assignmentStore.ping()
        }, 10000)
    }

    componentWillUnmount() {
        if (!this.updateTimer) {
            clearInterval(this.updateTimer)
        }
    }

    changeSearch = (v) => {
        const { assignmentStore } = this.props;
        assignmentStore.filter = v;
    };

    updatedAddressTag = () => {
        return <div style={{ position: 'absolute', top: -6, right: 10, zIndex: 1, width: '103px' }}>
            <Tag>{['Updated Address']}</Tag>
        </div>
    }

    render() {
        const { assignmentStore, shipmentStore, onClose } = this.props
        const { filteredShowingStops, selectedAssignment } = assignmentStore
        const {selectedShipmentAssignment} = shipmentStore
        const { selectedStopId } = shipmentStore;
        const showCloseBtn = onClose ? true : false
        const selectedAddressAssignment = selectedAssignment || selectedShipmentAssignment
        const isExpiredUpdatedAddress =  moment.tz(selectedAddressAssignment && selectedAddressAssignment.assignment.predicted_start_ts, moment.tz.guess()) < moment().subtract(updatedAdressAssignmentDays, "days")

        return (<div style={{ ...styles.container, ...this.style }}>
            <div style={styles.search}>
                {showCloseBtn && <div style={{ width: 32, paddingTop: 4, marginLeft: -8 }}>
                    <IconButton
                        aria-controls="customized-menu"
                        onClick={onClose}
                        size='small'
                    >
                        <CloseOutlined fontSize='small' />
                    </IconButton>
                </div>}
                <div style={{ flex: 1 }}>
                    <AxlSearchBox placeholder='Search Shipment' style={{ width: '100%' }} theme={`periwinkle`} onChange={this.changeSearch} />
                </div>
            </div>
            <div style={styles.list} className={'momentumScroll'}>
                {filteredShowingStops && filteredShowingStops.filter(s => !!s.shipment && s._deleted != true).map((stop) => {
                    const tags = stop && stop.shipment && stop.shipment.tags ? stop.shipment.tags.map((tag, i) => {
                        return {
                            text: <span style={styles.text}>{`${tag}`}</span>,
                            value: i
                        };
                    }) : [];
                    const updatedAddressMap = selectedAddressAssignment.updatedAddressMap[stop.shipment_id]
                    return <Box position='relative' data-testid="shipment-list-item">
                        {updatedAddressMap && updatedAddressMap.length > 0 && !isExpiredUpdatedAddress && this.updatedAddressTag()}
                        <AxlMiniStopBox onClick={() => this.selectStop(stop)}
                            key={stop.id}
                            style={{ opacity: !selectedStopId || selectedStopId === stop.id ? 1.0 : 0.5 }}
                            stop={stop}
                            tags={tags} />
                    </Box>
                })}
            </div>
        </div>)
    }
}

export default ShipmentList;
