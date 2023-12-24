import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { AxlSearchBox, AxlMiniAssignmentBox, AxlMiniGroupAssignments, AxlLoading } from 'axl-reactjs-ui';
import moment from 'moment'
import { withRouter } from 'react-router-dom';
import CheckCircle from '@material-ui/icons/CheckCircle';
import CheckCircleOutline from '@material-ui/icons/CheckCircleOutline';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import _ from 'lodash';
import Tune from '@material-ui/icons/Tune';

// Utils

// Components

// Styles
import AxlButton from '../../components/AxlMUIComponent/AxlButton';
import { Menu, MenuItem, IconButton } from '@material-ui/core';

const statuses = ['all', 'unassigned', 'pending', 'picking_up', 'inactive', 'at_risk', 'in_progress', 'completed']

@inject('assignmentStore')
@observer
export default class AssignmentListFilter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      anchorEl: null
    }
    this.toggleStatus = this.toggleStatus.bind(this)
  }

  componentDidMount() {
    const { assignmentStore } = this.props;
    const { hidden } = assignmentStore;
    statuses.map((item) => {
      if(hidden[item] === undefined) {
        hidden[item] = false;
      }
    });
  }
  

  handleClick = (event) => {
    this.setState({anchorEl: event.currentTarget})
  };

  handleClose = () => {
    this.setState({anchorEl: null})
  };

  toggleStatus(status) {
    const { assignmentStore } = this.props
    const { hidden } =assignmentStore
    const checked = !hidden[status]
    assignmentStore.setHidden(status, checked)

    if(status === "all") {
      assignmentStore.setHiddenAll(checked);
    } else {
      const isAll = {};
      statuses.map((item) => item !== "all" && (isAll[item] = false));

      const tempHidden = {...hidden};
      delete tempHidden.all;

      assignmentStore.setHidden("all", !_.isEqual(isAll, tempHidden));
    }
  }
  
  render() {
    const { assignmentStore } = this.props
    const { hidden } = assignmentStore
  
    return <div>
      <IconButton
        aria-controls="customized-menu"
        onClick={this.handleClick}
        size='small'
      >
        <CheckCircleOutline fontSize='small' />
      </IconButton>
      {/* <AxlButton onClick={this.handleClick} compact={true} tiny={true} icon={true} spacing={0} padding={'4px 4px'}><Tune /></AxlButton> */}
      <Menu
        id="simple-menu"
        anchorEl={this.state.anchorEl}
        keepMounted
        open={Boolean(this.state.anchorEl)}
        onClose={this.handleClose}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <MenuItem>Assignment Status</MenuItem>
        { statuses.map(status => (
          <MenuItem key={status} onClick={() => this.toggleStatus(status)}>
            { hidden[status] ? <CheckBoxOutlineBlankIcon fontSize='small' /> : <CheckCircle color='secondary' fontSize='small' /> }
            <span style={{marginLeft: 8}}>{ status.toUpperCase().replace('_', ' ') }</span>
          </MenuItem>
        ))}
      </Menu>
  </div>
  }
}