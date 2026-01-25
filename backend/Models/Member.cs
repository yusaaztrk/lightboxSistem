using System;

namespace LightboxBackend.Models;

public class Member
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty; // Unique Identifier
    public string CompanyName { get; set; } = string.Empty; // Optional
    
    public int MembershipTypeId { get; set; }
    public MembershipType MembershipType { get; set; }

    public bool IsApproved { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
