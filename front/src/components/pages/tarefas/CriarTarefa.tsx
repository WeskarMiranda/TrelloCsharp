import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Usuario } from '../../interfaces/Usuario';
import '../css/CriarTarefa.css';  // Adicionando o arquivo CSS

const CriarTarefa: React.FC = () => {
  const [taskName, setTaskName] = useState<string>('');
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [taskStatus, setTaskStatus] = useState<string>('pendente');
  const [users, setUsers] = useState<Usuario[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get<Usuario[]>('http://localhost:5031/user/listar');
        setUsers(response.data);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        setError('Erro ao carregar usuários.');
      }
    };

    fetchUsers();
  }, []);

  const handleUserSelect = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:5031/task/create', {
        Name: taskName,
        Description: taskDescription,
        Status: taskStatus,
        UserIds: selectedUserIds,
      });
      window.location.href = '/dashboard';  // Redirecionamento após a criação
    } catch (error) {
      console.error("Erro ao criar tarefa: ", error);
      setError('Erro ao criar a tarefa. Tente novamente.');
    }
  };

  return (
    <div data-testid="item-content" className="teste">
      <form className="forms" onSubmit={handleSubmit}>
        <h2>Criar Nova Tarefa</h2>

        {error && <p>{error}</p>}  {/* Exibindo erros */}

        <div>
          <label htmlFor="taskName">Nome da Tarefa:</label>
          <input
            id="taskName"
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Nome da tarefa"
            required
          />
        </div>

        <div>
          <label htmlFor="taskDescription">Descrição:</label>
          <textarea
            id="taskDescription"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            placeholder="Descrição"
            required
          />
        </div>

        <div>
          <label htmlFor="taskStatus">Status:</label>
          <select
            id="taskStatus"
            value={taskStatus}
            onChange={(e) => setTaskStatus(e.target.value)}
          >
            <option value="pendente">Pendente</option>
            <option value="em andamento">Em Andamento</option>
            <option value="concluída">Concluída</option>
          </select>
        </div>

        <div data-testid="item-content" className="sc-b4f18a95-3 ksPhOk">
          <label>Selecione os Integrantes:</label>
          {users.map(user => (
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

        <button className= 'criarbt'type="submit">Criar Tarefa</button>
      </form>
    </div>
  );
};

export default CriarTarefa;
