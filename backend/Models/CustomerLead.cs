using System;

namespace LightboxBackend.Models;

public class CustomerLead
{
    public int Id { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string WonPrizeLabel { get; set; } = string.Empty;
    public string DiscountCode { get; set; } = string.Empty;
    public int DiscountPercentage { get; set; } = 0;
    public bool IsUsed { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
