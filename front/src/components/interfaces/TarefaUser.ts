import { Tarefa } from "./Tarefa";
import { Usuario } from "./Usuario";

export interface TarefaUser {
    tarefaId: number;
    Tarefa: Tarefa;
    userId: number;
    Usuario: Usuario;
}