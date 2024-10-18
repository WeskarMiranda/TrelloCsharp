using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Trello.Models
{
    public class Calendar
    {
        public int Id { get; set; }

        [Required]
        public string? Title { get; set; }

        public string? Description { get; set; }

        public DateTime Date { get; set; }

        // Relacionamento com User
        public int UserId { get; set; }

        [JsonIgnore] // Evita ciclos na serialização JSON
        public User? User { get; set; }
    }
}