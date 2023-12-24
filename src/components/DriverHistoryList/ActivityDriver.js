import React, { PureComponent } from 'react';
import moment from 'moment-timezone';

// Styles
import styles, { Container, Inner, List, Item, Circle, Date, Text } from './styles';
/*

activities: [
  {
        "category": "ASSIGNMENT",
        "type": "PLANNING",
        "action": "book",
        "ts": 1576487829621,
        "assignment_label": "AC",
        "assignment_id": 184765
  }
]
*/
export default class ActivityDriver extends PureComponent {
  getActivity(action, assignLabel, assignId) {
    let result = '';
    if(action === 'book') {
      result = `Driver booked assignment ${assignLabel} (${assignId})`
    } else if (action ==='un-book') {
      result = `Driver un-booked assignment ${assignLabel} (${assignId})`
    }

    return result;
  }

  render() {
    const { action } = styles;
    let events = this.props.activities || [];

    return <Container>
      <Inner>
        <List>
          { events.map((h,i) => {
            return <Item key={i}>
              <Circle  style={{backgroundColor: action[h.action]}}/>
              <Text>{this.getActivity(h.action, h.assignment_label, h.assignment_id)}</Text>
              <Date>{moment.tz(h.ts, moment.tz.guess()).format('dddd M/D/YYYY - HH:mm:ss a z')}</Date>
            </Item>
          })}
        </List>
      </Inner>
    </Container>
  }
}
