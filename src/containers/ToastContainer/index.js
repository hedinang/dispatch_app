import React, {useEffect, useState} from 'react';
import {Box, Grid} from "@material-ui/core";
import AxlTable from "../../components/AxlMUIComponent/AxlTable";
import schema from "./schema";
import AxlMUIInput from "../../components/AxlMUIComponent/AxMUIInput";
import AxlMUISearchBox from "../../components/AxlMUIComponent/AxlMUISearchBox";
import moment from "moment-timezone";
import AxlButton from "../../components/AxlMUIComponent/AxlButton";
import AxlMUIModal from "../../components/AxlMUIComponent/AxlMUIModal";
import ToastForm from "./form";
import {inject} from "mobx-react";
import {observable, observe} from "mobx";
import _ from 'lodash';

@inject('toastStore')
export default class ToastContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: null,
      loading: false,
      close: {},
      query: {
        page_number: 1,
        page_size: 20,
      },
      result: {
        count: 0,
        page: 0,
        size: 1,
        items: [],
      },
    }
  }

  componentDidMount() {
    this.getList();
  }

  orderByHandle = (name) => {
    console.log(name)
  }

  onUpdate = (data) => {
    this.setState({loading: true});
    const _data = {
      ...data,
      cause: {
        uid: data.cause,
      },
      subject: {
        uid: data.subject,
      }
    };
    this.props.toastStore.update(data.id, _data).then(res => {
      if(res.ok && res.status === 200) {
        this.setState({
          close: {
            edit: true
          },
          loading: false,
        });
        this.getList();
      } else {
        this.setState({loading: false});
      }
    });
  }

  getList = (query = this.state.query) => {
    if(!query) return;

    this.props.toastStore.getList(query).then(res => {
      if(res.ok && res.status === 200) {
        this.setState({
          result: {
            ...res.data,
            count: res.data.total,
            items: res.data.items.map(data => ({
              ...data,
              cause: _.get(data, 'cause.uid'),
              subject: _.get(data, 'subject.uid'),
            }))
          }
        })
      } else {
        this.setState({result: _.assign({}, this.state.result, {items: []})});
      }
    })
  }

  onSearch = ({keyCode}) => {
    if(keyCode === 13) {
      const query = _.assign({}, this.state.query, {q: this.state.text});
      this.getList(query);
    }
  };

  onChange = ({target: {value}}) => {
    this.setState({text: value});
  };

  onClear = () => {
    const query = _.assign({}, this.state.query, {q: ''});
    this.setState({text: ''}, () => this.getList(query));
  }

  onChangePage = (object, number) => {
    const query = _.assign({}, this.state.query, {page_number: number});
    this.setState({query: query}, () => {
      this.getList(query);
    });
  }

  rerender = {
    created_ts: (value, item, result) => moment(item.created_ts).format('DD/MM/YYYY'),
    start_ts: (value, item, result) => moment(item.start_ts).format('DD/MM/YYYY'),
    end_ts: (value, item, result) => moment(item.end_ts).format('DD/MM/YYYY'),
    actions: (value, item, result) => <Grid container spacing={1}>
      <Grid item>
        <AxlMUIModal
          isClose={this.state.close['edit']}
          onRendered={() => this.setState({close: {edit: false}})}
          trigger={<AxlButton
            bgcolor={'primary.main'} color={'primary.white'}
            padding={'5px 10px'} spacing={0}>{`Edit`}</AxlButton>}>
          <ToastForm onClose={() => this.setState({close: {edit: true}})} data={item} onUpdate={this.onUpdate} loading={this.state.loading}/>
        </AxlMUIModal>
      </Grid>
      {/*<Grid item><AxlButton*/}
      {/*  bgcolor={'primary.redSecond'} color={'primary.white'}*/}
      {/*  padding={'5px 10px'} spacing={0}>{`Delete`}</AxlButton></Grid>*/}
    </Grid>
  }

  render() {
    const {fields} = schema['DEFAULT'];

    const selectItemHandle = (item) => {}

    const removeItemHandle = (item) => {}
    console.log(this.state.result)
    return <Box>
      <Box my={1}>
        <AxlMUISearchBox value={this.state.text} onChange={this.onChange} onKeyDown={this.onSearch} onClear={this.onClear} />
      </Box>
      <AxlTable theme={'main'} fields={fields} page={this.state.query.page_number} result={this.state.result} orderBy={this.orderByHandle} rerender={this.rerender} onChange={this.onChangePage} />
    </Box>
  }
}