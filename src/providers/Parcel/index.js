import React, { useReducer } from 'react';
import {
  parcelReducer,
  initialState,
} from './reducer';

export const Context = React.createContext();
const ParcelProvider = (props) => {
  const [state, dispatch] = useReducer(parcelReducer, initialState);
  return (
    <Context.Provider value={{ state, dispatch }}>
      {props.children}
    </Context.Provider>
  );
};

export default ParcelProvider;
