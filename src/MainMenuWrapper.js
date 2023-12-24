import React, { Component } from 'react';

import { withRouter } from 'react-router-dom'

class MainMenuWrapper extends Component {
  constructor(props) {
    super(props)
    props.stores.lnfStore.setCurrentPath(props.location.pathname)
  }

  componentWillReceiveProps(props) {
    const { location } = props
    this.props.stores.lnfStore.setCurrentPath(location.pathname)
  }

  render() {
    return <div />
  }
}

export default withRouter(MainMenuWrapper)
