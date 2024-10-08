import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importe useNavigate

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false); // Estado de carregamento
  const navigate = useNavigate(); // Crie uma instância de useNavigate

  const loginUser = async (user) => {
    setLoading(true); // Define o carregamento como verdadeiro
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
        setSuccess('Login realizado com sucesso!');
        setError(''); // Limpa a mensagem de erro

        // Redirecionar para a página de dashboard após login bem-sucedido
        navigate('/dashboard'); 
      } else {
        setError(data.message || 'Erro ao realizar login'); // Mostra a mensagem de erro do servidor
        setSuccess(''); // Limpa a mensagem de sucesso
      }
    } catch (err) {
      console.error('Erro ao realizar login:', err);
      setError('Ocorreu um erro ao fazer login. Tente novamente.');
      setSuccess(''); // Limpa a mensagem de sucesso
    } finally {
      setLoading(false); // Define o carregamento como falso
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação simples
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    const user = { Email: email, Password: password }; // Mantém as propriedades como "Email" e "Password"
    loginUser(user); // Chama a função de login
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email" // Alterado para type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu email" // Placeholder adicionado
            required // Torna o campo obrigatório
          />
        </div>
        <div>
          <label>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha" // Placeholder adicionado
            required // Torna o campo obrigatório
          />
        </div>
        <button type="submit" disabled={loading}> {/* Desabilita o botão durante o carregamento */}
          {loading ? 'Carregando...' : 'Login'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Mensagem de erro */}
      {success && <p style={{ color: 'green' }}>{success}</p>} {/* Mensagem de sucesso */}
    </div>
  );
};

export default LoginForm;
