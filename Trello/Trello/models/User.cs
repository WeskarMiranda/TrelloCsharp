using System;
using System.Collections.Generic;
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

        [JsonIgnore] // Ignorar para evitar ciclos
        public ICollection<TarefaUser> TarefaUsers { get; set; } = new List<TarefaUser>();
    }
}  