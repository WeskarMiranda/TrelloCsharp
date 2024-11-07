import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Usuario } from '../interfaces/Usuario';

const Registrar: React.FC = () => {
  const [nome, setNome] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const navigate = useNavigate();

  const registerUser = async (user: Omit<Usuario, 'id' | 'criadoEm'>) => {
    try {
      const response = await axios.post('http://localhost:5031/user/register', user);
      if (response.status === 201) {
        setSuccess('Usuário cadastrado com sucesso!');
        setError('');
        setNome('');
        setEmail('');
        setPassword('');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Erro ao cadastrar usuário:', err);
      setError('Erro ao cadastrar. Tente novamente.');
      setSuccess('');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    registerUser({ nome, email, password });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Registrar</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default Registrar;

