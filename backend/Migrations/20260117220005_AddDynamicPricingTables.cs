using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace LightboxBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddDynamicPricingTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "LedSpacingOptions",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "LedSpacingOptions",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DropColumn(
                name: "DigerBaskiM2",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "DigerKoseAparatiAdet",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "DigerSabitEkstraGider",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Kasa10Double",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Kasa10Single",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Kasa12Double",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Kasa12Single",
                table: "Settings");

            migrationBuilder.RenameColumn(
                name: "ZeminMdf4mm",
                table: "Settings",
                newName: "ProfitMarginPercentage");

            migrationBuilder.RenameColumn(
                name: "ZeminKompozit4mm",
                table: "Settings",
                newName: "ProfileCostsJson");

            migrationBuilder.RenameColumn(
                name: "ZeminDekota4mm",
                table: "Settings",
                newName: "PrintCostPerM2");

            migrationBuilder.RenameColumn(
                name: "LedIcMekan",
                table: "Settings",
                newName: "LedOutdoorPricePerMeter");

            migrationBuilder.RenameColumn(
                name: "LedDisMekan",
                table: "Settings",
                newName: "LedIndoorPricePerMeter");

            migrationBuilder.RenameColumn(
                name: "Kasa8Single",
                table: "Settings",
                newName: "LaborRatePercentage");

            migrationBuilder.RenameColumn(
                name: "Kasa8Double",
                table: "Settings",
                newName: "CornerPiecePrice");

            migrationBuilder.RenameColumn(
                name: "Kasa5Single",
                table: "Settings",
                newName: "CableFixedCost");

            migrationBuilder.RenameColumn(
                name: "Kasa4Single",
                table: "Settings",
                newName: "AmperesPerMeter");

            migrationBuilder.CreateTable(
                name: "AdapterPrices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Amperage = table.Column<decimal>(type: "TEXT", nullable: false),
                    Wattage = table.Column<decimal>(type: "TEXT", nullable: false),
                    Price = table.Column<decimal>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdapterPrices", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BackingCosts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    MaterialType = table.Column<string>(type: "TEXT", nullable: false),
                    DisplayName = table.Column<string>(type: "TEXT", nullable: false),
                    PricePerM2 = table.Column<decimal>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BackingCosts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProfileCosts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    DepthCm = table.Column<decimal>(type: "TEXT", nullable: false),
                    IsDoubleSided = table.Column<bool>(type: "INTEGER", nullable: false),
                    PricePerMeter = table.Column<decimal>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfileCosts", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "AdapterPrices",
                columns: new[] { "Id", "Amperage", "Name", "Price", "Wattage" },
                values: new object[,]
                {
                    { 1, 3m, "3A Adaptör", 7.60m, 36m },
                    { 2, 5m, "5A Adaptör", 9.40m, 60m },
                    { 3, 10m, "10A Adaptör", 13.20m, 120m },
                    { 4, 12.5m, "12.5A Adaptör", 15.40m, 150m },
                    { 5, 16.5m, "16.5A Adaptör", 21.00m, 198m },
                    { 6, 20m, "20A Adaptör", 22.80m, 240m },
                    { 7, 30m, "30A Adaptör", 25.20m, 360m }
                });

            migrationBuilder.InsertData(
                table: "BackingCosts",
                columns: new[] { "Id", "DisplayName", "MaterialType", "PricePerM2" },
                values: new object[,]
                {
                    { 1, "3 MM MDF", "MDF_3MM", 4.00m },
                    { 2, "5 MM MDF", "MDF_5MM", 6.50m },
                    { 3, "4.5 MM DEKOTA", "DEKOTA_4_5MM", 6.00m },
                    { 4, "KOMPOZİT", "KOMPOZIT_4MM", 15.00m }
                });

            migrationBuilder.InsertData(
                table: "ProfileCosts",
                columns: new[] { "Id", "DepthCm", "IsDoubleSided", "Name", "PricePerMeter" },
                values: new object[,]
                {
                    { 1, 4.5m, false, "4.5cm Tek Taraf", 4.30m },
                    { 2, 8m, false, "8cm Tek Taraf", 5.00m },
                    { 3, 10m, false, "10cm Tek Taraf", 6.00m },
                    { 4, 12m, false, "12cm Tek Taraf", 7.50m },
                    { 5, 8m, true, "8cm Çift Taraf", 6.00m },
                    { 6, 10m, true, "10cm Çift Taraf", 10.00m },
                    { 7, 12m, true, "12cm Çift Taraf", 15.00m }
                });

            migrationBuilder.UpdateData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "AdapterPricesJson", "AmperesPerMeter", "CableFixedCost", "CornerPiecePrice", "LaborRatePercentage", "LedIndoorPricePerMeter", "LedOutdoorPricePerMeter", "LedSpacingOptionsJson", "PrintCostPerM2", "ProfileCostsJson", "ProfitMarginPercentage" },
                values: new object[] { "[]", 1.0m, 6.00m, 0.70m, 30.0m, 2.00m, 3.00m, "[15]", 10.00m, "[]", 30.0m });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdapterPrices");

            migrationBuilder.DropTable(
                name: "BackingCosts");

            migrationBuilder.DropTable(
                name: "ProfileCosts");

            migrationBuilder.RenameColumn(
                name: "ProfitMarginPercentage",
                table: "Settings",
                newName: "ZeminMdf4mm");

            migrationBuilder.RenameColumn(
                name: "ProfileCostsJson",
                table: "Settings",
                newName: "ZeminKompozit4mm");

            migrationBuilder.RenameColumn(
                name: "PrintCostPerM2",
                table: "Settings",
                newName: "ZeminDekota4mm");

            migrationBuilder.RenameColumn(
                name: "LedOutdoorPricePerMeter",
                table: "Settings",
                newName: "LedIcMekan");

            migrationBuilder.RenameColumn(
                name: "LedIndoorPricePerMeter",
                table: "Settings",
                newName: "LedDisMekan");

            migrationBuilder.RenameColumn(
                name: "LaborRatePercentage",
                table: "Settings",
                newName: "Kasa8Single");

            migrationBuilder.RenameColumn(
                name: "CornerPiecePrice",
                table: "Settings",
                newName: "Kasa8Double");

            migrationBuilder.RenameColumn(
                name: "CableFixedCost",
                table: "Settings",
                newName: "Kasa5Single");

            migrationBuilder.RenameColumn(
                name: "AmperesPerMeter",
                table: "Settings",
                newName: "Kasa4Single");

            migrationBuilder.AddColumn<decimal>(
                name: "DigerBaskiM2",
                table: "Settings",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "DigerKoseAparatiAdet",
                table: "Settings",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "DigerSabitEkstraGider",
                table: "Settings",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Kasa10Double",
                table: "Settings",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Kasa10Single",
                table: "Settings",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Kasa12Double",
                table: "Settings",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Kasa12Single",
                table: "Settings",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.InsertData(
                table: "LedSpacingOptions",
                columns: new[] { "Id", "Cm" },
                values: new object[,]
                {
                    { 1, 10 },
                    { 2, 15 }
                });

            migrationBuilder.UpdateData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "AdapterPricesJson", "DigerBaskiM2", "DigerKoseAparatiAdet", "DigerSabitEkstraGider", "Kasa10Double", "Kasa10Single", "Kasa12Double", "Kasa12Single", "Kasa4Single", "Kasa5Single", "Kasa8Double", "Kasa8Single", "LedDisMekan", "LedIcMekan", "LedSpacingOptionsJson", "ZeminDekota4mm", "ZeminKompozit4mm", "ZeminMdf4mm" },
                values: new object[] { "[{\"amps\":3,\"price\":50,\"watt\":36},{\"amps\":5,\"price\":80,\"watt\":60},{\"amps\":10,\"price\":150,\"watt\":120},{\"amps\":12.5,\"price\":180,\"watt\":150},{\"amps\":20,\"price\":250,\"watt\":240},{\"amps\":30,\"price\":350,\"watt\":360}]", 300m, 50m, 40m, 1000m, 500m, 1500m, 750m, 150m, 250m, 600m, 400m, 4m, 2m, "[10,15]", 500m, 600m, 200m });
        }
    }
}
