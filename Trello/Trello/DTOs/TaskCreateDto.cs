public class TaskCreateDto
{
    public string Name { get; set; }
    public string Description { get; set; }
    public string Status { get; set; }
    public List<int> UserIds { get; set; } // IDs dos usuários a serem associados
}
