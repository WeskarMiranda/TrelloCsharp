using System.Text.Json.Serialization;
namespace Trello.Models
{
    public class TarefaUser
    {
        public int UserId { get; set; }

        [JsonIgnore] // Ignorar para evitar ciclos
        public User? User { get; set; } // Navegação para User

        public int TarefaId { get; set; }

        [JsonIgnore] // Ignorar para evitar ciclos
        public Tarefa? Tarefa { get; set; } // Navegação para Tarefa

        public int Id { get; set; } // Se você precisar desse ID

    }
}