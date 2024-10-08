import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'; // Sua página inicial
import RegisterForm from './pages/RegisterForm'; // Formulário de registro
import LoginForm from './pages/LoginForm'; // Formulário de login
import Dashboard from './pages/Dashboard'; // Página do dashboard
import CreateTaskForm from './pages/CreateTaskForm'; // Importação do formulário de criação de tarefas
import EditTask from './pages/EditTask';

function App() {
  return (
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
  );
}

export default App;
