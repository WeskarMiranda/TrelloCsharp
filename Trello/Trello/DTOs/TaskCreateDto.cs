public class TaskCreateDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }
    public List<int> UserIds { get; set; } = new List<int>(); // IDs dos usuários a serem associados
}
