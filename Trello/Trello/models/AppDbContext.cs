using Microsoft.EntityFrameworkCore;
using Trello.Models;

namespace Trello.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Tarefa> Tarefas { get; set; }
        public DbSet<Calendar> Calendars { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configurar o relacionamento entre User e Calendar
            modelBuilder.Entity<Calendar>()
                .HasOne(c => c.User)
                .WithMany(u => u.Calendars)
                .HasForeignKey(c => c.UserId);
            // Configurar o relacionamento de muitos para muitos sem a tabela intermediária
            modelBuilder.Entity<Tarefa>()
                .HasMany(t => t.Users)
                .WithMany(u => u.Tarefas)
                .UsingEntity(j => j.ToTable("UserTarefas")); // Tabela intermediária para o relacionamento
        }
    }
}

