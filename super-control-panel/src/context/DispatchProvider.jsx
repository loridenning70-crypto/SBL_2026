import { createContext, useContext, useState, useEffect } from 'react';
import { getAllResponsesForRunId, getAllRuns } from '../utils/supabase';

const DispatchContext = createContext();

export const useDispatch = () => {
  return useContext(DispatchContext);
}

export default function DispatchProvider({ children, runId }) {
  const [dispatch, setDispatch] = useState({});

  useEffect(() => {
    const init = async () => {
      const { data } = await getAllResponsesForRunId(runId);

      const dispatch = {}
      for (const response of data) {
        const phaseKey = response.prompt_id.prompt_id
        if (!dispatch[phaseKey]) dispatch[phaseKey] = []
        dispatch[phaseKey].push(response)
      }
      setDispatch(dispatch);
    }
    if (runId) init();
  }, [runId]);

  return (
    <DispatchContext.Provider value={{ dispatch, setDispatch }}>
      {children}
    </DispatchContext.Provider>
  );
}