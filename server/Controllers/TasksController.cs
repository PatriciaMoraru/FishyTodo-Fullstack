using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FishyTodo.API.Data;
using FishyTodo.API.Models;

namespace FishyTodo.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _db;

    public TasksController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var tasks = await _db.Tasks.ToListAsync();
        return Ok(tasks);
    }
}
