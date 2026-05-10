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

var rawConnection = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");

var connectionString = ConvertPostgresUrl(rawConnection);

static string ConvertPostgresUrl(string input)
{
    if (!input.StartsWith("postgres://") && !input.StartsWith("postgresql://"))
        return input;
    var uri = new Uri(input);
    var parts = uri.UserInfo.Split(':', 2);
    var user = parts[0];
    var password = parts.Length > 1 ? parts[1] : "";
    var port = uri.Port > 0 ? uri.Port : 5432;
    var database = uri.AbsolutePath.TrimStart('/');
    var query = System.Web.HttpUtility.ParseQueryString(uri.Query);
    var sslMode = query["sslmode"] switch
    {
        "require"            => "Require",
        "verify-ca"          => "VerifyCA",
        "verify-full"        => "VerifyFull",
        "prefer"             => "Prefer",
        "allow"              => "Allow",
        "disable"            => "Disable",
        _                    => "Disable"   // internal Render network — no SSL needed
    };
    var trustCert = sslMode is "Require" or "Prefer" ? ";Trust Server Certificate=true" : "";
    return $"Host={uri.Host};Port={port};Database={database};Username={user};Password={password};SSL Mode={sslMode}{trustCert}";
}

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(connectionString));

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

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "FishyTodo API v1");
    c.RoutePrefix = string.Empty; // Swagger at root: https://fishytodo-api.onrender.com
});

if (app.Environment.IsDevelopment()) app.UseHttpsRedirection();
app.UseCors("FishyTodoCors");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
