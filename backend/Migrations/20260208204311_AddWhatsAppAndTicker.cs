using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LightboxBackend.Migrations
{
    /// <inheritdoc />
    public partial class AddWhatsAppAndTicker : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ScrollingMessage",
                table: "Settings",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "WhatsAppNumber",
                table: "Settings",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Settings",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ScrollingMessage", "WhatsAppNumber" },
                values: new object[] { "Hoş geldiniz! En uygun fiyatlı Lightbox çözümleri burada.", "905000000000" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ScrollingMessage",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "WhatsAppNumber",
                table: "Settings");
        }
    }
}
