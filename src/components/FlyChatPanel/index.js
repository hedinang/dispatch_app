import React, { Component } from 'react';

import styles, * as E from './styles';

export default class FlyChatPanel extends Component {
  render() {
    return <E.Container nofly={this.props.nofly} style={this.props.styleContainer}>{this.props.children}</E.Container>;
  }
}