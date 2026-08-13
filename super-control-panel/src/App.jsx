import { useState } from 'react'

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import HolosProvider from './context/HolosProvider';
import ModalProvider from './context/ModalProvider';
import { colors } from './utils/colors'

import DispatchLanding from './DispatchLanding';
import Dispatch from './Dispatch';
import Nothing from './Nothing';
import Landing from './Landing';
import Panel from './Panel';
import Runs from './Runs';

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <HolosProvider>
      <Router>
        <ModalProvider>
          <Routes>
            <Route path="/" element={<Runs />} />
            <Route path="/dispatch" element={<DispatchLanding />}>
              <Route index element={<Nothing label="You cannot execute prompts until a run is created" />} />
              <Route path=":runId" element={<Dispatch />} />
            </Route>
            <Route path="/run/:runId" element={<Landing />}>
              <Route index element={<Nothing label="Select a run and character to view details" />} />
              <Route path=":characterId" element={<Panel />} />
            </Route>
          </Routes>
        </ModalProvider>
      </Router>
    </HolosProvider>
  )
}
