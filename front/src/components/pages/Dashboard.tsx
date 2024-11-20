import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Tarefa } from '../interfaces/Tarefa';
import { Usuario } from '../interfaces/Usuario';
import { TarefaUser } from '../interfaces/TarefaUser';
import './css/Deashboard.css'


const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Tarefa[]>([]);
    const [users, setUsers] = useState<Usuario[]>([]);
    const [taskUserAssociations, setTaskUserAssociations] = useState<TarefaUser[]>([]);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get<Tarefa[]>('http://localhost:5031/task/listar');
                setTasks(response.data);
            } catch (err) {
                console.error('Erro ao buscar tarefas:', err);
                setError('Ocorreu um erro ao buscar as tarefas.');
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await axios.get<Usuario[]>('http://localhost:5031/user/listar');
                setUsers(response.data);
            } catch (err) {
                console.error('Erro ao buscar usuários:', err);
                setError('Ocorreu um erro ao buscar os usuários.');
            }
        };

        const fetchTaskUserAssociations = async () => {
            try {
                const response = await axios.get<TarefaUser[]>('http://localhost:5031/taskuser/listar');
                setTaskUserAssociations(response.data);
            } catch (err) {
                console.error('Erro ao buscar associações de tarefa-usuário:', err);
                setError('Ocorreu um erro ao buscar as associações.');
            }
        };

        fetchTasks();
        fetchUsers();
        fetchTaskUserAssociations();
    }, []);

    const getUsersForTask = (taskId: number) => {
        const userIds = taskUserAssociations
            .filter(assoc => assoc.tarefaId === taskId)
            .map(assoc => assoc.userId);

        const associatedUsers = users.filter(user => userIds.includes(user.id));
        return associatedUsers;
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`http://localhost:5031/task/deletar/${id}`);
            setTasks(tasks.filter(task => task.id !== id));
        } catch (error) {
            console.error('Erro ao excluir a tarefa:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken'); 

        navigate('/'); 
    };

    return (
        <div className="dashboard">
          <div className="dashboard-header">
            <button onClick={handleLogout}>Logout</button>
          </div>
          <h1>Bem-vindo ao Dashboard!</h1>
          <button onClick={() => navigate('/create-task')}>Criar Tarefa</button>
      
          {error && <p style={{ color: 'red' }}>{error}</p>}
      
          <h2>Tarefas</h2>
          {tasks.length === 0 ? (
            <p>Nenhuma tarefa encontrada.</p>
          ) : (
            <div className="task-cards-container">
              {tasks.map((task) => (
                <div key={task.id} className="task-card">
                  <h3>{task.name}</h3>
                  <p>Status: {task.status}</p>
                  <p>Descrição: {task.description}</p>
                  <p>Integrantes:</p>
                  <ul>
                    {getUsersForTask(task.id).map(user => (
                      <li key={user.id}>{user.nome}</li>
                    ))}
                  </ul>
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


