import { get } from 'lodash';
import { observable, action, toJS } from 'mobx';

class ObjectListStore {
  DEFAULT = {
    baseUrl: "",
    fields: [""],
    fieldFilterComponents: [],
    filters: {
      page: 1,
      size: 20,
      order_by: "id",
      desc: true
    },
    result: {
      count: 0,
      items: [],
      total_pages: 0
    },
    listField: "items",
    idField: "id"
  };

  constructor(api) {
    this.api = api;
  }

  @action setType(type) {
    if (this[type]) {
      this.type = type;
      this.setData(this[type]);
    }
  }

  @action reset() {
    if (this.type) {
      this.setType(this.type);
    } else {
      this.setData(this.DEFAULT);
    }
  }

  @action setData(data) {
    if (data) {
      if (data.fields) {
        this.fields = data.fields;
      }

      if (data.fieldFilterComponents) {
        this.fieldFilterComponents = data.fieldFilterComponents;
      }

      if (data.filters) {
        this.filters = data.filters;
      }

      if (data.result) {
        this.result = data.result;
      }

      if (data.baseUrl) {
        this.baseUrl = data.baseUrl;
      }

      if (data.listField) {
        this.listField = data.listField;
      }

      if (data.idField) {
        this.idField = data.idField;
      }

      if (data.processResult) {
        this.processResult = data.processResult;
      }
    }
  }

  baseUrl;
  processResult;
  type;
  @observable fields;
  @observable filters;
  @observable selectedItems = [];
  @observable result = {
    count: 0
  };

  @observable listField = 'items';

  @observable searching = false;

  setBaseUrl = (baseUrl) => {
    this.baseUrl = baseUrl;
  };

  getStore(type) {
    return type ? this[type] : this;
  }

  @action
  selectItem = (item) => (e) => {
    this.selectedItems.push(item[this.idField]);
  };

  @action
  setFilter = (name, value) => {
    this.filters[name] = value;
  };

  @action
  setFieldFilterComponents = (data) => {
    const newFilterComponents = Object.assign({}, this.fieldFilterComponents, data);
    this.fieldFilterComponents = newFilterComponents;
  };

  @action
  setFilters = (data) => {
    const newFilters = Object.assign({}, this.filters, data);
    this.filters = newFilters;
  };

  @action removeFilter = (name) => {
    if (this.filters[name]) {
      delete this.filters[name];
    }
  };

  @action setPage = (page) => {
    this.filters[page] = page;
  };

  @action setSize = (size) => {
    this.filters[size] = size;
  };

  @action
  toggleOrder = (field) => (e) => {
    if (this.filters.order_by === field) {
      this.filters.desc = !this.filters.desc;
    } else {
      this.filters.order_by = field;
      this.filters.desc = true;
    }

    this.search();
  };

  @action
  toggleStaticOrder = (field) => (e) => {
    if (this.filters.order_by === field) {
      this.filters.desc = !this.filters.desc;
    } else {
      this.filters.order_by = field;
      this.filters.desc = true;
    }

    const orderBy = this.filters.order_by;

    if (this.filters.desc) {
      this.result.items = this.result.items.slice().sort((a, b) => {
        const left = get(a, orderBy, '');
        const right = get(b, orderBy, '');

        if (left == right) return 0;
        return left > right ? 1 : -1;
      })
    } else {
      this.result.items = this.result.items.slice().sort((b, a) => {
        const left = get(a, orderBy, '');
        const right = get(b, orderBy, '');

        if (left == right) return 0;
        return left > right ? 1 : -1;
      });
    }
  };

  @action
  search = (cb) => {
    this.searching = true;
    this.selectedItems = [];
    const filters = toJS(this.filters);

    if (filters.page && filters.page > 0) {
      filters.page = filters.page - 1;
    }

    this.api.get(this.baseUrl, filters)
      .then(response => {
        this.searching = false;
        if (response.status === 200) {
          if (this.processResult) {
            this.processResult(response.data, this);
          }
          else {
            if (Array.isArray(response.data)) {
              this.result = {
                items: response.data,
                count: response.data.length,
                total_pages: 1
              }
            } else {
              let result = {
                items: response.data[this.listField],
                count: response.data.count ? response.data.count : response.data[this.listField].length,
                total_pages: response.data.count && this.filters.size ? Math.ceil(response.data.count / this.filters.size) : 1
              }

              this.result = {...response.data, ...result};
            }

            this.result.data = response.data;
          }

          if(cb) cb(response);
        }
      })
  };

  @action directAddItems(items) {
    if (!this.result) {
      this.result = {
        items: items,
        count: items.length,
        total_pages: 1
      }
    } else {
      const newItems = this.result.items.slice().concat(items);
      this.result = {
        items: newItems,
        count: newItems.length,
        total_pages: this.result.total_pages ? this.result.total_pages : 1
      }
    }
  }

  @action addItems(items, id) {
    if (!this.result) {
      this.result = {
        items: items,
        count: items.length,
        total_pages: 1
      }
    } else {
      const mapItem = this.result.items.reduce(function(map, obj) {
        map[obj[id]] = obj;
        return map;
      }, {});
      // need to add more
      const addedItems = items.filter(item => !mapItem[item[id]]);

      const newItems = this.result.items.slice().concat(addedItems);
      this.result = {
        items: newItems,
        count: newItems.length,
        total_pages: this.result.total_pages ? this.result.total_pages : 1
      }
    }
  }

  @action directRemoveItem(item) {
    if (this.result) {
      const items = this.result.items.slice().filter(i => i[this.idField] !== item[this.idField]);
      this.result = {
        items: items,
        count: items.length,
        total_pages: this.result.total_pages ? this.result.total_pages : 1
      }
    }
  }

  isSelected = (item) => {
    return this.selectedItems.includes(item[this.idField]);
  }
}

export default ObjectListStore;
