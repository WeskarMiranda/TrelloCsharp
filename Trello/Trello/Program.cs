using Trello.Models; 
using Microsoft.EntityFrameworkCore;
using Trello.Data;

var builder = WebApplication.CreateBuilder(args);

// Configuração do banco de dados 
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=app.db"));

// Configuração do CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") // Porta onde o React está rodando
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Middleware de tratamento de erros
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Erro: {ex.Message}"); // Log do erro
        context.Response.StatusCode = 500;
        await context.Response.WriteAsync("Ocorreu um erro inesperado.");
    }
});

// Aplicar CORS antes das rotas
app.UseCors("AllowReactApp");

// POST - Cadastra um novo usuário e grava suas informações
app.MapPost("/user/register", async (UserRegistrationDto registrationDto, AppDbContext context) =>
{
    if (!registrationDto.IsValid())
    {
        return Results.BadRequest("Todos os campos são obrigatórios.");
    }

    // Verificar se o usuário já existe
    if (await context.Users.AnyAsync(u => u.Email == registrationDto.Email))
    {
        return Results.BadRequest("Usuário já cadastrado.");
    }

    // Criar o novo usuário
    var user = new User
    {
        Nome = registrationDto.Nome,
        Email = registrationDto.Email,
        Password = BCrypt.Net.BCrypt.HashPassword(registrationDto.Password),
        CriadoEm = DateTime.UtcNow
    };

    context.Users.Add(user);
    await context.SaveChangesAsync();

    return Results.Created($"/user/{user.Id}", user);
});

// POST - Faz login do usuário registrado comparando as hashes
app.MapPost("/user/login", async (LoginRequest loginRequest, AppDbContext context) =>
{
    if (!loginRequest.IsValid())
    {
        return Results.BadRequest("Email e senha são obrigatórios.");
    }

    var user = await context.Users.FirstOrDefaultAsync(u => u.Email == loginRequest.Email);
    if (user == null)
    {
        return Results.NotFound("Usuário não encontrado.");
    }

    if (!BCrypt.Net.BCrypt.Verify(loginRequest.Password, user.Password))
    {
        return Results.Unauthorized();
    }

    return Results.Ok("Login realizado com sucesso.");
});

// GET - Obter a lista de todos os usuários com seus IDs de tarefas
app.MapGet("/user/listar", async (AppDbContext context) =>
{
    var users = await context.Users
        .Select(u => new
        {
            u.Id,
            u.Nome,
            u.Email,
            u.Password,
            TaskIds = u.Tarefas.Select(t => t.Id).ToList() // Lista de IDs de tarefas
        })
        .ToListAsync();

    if (users == null || users.Count == 0)
    {
        return Results.NotFound(); // Se não houver usuários, retorne 404
    }

    return Results.Ok(users); // Retorne os usuários e suas tarefas
});


// PUT - Atualizar um usuário pelo Id, incluindo a lista de IDs de tarefas
app.MapPut("/user/alterar/{id}", async (int id, UserUpdateDto updatedUserDto, AppDbContext context) =>
{
    var user = await context.Users
        .Include(u => u.Tarefas) // Incluir tarefas para poder manipular a lista
        .FirstOrDefaultAsync(u => u.Id == id);
    
    if (user == null)
    {
        return Results.NotFound("Usuário não encontrado.");
    }

    // Atualiza o nome do usuário
    user.Nome = updatedUserDto.Nome;
    user.Email = updatedUserDto.Email;

    // Atualizar senha se fornecida
    if (!string.IsNullOrEmpty(updatedUserDto.Password))
    {
        user.Password = BCrypt.Net.BCrypt.HashPassword(updatedUserDto.Password);
    }

    // Atualizar a lista de tarefas
    var tarefasAtualizadas = await context.Tarefas
        .Where(t => updatedUserDto.TaskIds.Contains(t.Id))
        .ToListAsync();

    user.Tarefas.Clear(); // Limpar as tarefas atuais
    user.Tarefas.AddRange(tarefasAtualizadas); // Adicionar as novas tarefas

    await context.SaveChangesAsync();
    return Results.Ok("Usuário atualizado com sucesso.");
});


