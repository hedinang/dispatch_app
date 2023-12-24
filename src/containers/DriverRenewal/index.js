import React from 'react';
import {Box} from "@material-ui/core";
import AxlTable from "../../components/AxlMUIComponent/AxlTable";
import schema from "./schema";
import AxlMUIInput from "../../components/AxlMUIComponent/AxMUIInput";
import AxlMUISearchBox from "../../components/AxlMUIComponent/AxlMUISearchBox";

export default function DriverRenewal() {
  const result = {
    count: 3,
    size: 10,
    items: [
      {id: 1, name: '1'},
      {id: 2, name: '2'},
      {id: 3, name: '3'},
      {id: 4, name: '4'},
      {id: 5, name: '5'},
      {id: 6, name: '6'},
      {id: 7, name: '7'},
      {id: 8, name: '8'},
      {id: 9, name: '9'},
      {id: 10, name: '10'},
    ]
  };
  const {fields} = schema['DEFAULT'];

  const orderByHandle = (name) => {
    console.log(name)
  }

  return <Box>
    <Box>
      <AxlMUISearchBox />
    </Box>
    <AxlTable theme={'main'} fields={fields} result={result} orderBy={orderByHandle} />
  </Box>
}