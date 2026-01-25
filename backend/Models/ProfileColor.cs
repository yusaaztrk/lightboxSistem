namespace LightboxBackend.Models;

public class ProfileColor
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string HexCode { get; set; } = "#C0C0C0"; // Default Silver
    public string CmykCode { get; set; } = string.Empty;
}
