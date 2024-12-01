using System;
using System.ComponentModel.DataAnnotations;

public class CalendarUpdateDto
{
    [Required]
    public string? Title { get; set; }

    public string? Description { get; set; }

    [Required]
    public DateTime Date { get; set; }

}