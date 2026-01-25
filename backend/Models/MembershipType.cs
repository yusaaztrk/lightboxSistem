using System.Collections.Generic;

namespace LightboxBackend.Models;

public class MembershipType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // e.g. "Bayi", "Müşteri"
    public int DiscountPercentage { get; set; } // e.g. 20 for Bayi, 0 for Müşteri
}
