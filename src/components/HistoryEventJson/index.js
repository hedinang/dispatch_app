import { Box, Dialog } from '@material-ui/core'
import React from 'react'

function HistoryEventJson({isShowModal, handleToggleModal, event}) {
  return (
    <Dialog open={isShowModal} onClose={() => handleToggleModal(false)}>
        <Box p={2}>
            <pre style={{padding: 10, margin: 0, whiteSpace: 'pre-wrap', backgroundColor: '#f0f0f0'}}>
                {JSON.stringify(event, null, 2)}
            </pre>
        </Box>
    </Dialog>
  )
}

export default HistoryEventJson