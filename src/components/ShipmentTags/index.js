import React from 'react';
import {inject, observer} from "mobx-react";
import { AxlCheckbox, AxlButton } from 'axl-reactjs-ui';

import styles, * as E from './styles';

@inject('shipmentStore', 'assignmentStore')
@observer
export default class ShipmentTags extends React.Component {
  constructor(props) {
    super(props); 
    this.state = {
      tags: []
    }   
  }

  componentDidMount() {
    const { shipment } = this.props;
    this.setState({tags: shipment.tags ? shipment.tags : []});
  }

  addTag = (e) => {
    const { tags } = this.state;
    const {shipmentStore, assignmentStore, shipment} = this.props;

    shipmentStore.updateTags(shipment, tags, () => {
      // console.log('updated tags');
      // shipmentStore.selectedShipment.tags = tags;
      
    });
  }

  updateTag = (tag) => (e) => {
    const { tags } = this.state;    
    const lcTags = tags.map(t => t.toLowerCase());
    if (lcTags.includes(tag.toLowerCase())) {
      this.setState({tags: tags.filter(t => t.toLowerCase() !== tag.toLowerCase())});
    } else {      
      this.setState({tags: tags.concat([tag])});
    }
  }

  render() {
    const { tagForm, addingTag } = this.props.shipmentStore;
    const { shipment } = this.props;
    const { tags } = this.state;

    const tagValues = [
      { text: 'VIP', value: 'VIP', enable: true },
      { text: 'Flagged', value: 'Flagged', enable: true },
      { text: 'Commercial building', value: 'Commercial', enable: false },
      { text: 'New driver', value: 'New driver', enable: false },
    ];

    const shipmentTags = shipment && shipment.tags ? shipment.tags.map(t => t.toLowerCase()) : null;
    const lcTags = tags.map(t => t.toLowerCase());
    return <E.Container>
      <E.Inner>
        <E.Title>{`Shipment Tags`}</E.Title>
        <E.Row>
          <E.Label>{`Tags:`}</E.Label>
          <E.Col style={styles.col}>
            {tagValues.filter(t => t.enable).map((v, i) => <E.Control key={i} >
              <AxlCheckbox key={i} checked={lcTags && lcTags.includes(v.value.toLowerCase())} disable={!v.enable} onChange={this.updateTag(v.text)} name='tags' value={v.value} theme={`main`} color={`white`}>{v.text}</AxlCheckbox>
            </E.Control>)}
            {tagValues              
              .filter(t => !t.enable)              
              .filter(t => shipmentTags && shipmentTags.includes(t.value.toLowerCase()))
              .map((t, i) => <E.Control key={i} >
              <AxlCheckbox key={i} checked={lcTags && lcTags.includes(t.value.toLowerCase())} disable={true} onChange={this.updateTag(t.value)} name='tags' value={t.value} theme={`main`} color={`white`}>{t.text}</AxlCheckbox>
            </E.Control>)}
            <E.Row>
              <E.Content>
                <AxlButton loading={addingTag} onClick={this.addTag} compact bg={`bluish`}>{`Add Tags`}</AxlButton>
                <AxlButton onClick={() => this.props.onClose && this.props.onClose() } compact bg={`borBluish`}>{`Cancel`}</AxlButton>
              </E.Content>
            </E.Row>
          </E.Col>
        </E.Row>
      </E.Inner>
    </E.Container>
  }
}
