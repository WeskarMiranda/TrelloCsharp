import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Usuario } from '../../interfaces/Usuario';
import { Tarefa } from '../../interfaces/Tarefa';
import '../css/EditarTarefa.css'

const EditarTarefa: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [taskName, setTaskName] = useState<string>('');
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [taskStatus, setTaskStatus] = useState<string>('pendente');
  const [users, setUsers] = useState<Usuario[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const taskResponse = await axios.get<Tarefa>(`http://localhost:5031/task/${id}`);
        const { name, description, status } = taskResponse.data;
        setTaskName(name);
        setTaskDescription(description ?? '');
        setTaskStatus(status);

        const associationResponse = await axios.get(`http://localhost:5031/taskuser/listar`);
        const associatedUsers = associationResponse.data
          .filter((assoc: { tarefaId: number }) => assoc.tarefaId === Number(id))
          .map((assoc: { userId: number }) => assoc.userId);
        setSelectedUserIds(associatedUsers);
      } catch (err) {
        console.error('Erro ao buscar dados da tarefa:', err);
        setError('Erro ao buscar dados da tarefa.');
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get<Usuario[]>('http://localhost:5031/user/listar');
        setUsers(response.data);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        setError('Erro ao buscar usuários.');
      }
    };

    fetchTaskData();
    fetchUsers();
  }, [id]);

  const handleUserSelect = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axios.put(`http://localhost:5031/task/editar/${id}`, {
        Name: taskName,
        Description: taskDescription,
        Status: taskStatus,
        UserIds: selectedUserIds
      });

      navigate('/dashboard');
    } catch (error) {
      console.error("Erro ao atualizar a tarefa: ", error);
      setError('Erro ao atualizar a tarefa');
    }
  };

  return (
    <div data-testid="item-content" className="teste">
    <form className="forms" onSubmit={handleSubmit}>
      <h2>Editar Tarefa</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Nome:</label>
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="Nome da tarefa"
          required
        />
      </div>
      <div>
        <label>Descrição:</label>
        <textarea
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          placeholder="Descrição"
          required
        />
      </div>
      <div>
        <label>Status:</label>
        <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)}>
          <option value="pendente">Pendente</option>
          <option value="em andamento">Em Andamento</option>
          <option value="concluída">Concluída</option>
        </select>
      </div>
      <div data-testid="item-content" className="sc-b4f18a95-3 ksPhOk">
        {users.map((user) => (
          <div className="checkbox-item" key={user.id}>
            <label className="sc-657bc1dc-0 kseUnL">  
            {user.nome}
            <input
              type="checkbox"
              checked={selectedUserIds.includes(user.id)}
              onChange={() => handleUserSelect(user.id)}
            />
            </label>
          </div>
        ))}
      </div>

      <button className='criarbt'type="submit">Salvar Alterações</button>
      </form>
    </div>
  );
};

export default EditarTarefa;

