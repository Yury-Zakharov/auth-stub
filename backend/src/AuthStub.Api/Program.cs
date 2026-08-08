using System.ComponentModel.DataAnnotations;
using System.Net;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddValidation();
builder.Services.AddScoped<IAuthService, AuthService>();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapPost("/api/auth/login", (LoginRequest request, IAuthService authService) => 
    {
        var token = authService.Authenticate(request.Login, request.Password);
        return token is null
            ? Results.Unauthorized()
            : Results.Ok(token);
    });


app.Run();

public interface IAuthService
 {
    public string? Authenticate(string login, string password);
 }
 
 public sealed class AuthService: IAuthService
 {
    string? IAuthService.Authenticate(string login, string password) =>
    (login, password) switch
    {
        ("intruder", "password") => "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTc4NjMxMDE4MX0.ltPwax3dpLw2hjmwmBkQ0Ybir9bQt3dtstyFZeN-KtA",
        _ => null
    };
 }
 
public record LoginRequest
 {
    [Required(AllowEmptyStrings = false)]
    public string Login { get; init; } = string.Empty;
    
    [Required(AllowEmptyStrings = false)]
    public string Password { get; init; } = string.Empty;
 }
 
