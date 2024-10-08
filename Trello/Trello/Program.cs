using Trello.Models; // Certifique-se de que este namespace está correto
using Microsoft.EntityFrameworkCore;
using Trello.Data;

var builder = WebApplication.CreateBuilder(args);

// Configuração do banco de dados (SQLite como exemplo)
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

// GET - Obter a lista de todos os usuários
app.MapGet("/user/listar", async (AppDbContext context) =>
{
    var users = await context.Users.ToListAsync();
    if (users == null || users.Count == 0)
    {
        return Results.NotFound(); // Se não houver usuários, retorne 404
    }
    return Results.Ok(users); // Retorne os usuários se existirem
});

// PUT - Atualizar um usuário pelo Id
app.MapPut("/user/alterar/{id}", async (int id, User updatedUser, AppDbContext context) =>
{
    var user = await context.Users.FindAsync(id);
    
    if (user == null)
    {
        return Results.NotFound("Usuário não encontrado.");
    }

    user.Nome = updatedUser.Nome;

    // Atualizar senha se fornecida
    if (!string.IsNullOrEmpty(updatedUser.Password))
    {
        user.Password = BCrypt.Net.BCrypt.HashPassword(updatedUser.Password);
    }

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

    // Lista para armazenar IDs de usuários que não foram encontrados
    var usuariosNaoEncontrados = new List<int>();

    try
    {
        // Crie a nova tarefa com os dados recebidos
        var tarefa = new Tarefa
        {
            Name = tarefaDto.Name,
            Description = tarefaDto.Description,
            Status = tarefaDto.Status
        };

        // Adicione usuários à tarefa
        foreach (var userId in tarefaDto.UserIds)
        {
            var user = await context.Users.FindAsync(userId);
            if (user != null)
            {
                tarefa.TarefaUsers.Add(new TarefaUser { UserId = userId, Tarefa = tarefa });
                Console.WriteLine($"Usuário com ID {userId} adicionado à tarefa.");
            }
            else
            {
                // Adiciona o ID à lista de usuários não encontrados
                usuariosNaoEncontrados.Add(userId);
            }
        }

        // Se algum usuário não foi encontrado, retorna erro
        if (usuariosNaoEncontrados.Any())
        {
            return Results.BadRequest($"Os seguintes IDs de usuários não foram encontrados: {string.Join(", ", usuariosNaoEncontrados)}.");
        }

        // Se todos os usuários foram encontrados, salva a tarefa
        context.Tarefas.Add(tarefa);
        await context.SaveChangesAsync();

        return Results.Created($"/task/{tarefa.Id}", tarefa);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Erro ao criar tarefa: {ex.Message}");
        return Results.Problem($"Erro ao criar tarefa: {ex.Message}", statusCode: 500);
    }
});



// GET - Obter a lista de todas as tarefas
app.MapGet("/task/listar", async (AppDbContext context) =>
{
    // Inclua os relacionamentos TarefaUsers e Users ao buscar as tarefas
    var tarefas = await context.Tarefas
        .Include(t => t.TarefaUsers) // Inclui os relacionamentos de TarefaUsers
        .ThenInclude(tu => tu.User)  // Inclui os usuários associados
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

// PUT - Atualizar uma tarefa pelo Id
app.MapPut("/task/editar/{id}", async (int id, Tarefa updatedTask, AppDbContext context) =>
{
    var task = await context.Tarefas.FindAsync(id);
    
    if (task == null)
    {
        return Results.NotFound("Tarefa não encontrada.");
    }

    // Atualiza os campos da tarefa
    task.Name = updatedTask.Name;
    task.Description = updatedTask.Description; // Atualizar a descrição se necessário
    task.Status = updatedTask.Status; // Atualizar o status se necessário

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
