using API.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<AppDbContext>(); 
var app = builder.Build();

// POST - Cadastra um novo usuario e grava suas informações
app.MapPost("/user/register", async (User user, AppDbContext context) =>
{
    // Verificar se a senha foi fornecida
    if (string.IsNullOrEmpty(user.Password))
    {
        return Results.BadRequest("A senha é obrigatória.");
    }

    // Gerar o hash da senha
    user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);

    context.Add(user);
    await context.SaveChangesAsync();
    return Results.Created($"/user/{user.Id}", user);
});

// POST - Faz login do usuario registrado comparando as hash
app.MapPost("/user/login", async (User loginRequest, AppDbContext context) =>
{
    // Verificar se a senha foi fornecida
    if (string.IsNullOrEmpty(loginRequest.Password))
    {
        return Results.BadRequest("A senha é obrigatória.");
    }

    // Buscar o usuário pelo nome
    var user = await context.Users.FirstOrDefaultAsync(u => u.Nome == loginRequest.Nome);
    if (user == null)
    {
        return Results.NotFound("Usuário não encontrado.");
    }

    // Verificar se a senha fornecida corresponde à hash armazenada
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
    return Results.Ok(users);
});

// PUT - Atualizar um usuário pelo Id
app.MapPut("/user/alterar/{id}", async (int id, User updatedUser, AppDbContext context) =>
{
    var user = await context.Users.FindAsync(id);
    
    if (user == null)
    {
        return Results.NotFound("Usuario não encontrado.");
    }

    user.Nome = updatedUser.Nome;
    user.Password = updatedUser.Password;

    await context.SaveChangesAsync();
    return Results.Ok("Usuario atualizado com sucesso.");
});

// DELETE - Excluir um usuário pelo Id
app.MapDelete("/user/deletar/{id}", async (int id, AppDbContext context) =>
{
    var user = await context.Users.FindAsync(id);
    
    if (user == null)
    {
        return Results.NotFound("Usuario não encontrado.");
    }

    context.Users.Remove(user);
    await context.SaveChangesAsync();
    return Results.Ok("Usuario removido com sucesso.");
});

app.Run();

