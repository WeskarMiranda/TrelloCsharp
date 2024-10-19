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

        [JsonIgnore]
        public List<TarefaUser> TarefaUsers { get; set; } = new List<TarefaUser>();
    }
}

