namespace LightboxBackend.Models;

public class SpinWheelItem
{
    public int Id { get; set; }
    public string Label { get; set; } = string.Empty; // e.g. "%10 İndirim"
    public int DiscountPercentage { get; set; } // e.g. 10
    public double Probability { get; set; } // 0-100, should sum to 100 ideally
    public string ColorHex { get; set; } = "#ffffff";
    public bool IsLoss { get; set; } = false; // "Pas"
}
