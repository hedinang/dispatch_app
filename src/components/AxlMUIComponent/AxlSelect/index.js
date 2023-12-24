import React, {useEffect} from 'react';
import {Box, Select, MenuItem, ThemeProvider} from '@material-ui/core';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import {mainTheme} from "./themes";

const mapToTheme = {
  // light: lightTheme,
  main: mainTheme,
};

export default function AxlSelect({
                                    theme = 'main',
                                    ...props
}) {
  const [value, setValue] = React.useState(props.defaultValue);

  const handleChange = ({target: {value}}) => {
    setValue(value);
    if(props.onChange)
      props.onChange(value);
  };

  // useEffect(() => {
  //   props.triggerOnchange(value);
  // });

  return (<ThemeProvider theme={mapToTheme[theme]}>
    <Select
      value={value}
      onChange={handleChange}
      variant="outlined"
      {...props}>
      {props.options.length ? props.options.map((option, index) =>
        <MenuItem key={index} value={option.value}>{option.label}</MenuItem>) : <MenuItem key={0}>{`No value`}</MenuItem>}
    </Select>
  </ThemeProvider>);
}
