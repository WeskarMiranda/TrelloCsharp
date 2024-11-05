// CreateTaskForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateTaskForm = () => {
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskStatus, setTaskStatus] = useState('pendente');
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5031/user/listar');
        setUsers(response.data);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleUserSelect = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:5031/task/create', {
        Name: taskName,
        Description: taskDescription,
        Status: taskStatus,
        UserIds: selectedUserIds,
      });
      // Redirecionar para o Dashboard após a criação
      window.location.href = '/dashboard';
    } catch (error) {
      console.error("Erro ao criar tarefa: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        placeholder="Nome da tarefa"
        required
      />
      <textarea
        value={taskDescription}
        onChange={(e) => setTaskDescription(e.target.value)}
        placeholder="Descrição"
        required
      />
      <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)}>
        <option value="pendente">Pendente</option>
        <option value="em andamento">Em Andamento</option>
        <option value="concluída">Concluída</option>
      </select>
      <h3>Selecione os Integrantes:</h3>
      {users.map(user => (
        <div key={user.id}>
          <input
            type="checkbox"
            checked={selectedUserIds.includes(user.id)}
            onChange={() => handleUserSelect(user.id)}
          />
          {user.nome}
        </div>
      ))}
      <button type="submit">Criar Tarefa</button>
    </form>
  );
};

export default CreateTaskForm;
