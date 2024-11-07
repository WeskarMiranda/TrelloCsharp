import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Tarefa } from '../interfaces/Tarefa';

const EditarTarefa: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Tarefa>({ id: Number(id), name: '', description: '', status: '' });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await axios.get<Tarefa>(`http://localhost:5031/task/${id}`);
        setTask(response.data);
      } catch (err) {
        console.error('Erro ao buscar a tarefa:', err);
        setError('Erro ao buscar a tarefa.');
      }
    };
    fetchTask();
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5031/task/editar/${id}`, task);
      navigate('/dashboard');
    } catch (err) {
      console.error('Erro ao atualizar a tarefa:', err);
      setError('Erro ao atualizar a tarefa');
    }
  };

  return (
    <div>
      <h2>Editar Tarefa</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input
            type="text"
            name="name"
            value={task.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Descrição:</label>
          <textarea
            name="description"
            value={task.description ?? ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Status:</label>
          <select
            name="status"
            value={task.status}
            onChange={handleChange}
          >
            <option value="pendente">Pendente</option>
            <option value="em andamento">Em Andamento</option>
            <option value="concluída">Concluída</option>
          </select>
        </div>
        <button type="submit">Salvar</button>
      </form>
    </div>
  );
};

export default EditarTarefa;
