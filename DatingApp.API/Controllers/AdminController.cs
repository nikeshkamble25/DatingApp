using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using DatingApp.API.Data;
using DatingApp.API.DTO;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace DatingApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IOptions<CloudinarySettings> _cloudinaryConfig;
        private readonly DataContext _context;
        private Cloudinary _cloudinary;
        private readonly UserManager<User> _userManager;
        public AdminController(DataContext context,
        UserManager<User> userManager,
        IOptions<CloudinarySettings> cloudinaryConfig)
        {
            _cloudinaryConfig = cloudinaryConfig;
            _userManager = userManager;
            _context = context;
            Account acc = new Account(
              _cloudinaryConfig.Value.CloudName,
              _cloudinaryConfig.Value.ApiKey,
              _cloudinaryConfig.Value.ApiSecret
            );
            _cloudinary = new Cloudinary(acc);
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpGet("usersWithRoles")]
        public async Task<IActionResult> GetUsersWithRole()
        {
            var userList = await _context.Users.OrderByDescending(x => x.Id)
                                        .Select(user => new
                                        {
                                            Id = user.Id,
                                            UserName = user.UserName,
                                            Roles = (from userRole in user.UserRoles
                                                     join role in _context.Roles
                                                     on userRole.RoleId equals role.Id
                                                     select role.Name).ToList()
                                        }).ToListAsync();
            return Ok(userList);
        }

        [Authorize(Policy = "RequireAdminRole")]
        [HttpPost("editRoles/{userName}")]
        public async Task<ActionResult> EditRoles(string userName, RoleEditDto roleEditDto)
        {
            var user = await _userManager.FindByNameAsync(userName);
            var userRoles = await _userManager.GetRolesAsync(user);
            var selectedRoles = roleEditDto.RoleNames;
            selectedRoles = selectedRoles ?? new List<string> { };
            var result = await _userManager.AddToRolesAsync(user, selectedRoles.Except(userRoles));
            if (!result.Succeeded)
                return BadRequest("Failed to add to roles");
            result = await _userManager.RemoveFromRolesAsync(user, userRoles.Except(selectedRoles));
            if (!result.Succeeded)
                return BadRequest("Failed to remove the roles");
            return Ok(await _userManager.GetRolesAsync(user));
        }

        [Authorize(Policy = "ModeratorPhotoRole")]
        [HttpGet("photosForModeration")]
        public async Task<IActionResult> GetPhotosForModeration()
        {
            var users = await _context.Users.Where(obj => obj.Photos.Any(p => !p.IsApproved)).Select(obj =>
                new
                {
                    UserId = obj.Id,
                    UserName = obj.UserName,
                    KnownAs = obj.KnownAs,
                    PhotoUrl = obj.Photos.FirstOrDefault(obj => obj.IsMain).Url,
                    Photos = obj.Photos.Where(p => !p.IsApproved).Select(p => new { p.Id, p.Url })
                }
            ).ToListAsync();
            return Ok(users);
        }

        [Authorize(Policy = "ModeratorPhotoRole")]
        [HttpPost("ModeratePhoto")]
        public async Task<IActionResult> ModeratePhoto(PhotoModeratorDto photoModeratorDto)
        {
            var photoForAction = await _context.Photos.FirstOrDefaultAsync(obj => obj.Id == photoModeratorDto.photoId);
            if (photoForAction == null)
                return BadRequest("Photo not found");

            if (!photoModeratorDto.approved)
            {
                _context.Photos.Remove(photoForAction);
                if (photoForAction.PublicId != null)
                {
                    var deleteParams = new DeletionParams(photoForAction.PublicId);
                    var result = _cloudinary.Destroy(deleteParams);
                    if (result.Result != "ok")
                    {
                        return BadRequest("Could not delete photo from cloud");
                    }
                }
            }
            else
            {
                photoForAction.IsApproved = photoModeratorDto.approved;
            }
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}