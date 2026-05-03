using Microsoft.AspNetCore.Mvc;

namespace FishyTodo.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "healthy",
            app = "FishyTodo API",
            timestamp = DateTime.UtcNow
        });
    }
}
