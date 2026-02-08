using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LightboxBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddLedSpacingSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DefaultLedSpacingCm",
                table: "Settings",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "LedSpacingCm",
                table: "BackingCosts",
                type: "TEXT",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "BackingCosts",
                keyColumn: "Id",
                keyValue: 1,
                column: "LedSpacingCm",
                value: null);

            migrationBuilder.UpdateData(
                table: "BackingCosts",
                keyColumn: "Id",
                keyValue: 2,
                column: "LedSpacingCm",
                value: null);

            migrationBuilder.UpdateData(
                table: "BackingCosts",
                keyColumn: "Id",
                keyValue: 3,
                column: "LedSpacingCm",
                value: null);

            migrationBuilder.UpdateData(
                table: "BackingCosts",
                keyColumn: "Id",
                keyValue: 4,
                column: "LedSpacingCm",
                value: null);

            migrationBuilder.UpdateData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: 1,
                column: "DefaultLedSpacingCm",
                value: 15.0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DefaultLedSpacingCm",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "LedSpacingCm",
                table: "BackingCosts");
        }
    }
}
