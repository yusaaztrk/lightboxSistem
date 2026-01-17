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
                name: "LedSpacingOptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Cm = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LedSpacingOptions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Settings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Kasa10Double = table.Column<decimal>(type: "TEXT", nullable: false),
                    Kasa10Single = table.Column<decimal>(type: "TEXT", nullable: false),
                    Kasa12Double = table.Column<decimal>(type: "TEXT", nullable: false),
                    Kasa12Single = table.Column<decimal>(type: "TEXT", nullable: false),
                    Kasa4Single = table.Column<decimal>(type: "TEXT", nullable: false),
                    ZeminMdf4mm = table.Column<decimal>(type: "TEXT", nullable: false),
                    ZeminDekota4mm = table.Column<decimal>(type: "TEXT", nullable: false),
                    ZeminKompozit4mm = table.Column<decimal>(type: "TEXT", nullable: false),
                    LedIcMekan = table.Column<decimal>(type: "TEXT", nullable: false),
                    LedDisMekan = table.Column<decimal>(type: "TEXT", nullable: false),
                    DigerBaskiM2 = table.Column<decimal>(type: "TEXT", nullable: false),
                    DigerKoseAparatiAdet = table.Column<decimal>(type: "TEXT", nullable: false),
                    DigerSabitEkstraGider = table.Column<decimal>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Settings", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "LedSpacingOptions",
                columns: new[] { "Id", "Cm" },
                values: new object[,]
                {
                    { 1, 10 },
                    { 2, 15 }
                });

            migrationBuilder.InsertData(
                table: "Settings",
                columns: new[] { "Id", "DigerBaskiM2", "DigerKoseAparatiAdet", "DigerSabitEkstraGider", "Kasa10Double", "Kasa10Single", "Kasa12Double", "Kasa12Single", "Kasa4Single", "LedDisMekan", "LedIcMekan", "ZeminDekota4mm", "ZeminKompozit4mm", "ZeminMdf4mm" },
                values: new object[] { 1, 300m, 50m, 40m, 1000m, 500m, 1500m, 750m, 150m, 0m, 2m, 500m, 600m, 200m });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LedSpacingOptions");

            migrationBuilder.DropTable(
                name: "Settings");
        }
    }
}
