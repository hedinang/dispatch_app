import React from 'react';
import {AbandondedList} from "../../components/AbandonedList";
import {Link} from "react-router-dom";

export default class CallCenterAbandondedScreen extends React.Component {
  render() {
    const renderer = {
      id: (v, item) => <span>{console.log(v, item)}</span>,
    };
    return(<AbandondedList pagination renderer={renderer} apiType={'post'} />);
  }
}