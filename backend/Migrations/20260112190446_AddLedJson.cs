using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LightboxBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddLedJson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LedSpacingOptionsJson",
                table: "Settings",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: 1,
                column: "LedSpacingOptionsJson",
                value: "[10,15]");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LedSpacingOptionsJson",
                table: "Settings");
        }
    }
}
