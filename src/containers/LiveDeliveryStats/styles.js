export const Statuses = {
  default: '#bebfc0',
  early: '#a5ccec',
  late: '#8447f6',
  unassigned: '#bebfc0',
  pending: '#fa6725',
  in_progress: '#fbc04f',
  succeeded: '#66b752',
  failed: '#d63031',
  missing: '#222',
  damaged: '#FF7F00',
  lost: '#a000b0'
}

export default {
    container: {
        position: 'relative',
        overflow: 'auto',
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '4px',
        minWidth: '500px',
        minHeight: '460px',
        margin: '4px',
    },
    header: {
      fontSize: '26px',
      cursor: 'pointer'
    }
}
