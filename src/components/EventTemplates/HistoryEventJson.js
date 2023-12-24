import { Box, Dialog, Link } from '@material-ui/core'
import React from 'react'

function HistoryEventJson({ isShowModal, handleToggleModal, event, originViewMode, onViewMode, setOriginViewMode }) {
  return (
    <Dialog open={isShowModal} onClose={() => {
      handleToggleModal(false);
      setOriginViewMode(true);
    }}>
      <Box style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }} p={2}>
        <pre style={{ padding: 10, margin: 0, whiteSpace: 'pre-wrap', backgroundColor: '#f0f0f0', maxWidth:'500px' }}>
          {JSON.stringify(event, null, 2)}
        </pre>
        <Box display={'flex'} justifyContent={'flex-end'} mt={2} width={'100%'}>
          <Link 
            component="button"
            onClick={() => onViewMode(event.id)}>{originViewMode ? 'Convert' : 'Back origin'}</Link>
        </Box>
      </Box>
    </Dialog>
  )
}

export default HistoryEventJson