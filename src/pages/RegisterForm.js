import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Certifique-se de que este import esteja presente

const RegisterForm = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState(''); // Adicionei o estado para o email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const registerUser = async (user) => {
    try {
      const response = await fetch('http://localhost:5031/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Usuário cadastrado com sucesso!');
        setError('');
        setNome('');
        setEmail(''); // Limpa o campo de email
        setPassword('');
        navigate('/dashboard'); // Redireciona após o registro
      } else {
        setError(data);
        setSuccess('');
      }
    } catch (err) {
      console.error('Erro ao cadastrar usuário:', err);
      setError('Ocorreu um erro ao cadastrar. Tente novamente.');
      setSuccess('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nome || !email || !password) { // Verifica se todos os campos estão preenchidos
      setError('Por favor, preencha todos os campos.');
      return;
    }

    const user = { Nome: nome, Email: email, Password: password }; // Inclui o email no objeto
    registerUser(user);
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
          />
        </div>
        <div>
          <label>Email:</label> {/* Adicionei o campo de email */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required // Torna o campo obrigatório
          />
        </div>
        <div>
          <label>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required // Torna o campo obrigatório
          />
        </div>
        <button type="submit">Registrar</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default RegisterForm;
