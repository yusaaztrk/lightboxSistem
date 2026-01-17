using LightboxBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace LightboxBackend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<SystemSettings> Settings { get; set; }
    public DbSet<LedSpacingOption> LedSpacingOptions { get; set; }
    public DbSet<Order> Orders { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Seed initial data if empty
        modelBuilder.Entity<SystemSettings>().HasData(new SystemSettings 
        { 
            Id = 1
            // Defaults are already set in the class, but EF requires explicit mapping for HasData sometimes or just constructor.
            // Simplified for now, will handle seeding in Program.cs if needed or rely on default values when row created.
        });

        modelBuilder.Entity<LedSpacingOption>().HasData(
            new LedSpacingOption { Id = 1, Cm = 10 },
            new LedSpacingOption { Id = 2, Cm = 15 }
        );
    }
}
