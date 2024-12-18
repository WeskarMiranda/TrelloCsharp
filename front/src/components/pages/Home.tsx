import React from 'react';
import { Link } from 'react-router-dom';
import './css/Home.css'


const Home = () => {
  return (
    <div className="home">
      <header>
        <h1>Bem-vindo ao Trello App</h1>
        <div>
          <Link to="/login">
            <button className='homebt'>Login</button>
          </Link>
          <Link to="/register">
            <button className='homebt'>Cadastro</button>
          </Link>
        </div>
      </header>
    </div>
  );
};

export default Home;