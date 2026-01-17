using System.ComponentModel.DataAnnotations;

namespace LightboxBackend.Models;

public class ProfileCost
{
    [Key]
    public int Id { get; set; }
    
    public string Name { get; set; } = string.Empty; // Örn: "4.5 cm Kasa"
    public decimal DepthCm { get; set; } // 4.5, 8, 10, 12
    public bool IsDoubleSided { get; set; } // Tek taraflı mı çift taraflı mı?
    public decimal PricePerMeter { get; set; } // Metretül fiyatı
    
    // Helper property for display
    public string DisplayName => $"{DepthCm}cm {(IsDoubleSided ? "Çift Taraf" : "Tek Taraf")}";
}
