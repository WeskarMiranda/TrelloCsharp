import React, { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]); 
  const [users, setUsers] = useState([]); 
  const [error, setError] = useState('');
  const [cookies] = useCookies(['user']); 
  const userId = cookies.user?.id; // ID do usuário logado

  // Função para buscar tarefas
  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:5031/task/listar');
      if (!response.ok) {
        throw new Error('Erro ao buscar tarefas');
      }
      const data = await response.json();
      console.log('Tarefas recebidas:', data);
      setTasks(data);
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err);
      setError('Ocorreu um erro ao buscar as tarefas.'); 
    }
  };

  // Função para buscar usuários
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5031/user/listar');
      if (!response.ok) {
        throw new Error('Erro ao buscar usuários');
      }
      const data = await response.json();
      console.log('Usuários recebidos:', data); 
      setUsers(data); 
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      setError('Ocorreu um erro ao buscar os usuários.');
    }
  };

  // Efeitos para buscar dados
  useEffect(() => {
    fetchTasks();
    fetchUsers(); 
  }, []);

  // Filtrar tarefas relacionadas ao usuário logado
  const filteredTasks = tasks.filter(task => 
    Array.isArray(task.userIds) && task.userIds.includes(userId)
  );
  console.log("Tarefas filtradas para o usuário:", filteredTasks);

  const handleDelete = async (id) => {
    const response = await fetch(`http://localhost:5031/task/deletar/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setTasks(tasks.filter(task => task.id !== id));
    } else {
      alert('Erro ao excluir a tarefa.');
    }
  };

  return (
    <div className="dashboard" style={{ padding: '20px' }}>
      <h1>Bem-vindo ao Dashboard!</h1>
      <p>Aqui você pode gerenciar suas informações.</p>
      <button onClick={() => navigate('/create-task')}>Criar Tarefa</button>

      {error && <p style={{ color: 'red' }}>{error}</p>} 

      <h2>Tarefas</h2>
      {filteredTasks.length === 0 ? (
        <p>Nenhuma tarefa encontrada para o usuário logado.</p>
      ) : (
        <div className="task-cards-container">
          {filteredTasks.map((task) => (
            <div key={task.id} className="task-card">
              <h3>{task.name}</h3>
              <p>Status: {task.status}</p>
              <p>Descrição: {task.description}</p>
              <p>Integrantes:</p>
              {task.userIds && task.userIds.length > 0 ? (
                <ul>
                  {task.userIds.map((userId) => {
                    const user = users.find(u => u.id === userId);
                    return (
                      <li key={userId}>
                        {user ? user.nome : 'Usuário não encontrado'}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>Nenhum integrante associado.</p>
              )}
              <div className="task-card-actions">
                <button onClick={() => navigate(`/task/edit/${task.id}`)}>Editar</button>
                <button onClick={() => handleDelete(task.id)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
