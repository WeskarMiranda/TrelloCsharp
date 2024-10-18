using System;
using System.ComponentModel.DataAnnotations;

public class CalendarCreateDto
{
    [Required]
    public string? Title { get; set; }

    public string? Description { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public int UserId { get; set; } // ID do usuário que está criando o calendário
}