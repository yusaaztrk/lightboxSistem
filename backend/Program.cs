using LightboxBackend.Data;
using LightboxBackend.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Database Context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register custom services
builder.Services.AddScoped<LedOptimizationService>();
builder.Services.AddScoped<PricingCalculationService>();

// CORS (Allow Frontend)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.MapControllers();

// Auto-Migrate Database on Startup (Convenience for single-server)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    // Seed Admin User if not exists
    if (!db.AdminUsers.Any())
    {
        // Explicitly requested credentials
        string pHash = BCrypt.Net.BCrypt.HashPassword("eminlet3443");
        db.AdminUsers.Add(new LightboxBackend.Models.AdminUser 
        { 
            Username = "eminadminakin", 
            PasswordHash = pHash 
        });
        db.SaveChanges();
    }
}

app.Run();
