// LoginForm.js
import React, { useState } from 'react';
import { useUser } from '../UserContext'; // Importa o contexto de usuário
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const { setUser } = useUser(); // Acessa a função para definir o usuário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loginUser = async (user) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5031/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data); // Armazena os dados do usuário no contexto
        navigate('/dashboard'); // Redireciona para o dashboard
      } else {
        setError(data.message || 'Erro ao realizar login');
      }
    } catch (err) {
      console.error('Erro ao realizar login:', err);
      setError('Ocorreu um erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = { Email: email, Password: password }; // Formato dos campos
    loginUser(user); // Chama a função de login
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
            placeholder="Digite seu email"
            required
          />
        </div>
        <div>
          <label>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Carregando...' : 'Login'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Mensagem de erro */}
    </div>
  );
};

export default LoginForm;
