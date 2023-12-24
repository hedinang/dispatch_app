export default {
  container: {
    backgroundColor: '#ffcfd1',
    borderRadius: '-8px',
    maxWidth: '300px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '16px',
    marginBottom: '16px',
    padding: '12px 16px',
    position: 'relative',
    fontSize: '13px',
    fontWeight: 'bold',
    mask: "radial-gradient(circle at 0 0, #000 var(--r, 16px), transparent 0)"
  },
  cornerTL: {
    width: '18px',
    height: '18px',
    position: 'absolute',
    top: '0px',
    left: '0px',
    background: "radial-gradient(circle at 0 0, white var(--r, 18px), transparent 0)"
  },
  cornerTR: {
    width: '18px',
    height: '18px',
    position: 'absolute',
    top: '0px',
    right: '0px',
    background: "radial-gradient(circle at 100% 0, white var(--r, 18px), transparent 0)"
  },
  cornerBL: {
    width: '18px',
    height: '18px',
    position: 'absolute',
    bottom: '0px',
    left: '0px',
    background: "radial-gradient(circle at 0 100%, white var(--r, 18px), transparent 0)"
  },
  cornerBR: {
    width: '18px',
    height: '18px',
    position: 'absolute',
    bottom: '0px',
    right: '0px',
    background: "radial-gradient(circle at 100% 100%, white var(--r, 18px), transparent 0)"
  },
  innerContainer: {
    borderRadius: '16px',
    border: 'solid 2px #ff9997',
    padding: '20px 12px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  name: {
    flex: 1,
    textAlign: 'left',
    color: '#111',
    fontWeight: '500',
    fontSize: '18px'
  },
  pickupTime:{
    width: '80px',
    padding: '12px 10px',
    backgroundColor: '#f7f6ff',
    borderRadius: '10px',
    textAlign: 'center',
    color: '#4a4a4a',
    fontSize: '18px',
    fontWeight: '400',
  },
  label: {
    color: '#848484',
    fontWeight: '500',
    fontSize: '12px',
    paddingBottom: '8px'
  },
}
