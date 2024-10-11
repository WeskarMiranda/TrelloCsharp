public class TaskUpdateDto
{
    public string? Name { get; set; } // Nome da tarefa
    public string? Description { get; set; } // Descrição da tarefa
    public string? Status { get; set; } // Status da tarefa (ex: Em progresso, Concluída)
    public List<int> UserIds { get; set; } = new List<int>(); // Lista de IDs dos usuários associados à tarefa

    public bool IsValid()
    {
        return !string.IsNullOrEmpty(Name) && UserIds != null;
    }
}
