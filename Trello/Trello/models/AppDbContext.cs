using Microsoft.EntityFrameworkCore;
using Trello.Models;

namespace Trello.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } // Alterado para 'User'
        public DbSet<Tarefa> Tarefas { get; set; }
        public DbSet<TarefaUser> TarefaUsers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configurando a chave primária composta para a tabela TarefaUser
            modelBuilder.Entity<TarefaUser>()
                .HasKey(tu => new { tu.UserId, tu.TarefaId });

            // Configurando o relacionamento entre TarefaUser e User
            modelBuilder.Entity<TarefaUser>()
                .HasOne(tu => tu.User)
                .WithMany(u => u.TarefaUsers)
                .HasForeignKey(tu => tu.UserId)
                .OnDelete(DeleteBehavior.Cascade); // Comportamento de exclusão em cascata

            // Configurando o relacionamento entre TarefaUser e Tarefa
            modelBuilder.Entity<TarefaUser>()
                .HasOne(tu => tu.Tarefa)
                .WithMany(t => t.TarefaUsers)
                .HasForeignKey(tu => tu.TarefaId)
                .OnDelete(DeleteBehavior.Cascade); // Comportamento de exclusão em cascata
        }
    }
}
