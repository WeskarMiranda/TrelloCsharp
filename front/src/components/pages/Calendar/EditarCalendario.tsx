import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar } from '../../interfaces/Calendar';
import { Usuario } from '../../interfaces/Usuario';
import { CalendarUser } from '../../interfaces/CalendarUser';

const EditarCalendario: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(''); // Mantém como string
  const [users, setUsers] = useState<Usuario[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const response = await axios.get<Calendar>(`http://localhost:5031/calendar/${id}`);
        setTitle(response.data.title);
        setDescription(response.data.description);

        // Converte a data em string no formato 'YYYY-MM-DD'
        const dateString = new Date(response.data.date).toISOString().split('T')[0];
        setDate(dateString);
        
      } catch (error) {
        console.error('Erro ao buscar calendário:', error);
        setError('Erro ao carregar o calendário.');
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get<Usuario[]>('http://localhost:5031/user/listar');
        setUsers(response.data);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        setError('Erro ao carregar usuários.');
      }
    };

    fetchCalendar();
    fetchUsers();
  }, [id]);

  const handleUserSelect = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axios.put(`http://localhost:5031/calendar/update/${id}`, {
        Title: title,
        Description: description,
        Date: date,
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao atualizar calendário:', error);
      setError('Erro ao atualizar o calendário.');
    }
  };

  return (
    <div className="edit-calendar">
      <form onSubmit={handleSubmit}>
        <h2>Editar Calendário</h2>

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

        <button type="submit">Salvar Alterações</button>
      </form>
    </div>
  );
};

export default EditarCalendario;
