public class TaskUpdateDto
{
    public string? Name { get; set; } 
    public string? Description { get; set; } 
    public string? Status { get; set; } 
    public List<int> UserIds { get; set; } = new List<int>();

    public bool IsValid()
    {
        return !string.IsNullOrEmpty(Name) && UserIds != null;
    }
}
