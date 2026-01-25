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
        // 5cm margin on both sides
        var spanWidth = widthCm - (2 * EDGE_MARGIN_CM);
        
        // If box is too small (< 10cm), assume 1 central strip or handle gracefully
        if (spanWidth <= 0)
        {
             var singleStripLength = (heightCm - LENGTH_MARGIN_CM) / 100; 
             return new LedLayoutResult {
                Direction = "Vertical",
                StripCount = isDoubleSided ? 2 : 1,
                StripLength = singleStripLength,
                TotalLedMeters = isDoubleSided ? singleStripLength * 2 : singleStripLength,
                TotalCost = (isDoubleSided ? singleStripLength * 2 : singleStripLength) * ledPrice
             };
        }

        // Calculate number of GAPS needed to cover the span with max 15cm spacing
        var gapCount = (int)Math.Ceiling(spanWidth / LED_SPACING_CM);
        
        // Total strips = Gaps + 1 (Start strip + End strip + intermediates)
        var stripCount = gapCount + 1;
        
        // Each strip runs the full height MINUS margins (2cm soldering)
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
        // 5cm margin on top and bottom
        var spanHeight = heightCm - (2 * EDGE_MARGIN_CM);
        
        if (spanHeight <= 0)
        {
             var singleStripLength = (widthCm - LENGTH_MARGIN_CM) / 100; 
             return new LedLayoutResult {
                Direction = "Horizontal",
                StripCount = isDoubleSided ? 2 : 1,
                StripLength = singleStripLength,
                TotalLedMeters = isDoubleSided ? singleStripLength * 2 : singleStripLength,
                TotalCost = (isDoubleSided ? singleStripLength * 2 : singleStripLength) * ledPrice
             };
        }
        
        // Calculate number of GAPS
        var gapCount = (int)Math.Ceiling(spanHeight / LED_SPACING_CM);
        var stripCount = gapCount + 1;
        
        // Each strip runs the full width MINUS margins (2cm soldering)
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
