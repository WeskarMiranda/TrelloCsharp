using Trello.Models;

public class Tarefa
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Status { get; set; }
    public List<TarefaUser> TarefaUsers { get; set; } = new List<TarefaUser>();

    // Adicione esta propriedade se você precisar dela
    public List<int> UserIds 
    { 
        get => TarefaUsers.Select(tu => tu.UserId).ToList(); 
    }
}
