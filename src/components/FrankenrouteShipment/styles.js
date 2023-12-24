import {makeStyles} from "@material-ui/core/styles";

export default makeStyles((theme) => ({
  wrapper: {
    fontFamily: 'AvenirNext',
    fontSize: 13,
    backgroundColor: '#f4f3ff',
    padding: theme.spacing(1),
  },
  title: {
    color: '#8d8d8d',
    fontSize: 12,
    marginBottom: theme.spacing(0.5),
  },
  value: {
    color: '#3b3b3b',
    fontFamily: 'AvenirNext-DemiBold',
  },
  error: {
    color: 'red',
    fontStyle: 'italic',
    fontSize: 12,
  }
}));