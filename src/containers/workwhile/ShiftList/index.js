import React, { Component } from 'react';
import { AxlTable, AxlButton, AxlPagination } from 'axl-reactjs-ui';
import styles from './styles';
import Moment from 'react-moment';
import moment from "moment-timezone";

import { inject, observer } from 'mobx-react';
import { Link } from "react-router-dom";
import AxlSelect from '../../../components/AxlMUIComponent/AxlSelect';
@inject('wwStore')
@observer
class ShiftList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            currentPage: 1,
        }
    }

    componentDidMount() {
        const { wwStore } = this.props
        const search = window.location.search;
        const params = new URLSearchParams(search);
        const page = params.get('page')
        const warehouseId = params.get('warehouse')
        console.log(warehouseId)
        const currentPage = page ? parseInt(page) : 1
        if (warehouseId)
            wwStore.selectWarehouse(parseInt(warehouseId))
        
        wwStore.getActiveShifts(currentPage)
        wwStore.getLocations()
    }

    onSelectPage = (page) => {
        const { wwStore, history, location } = this.props
        this.setState({currentPage: page})
        wwStore.getActiveShifts(page)
        history.push({
            search: "?" + new URLSearchParams(wwStore.searchQuery).toString()
        })
    }

    onSelectItem = (item) => {
        const { wwStore, history, location } = this.props
        history.push(`${location.pathname}/${item.id}`)
    }

    onSelectWarehouse = (e) => {
        const { wwStore, history } = this.props
        wwStore.selectWarehouse(e.target.value)
        wwStore.getActiveShifts(1)
        history.push({
            search: "?" + new URLSearchParams(wwStore.searchQuery).toString()
        })
}

    render() {
        const { wwStore } = this.props
        const { activeShifts, locations, warehouseId } = wwStore
        const { items, total, limit } = activeShifts || {}
        const pageCount = limit && total ? Math.floor((total + limit - 1) / limit) : 0
        const locationOptions = [{label: 'Select a warehouse', value: ''}, ...locations.filter(l => l.warehouse_id).map(l => Object.assign({}, {label: l.location.name, value: l.warehouse_id}))]
        return <div style={{ ...styles.container }}>
            <div style={{textAlign: 'left'}}>
                <Link to="/schedule/new" style={{ textDecoration: 'none' }}><AxlButton style={{ width: '200px' }}>New Schedule</AxlButton></Link>
                <div style={{display: 'inline-block', margin: 10, width: 240}}>
                <AxlSelect style={{backgroundColor: 'white'}} options={locationOptions} name='type' onChange={this.onSelectWarehouse} value={warehouseId} />
                </div>
            </div>
            <div style={styles.list} className={'momentumScroll'}>
                <AxlTable>
                    <AxlTable.Header>
                        <AxlTable.Row>
                            <AxlTable.HeaderCell>Location</AxlTable.HeaderCell>
                            <AxlTable.HeaderCell>Address</AxlTable.HeaderCell>
                            {/* <AxlTable.HeaderCell>Position</AxlTable.HeaderCell> */}
                            <AxlTable.HeaderCell>Start</AxlTable.HeaderCell>
                            <AxlTable.HeaderCell>End</AxlTable.HeaderCell>
                            <AxlTable.HeaderCell>Worker Needed</AxlTable.HeaderCell>
                            <AxlTable.HeaderCell>Pay</AxlTable.HeaderCell>
                            <AxlTable.HeaderCell># Routes</AxlTable.HeaderCell>
                            <AxlTable.HeaderCell>Booked</AxlTable.HeaderCell>
                            <AxlTable.HeaderCell></AxlTable.HeaderCell>
                        </AxlTable.Row>
                    </AxlTable.Header>
                    <AxlTable.Body>
                        {items && items.map(item => <AxlTable.Row key={items.shift.id} onClick={() => this.onSelectItem(item)}>
                            <AxlTable.Cell>{item.shift.location.name}</AxlTable.Cell>
                            <AxlTable.Cell>
                                <div>{item.shift.location.address.street}</div>
                                <div>{item.shift.location.address.city}, {item.shift.location.address.state} {item.shift.location.address.zip}</div>
                            </AxlTable.Cell>
                            {/* <AxlTable.Cell>{item.shift.position.name}</AxlTable.Cell> */}
                            <AxlTable.Cell><Moment interval={0} format={'MMM DD, hh:mm A'}>{item.shift.startsAt}</Moment></AxlTable.Cell>
                            <AxlTable.Cell><Moment interval={0} format={'MMM DD, hh:mm A'}>{item.shift.endsAt}</Moment></AxlTable.Cell>
                            <AxlTable.Cell>{item.shift.workersNeeded}</AxlTable.Cell>
                            <AxlTable.Cell>${item.shift.payLumpSum}</AxlTable.Cell>
                            <AxlTable.Cell>{item.objects ? item.objects.length : 0}</AxlTable.Cell>
                            <AxlTable.Cell>{item.shift.workItems ? item.shift.workItems.length : 0}</AxlTable.Cell>
                            <AxlTable.Cell>

                            </AxlTable.Cell>
                        </AxlTable.Row>)}
                    </AxlTable.Body>
                </AxlTable>
                {items && pageCount > 1 && <div style={{ textAlign: 'center', margin: 15 }}>
                    <AxlPagination onSelect={this.onSelectPage} current={this.state.currentPage} total={pageCount}></AxlPagination>
                </div>}
            </div>
        </div>
    }
}

export default ShiftList
