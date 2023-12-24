import React, { Component } from 'react';
import { Styles } from 'axl-reactjs-ui';
import { inject, observer } from 'mobx-react';
import DriverRegistrationList from '../../containers/DriverRegistrationList/index'

class DriverRegistrationScreen extends Component {
    render() {
        return <div>
            <DriverRegistrationList />
        </div>
    }
}

export default DriverRegistrationScreen
