using System.ComponentModel.DataAnnotations;

namespace LightboxBackend.Models;

public class SystemSettings
{
    [Key]
    public int Id { get; set; }

    // --- GENEL MALİYETLER (Sabit Giderler) ---
    // Ekran görüntüsü: "KABLO MALİYETİ: HER BİR ADET İÇİN 6,00$"
    public decimal CableFixedCost { get; set; } = 6.00m;

    // Ekran görüntüsü: "KÖŞEBENT MALİYETİ: ADET 0,70$"
    public decimal CornerPiecePrice { get; set; } = 0.70m;

    // Ekran görüntüsü: "LEDBOX BASKI MALİYETİ M² 10,00$"
    public decimal PrintCostPerM2 { get; set; } = 10.00m;

    // --- ORANLAR (Parametrik) ---
    // Ses kaydı: "%30 İşçilik... %30 Kar"
    public decimal LaborRatePercentage { get; set; } = 30.0m;
    public decimal ProfitMarginPercentage { get; set; } = 30.0m;
    
    // Sadece Kumaş Hesabı için Kar Marjı
    public decimal FabricProfitMarginPercentage { get; set; } = 30.0m;

    // Ayak (Stand) Ücreti (Takım)
    public decimal StandPrice { get; set; } = 50.0m;

    // --- LED ve ELEKTRİK PARAMETRELERİ ---
    // Ekran görüntüsü: 50cm çubuk 0.5 Amper → 1 Metre = 1.0 Amper
    public decimal AmperesPerMeter { get; set; } = 1.0m;

    // Default LED dizim aralığı (cm) - Zemin üzerinde override yoksa kullanılır
    public decimal DefaultLedSpacingCm { get; set; } = 15.0m;

    // Ekran görüntüsü: İç mekan adet (50cm) 1$ → Metresi 2$
    public decimal LedIndoorPricePerMeter { get; set; } = 2.00m;

    // Ekran görüntüsü: Dış mekan adet (50cm) 1.5$ → Metresi 3$
    public decimal LedOutdoorPricePerMeter { get; set; } = 3.00m;

    // --- DEPRECATED FIELDS (Geriye Dönük Uyumluluk İçin) ---
    // Not: Profil, Zemin ve Adaptör fiyatları artık ayrı tablolarda tutulacak
    [Obsolete("Use ProfileCost table instead")]
    public string ProfileCostsJson { get; set; } = "[]";
    
    [Obsolete("Use AdapterPrice table instead")]
    public string AdapterPricesJson { get; set; } = "[]";
    
    [Obsolete("LED spacing is now calculated automatically")]
    public string LedSpacingOptionsJson { get; set; } = "[15]";
}
