public class LoginRequest
{
    public string Email { get; set; }
    public string Password { get; set; }

    public LoginRequest(string email, string password)
    {
        Email = email ?? throw new ArgumentNullException(nameof(email));
        Password = password ?? throw new ArgumentNullException(nameof(password));
    }

    public bool IsValid()
    {
        return !string.IsNullOrWhiteSpace(Email) && !string.IsNullOrWhiteSpace(Password);
    }
}
