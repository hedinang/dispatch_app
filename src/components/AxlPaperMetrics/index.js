import React from 'react'
import AxlPaper from '../Paper'

function AxlPaperMetrics({title, subTitle, children}) {
  return (
    <AxlPaper title={title} subTitle={subTitle} 
        styles={
            {
                subTitle: {
                    fontStyle: 'italic',
                    fontSize: '13.5px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                },
                title: {
                    display: 'flex',
                    justifyContent: 'flex-start',
                    marginBottom: '8px'
                },
                root: {
                    width: '100%',
                },
                mainContent: {
                    padding: '0 15px'
                }
        }
    }>
        {children}
    </AxlPaper>
  )
}

export default AxlPaperMetrics