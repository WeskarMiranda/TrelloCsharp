import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './UserContext'; 
import Home from './components/pages/Home'; 
import RegisterForm from './components/pages/Registrar'; 
import LoginForm from './components/pages/Login'; 
import Dashboard from './components/pages/Dashboard'; 
import CreateTaskForm from './components/pages/CriarTarefa'; 
import EditTask from './components/pages/EditarTarefa';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-task" element={<CreateTaskForm />} />
          <Route path="/task/edit/:id" element={<EditTask />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
