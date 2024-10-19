public class UserUpdateDto
{
    public string? Nome { get; set; } 
    public string? Email { get; set; } 
    public string? Password { get; set; } 
    public List<int> TaskIds { get; set; } = new List<int>(); 

    public bool IsValid()
    {
        return !string.IsNullOrEmpty(Nome) && TaskIds != null;
    }
}
