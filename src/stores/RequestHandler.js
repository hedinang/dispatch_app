import { observable, action } from 'mobx';

class RequestErrorHandler {
  constructor() {}

  @observable errors = [];

  @action
  error = (data) => {
    this.errors.push(data);
  };

  @action
  clearErrors = () => {
    this.errors = [];
  };
}

export default RequestErrorHandler;
