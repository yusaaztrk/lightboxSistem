namespace LightboxBackend.Models;

public class LedLayoutResult
{
    public string Direction { get; set; } = string.Empty; // "Horizontal" or "Vertical"
    public int StripCount { get; set; }
    public decimal StripLength { get; set; }
    public decimal TotalLedMeters { get; set; }
    public decimal TotalCost { get; set; }
}
