using System.Text.Json.Serialization;
namespace Trello.Models
{
    public class TarefaUser
    {
        public int TarefaId { get; set; }
        public Tarefa? Tarefa { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

    }
}