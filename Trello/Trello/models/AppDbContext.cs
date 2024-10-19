using Microsoft.EntityFrameworkCore;
using Trello.Models;

namespace Trello.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Tarefa> Tarefas { get; set; }
        public DbSet<TarefaUser> TarefaUsers { get; set; }
        public DbSet<Calendar> Calendars { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Calendar>()
                .HasOne(c => c.User)
                .WithMany(u => u.Calendars)
                .HasForeignKey(c => c.UserId);
            
            modelBuilder.Entity<TarefaUser>()
            .HasKey(tu => new { tu.UserId, tu.TarefaId });

            modelBuilder.Entity<TarefaUser>()
            .HasOne(tu => tu.User)
            .WithMany(u => u.TarefaUsers)
            .HasForeignKey(tu => tu.UserId);

            modelBuilder.Entity<TarefaUser>()
            .HasOne(tu => tu.Tarefa)
            .WithMany(t => t.TarefaUsers)
            .HasForeignKey(tu => tu.TarefaId);
        }
    }
}

