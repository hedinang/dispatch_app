import React, { Fragment, useEffect, useState, useRef, useContext } from 'react'

import { FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

import styles from './styles';
import { Box, CircularProgress } from '@material-ui/core';

const VirtualTableContext = React.createContext({
  top: 0,
  header: <Fragment></Fragment>,
  footer: <Fragment></Fragment>,
})

const LOADING = 1;
const LOADED = 2;
let itemStatusMap = {};

const isItemLoaded = index => !!itemStatusMap[index];
const loadMoreItems = (startIndex, stopIndex) => {
  for (let index = startIndex; index <= stopIndex; index++) {
    itemStatusMap[index] = LOADING;
  }
  return new Promise(resolve =>
    setTimeout(() => {
      for (let index = startIndex; index <= stopIndex; index++) {
        itemStatusMap[index] = LOADED;
      }
      resolve();
    }, 2500)
  );
};

function VirtualTable({
  row,
  header,
  footer,
  dataProps
}) {
  let listRef = useRef({});
  const [top, setTop] = useState(0);
  const {fields, items, renderer} = dataProps;
  useEffect(() => {
    if(listRef && listRef.current) {
      listRef.current.scrollToItem(0)
    }
  }, [items])

  return (
    <VirtualTableContext.Provider value={{ top, header, footer }}>
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={items && items.length}
        loadMoreItems={loadMoreItems}
        threshold={20}
      >
        {({ onItemsRendered, ref }) => (
          <FixedSizeList
            height={500}
            width="100%"
            itemCount={items && items.length}
            itemSize={70}
            itemData={{
              fields,
              items,
              renderer
            }}
            innerElementType={Inner}
            onItemsRendered={(props) => {
              const style =
                listRef.current && (typeof listRef.current._getItemStyle === 'function') &&
                listRef.current._getItemStyle(props.overscanStartIndex)
              setTop((style && style.top) || 0)

              !isItemLoaded && onItemsRendered(props)
            }}
            ref={(el) => {
              listRef.current = el

              if (typeof ref === 'function') ref(el)
            }}
          >
            {row}
          </FixedSizeList>
        )}
      </InfiniteLoader>
    </VirtualTableContext.Provider>
  )
}

function TableRow({ data, index }) {
  const { fields, items, renderer } = data;
  const item = items[index];

  return (
    <tr style={styles.tbody__tr}>
      {fields && fields.map((field) => {
        const name = field && field.name;
        const id = item && item.id;
        let style = {...styles.tbody__td};

        if(field.hightlight) {
          style = {
            ...style,
            ...styles.highlightCell
          }
        }
        return (
          <td style={style} key={`${name}-${ id || index}`} width={field.width || '1em'} height={field.height || '50px'}>
            {
              !renderer[field.name] 
              ? item 
                ? 
                  Array.isArray(item[name]) 
                  ? item[name].map(item => <div>{item}</div>)
                  : item[name]
                : 'Loading...' 
              : renderer[name](item[name], item, items)
            }
          </td>
        )
      }
      )}
    </tr>
  )
}

const Inner = React.forwardRef(
  function Inner({ children, ...rest }, ref) {
    const { header, footer, top } = useContext(VirtualTableContext)
    return (
      <div {...rest} ref={ref}>
        <table style={{ top, position: 'absolute', width: '100%',fontFamily: 'AvenirNext', borderCollapse: 'collapse', tableLayout: 'fixed'}}>
          {header}
          <tbody>{children}</tbody>
          {footer}
        </table>
      </div>
    )
  }
)

function ReactWindowList(props) {
  const {
    store, renderer, allowSelect, disabledIds, pagination, hiddenIfEmpty, header, styles: propStyles,
  } = props;

  const {result, fields, filters, idField, fieldFilterComponents, searching} = store;

  useEffect(() => {
    const {store, baseUrl, keepData, filters} = props;
    if (!keepData) {
      store.reset();
    }

    if (baseUrl) {
      store.setBaseUrl(baseUrl);
    }

    if (filters) {
      store.setFilters(filters);
    }

    store.search();
  }, [])

  return (
    <Box position={'relative'}>
      <VirtualTable
        header={
          <thead style={{ position: 'sticky', top: 0, background: 'white' }}>
            <tr style={styles.thead__tr}>
              {fields && fields.map((field, i) => {
                let style = {...styles.thead__th};
  
                if(field.hightlight) {
                  style = {
                    ...style,
                    ...styles.highlightCell
                  }
                }
                if (field.width) {
                  style = {
                    ...style,
                    width: field.width || '1em',
                  }
                }
                return <th key={i} style={style}>{field && field.label}</th>
              })}
            </tr>
          </thead>
        }
        row={TableRow}
        dataProps={ {
          fields,
          items: result && result.items || [],
          renderer,
        }}
      />
      {searching && <Box display={'flex'} justifyContent={'center'} alignItems={'center'} position={'absolute'} top={70} left={'50%'}><CircularProgress/></Box>}
    </Box>
  )
}

export default ReactWindowList;
