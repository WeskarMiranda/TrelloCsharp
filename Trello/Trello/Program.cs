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
            policy.WithOrigins("http://localhost:3000") 
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
        Console.WriteLine($"Erro: {ex.Message}"); 
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

    if (await context.Users.AnyAsync(u => u.Email == registrationDto.Email))
    {
        return Results.BadRequest("Usuário já cadastrado.");
    }

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
            TaskIds = u.TarefaUsers.Select(t => t.TarefaId).ToList() 
        })
        .ToListAsync();

    if (users == null || users.Count == 0)
    {
        return Results.NotFound(); 
    }

    return Results.Ok(users); 
});


// PUT - Atualizar um usuário pelo Id, incluindo a lista de IDs de tarefas
app.MapPut("/user/alterar/{id}", async (int id, UserUpdateDto updatedUserDto, AppDbContext context) =>
{
    var user = await context.Users
        .Include(u => u.TarefaUsers) 
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

    
    var tarefasAtualizadas = await context.TarefaUsers
        .Where(t => updatedUserDto.TaskIds.Contains(t.TarefaId))
        .ToListAsync();

    user.TarefaUsers.Clear(); 
    user.TarefaUsers.AddRange(tarefasAtualizadas); 

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
        return Results.BadRequest("O nome da tarefa é obrigatório.");

    var tarefa = new Tarefa
    {
        Name = tarefaDto.Name,
        Description = tarefaDto.Description,
        Status = tarefaDto.Status
    };

    foreach (var userId in tarefaDto.UserIds)
    {
        var user = await context.Users.FindAsync(userId);
        if (user == null) return Results.BadRequest($"Usuário {userId} não encontrado.");

        tarefa.TarefaUsers.Add(new TarefaUser { Tarefa = tarefa, User = user });
    }

    context.Tarefas.Add(tarefa);
    await context.SaveChangesAsync();

    return Results.Created($"/task/{tarefa.Id}", tarefa);
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
            UserIds = t.TarefaUsers.Select(tu => tu.UserId).ToList()
        })
        .ToListAsync();

    return Results.Ok(tarefas);
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
    var tarefa = await context.Tarefas
        .Include(t => t.TarefaUsers)
        .FirstOrDefaultAsync(t => t.Id == id);

    if (tarefa == null) return Results.NotFound("Tarefa não encontrada.");

    tarefa.Name = updatedTaskDto.Name;
    tarefa.Description = updatedTaskDto.Description;
    tarefa.Status = updatedTaskDto.Status;

    tarefa.TarefaUsers.Clear();
    foreach (var userId in updatedTaskDto.UserIds)
    {
        var user = await context.Users.FindAsync(userId);
        if (user != null)
        {
            tarefa.TarefaUsers.Add(new TarefaUser { TarefaId = tarefa.Id, UserId = userId });
        }
    }

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

// POST - Criar um novo calendário
app.MapPost("/calendar/create", async (CalendarCreateDto calendarDto, AppDbContext context) =>
{
    if (!await context.Users.AnyAsync(u => u.Id == calendarDto.UserId))
    {
        return Results.BadRequest("Usuário não encontrado.");
    }

    var calendar = new Calendar
    {
        Title = calendarDto.Title,
        Description = calendarDto.Description,
        Date = calendarDto.Date,
        UserId = calendarDto.UserId
    };

    context.Calendars.Add(calendar);
    await context.SaveChangesAsync();

    return Results.Created($"/calendar/{calendar.Id}", calendar);
});

// GET - Obter todos os calendários
app.MapGet("/calendar/list", async (AppDbContext context) =>
{
    var calendars = await context.Calendars
        .Select(c => new
        {
            c.Id,
            c.Title,
            c.Description,
            c.Date,
            c.UserId
        })
        .ToListAsync();

    return Results.Ok(calendars);
});

// GET - Obter calendários de um usuário específico
app.MapGet("/calendar/user/{userId}", async (int userId, AppDbContext context) =>
{

    var calendars = await context.Calendars
        .Where(c => c.UserId == userId)
        .Select(c => new
        {
            c.Id,
            c.Title,
            c.Description,
            c.Date
        })
        .ToListAsync();

    if (!calendars.Any())
    {
        return Results.NotFound("calendario não encontrado.");
    }

    return Results.Ok(calendars);
});


// PUT - Atualizar um calendário
app.MapPut("/calendar/update/{id}", async (int id, CalendarUpdateDto calendarDto, AppDbContext context) =>
{
    var calendar = await context.Calendars.FindAsync(id);
    if (calendar == null)
    {
        return Results.NotFound("Calendário não encontrado.");
    }

    calendar.Title = calendarDto.Title;
    calendar.Description = calendarDto.Description;
    calendar.Date = calendarDto.Date;

    await context.SaveChangesAsync();
    return Results.Ok("Calendário atualizado com sucesso.");
});

// DELETE - Excluir um calendário
app.MapDelete("/calendar/delete/{id}", async (int id, AppDbContext context) =>
{
    var calendar = await context.Calendars.FindAsync(id);
    if (calendar == null)
    {
        return Results.NotFound("Calendário não encontrado.");
    }

    context.Calendars.Remove(calendar);
    await context.SaveChangesAsync();
    return Results.Ok("Calendário excluído com sucesso.");
});

// GET - Obter a lista de associações entre tarefas e usuários
app.MapGet("/taskuser/listar", async (AppDbContext context) =>
{
    var taskUserAssociations = await context.TarefaUsers
        .Select(tu => new 
        {
            tu.TarefaId,
            tu.UserId
        })
        .ToListAsync();

    if (taskUserAssociations == null || !taskUserAssociations.Any())
    {
        return Results.NotFound("Nenhuma associação encontrada.");
    }

    return Results.Ok(taskUserAssociations);
});



app.Run();
