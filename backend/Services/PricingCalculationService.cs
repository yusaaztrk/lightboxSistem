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
        string ledType, string backplateType, SystemSettings settings, int? profileId = null, bool hasFeet = false)
    {
        var breakdown = new CalculationBreakdown();
        
        // 1. Calculate dimensions
        var widthM = width / 100m;
        var heightM = height / 100m;
        var perimeterM = (widthM + heightM) * 2;
        var areaM2 = widthM * heightM;
        
        breakdown.Perimeter = perimeterM;
        breakdown.AreaM2 = areaM2;
        
        // 2. Profile cost (Prioritize ProfileID for specific selection)
        ProfileCost? profileCost = null;

        if (profileId.HasValue && profileId.Value > 0)
        {
            profileCost = await _context.ProfileCosts.FindAsync(profileId.Value);
        }

        // Fallback or validation: if ID not found or not provided, match by depth/type
        if (profileCost == null)
        {
            profileCost = await _context.ProfileCosts
                .FirstOrDefaultAsync(p => 
                    p.DepthCm == depth && 
                    p.IsDoubleSided == isDoubleSided);
        }
        
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
        // Fetch ALL adapters first to sort in memory (Client-side evaluation)
        // because SQLite doesn't support decimal OrderBy in this version
        var allAdapters = await _context.AdapterPrices.ToListAsync();

        var adapter = allAdapters
            .Where(a => a.Amperage >= safetyAmperes)
            .OrderBy(a => a.Amperage)
            .FirstOrDefault();
        
        if (adapter == null)
        {
            // If none sufficient, pick the largest one
            adapter = allAdapters
                .OrderByDescending(a => a.Amperage)
                .FirstOrDefault();
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
        
        // Stand Cost Logic
        if (hasFeet) 
        {
            breakdown.StandCost = settings.StandPrice;
        }
        else 
        {
            breakdown.StandCost = 0;
        }

        // 8. Calculate totals
        breakdown.RawMaterialTotal = 
            breakdown.ProfileCost + 
            breakdown.BackingCost + 
            breakdown.PrintCost + 
            breakdown.LedCost + 
            breakdown.AdapterCost + 
            breakdown.CableCost + 
            breakdown.CornerPieceCost +
            breakdown.StandCost;
        
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
