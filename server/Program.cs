using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using FishyTodo.API.Data;

var builder = WebApplication.CreateBuilder(args);

var fishyFrontend = builder.Configuration["FishyFrontend:Origins"]
    ?? "http://localhost:5173;http://127.0.0.1:5173";
builder.Services.AddCors(options =>
{
    options.AddPolicy("FishyTodoCors", policy =>
    {
        policy.WithOrigins(fishyFrontend.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseInMemoryDatabase("FishyTodoDB"));

var jwtKey = builder.Configuration["Jwt:Key"]!;
var jwtIssuer = builder.Configuration["Jwt:Issuer"]!;
var jwtAudience = builder.Configuration["Jwt:Audience"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "FishyTodo API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste your JWT token here. Get one from POST /token first."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "FishyTodo API v1");
        c.RoutePrefix = string.Empty; // Swagger at root: http://localhost:5112/
    });
}

app.UseHttpsRedirection();
app.UseCors("FishyTodoCors");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
