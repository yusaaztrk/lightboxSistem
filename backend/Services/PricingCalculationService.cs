namespace LightboxBackend.Services;

using LightboxBackend.Data;
using LightboxBackend.Models;
using Microsoft.EntityFrameworkCore;

public class PricingCalculationService
{
    private readonly LedOptimizationService _ledOptimizer;
    private readonly AppDbContext _context;
    
    public PricingCalculationService(
        LedOptimizationService ledOptimizer,
        AppDbContext context)
    {
        _ledOptimizer = ledOptimizer;
        _context = context;
    }
    
    public async Task<CalculationBreakdown> CalculateDetailedPrice(
        decimal width, decimal height, decimal depth, bool isDoubleSided, 
        string ledType, string backplateType, SystemSettings settings)
    {
        var breakdown = new CalculationBreakdown();
        
        // 1. Calculate dimensions
        var widthM = width / 100m;
        var heightM = height / 100m;
        var perimeterM = (widthM + heightM) * 2;
        var areaM2 = widthM * heightM;
        
        // 2. Profile cost (from ProfileCost table)
        var profileCost = await _context.ProfileCosts
            .FirstOrDefaultAsync(p => 
                p.DepthCm == depth && 
                p.IsDoubleSided == isDoubleSided);
        
        if (profileCost == null)
            throw new Exception($"Profil bulunamadı: {depth}cm {(isDoubleSided ? "Çift" : "Tek")} Taraf");
        
        breakdown.ProfileCost = perimeterM * profileCost.PricePerMeter;
        
        // 3. Backing cost (from BackingCost table - NO MORE HARDCODED!)
        var backingCost = await _context.BackingCosts
            .FirstOrDefaultAsync(b => b.MaterialType == backplateType);
        
        if (backingCost == null)
            throw new Exception($"Zemin malzemesi bulunamadı: {backplateType}");
        
        breakdown.BackingCost = areaM2 * backingCost.PricePerM2;
        
        // 4. Print cost (x2 if double-sided)
        // Ekran görüntüsü: "LEDBOX BASKI MALİYETİ M² 10,00$"
        var printMultiplier = isDoubleSided ? 2 : 1;
        breakdown.PrintCost = areaM2 * settings.PrintCostPerM2 * printMultiplier;
        
        // 5. LED optimization
        var ledPrice = ledType == "INNER" 
            ? settings.LedIndoorPricePerMeter 
            : settings.LedOutdoorPricePerMeter;
        
        var (optimal, alternative) = _ledOptimizer.CalculateOptimalLayout(
            width, height, isDoubleSided, ledPrice);
        
        breakdown.SelectedLayout = optimal;
        breakdown.AlternativeLayout = alternative;
        breakdown.LedCost = optimal.TotalCost;
        
        // 6. Adapter selection (AMPERE-BASED from AdapterPrice table)
        // Ekran görüntüsü: 50cm çubuk 0.5 Amper → 1 Metre = 1.0 Amper
        var totalAmperes = optimal.TotalLedMeters * settings.AmperesPerMeter;
        
        // Add 20% safety margin for adapter selection
        var safetyAmperes = totalAmperes * 1.2m;
        
        // Select adapter from database that can handle the ampere load
        var adapter = await _context.AdapterPrices
            .Where(a => a.Amperage >= safetyAmperes)
            .OrderBy(a => a.Amperage) // En küçük uygun adaptörü seç
            .FirstOrDefaultAsync();
        
        if (adapter == null)
        {
            // Eğer hiçbir adaptör yetmiyorsa, en büyüğünü al
            adapter = await _context.AdapterPrices
                .OrderByDescending(a => a.Amperage)
                .FirstAsync();
        }
        
        breakdown.AdapterCost = adapter.Price;
        breakdown.AdapterName = adapter.Name;
        breakdown.RequiredAmperes = totalAmperes;
        breakdown.SelectedAmperes = adapter.Amperage;
        
        // 7. Cable and corner pieces
        // Ekran görüntüsü: "KABLO MALİYETİ: HER BİR ADET İÇİN 6,00$"
        breakdown.CableCost = settings.CableFixedCost;
        
        // Ekran görüntüsü: "KÖŞEBENT MALİYETİ: ADET 0,70$"
        var cornerCount = isDoubleSided ? 8 : 4;
        breakdown.CornerPieceCost = cornerCount * settings.CornerPiecePrice;
        
        // 8. Calculate totals
        breakdown.RawMaterialTotal = 
            breakdown.ProfileCost + 
            breakdown.BackingCost + 
            breakdown.PrintCost + 
            breakdown.LedCost + 
            breakdown.AdapterCost + 
            breakdown.CableCost + 
            breakdown.CornerPieceCost;
        
        // 9. Add labor (Ses kaydı: %30 İşçilik)
        breakdown.LaborCost = breakdown.RawMaterialTotal * 
            (settings.LaborRatePercentage / 100m);
        breakdown.LaboredTotal = breakdown.RawMaterialTotal + breakdown.LaborCost;
        
        // 10. Add profit margin (Ses kaydı: %30 Kar)
        breakdown.ProfitMargin = breakdown.LaboredTotal * 
            (settings.ProfitMarginPercentage / 100m);
        breakdown.FinalPrice = breakdown.LaboredTotal + breakdown.ProfitMargin;
        
        return breakdown;
    }
}
