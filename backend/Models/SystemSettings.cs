using System.ComponentModel.DataAnnotations;

namespace LightboxBackend.Models;

public class SystemSettings
{
    [Key]
    public int Id { get; set; }

    // Kasa (Mt Tül) Costs
    public decimal Kasa4Single { get; set; } = 150;
    public decimal Kasa5Single { get; set; } = 250;
    public decimal Kasa8Single { get; set; } = 400;
    public decimal Kasa10Single { get; set; } = 500;
    public decimal Kasa12Single { get; set; } = 750;
    
    public decimal Kasa8Double { get; set; } = 600;
    public decimal Kasa10Double { get; set; } = 1000;
    public decimal Kasa12Double { get; set; } = 1500;

    // Zemin (M2) Costs
    public decimal ZeminMdf4mm { get; set; } = 200;
    public decimal ZeminDekota4mm { get; set; } = 500;
    public decimal ZeminKompozit4mm { get; set; } = 600;

    // Led (Mt Tül) Costs
    public decimal LedIcMekan { get; set; } = 2;
    public decimal LedDisMekan { get; set; } = 4;

    // Diğer Giderler
    public decimal DigerBaskiM2 { get; set; } = 300;
    public decimal DigerKoseAparatiAdet { get; set; } = 50;
    public decimal DigerSabitEkstraGider { get; set; } = 40;

    // JSON Fields
    public string AdapterPricesJson { get; set; } = "[{\"amps\":3,\"price\":50,\"watt\":36},{\"amps\":5,\"price\":80,\"watt\":60},{\"amps\":10,\"price\":150,\"watt\":120},{\"amps\":12.5,\"price\":180,\"watt\":150},{\"amps\":20,\"price\":250,\"watt\":240},{\"amps\":30,\"price\":350,\"watt\":360}]";
    
    public string LedSpacingOptionsJson { get; set; } = "[10,15]";
}
