using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LightboxBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdapterPricesJson",
                table: "Settings",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Kasa5Single",
                table: "Settings",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Kasa8Double",
                table: "Settings",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Kasa8Single",
                table: "Settings",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.UpdateData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "AdapterPricesJson", "Kasa5Single", "Kasa8Double", "Kasa8Single", "LedDisMekan" },
                values: new object[] { "[{\"amps\":3,\"price\":50,\"watt\":36},{\"amps\":5,\"price\":80,\"watt\":60},{\"amps\":10,\"price\":150,\"watt\":120},{\"amps\":12.5,\"price\":180,\"watt\":150},{\"amps\":20,\"price\":250,\"watt\":240},{\"amps\":30,\"price\":350,\"watt\":360}]", 250m, 600m, 400m, 4m });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdapterPricesJson",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Kasa5Single",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Kasa8Double",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Kasa8Single",
                table: "Settings");

            migrationBuilder.UpdateData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: 1,
                column: "LedDisMekan",
                value: 0m);
        }
    }
}
