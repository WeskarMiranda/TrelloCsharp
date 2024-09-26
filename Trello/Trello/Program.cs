using API.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<AppDbContext>(); 
var app = builder.Build();

// POST - Criar novo usuário
app.MapPost("/user", async (User user, AppDbContext context) =>
{
    context.Add(user);
    await context.SaveChangesAsync();
    return Results.Created($"/user/{user.Id}", user);
});

// GET - Obter a lista de todos os usuários
app.MapGet("/user/listar", async (AppDbContext context) =>
{
    var users = await context.Users.ToListAsync();
    return Results.Ok(users);
});

// PUT - Atualizar um usuário pelo Id
app.MapPut("/user/{id}", async (int id, User updatedUser, AppDbContext context) =>
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
app.MapDelete("/user/{id}", async (int id, AppDbContext context) =>
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

