using System.ComponentModel.DataAnnotations;

namespace LightboxBackend.Models;

public class BackingCost
{
    [Key]
    public int Id { get; set; }
    
    public string MaterialType { get; set; } = string.Empty; // "MDF_3MM", "DEKOTA_4_5MM", etc.
    public string DisplayName { get; set; } = string.Empty; // "3 MM MDF"
    public decimal PricePerM2 { get; set; } // M² fiyatı
    
    // Helper property
    public string FullDisplayName => $"{DisplayName} - ${PricePerM2}/m²";
}
