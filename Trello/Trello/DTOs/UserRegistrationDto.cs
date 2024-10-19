public class UserRegistrationDto
{
    public string? Nome { get; set; }
    public string? Email { get; set; }
    public string Password { get; set; } = string.Empty; 

    public bool IsValid()
    {
        return !string.IsNullOrWhiteSpace(Nome) &&
               !string.IsNullOrWhiteSpace(Email) &&
               !string.IsNullOrWhiteSpace(Password);
    }
}
