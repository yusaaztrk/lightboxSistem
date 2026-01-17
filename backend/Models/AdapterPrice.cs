using System.ComponentModel.DataAnnotations;

namespace LightboxBackend.Models;

public class AdapterPrice
{
    [Key]
    public int Id { get; set; }
    
    public string Name { get; set; } = string.Empty; // Örn: "5 Amper (60 Watt)"
    public decimal Amperage { get; set; } // 5.0
    public decimal Wattage { get; set; } // 60 (bilgi amaçlı)
    public decimal Price { get; set; } // 9.40
    
    // Helper property for display
    public string DisplayName => $"{Amperage}A ({Wattage}W) - ${Price}";
}
