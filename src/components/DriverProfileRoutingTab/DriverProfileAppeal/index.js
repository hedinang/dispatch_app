import React from 'react';
import {Box, List, ListItem, Grid} from "@material-ui/core";
import {inject} from "mobx-react";
import {observable, observe} from "mobx";
import AxlTable from "../../AxlMUIComponent/AxlTable";
import schema from "./schema";
import moment from "moment";
import _ from 'lodash';

@inject('appealStore')
export default class DriverProfileAppeal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appeals: {
        count: 0,
        size: 1,
        page: 1,
        items: []
      },
      query: {
        size: 5,
        page: 1,
        driver_id: _.get(props, 'driver.id'),
      }
    };
  }

  componentDidMount() {
    this.getList();
  }

  getList = (query = this.state.query) => {
    this.props.appealStore.getList(query).then(res => {
      if(res.ok && res.status === 200) {
        this.setState({
          appeals: {
            size: 5,
            page: 1,
            items: res.data.items,
            count: res.data.total,
          }
        })
      }
    })
  }

  onChange = (subject, number) => {
    this.setState({
      appeals: _.assign({}, this.state.appeals, {page: number}),
      query: _.assign({}, this.state.query, {page: number}),
    }, () => {
      this.getList();
    });
    // const query = _.assign({}, this.state.query, {offset: number - 1});
  }

  rerender = {
    created_ts: (value, item, result) => moment(item.created_ts).format('MM/DD/YYYY HH:mmA'),
    updated_ts: (value, item, result) => moment(item.updated_ts).format('MM/DD/YYYY HH:mmA'),
  }

  render() {
    const {fields} = schema['DEFAULT'];

    return <Box>
      <AxlTable theme={'main'} page={this.state.query.page} result={this.state.appeals} fields={fields} rerender={this.rerender} onChange={this.onChange} />
    </Box>
  }
}