namespace LightboxBackend.Services;

using LightboxBackend.Models;

public class LedOptimizationService
{
    private const decimal EDGE_MARGIN_CM = 5;
    private const decimal LED_SPACING_CM = 15;
    private const decimal LENGTH_MARGIN_CM = 2; // Montaj payı: kablo lehim ve montaj rahatlığı
    
    public (LedLayoutResult optimal, LedLayoutResult alternative) 
        CalculateOptimalLayout(decimal widthCm, decimal heightCm, 
                               bool isDoubleSided, decimal ledPricePerMeter)
    {
        // Vertical layout: strips run along height
        var verticalResult = CalculateVerticalLayout(widthCm, heightCm, 
                                                      isDoubleSided, ledPricePerMeter);
        
        // Horizontal layout: strips run along width
        var horizontalResult = CalculateHorizontalLayout(widthCm, heightCm, 
                                                          isDoubleSided, ledPricePerMeter);
        
        // Select the cheaper option
        if (verticalResult.TotalCost <= horizontalResult.TotalCost)
            return (verticalResult, horizontalResult);
        else
            return (horizontalResult, verticalResult);
    }
    
    private LedLayoutResult CalculateVerticalLayout(decimal widthCm, decimal heightCm, 
                                                     bool isDoubleSided, decimal ledPrice)
    {
        // Deduct 10cm total (5cm from each side)
        var usableWidth = widthCm - (2 * EDGE_MARGIN_CM);
        
        // Calculate number of strips (15cm spacing)
        var stripCount = (int)Math.Ceiling(usableWidth / LED_SPACING_CM);
        stripCount = Math.Max(1, stripCount); // At least 1 strip
        
        // Each strip runs the full height MINUS mounting margin
        var stripLength = (heightCm - LENGTH_MARGIN_CM) / 100; // Convert to meters
        
        var totalMeters = stripCount * stripLength;
        if (isDoubleSided) totalMeters *= 2;
        
        return new LedLayoutResult
        {
            Direction = "Vertical",
            StripCount = isDoubleSided ? stripCount * 2 : stripCount,
            StripLength = stripLength,
            TotalLedMeters = totalMeters,
            TotalCost = totalMeters * ledPrice
        };
    }
    
    private LedLayoutResult CalculateHorizontalLayout(decimal widthCm, decimal heightCm, 
                                                       bool isDoubleSided, decimal ledPrice)
    {
        // Deduct 10cm total (5cm from top and bottom)
        var usableHeight = heightCm - (2 * EDGE_MARGIN_CM);
        
        // Calculate number of strips (15cm spacing)
        var stripCount = (int)Math.Ceiling(usableHeight / LED_SPACING_CM);
        stripCount = Math.Max(1, stripCount);
        
        // Each strip runs the full width MINUS mounting margin
        var stripLength = (widthCm - LENGTH_MARGIN_CM) / 100; // Convert to meters
        
        var totalMeters = stripCount * stripLength;
        if (isDoubleSided) totalMeters *= 2;
        
        return new LedLayoutResult
        {
            Direction = "Horizontal",
            StripCount = isDoubleSided ? stripCount * 2 : stripCount,
            StripLength = stripLength,
            TotalLedMeters = totalMeters,
            TotalCost = totalMeters * ledPrice
        };
    }
}
