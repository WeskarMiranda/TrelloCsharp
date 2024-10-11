public class UserUpdateDto
{
    public string? Nome { get; set; } // Nome do usuário
    public string? Email { get; set; } // Email do usuario
    public string? Password { get; set; } // Nova senha, se houver
    public List<int> TaskIds { get; set; } = new List<int>(); // Lista de IDs das tarefas associadas ao usuário

    public bool IsValid()
    {
        return !string.IsNullOrEmpty(Nome) && TaskIds != null;
    }
}
