using System.ComponentModel.DataAnnotations;

namespace LightboxBackend.Models
{
    public class AdminUser
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
    }
}
