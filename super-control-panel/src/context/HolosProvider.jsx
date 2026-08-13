import { createContext, useContext, useState, useEffect } from 'react';
import { getAllRuns } from '../utils/supabase';

const HolosContext = createContext();

export const useHolos = () => {
  return useContext(HolosContext);
}

export default function HolosProvider({ children }) {
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    const init = async () => {
      const data = await getAllRuns();
      if (data) {
        setRuns(data);
      }
    }
    init()
  }, []);

  return (
    <HolosContext.Provider value={{ runs, setRuns }}>
      {children}
    </HolosContext.Provider>
  );
}