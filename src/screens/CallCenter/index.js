import React, { Component } from 'react';
import {Route, Switch} from 'react-router-dom';
import CallCenterContainer from "../../containers/CallCenter";
import DispatchScreen from "../Dispatch";

export default class CallCenterScreen extends Component {
  render() {
    return <div>
      <Switch>
        <Route path='/call-center/results' component={CallCenterContainer} />
        <Route path='/call-center' component={DispatchScreen} />
      </Switch>
    </div>
  }
}