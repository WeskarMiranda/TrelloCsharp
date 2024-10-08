import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateTaskForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pendente'); // Status padrão
  const [users, setUsers] = useState([]); // Para armazenar os usuários
  const [selectedUsers, setSelectedUsers] = useState([]); // Para armazenar os usuários selecionados
  const [errorMessage, setErrorMessage] = useState(''); // Para armazenar mensagens de erro
  const navigate = useNavigate();

  // Função para buscar usuários
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5031/user/listar');
        if (!response.ok) {
          throw new Error('Erro ao buscar usuários');
        }
        const data = await response.json();
        console.log('Dados recebidos da API:', data); // Log para verificar os dados recebidos

        // Verifique se os dados são válidos antes de armazenar
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error('Dados recebidos não são um array válido');
        }
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        setErrorMessage("Não foi possível carregar os usuários.");
      }
    };

    fetchUsers();
  }, []);

  // Função para lidar com a mudança de seleção de usuários
  const handleUserChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedUsers(value);
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Verifique se todos os campos necessários estão preenchidos
      if (!name || !description) {
        throw new Error('Nome e descrição são obrigatórios.');
      }

      const response = await fetch('http://localhost:5031/task/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Name: name, // Usando 'Name' conforme especificado
          Description: description, // Usando 'Description'
          Status: status, // Usando 'Status'
          TarefaUsers: selectedUsers.map(id => ({ UserId: id })), // Mapeia os usuários selecionados
        }),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Captura o corpo da resposta em caso de erro
        throw new Error(errorData.message || 'Erro ao criar tarefa'); // Usa a mensagem retornada ou uma mensagem padrão
      }

      // Limpa os campos do formulário
      setName('');
      setDescription('');
      setStatus('pendente');
      setSelectedUsers([]);
      
      // Redirecionar para o Dashboard após criar a tarefa
      navigate('/dashboard');
    } catch (err) {
      console.error('Erro ao criar tarefa:', err);
      setErrorMessage(err.message || 'Erro ao criar tarefa. Tente novamente mais tarde.'); // Define a mensagem de erro
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {errorMessage && <div className="error-message">{errorMessage}</div>} {/* Exibe a mensagem de erro */}
      
      <div>
        <label htmlFor="taskName">Nome da Tarefa:</label>
        <input
          id="taskName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="taskDescription">Descrição da Tarefa:</label>
        <textarea
          id="taskDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label htmlFor="taskStatus">Status:</label>
        <select
          id="taskStatus"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="pendente">Pendente</option>
          <option value="concluída">Concluída</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="userSelect">Adicionar Integrantes:</label>
        <select
          id="userSelect"
          multiple
          value={selectedUsers}
          onChange={handleUserChange}
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}> {/* Usando 'user.id' conforme especificado */}
              {user.nome} {/* Usando 'user.nome' conforme especificado */}
            </option>
          ))}
        </select>
      </div>
      
      <button type="submit">Criar Tarefa</button>
    </form>
  );
};

export default CreateTaskForm;
