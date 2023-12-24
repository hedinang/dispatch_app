import FilterListIcon from '@material-ui/icons/FilterList';
import { AxlPagination, AxlTable } from 'axl-reactjs-ui';
import { toJS } from "mobx";
import { observer } from "mobx-react";
import React, { Component, Fragment } from 'react';

import styles from "./styles";

@observer
class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndexes: []
    };
  }

  componentDidMount() {
    const {store, baseUrl, keepData, filters} = this.props;
    if (!keepData) {
      store.reset();
    }

    if (baseUrl) {
      store.setBaseUrl(baseUrl);
    }

    if (filters) {
      store.setFilters(filters);
    }

    store.search();
  }

  selectItem = (item) => (e) => {

    const {multipleSelect, store} = this.props;

    if (!store) return null;
    const {result, idField} = store;

    const {selectedIndexes, prevBatch} = this.state;
    const inSelectedIndex = store.selectedItems.indexOf(item[store.idField]);
    const isShift = e.shiftKey;
    const currentIndex = result.items.indexOf(item);

    if (isShift) {
      if (selectedIndexes.length > 0 && multipleSelect) {
        const lastSelectedIndex = selectedIndexes[selectedIndexes.length - 1];

        const allIds = toJS(result.items.map(i => i[idField]));
        let tobeAddIds = [];
        if (currentIndex > lastSelectedIndex) {
          tobeAddIds = allIds.slice(lastSelectedIndex, currentIndex + 1);
        } else {
          tobeAddIds = allIds.slice(currentIndex, lastSelectedIndex + 1);
        }

        if (prevBatch && prevBatch.selectedIndex && prevBatch.selectedIndex === lastSelectedIndex) {
          store.selectedItems = store.selectedItems.filter(id => !prevBatch.addedIds.includes(id));
        }

        tobeAddIds = tobeAddIds.filter(id => !store.selectedItems.includes(id));

        store.selectedItems = store.selectedItems
          .concat(tobeAddIds);

        this.setState({prevBatch: {
          selectedIndex: lastSelectedIndex,
          addedIds: tobeAddIds
        }});
      } else {
        this.setState({selectedIndexes: selectedIndexes.concat([currentIndex])});
        if (multipleSelect) {
          store.selectedItems.push(item[store.idField]);
        } else {
          store.selectedItems = [item[store.idField]];
        }
      }
    } else {
      if (inSelectedIndex >= 0) {
        store.selectedItems.splice(inSelectedIndex, 1);
        // remove prev shift index
        this.setState({selectedIndexes: selectedIndexes.splice(selectedIndexes.indexOf(currentIndex), 1)});
      } else {
        this.setState({selectedIndexes: selectedIndexes.concat([currentIndex])});
        if (multipleSelect) {
          store.selectedItems.push(item[store.idField]);
        } else {
          store.selectedItems = [item[store.idField]];
        }
      }
    }
  };

  onSelectPage = (page) => {
    const {store} = this.props;

    store.filters.page = page;
    store.search();
  };

  render() {
    const {
      store, renderer, allowSelect, disabledIds, pagination, hiddenIfEmpty, header, styles: propStyles, dataTestId
    } = this.props;

    const {result, fields, filters, idField, fieldFilterComponents} = store;

    if (hiddenIfEmpty && (!result || !result.items || result.items.length < 1)) {
      return null;
    }

    return <Fragment>
      {header && header}
      <div style={styles.list} data-testid={`list-${dataTestId}`}>
        <AxlTable style={styles.tableStyle}>
          <AxlTable.Header>
            <AxlTable.Row>
              {fields && fields.map((field, i) => {
                const props = Object.assign({}, field);
                props['filters'] = filters;
                if (fieldFilterComponents && fieldFilterComponents[field.name]) {
                  props['filterComponent'] = fieldFilterComponents[field.name]['component']
                  props['resetFilter'] = fieldFilterComponents[field.name]['resetFilter']
                }
                props['store'] = store
                return <List.HeaderCell key={i} {...props}></List.HeaderCell>
              })}
            </AxlTable.Row>
          </AxlTable.Header>
          <AxlTable.Body>
            {result && result.items && result.items.length > 0 &&
            result.items.map((item, index) => {
                const style = {};
                const isDisabled = disabledIds && disabledIds.length > 0 && disabledIds.includes(item[idField]);
                if (isDisabled) {
                  Object.assign(style, styles.disabledCell)
                }
                else if (store.isSelected(item, index)) Object.assign(style, styles.selected);

                const props = {style};
                if (allowSelect && !isDisabled) {
                  Object.assign(style, {cursor: 'pointer'});
                  props['onClick'] = this.selectItem(item, index)
                }

                return <AxlTable.Row key={`row-${index}`} {...props}>
                  {fields.map((field, i2) => {
                      const style = {};
                      if (field.hightlight) Object.assign(style, styles.highlightCell);
                      if (field.nowrap) Object.assign(style, styles.nowrap);
                      if (propStyles && propStyles.td) Object.assign(style, propStyles.td);
                      return <AxlTable.Cell key={`field_${index}${i2}`} style={style}>
                        {!renderer[field.name] ? item[field.name] : renderer[field.name](item[field.name], item, result)}
                      </AxlTable.Cell>
                    }
                  )}
                </AxlTable.Row>
              }
            )}
          </AxlTable.Body>
        </AxlTable>
      </div>
      {pagination && result.total_pages > 1 && <div style={{textAlign: 'center'}}>
        <AxlPagination onSelect = {this.onSelectPage} current={filters.page} total={result.total_pages}></AxlPagination>
      </div>}
    </Fragment>
  }

  static HeaderCell = class extends Component {
    constructor(props) {
      super(props);
      this.state = {
        display: false
      };
    }

    render() {
      const {label, filters, orderField, hightlight, nowrap, toggleOrder, filterComponent, resetFilter, name, store} = this.props;

      const props = {};
      // style
      const style = {};
      if (hightlight) Object.assign(style, styles.highlightCell);
      if (nowrap) Object.assign(style, styles.nowrap);
      if (filterComponent) Object.assign(style, {height: 50, minWidth:160});
      props['style'] = style;

      if (orderField) {
        props['isActive'] = filters && filters.order_by === orderField;
        props['up'] = !(filters && filters.desc);
        if (toggleOrder) props['onClick'] = toggleOrder(orderField);
      }
      const FilterComponent = () => {return filterComponent}

      const handleDisplayFilter = () => {
        const filterSelected = filters[name] && (filters[name].length || Object.keys(filters[name]).length > 0 || filters[name] > 0)
        if (this.state.display && filterSelected) {
          resetFilter()
          store.filters = {...store.filters, [name]: []}
          store.search();
        }
        this.setState({display: !this.state.display})
      }

      return <AxlTable.HeaderCell {...props}>
              {label}
              {filterComponent && (
                  <FilterListIcon onClick={handleDisplayFilter} style={{cursor:'pointer', position:'absolute', top:25, 
                                                                            color: this.state.display ? '#887fff':''}}/>
              )}
              {filterComponent && this.state.display && (
                <div style={{position:'absolute', width:'100%', zIndex:10}}>
                  <FilterComponent />
                </div>
              )}
            </AxlTable.HeaderCell>
    }
  }
}

export default List;
