using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace LightboxBackend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                name: "Orders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CustomerName = table.Column<string>(type: "TEXT", nullable: true),
                    CustomerEmail = table.Column<string>(type: "TEXT", nullable: true),
                    CustomerPhone = table.Column<string>(type: "TEXT", nullable: true),
                    Dimensions = table.Column<string>(type: "TEXT", nullable: false),
                    Price = table.Column<decimal>(type: "TEXT", nullable: false),
                    ConfigurationDetails = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
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

            migrationBuilder.CreateTable(
                name: "Settings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CableFixedCost = table.Column<decimal>(type: "TEXT", nullable: false),
                    CornerPiecePrice = table.Column<decimal>(type: "TEXT", nullable: false),
                    PrintCostPerM2 = table.Column<decimal>(type: "TEXT", nullable: false),
                    LaborRatePercentage = table.Column<decimal>(type: "TEXT", nullable: false),
                    ProfitMarginPercentage = table.Column<decimal>(type: "TEXT", nullable: false),
                    AmperesPerMeter = table.Column<decimal>(type: "TEXT", nullable: false),
                    LedIndoorPricePerMeter = table.Column<decimal>(type: "TEXT", nullable: false),
                    LedOutdoorPricePerMeter = table.Column<decimal>(type: "TEXT", nullable: false),
                    ProfileCostsJson = table.Column<string>(type: "TEXT", nullable: false),
                    AdapterPricesJson = table.Column<string>(type: "TEXT", nullable: false),
                    LedSpacingOptionsJson = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Settings", x => x.Id);
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
                    { 3, 10m, false, "10cm Tek Taraf", 7.00m },
                    { 4, 12m, false, "12cm Tek Taraf", 11.00m },
                    { 5, 8m, true, "8cm Çift Taraf", 6.00m },
                    { 6, 10m, true, "10cm Çift Taraf", 10.00m },
                    { 7, 12m, true, "12cm Çift Taraf", 12.00m }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "AdapterPricesJson", "AmperesPerMeter", "CableFixedCost", "CornerPiecePrice", "LaborRatePercentage", "LedIndoorPricePerMeter", "LedOutdoorPricePerMeter", "LedSpacingOptionsJson", "PrintCostPerM2", "ProfileCostsJson", "ProfitMarginPercentage" },
                values: new object[] { 1, "[]", 1.0m, 6.00m, 0.70m, 30.0m, 2.00m, 3.00m, "[15]", 10.00m, "[]", 30.0m });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdapterPrices");

            migrationBuilder.DropTable(
                name: "BackingCosts");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "ProfileCosts");

            migrationBuilder.DropTable(
                name: "Settings");
        }
    }
}
