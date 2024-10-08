import React, { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Importe um arquivo CSS para estilos

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]); 
  const [error, setError] = useState(''); 

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:5031/task/listar'); 
        if (!response.ok) {
          throw new Error('Erro ao buscar tarefas');
        }
        const data = await response.json();
        setTasks(data); 
      } catch (err) {
        console.error('Erro ao buscar tarefas:', err);
        setError('Ocorreu um erro ao buscar as tarefas.'); 
      }
    };

    fetchTasks();
  }, []);

  const handleDelete = async (id) => {
    const response = await fetch(`http://localhost:5031/task/deletar/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setTasks(tasks.filter(task => task.id !== id)); // Remove a tarefa da lista local
    } else {
      alert('Erro ao excluir a tarefa.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Bem-vindo ao Dashboard!</h1>
      <p>Aqui você pode gerenciar suas informações.</p>
      <button onClick={() => navigate('/create-task')}>Criar Tarefa</button>

      {error && <p style={{ color: 'red' }}>{error}</p>} 

      <h2>Tarefas</h2>
      {tasks.length === 0 ? (
        <p>Nenhuma tarefa encontrada.</p>
      ) : (
        <div className="task-cards-container">
          {tasks.map((task) => (
            <div key={task.id} className="task-card">
              <h3>{task.Nome}</h3> {/* Verifique se a propriedade é Nome */}
              <p>Status: {task.Status}</p> {/* Verifique se a propriedade é Status */}
              <p>Descrição: {task.Descrição}</p> {/* Verifique se a propriedade é Descrição */}
              <p>Integrantes:</p>
              {task.users && task.users.length > 0 ? ( // Protege o acesso a users
                <ul>
                  {task.users.map((user) => (
                    <li key={user.id}>{user.Nome}</li>
                  ))}
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
