namespace LightboxBackend.Models;

public class CalculationBreakdown
{
    public decimal ProfileCost { get; set; }
    public decimal BackingCost { get; set; }
    public decimal PrintCost { get; set; }
    public decimal LedCost { get; set; }
    public decimal AdapterCost { get; set; }
    public decimal CableCost { get; set; }
    public decimal CornerPieceCost { get; set; }
    
    public decimal RawMaterialTotal { get; set; }
    public decimal LaborCost { get; set; }
    public decimal LaboredTotal { get; set; }
    public decimal ProfitMargin { get; set; }
    public decimal FinalPrice { get; set; }
    
    public LedLayoutResult? SelectedLayout { get; set; }
    public LedLayoutResult? AlternativeLayout { get; set; }
    
    // Additional adapter info
    public string AdapterName { get; set; } = string.Empty;
    public decimal RequiredAmperes { get; set; }
    public decimal SelectedAmperes { get; set; }
}
