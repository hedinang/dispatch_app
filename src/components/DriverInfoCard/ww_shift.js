import React, { Component } from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';


const Location = ({location}) => <div>
    <h4 style={{marginBottom: 4}}>Location</h4>
    <div>
        {/* <code style={{marginRight: 20, backgroundColor: '#f8f8f8', borderRadius: '3px'}}>{location.id}</code> */}
        { location.name }
    </div>
    <div>
        { location.address.street }, { location.address.city }, { location.address.state } { location.address.zipcode }
    </div>
</div>

const Position = ({position}) => <div>
    <h4 style={{marginBottom: 4}}>Position</h4>
    <div>
        {/* <code style={{marginRight: 20, backgroundColor: '#f8f8f8', borderRadius: '3px'}}>{position.id}</code> */}
        { position.name }
    </div>
</div>

const Duration = ({start, end}) => <div>
    <h4 style={{marginBottom: 4}}>Duration</h4>
    <div style={{display: 'flex'}}>
        <div style={{flex: 1}}>
            Start: { moment(start).format('MM/DD hh:mmA') }
        </div>
        <div style={{flex: 1}}>
            End: { moment(end).format('MM/DD hh:mmA') }
        </div>
    </div>
</div>

const WorkItems = ({items}) => <table style={{width: '100%', borderCollapse: 'collapse'}}>
    <tr>
        <th style={{border: 'solid 1px #ccc', padding: 3}}>Worker ID</th>
        <th style={{border: 'solid 1px #ccc', padding: 3}}>Name</th>
        <th style={{border: 'solid 1px #ccc', padding: 3}}>Phone Number</th>
        <th style={{border: 'solid 1px #ccc', padding: 3}}>Status</th>
    </tr>
    { items.map(item => <tr key={item.id}>
        <td style={{border: 'solid 1px #ccc', padding: 3}}>{ item.worker.id }</td>
        <td style={{border: 'solid 1px #ccc', padding: 3}}>{ item.worker.name }</td>
        <td style={{border: 'solid 1px #ccc', padding: 3}}>{ item.worker.phoneNumber }</td>
        <td style={{border: 'solid 1px #ccc', padding: 3}}>{ item.status }</td>
    </tr>) }
</table>

export default class Shift extends Component {
    render() {
        const { info } = this.props
        const { objects, shift } = info || {}
        const { location, workItems, position, startsAt, endsAt } = shift || {}
        return <div>
            <div><Link to={`/schedule/workwhile/${info.id}`}>View detail</Link></div>
            { startsAt && <Duration start={startsAt} end={endsAt} /> }
            { location && <Location location={location} /> }
            { position && <Position position={position} /> }
            { workItems && <h4 style={{marginBottom: 4}}>{workItems.length} Work Items</h4> }
            { workItems && <WorkItems items={workItems} /> }
        </div>
    }
}