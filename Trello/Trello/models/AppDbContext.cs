using API.Models;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlite("Data Source=trello.db");
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configura o Id como chave primária e autoincremento
        modelBuilder.Entity<User>()
            .Property(u => u.Id)
            .ValueGeneratedOnAdd(); // Auto-incremento
    }
}