import React, { useState, FormEvent } from 'react';
import { useUser } from '../../UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Usuario } from '../interfaces/Usuario';

const LoginForm: React.FC = () => {
  const { setUser } = useUser();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const loginUser = async (user: Pick<Usuario, 'email' | 'password'>) => {
    setLoading(true);
    try {
      const response = await axios.post<Usuario>('http://localhost:5031/user/login', user);
      setUser(response.data);
      navigate('/dashboard');
    } catch (err) {
      console.error('Erro ao realizar login:', err);
      setError('Erro ao realizar login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    loginUser({ email, password });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
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
        <button type="submit" disabled={loading}>
          {loading ? 'Carregando...' : 'Login'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default LoginForm;
