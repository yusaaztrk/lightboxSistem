using System;
using System.ComponentModel.DataAnnotations;

namespace LightboxBackend.Models
{
    public class Order
    {
        public int Id { get; set; }

        public string? CustomerName { get; set; }
        public string? CustomerEmail { get; set; }
        public string? CustomerPhone { get; set; }

        public string Dimensions { get; set; } = string.Empty; // e.g. "50x70"
        public decimal Price { get; set; }
        
        // Detailed configuration stored as JSON or detailed string
        public string ConfigurationDetails { get; set; } = string.Empty; 
        
        // Full Cost Breakdown JSON
        public string CostDetails { get; set; } = string.Empty; 
        
        public string Status { get; set; } = "Pending"; // Pending, Completed, Cancelled
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
