using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Trello.Models
{
    public class Tarefa
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }

        [JsonIgnore] // Ignorar para evitar ciclos
        public List<User> Users { get; set; } = new List<User>(); // Relacionamento direto com Users
    }
}

