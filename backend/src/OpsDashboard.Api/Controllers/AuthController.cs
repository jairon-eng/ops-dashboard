using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace OpsDashboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;

    public AuthController(IConfiguration config)
    {
        _config = config;
    }

    public record LoginRequest(string Username, string Password);

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest req)
    {
        // MVP: usuario hardcodeado (para portafolio). Luego lo pasamos a DB.
        if (req.Username != "admin" || req.Password != "admin123!")
            return Unauthorized(new { message = "Invalid credentials" });

        var jwt = _config.GetSection("Jwt");
        var issuer = jwt["Issuer"];
        var audience = jwt["Audience"];
        var key = jwt["Key"]!;

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, req.Username),
            new Claim(ClaimTypes.Name, req.Username),
            new Claim(ClaimTypes.Role, "Admin")
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(4),
            signingCredentials: creds
        );

        return Ok(new
        {
            accessToken = new JwtSecurityTokenHandler().WriteToken(token),
            expiresInSeconds = (int)TimeSpan.FromHours(4).TotalSeconds
        });
    }
}