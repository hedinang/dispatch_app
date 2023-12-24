import React, { Component } from 'react';
import {Route, Switch} from 'react-router-dom';

import ScheduleList from '../../containers/ScheduleList/index';
import ScheduleDetail from '../../containers/ScheduleDetail/index'
import ScheduleCreation from '../../containers/ScheduleCreation/index'
import ShiftList from '../../containers/workwhile/ShiftList';
import ShiftDetail from '../../containers/workwhile/ShiftDetail';

class ScheduleScreen extends Component {
    render() {
        return <div>
            <Switch>
                <Route exact path='/schedule' component={ScheduleList}/>
                <Route exact path='/schedule/workwhile' component={ShiftList}/>
                <Route path='/schedule/workwhile/:id' component={ShiftDetail}/>
                <Route exact path='/schedule/new' component={ScheduleCreation}/>
                <Route path='/schedule/:id' component={ScheduleDetail}/>
                <Route path='/schedule/:id/solutions/:solutionId/assignments' component={ScheduleDetail}/>
            </Switch>
        </div>
    }
}

export default ScheduleScreen
