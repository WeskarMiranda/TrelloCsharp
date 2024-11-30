import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './UserContext'; 
import Home from './components/pages/Home'; 
import Registrar from './components/pages/usuario/Registrar'; 
import Login from './components/pages/usuario/Login'; 
import Dashboard from './components/pages/Dashboard'; 
import CriarTarefa from './components/pages/tarefas/CriarTarefa'; 
import EditarTarefa from './components/pages/tarefas/EditarTarefa';
import CriarCalendario from './components/pages/Calendar/CriarCalendario';
import EditarCalendario from './components/pages/Calendar/EditarCalendario';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Registrar />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-task" element={<CriarTarefa />} />
          <Route path="/task/edit/:id" element={<EditarTarefa />} />
          <Route path="/create-calendar" element={<CriarCalendario />} />
          <Route path="/calendar/edit/:id" element={<EditarCalendario />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
