using System.Collections.Generic;
using System;
using System.Text.Json.Serialization;

namespace Trello.Models
{
    public class User
    {
        public int Id { get; set; }
        public string? Nome { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public DateTime CriadoEm { get; set; }

        // Lista de Tarefas que o usuário está associado
        [JsonIgnore] // Evitar ciclos
        public List<Tarefa> Tarefas { get; set; } = new List<Tarefa>();
    }
}
 