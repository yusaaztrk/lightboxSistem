using System.ComponentModel.DataAnnotations;

namespace LightboxBackend.Models;

public class LedSpacingOption
{
    [Key]
    public int Id { get; set; }
    
    public int Cm { get; set; } // e.g., 10, 15
}
