import { Tarefa } from "./Tarefa";
import { Usuario } from "./Usuario";

export interface TarefaUser {
    Tarefaid: number;
    Tarefa: Tarefa;
    Userid: number;
    Usuario: Usuario;
}