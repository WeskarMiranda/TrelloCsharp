import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditTask = () => {
    const { id } = useParams(); // Obtém o ID da tarefa da URL
    const navigate = useNavigate();
    const [task, setTask] = useState({ Nome: '', Descrição: '', Status: '' }); // Mantenha os nomes conforme solicitado
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const response = await fetch(`http://localhost:5031/task/${id}`); // Supondo que você tenha uma rota GET para buscar uma tarefa
                if (!response.ok) {
                    throw new Error('Erro ao buscar a tarefa.');
                }
                const data = await response.json();
                setTask(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchTask();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTask({ ...task, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5031/task/editar/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task),
            });
            if (!response.ok) {
                throw new Error('Erro ao atualizar a tarefa');
            }
            navigate('/dashboard'); // Redireciona para o dashboard após a edição
        } catch (err) {
            setError(err.message);
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
                        name="Nome" // Mantenha o nome da propriedade
                        value={task.Nome} // Mantenha o nome da propriedade
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Descrição:</label>
                    <textarea
                        name="Descrição" // Mantenha o nome da propriedade
                        value={task.Descrição ?? ''} // Garante que não seja null
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Status:</label>
                    <select
                        name="Status" // Mantenha o nome da propriedade
                        value={task.Status} // Mantenha o nome da propriedade
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

export default EditTask;
