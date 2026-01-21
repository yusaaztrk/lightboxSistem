using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LightboxBackend.Migrations
{
    /// <inheritdoc />
    public partial class FinalizeSchemaAndSeeds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "ProfileCosts",
                keyColumn: "Id",
                keyValue: 3,
                column: "PricePerMeter",
                value: 7.00m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "ProfileCosts",
                keyColumn: "Id",
                keyValue: 3,
                column: "PricePerMeter",
                value: 6.00m);
        }
    }
}
