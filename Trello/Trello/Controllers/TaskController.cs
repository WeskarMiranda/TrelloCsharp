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
                var tarefas = await _context.Tarefas
                    .Include(t => t.TarefaUsers)
                        .ThenInclude(tu => tu.User)
                    .ToListAsync();

                var result = tarefas.Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Description,
                    t.Status,
                    Users = t.TarefaUsers
                        .Where(tu => tu.User != null) 
                        .Select(tu => new 
                        { 
                            tu.UserId, 
                            Nome = tu.User?.Nome 
                        })
                        .ToList()
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao listar tarefas: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor.");
            }
        }


        // Método para criar uma nova tarefa
        [HttpPost("create")]
        public async Task<IActionResult> CreateTask([FromBody] Tarefa model)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(model.Name) || string.IsNullOrWhiteSpace(model.Description))
                {
                    return BadRequest("Nome e descrição são obrigatórios.");
                }

                var newTask = new Tarefa
                {
                    Name = model.Name,
                    Description = model.Description,
                    Status = model.Status
                };

                if (model.TarefaUsers != null && model.TarefaUsers.Any())
                {
                    var usersToAdd = await _context.Users
                        .Where(u => model.TarefaUsers.Select(tu => tu.UserId).Contains(u.Id))
                        .ToListAsync();

                    foreach (var user in usersToAdd)
                    {
                        newTask.TarefaUsers.Add(new TarefaUser { UserId = user.Id });
                    }
                }

                await _context.Tarefas.AddAsync(newTask);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(Listar), new { id = newTask.Id }, newTask);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao criar tarefa: {ex.Message}");
                return StatusCode(500, "Erro interno do servidor.");
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
