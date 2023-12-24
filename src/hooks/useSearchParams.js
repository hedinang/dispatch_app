import React from 'react';
import { useLocation, useHistory } from 'react-router-dom';

export default function useSearchParams() {
  const { search } = useLocation();
  const history = useHistory();

  const searchParams = React.useMemo(() => new URLSearchParams(search), [search]);

  const setSearchParams = React.useCallback((_searchParams) => {
    history.push({ search: _searchParams.toString() });
  }, [history]);

  return [searchParams, setSearchParams];
}
