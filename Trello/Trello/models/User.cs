namespace API.Models
{
    public class User{
        public User(){
            CriadoEm = DateTime.Now;
        }

	public int Id { get; set; }
	public string? Nome { get; set; }
	public string? Password { get; set; }
    public DateTime CriadoEm { get; set; }
}
}