// DELETE - Excluir um usuário pelo Id
app.MapDelete("/user/deletar/{id}", async (int id, AppDbContext context) =>
{
    var user = await context.Users.FindAsync(id);
    
    if (user == null)
    {
        return Results.NotFound("Usuário não encontrado.");
    }

    context.Users.Remove(user);
    await context.SaveChangesAsync();
    return Results.Ok("Usuário removido com sucesso.");
});

// POST - Criar uma nova tarefa
app.MapPost("/task/create", async (TaskCreateDto tarefaDto, AppDbContext context) =>
{
    if (string.IsNullOrEmpty(tarefaDto.Name))
    {
        return Results.BadRequest("O nome da tarefa é obrigatório.");
    }

    var usuariosNaoEncontrados = new List<int>();

    try
    {
        var tarefa = new Tarefa
        {
            Name = tarefaDto.Name,
            Description = tarefaDto.Description,
            Status = tarefaDto.Status
        };

        // Adicionar usuários diretamente à tarefa
        foreach (var userId in tarefaDto.UserIds)
        {
            var user = await context.Users.FindAsync(userId);
            if (user != null)
            {
                tarefa.Users.Add(user); // Adiciona o usuário diretamente à tarefa
            }
            else
            {
                usuariosNaoEncontrados.Add(userId);
            }
        }

        if (usuariosNaoEncontrados.Any())
        {
            return Results.BadRequest($"Os seguintes IDs de usuários não foram encontrados: {string.Join(", ", usuariosNaoEncontrados)}.");
        }

        context.Tarefas.Add(tarefa);
        await context.SaveChangesAsync();

        return Results.Created($"/task/{tarefa.Id}", tarefa);
    }
    catch (Exception ex)
    {
        return Results.Problem($"Erro ao criar tarefa: {ex.Message}", statusCode: 500);
    }
});




// GET - Obter a lista de todas as tarefas com seus IDs de usuários
app.MapGet("/task/listar", async (AppDbContext context) =>
{
    var tarefas = await context.Tarefas
        .Select(t => new
        {
            t.Id,
            t.Name,
            t.Description,
            t.Status,
            UserIds = t.Users.Select(u => u.Id).ToList() // Lista de IDs de usuários
        })
        .ToListAsync();

    if (tarefas == null || tarefas.Count == 0)
    {
        return Results.NotFound(); // Se não houver tarefas, retorne 404
    }

    return Results.Ok(tarefas); // Retorne as tarefas e seus usuários
});


// GET - Obter uma tarefa pelo Id
app.MapGet("/task/{id}", async (int id, AppDbContext context) =>
{
    var task = await context.Tarefas.FindAsync(id);
    if (task == null)
    {
        return Results.NotFound("Tarefa não encontrada.");
    }
    return Results.Ok(task);
});

// PUT - Atualizar uma tarefa pelo Id, incluindo a lista de IDs de usuários
app.MapPut("/task/editar/{id}", async (int id, TaskUpdateDto updatedTaskDto, AppDbContext context) =>
{
    var task = await context.Tarefas
        .Include(t => t.Users) // Incluir usuários para manipular a lista
        .FirstOrDefaultAsync(t => t.Id == id);
    
    if (task == null)
    {
        return Results.NotFound("Tarefa não encontrada.");
    }

    // Atualiza os campos da tarefa
    task.Name = updatedTaskDto.Name;
    task.Description = updatedTaskDto.Description;
    task.Status = updatedTaskDto.Status;

    // Atualizar a lista de usuários
    var usuariosAtualizados = await context.Users
        .Where(u => updatedTaskDto.UserIds.Contains(u.Id))
        .ToListAsync();

    task.Users.Clear(); // Limpar os usuários atuais
    task.Users.AddRange(usuariosAtualizados); // Adicionar os novos usuários

    await context.SaveChangesAsync();
    return Results.Ok("Tarefa atualizada com sucesso.");
});


// DELETE - Excluir uma tarefa pelo Id
app.MapDelete("/task/deletar/{id}", async (int id, AppDbContext context) =>
{
    var task = await context.Tarefas.FindAsync(id);
    
    if (task == null)
    {
        return Results.NotFound("Tarefa não encontrada.");
    }

    context.Tarefas.Remove(task);
    await context.SaveChangesAsync();
    return Results.Ok("Tarefa removida com sucesso.");
});

// Executar a aplicação
app.Run();
