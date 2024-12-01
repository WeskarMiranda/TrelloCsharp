import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Usuario } from '../../interfaces/Usuario';
import '../css/CriarCalendario.css';

const CriarCalendario: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>('');
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
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    if (selectedUserIds.length === 0) {
      setError('Selecione ao menos um usuário.');
      return;
    }
  
    try {
      await axios.post('http://localhost:5031/calendar/create', {
        Title: title,
        Description: description,
        Date: date,
        UserId: selectedUserIds[0], 
      });
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Erro ao criar calendário: ', error);
      setError('Erro ao criar o calendário. Tente novamente.');
    }
  };
  

  return (
    <div className="create-calendar">
      <form onSubmit={handleSubmit}>
        <h2>Criar Novo Calendário</h2>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div>
          <label htmlFor="title">Título:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do calendário"
            required
          />
        </div>

        <div>
          <label htmlFor="description">Descrição:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição"
            required
          />
        </div>

        <div>
          <label htmlFor="date">Data:</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Selecione os Usuários:</label>
          {users.map((user) => (
            <div key={user.id}>
              <label>
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

        <button type="submit">Criar Calendário</button>
      </form>
    </div>
  );
};

export default CriarCalendario;