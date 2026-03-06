using Microsoft.EntityFrameworkCore;
using OpsDashboard.Api.Data;
using OpsDashboard.Api.Models;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Swagger
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "OpsDashboard API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {your JWT token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// EF Core + PostgreSQL
builder.Services.AddDbContext<OpsDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// JWT
var jwtSection = builder.Configuration.GetSection("Jwt");
var issuer = jwtSection["Issuer"];
var audience = jwtSection["Audience"];
var key = jwtSection["Key"];

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key!)),
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddAuthorization();

var app = builder.Build();

// Apply migrations + seed demo data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<OpsDbContext>();

    db.Database.Migrate();

    if (!db.Events.Any())
    {
        db.Events.AddRange(
            new Event
            {
                Title = "Database connection timeout",
                Type = EventType.Incident,
                Severity = Severity.High,
                Status = EventStatus.Open,
                Source = EventSource.Manual,
                CreatedAt = DateTime.UtcNow.AddHours(-6),
                ResolvedAt = null
            },
            new Event
            {
                Title = "Scheduled server maintenance",
                Type = EventType.Maintenance,
                Severity = Severity.Medium,
                Status = EventStatus.InProgress,
                Source = EventSource.Manual,
                CreatedAt = DateTime.UtcNow.AddHours(-3),
                ResolvedAt = null
            },
            new Event
            {
                Title = "CPU usage alert",
                Type = EventType.Alert,
                Severity = Severity.High,
                Status = EventStatus.Resolved,
                Source = EventSource.Api,
                CreatedAt = DateTime.UtcNow.AddHours(-10),
                ResolvedAt = DateTime.UtcNow.AddHours(-9)
            },
            new Event
            {
                Title = "Disk space warning",
                Type = EventType.Alert,
                Severity = Severity.Low,
                Status = EventStatus.Open,
                Source = EventSource.Api,
                CreatedAt = DateTime.UtcNow.AddHours(-1),
                ResolvedAt = null
            }
        );

        db.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("DevCors");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();