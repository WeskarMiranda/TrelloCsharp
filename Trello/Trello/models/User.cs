using System;
using System.Collections.Generic;

namespace Trello.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public DateTime CriadoEm { get; set; }

        public ICollection<TarefaUser> TarefaUsers { get; set; } = new List<TarefaUser>();
    }
}  