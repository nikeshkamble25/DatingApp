using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using DatingApp.API.Data;
using DatingApp.API.DTO;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace DatingApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IAuthRepository _repo;
        private readonly IConfiguration _config;

        public UserController(IAuthRepository repo,
                IConfiguration config)
        {
            this._repo = repo;
            this._config = config;
        }
        
        [Authorize]
        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto userDto)
        // public async Task<IActionResult> Register([FromBody]UserRegisterDto userDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            userDto.Username = userDto.Username.ToLower();
            if (await _repo.UserExists(userDto.Username))
                return BadRequest("Username alread exists");
            var userToCreate = new User()
            {
                Username = userDto.Username
            };
            var createdUser = await _repo.Register(userToCreate, userDto.Password);
            return Ok(createdUser);
        }

        [HttpPost("login")]
        // public async Task<IActionResult> Login([FromBody]UserLoginDto loginDto)
        public async Task<IActionResult> Login(UserLoginDto loginDto)
        {
            var userFromRepo = await _repo.Login(loginDto.Username, loginDto.Password);
            if (userFromRepo == null)
                return Unauthorized();
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier,userFromRepo.Id.ToString()),
                new Claim(ClaimTypes.Name,userFromRepo.Username)
            };

            var key = new SymmetricSecurityKey(Encoding
                        .UTF8
                        .GetBytes(_config.GetSection("AppSettings:Token").Value)
                    );
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor()
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = creds
            };
            var tokenHandler = new JwtSecurityTokenHandler();

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return Ok(new
            {
                token = tokenHandler.WriteToken(token)
            });
        }
    }
}