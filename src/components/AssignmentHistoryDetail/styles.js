export default {
  container: {},
  title: {
    fontSize: 20,
    marginTop: 15,
    marginBottom: 15,
    textAlign: 'center'
  },
  items: {
    position: 'relative',
    fontSize: '13px',
    lineHeight: '13px',
    fontWeight: '300',
    padding: '10px 0px',
    width: '95%',
    margin: '0px auto'
  },
  item: {
    position: 'relative',
    margin: '10px 0px',
    paddingLeft: '45px',
    textAlign: 'left'
  },
  car: {
    position: 'absolute',
    top: '0px',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    marginLeft: '1px',
    background: 'rgb(233, 240, 245)',
    border: '2px solid rgb(60, 165, 107)',
    display: 'flex',
    color: 'rgb(60, 165, 107)',
    left: 0
  },
  innerCar: {
    display: 'flex',
    width: '32px',
    height: '32px',
    position: 'relative',
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center'
  },
  inner: {
    position: 'relative'
  },
  info: {},
  notes: {
    width: '98%',
    backgroundColor: 'rgb(247, 247, 247)',
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 3px 0px',
    marginTop: '1em',
    marginBottom: '1em',
    lineHeight: 1.6,
    padding: '0.5em 1em',
    border: '1px solid rgb(199, 216, 222)',
    borderRadius: '3px'
  },
  text: {
    color: '#41484a',
    marginBottom: 3
  },
  line: {
    position: 'absolute',
    top: '20px',
    height: 'calc(100% - 100px)',
    width: '2px',
    background: 'rgb(160, 178, 184)',
    left: '16px'
  },
  clear: {
    clear: 'both',
    display: 'table'
  }
}
