import React, { Component } from 'react';
import { AxlPagination, AxlSearchBox, AxlButton, AxlDateInput, AxlReselect } from 'axl-reactjs-ui';
import styles, * as E from './styles';
import SearchResults from './SearchResults';
import SearchResultDetail from './SearchResultDetail';
import OverallSearchFilter from '../../containers/OverallSearchFilter/index'
import queryString from 'query-string';

import { inject, observer } from 'mobx-react';
import moment from "moment";

@inject('shipmentStore')
@observer
class SearchScreen extends Component {
    constructor(props) {
        super(props)
        const { shipmentStore } = this.props
        this.state = {
            q: shipmentStore.filter.q,
            isShowDatetimePicker: false,
        }
        this.handleChange = this.handleChange.bind(this)
        this.onSearch = this.onSearch.bind(this)
        this.onKeyPress = this.onKeyPress.bind(this)
        this.onSearch();
    }

    handleChange(event) {
        this.setState({q: event});
    }

    onSearch() {
        const { shipmentStore } = this.props
        shipmentStore.search(this.state.q)
    }

    onKeyPress(event) {
        if (event.key === 'Enter') {
            this.onSearch()
        }
    }

    onSelectPage(page) {
        const { shipmentStore } = this.props
        shipmentStore.selectResultPage(page)
    }

    setRegions(r) {
        alert('Not implemented yet!')
    }

    setTime(r) {
      const { shipmentStore } = this.props
      if (!r || r.length < 1)
        shipmentStore.setTimeRange('all')
       else if (typeof r === 'object')
        shipmentStore.setTimeRange(r.value)
      else
        shipmentStore.setTimeRange(r[0].value)

      // Show datetime picker
      if((r && typeof r === 'object') && r.value === 'custom') {
        this.setState({isShowDatetimePicker: true});
      } else {
        this.setState({isShowDatetimePicker: false});
      }
    }

    setDate(d) {
      const { shipmentStore } = this.props
      if(d) {
        shipmentStore.setDate(d)
      } else {
        shipmentStore.setDate(null)
      }
    }

    render() {
        const options3 = [
            { label: 'ALL', value: 'all' },
            { label: 'TODAY', value: 'today' },
            { label: 'PAST', value: 'past' },
            { label: 'FUTURE', value: 'future' },
            { label: 'CUSTOM', value: 'custom' },
        ]
        const { shipmentStore } = this.props
        const { shipmentSearchResult, isShowingDetail, loadingSearchResult, timeRange } = shipmentStore;

        return (<div style={styles.container}>
            <div style={styles.topHeader}>
              <OverallSearchFilter />
            </div>
            <E.SearchBar>
                <AxlReselect
                    defaultValue={ options3.filter(a => a.value === timeRange)[0]}
                    placeholder="SEARCH FOR ..."
                    isSearchable={false}
                    isLoading={false}
                    isClearable={true}
                    options={options3}
                    onChange={(v) => this.setTime(v)}
                    isMulti={false}
                />
                {this.state.isShowDatetimePicker && <E.DatePickerContainer>
                  <AxlDateInput
                    theme={'secondary'}
                    onChange = { (d) => this.setDate(d) }
                    options={{
                      // maxDate: 'today',
                      defaultValue: shipmentStore.start,
                      defaultDate: 'today',
                      dateFormat: 'MMMM DD, YYYY',
                      placeHolder: 'today',
                      enableTime: false,
                      altInput: true,
                      clickOpens: false,
                    }}
                  />
                </E.DatePickerContainer>}
                <E.SearchInput><AxlSearchBox style={{width: '100%', height: '46px'}} defaultValue={this.state.q} onChange={ this.handleChange } onEnter={ this.onSearch } /></E.SearchInput>
                <E.SearchButton><AxlButton onClick={this.onSearch} bg={'periwinkle'} style={styles.searchButton} loading={loadingSearchResult} >Search</AxlButton></E.SearchButton>
            </E.SearchBar>
            { !isShowingDetail && <SearchResults loading={loadingSearchResult} /> }
            { isShowingDetail && <SearchResultDetail /> }
            <AxlPagination onSelect = { this.onSelectPage.bind(this) } current={shipmentSearchResult.page} total={shipmentSearchResult.total_pages}></AxlPagination>
        </div>)
    }
}

export default SearchScreen;
