using LightboxBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace LightboxBackend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<SystemSettings> Settings { get; set; }

    public DbSet<Order> Orders { get; set; }
    public DbSet<ProfileColor> ProfileColors { get; set; }
    public DbSet<SpinWheelItem> SpinWheelItems { get; set; }
    public DbSet<CustomerLead> Leads { get; set; }
    
    // New dynamic pricing tables
    public DbSet<ProfileCost> ProfileCosts { get; set; }
    public DbSet<BackingCost> BackingCosts { get; set; }
    public DbSet<AdapterPrice> AdapterPrices { get; set; }
    
    // Membership
    public DbSet<MembershipType> MembershipTypes { get; set; }
    public DbSet<Member> Members { get; set; }
    
    // Admin Auth
    public DbSet<AdminUser> AdminUsers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Seed SystemSettings with production values
        modelBuilder.Entity<SystemSettings>().HasData(new SystemSettings 
        { 
            Id = 1,
            AmperesPerMeter = 1.0m, // 50cm = 0.5A => 1m = 1.0A
            DefaultLedSpacingCm = 15.0m,
            CableFixedCost = 6.00m,
            CornerPiecePrice = 0.70m,
            LedIndoorPricePerMeter = 2.00m, // (Adet 1$) * 2
            LedOutdoorPricePerMeter = 3.00m, // (Adet 1.5$) * 2
            PrintCostPerM2 = 10.00m,
            LaborRatePercentage = 30.0m,
            ProfitMarginPercentage = 30.0m,
            WhatsAppNumber = "905000000000",
            ScrollingMessage = "Hoş geldiniz! En uygun fiyatlı Lightbox çözümleri burada."
        });

        // Seed MembershipTypes
        modelBuilder.Entity<MembershipType>().HasData(
            new MembershipType { Id = 1, Name = "Müşteri", DiscountPercentage = 0 },
            new MembershipType { Id = 2, Name = "Bayi", DiscountPercentage = 20 }
        );

        // Seed ProfileCosts (Updated 10cm prices)
        modelBuilder.Entity<ProfileCost>().HasData(
            new ProfileCost { Id = 1, DepthCm = 4.5m, IsDoubleSided = false, PricePerMeter = 4.30m, Name = "4.5cm Tek Taraf" },
            new ProfileCost { Id = 2, DepthCm = 8m, IsDoubleSided = false, PricePerMeter = 5.00m, Name = "8cm Tek Taraf" },
            new ProfileCost { Id = 3, DepthCm = 10m, IsDoubleSided = false, PricePerMeter = 7.00m, Name = "10cm Tek Taraf" }, // Updated to $7.00
            new ProfileCost { Id = 4, DepthCm = 12m, IsDoubleSided = false, PricePerMeter = 11.00m, Name = "12cm Tek Taraf" },
            new ProfileCost { Id = 5, DepthCm = 8m, IsDoubleSided = true, PricePerMeter = 6.00m, Name = "8cm Çift Taraf" },
            new ProfileCost { Id = 6, DepthCm = 10m, IsDoubleSided = true, PricePerMeter = 10.00m, Name = "10cm Çift Taraf" }, // Updated to $10.00
            new ProfileCost { Id = 7, DepthCm = 12m, IsDoubleSided = true, PricePerMeter = 12.00m, Name = "12cm Çift Taraf" }
        );

        // Seed BackingCosts (Added 3mm/5mm MDF)
        modelBuilder.Entity<BackingCost>().HasData(
            new BackingCost { Id = 1, MaterialType = "MDF_3MM", DisplayName = "3 MM MDF", PricePerM2 = 4.00m },
            new BackingCost { Id = 2, MaterialType = "MDF_5MM", DisplayName = "5 MM MDF", PricePerM2 = 6.50m },
            new BackingCost { Id = 3, MaterialType = "DEKOTA_4_5MM", DisplayName = "4.5 MM DEKOTA", PricePerM2 = 6.00m },
            new BackingCost { Id = 4, MaterialType = "KOMPOZIT_4MM", DisplayName = "KOMPOZİT", PricePerM2 = 15.00m }
        );

        // Seed AdapterPrices (Full list)
        modelBuilder.Entity<AdapterPrice>().HasData(
            new AdapterPrice { Id = 1, Name = "3A Adaptör", Amperage = 3m, Wattage = 36m, Price = 7.60m },
            new AdapterPrice { Id = 2, Name = "5A Adaptör", Amperage = 5m, Wattage = 60m, Price = 9.40m },
            new AdapterPrice { Id = 3, Name = "10A Adaptör", Amperage = 10m, Wattage = 120m, Price = 13.20m },
            new AdapterPrice { Id = 4, Name = "12.5A Adaptör", Amperage = 12.5m, Wattage = 150m, Price = 15.40m },
            new AdapterPrice { Id = 5, Name = "16.5A Adaptör", Amperage = 16.5m, Wattage = 198m, Price = 21.00m },
            new AdapterPrice { Id = 6, Name = "20A Adaptör", Amperage = 20m, Wattage = 240m, Price = 22.80m },
            new AdapterPrice { Id = 7, Name = "30A Adaptör", Amperage = 30m, Wattage = 360m, Price = 25.20m }
        );
    }
}
