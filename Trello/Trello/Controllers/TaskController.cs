using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Trello.Models;
using Trello.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trello.Controllers
{
    [Route("task")] // Rota base para o controlador
    [ApiController]
    public class TaskController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TaskController(AppDbContext context)
        {
            _context = context;
        }

        // Método para listar tarefas
        [HttpGet("listar")]
        public async Task<IActionResult> Listar()
        {
            try
            {
                // Inclua os TarefaUsers relacionados na consulta
                var tarefas = await _context.Tarefas
                    .Include(t => t.TarefaUsers)
                        .ThenInclude(tu => tu.User) // Inclui o User relacionado
                    .ToListAsync();

                return Ok(tarefas);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao listar tarefas: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, "Erro interno do servidor. Verifique os logs para mais detalhes.");
            }
        }

        // Método para criar uma nova tarefa
        [HttpPost("create")]
        public async Task<IActionResult> CreateTask([FromBody] Tarefa model)
        {
            try
            {
                // Validação de campos obrigatórios
                if (string.IsNullOrWhiteSpace(model.Name) || string.IsNullOrWhiteSpace(model.Description))
                {
                    return BadRequest("Nome e descrição são obrigatórios.");
                }

                // Criação da nova tarefa
                var newTask = new Tarefa
                {
                    Name = model.Name,
                    Description = model.Description,
                    Status = model.Status,
                    TarefaUsers = new List<TarefaUser>() // Inicializa a lista associativa de usuários
                };

                // Verifica se existem IDs de usuários para adicionar
                if (model.TarefaUsers != null && model.TarefaUsers.Any())
                {
                    var usersToAdd = await _context.Users
                        .Where(u => model.TarefaUsers.Select(tu => tu.UserId).Contains(u.Id)) // Mapeando os IDs de User
                        .ToListAsync();

                    // Adiciona usuários à tabela de relacionamento
                    foreach (var user in usersToAdd)
                    {
                        newTask.TarefaUsers.Add(new TarefaUser { UserId = user.Id, Tarefa = newTask });
                    }
                }

                // Adiciona a nova tarefa ao contexto e salva
                await _context.Tarefas.AddAsync(newTask);
                await _context.SaveChangesAsync();

                // Retorna a tarefa criada
                return CreatedAtAction(nameof(Listar), new { id = newTask.Id }, newTask);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao criar tarefa: {ex.Message}");
                return StatusCode(500, $"Erro interno do servidor: {ex.Message}");
            }
        }

        // Método para testar a conexão com o banco de dados
        [HttpGet("testConnection")]
        public async Task<IActionResult> TestConnection()
        {
            try
            {
                var canConnect = await _context.Database.CanConnectAsync();
                return Ok(new { CanConnect = canConnect });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao conectar ao banco de dados: {ex.Message}");
            }
        }
    }
}
