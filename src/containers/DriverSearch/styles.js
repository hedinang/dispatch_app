export default {
    container: {
        position: 'absolute',
        overflow: 'auto',
        top: '54px',
        bottom: '60px',
        left: '8px',
        right: '8px',
    },
    buttons: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        textAlign: 'center',
        height: '60px',
        backgroundColor: '#fff'
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        textAlign: 'center',
        height: '54px',
        padding: '8px',
        boxSizing: 'border-box'
    },
    highlightCell: {
        backgroundColor: 'rgba(136, 127, 255, 0.1)'
    },
    selected: {
        backgroundColor: '#b2d4f5'
    },
    suspended: {
        textDecoration: 'line-through',
        backgroundColor: 'lightgray'
    },
    blacklisted: {
        textDecoration: 'line-through',
        backgroundColor: '#d1001c'
    },
    warning: {
        backgroundColor: '#fde8d4',
    },
    notFound: {
        textAlign: 'center',
        padding: 20,
        color: '#aaa'
    },
    dsp: {
        backgroundColor: 'rgba(74, 188, 78, 0.2)',
    }
}