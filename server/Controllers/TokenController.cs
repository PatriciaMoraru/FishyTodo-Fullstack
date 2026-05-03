using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FishyTodo.API.Models;

namespace FishyTodo.API.Controllers;

[ApiController]
[Route("[controller]")]
public class TokenController : ControllerBase
{
    private readonly IConfiguration _config;

    public TokenController(IConfiguration config)
    {
        _config = config;
    }

    [HttpPost]
    public IActionResult GenerateToken([FromBody] TokenRequest request)
    {
        var role = request.Role.ToUpper();

        if (role != "VISITOR" && role != "WRITER" && role != "ADMIN")
            return BadRequest(new { error = "Invalid role. Must be VISITOR, WRITER, or ADMIN." });

        var permissions = role switch
        {
            "ADMIN"   => new[] { "READ", "WRITE", "DELETE" },
            "WRITER"  => new[] { "READ", "WRITE" },
            _         => new[] { "READ" }
        };

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Role, role),
            new Claim("permissions", string.Join(",", permissions))
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiration = int.Parse(_config["Jwt:ExpirationMinutes"]!);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiration),
            signingCredentials: creds
        );

        return Ok(new
        {
            token = new JwtSecurityTokenHandler().WriteToken(token),
            role,
            permissions,
            expiresIn = $"{expiration} minute(s)"
        });
    }
}
