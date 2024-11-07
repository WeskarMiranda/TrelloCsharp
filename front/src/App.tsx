import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './UserContext'; 
import Home from './components/pages/Home'; 
import Registrar from './components/pages/usuario/Registrar'; 
import Login from './components/pages/usuario/Login'; 
import Dashboard from './components/pages/Dashboard'; 
import CriarTarefa from './components/pages/tarefas/CriarTarefa'; 
import EditarTarefa from './components/pages/tarefas/EditarTarefa';

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
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
