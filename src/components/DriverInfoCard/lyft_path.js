import React, { Component } from 'react';

const Orders = ({items}) => <table style={{width: '100%', borderCollapse: 'collapse'}}>
    <tr>
        <th style={{border: 'solid 1px #ccc', padding: 3}}>Shipment Id</th>
        <th style={{border: 'solid 1px #ccc', padding: 3}}>Label</th>
        <th style={{border: 'solid 1px #ccc', padding: 3}}>Delivery Order ID</th>
    </tr>
    { items.map(item => <tr key={item.id}>
        <td style={{border: 'solid 1px #ccc', padding: 3}}>{ item.package_external_id.split('_')[1] }</td>
        <td style={{border: 'solid 1px #ccc', padding: 3}}>{ item.label ? item.label.driver_label : ''}</td>
        <td style={{border: 'solid 1px #ccc', padding: 3}}>{ item.delivery_order_id }</td>
    </tr>) }
</table>

export default class DeliveryPath extends Component {
    render() {
        const { info, labels } = this.props
        const { delivery_orders } = info || {}
        let labelMap = {}
        if (labels) {
            labels.map(l => {
                labelMap['SH_' + l.shipment_id] = l
            })
        }
        const orders = delivery_orders ? delivery_orders.map(o => Object.assign({}, o, {label: labelMap[o.package_external_id]})) : []
        return <div>
            { delivery_orders && <h4 style={{marginBottom: 4}}>{delivery_orders.length} Orders</h4> }
            { delivery_orders && <Orders items={orders} /> }
        </div>
    }
}