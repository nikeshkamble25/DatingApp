using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.DTO;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Tokens;

namespace DatingApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        // private readonly IAuthRepository _repo;
        private readonly IConfiguration _config;
        private readonly IMapper _mapper;
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;

        public AuthController(
            // IAuthRepository repo,
                IConfiguration config,
                IMapper mapper,
                UserManager<User> userManager,
                SignInManager<User> signInManager)
        {
            // this._repo = repo;
            this._config = config;
            this._mapper = mapper;
            this._userManager = userManager;
            this._signInManager = signInManager;
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto userDto)
        {
            // if (!ModelState.IsValid)
            //     return BadRequest(ModelState);
            //userDto.Username = userDto.Username.ToLower();
            // if (await _repo.UserExists(userDto.Username))
            //     return BadRequest("Username alread exists");
            var userToCreate = _mapper.Map<User>(userDto);
            var result = await _userManager.CreateAsync(userToCreate, userDto.Password);
            // var createdUser = await _repo.Register(userToCreate, userDto.Password);
            var userToReturn = _mapper.Map<UserForDetailedDto>(userToCreate);
            if (result.Succeeded)
            {
                return CreatedAtRoute("GetUser", new { controller = "Users", id = userToCreate.Id }, userToReturn);
            }
            return BadRequest(result.Errors);
        }

        [AllowAnonymous]
        [HttpPost("login")]
        // public async Task<IActionResult> Login([FromBody]UserLoginDto loginDto)
        public async Task<IActionResult> Login(UserLoginDto loginDto)
        {

            var user = await _userManager.FindByNameAsync(loginDto.Username);
            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
            if (result.Succeeded)
            {
                var appUser = _mapper.Map<UserForListDto>(user);
                return Ok(new
                {
                    // token = tokenHandler.WriteToken(token),
                    token = GenerateJWTToken(user),
                    user
                });
            }
            return Unauthorized();
            // var userFromRepo = await _repo.Login(loginDto.Username, loginDto.Password);
            // if (userFromRepo == null)
            // return Unauthorized();
        }

        private string GenerateJWTToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier,user.Id.ToString()),
                new Claim(ClaimTypes.Name,user.UserName)
            };

            var keyToken = _config.GetSection("AppSettings:Token").Value;

            var key = new SymmetricSecurityKey(Encoding
                        .UTF8
                        .GetBytes(keyToken)
                    );
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenDescriptor = new SecurityTokenDescriptor()
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = creds
            };
            var tokenHandler = new JwtSecurityTokenHandler();

            IdentityModelEventSource.ShowPII = true;

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}