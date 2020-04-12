using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.DTO;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DatingApp.API.Controllers
{
    [ServiceFilter(typeof(LogUserActivity))]
    // [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IDatingRepository _repo;
        private readonly IMapper _mapper;
        public UsersController(IDatingRepository repo,
            IMapper mapper)
        {
            this._repo = repo;
            this._mapper = mapper;
        }
        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery]UserParams userParams)
        {
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var userFromRepo = await _repo.GetUser(currentUserId);
            userParams.UserId = currentUserId;
            if (string.IsNullOrEmpty(userParams.Gender))
            {
                userParams.Gender = userFromRepo.Gender == "male" ? "female" : "male";
            }

            var users = await _repo.GetUsers(userParams);

            var userToReturn = _mapper.Map<PagedList<User>, List<UserForListDto>>(users, opt =>
            {
                opt.AfterMap((src, dest) =>
                {
                    var lst = src.Where(obj => obj.Likers.Any(l => l.LikerId == userParams.UserId)).Select(obj => obj.Id);
                    var lst2 = dest.Where(obj => lst.Contains(obj.Id)).ToList();
                    lst2.ForEach((o) => o.Liked = true);
                });
            });

            Response.AddPagination(users.CurrentPage,
                users.PageSize,
                users.TotalCount,
                users.TotalPages);
            return Ok(userToReturn);
        }
        [HttpGet("{id}/detail", Name = "GetUserDetail")]
        public async Task<IActionResult> GetUserDetail(int id)
        {
            var user = await _repo.GetUser(id);
            var userToReturn = _mapper.Map<UserForDetailedDto>(user);
            return Ok(userToReturn);
        }
         [HttpGet("{id}/edit", Name = "GetUserEdit")]
        public async Task<IActionResult> GetUserEdit(int id)
        {
            var user = await _repo.GetUser(id);
            var userToReturn = _mapper.Map<UserForEditDto>(user);
            return Ok(userToReturn);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UserForUpdateDto userForUpdateDto)
        {
            if (id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();
            var userFromRepo = await _repo.GetUser(id);
            _mapper.Map(userForUpdateDto, userFromRepo);
            if (await _repo.SaveAll())
                return NoContent();
            throw new Exception($"Updating user {id} failed on save");
        }
        [HttpPost("{id}/like/{recipientId}")]
        public async Task<IActionResult> LikeUser(int id, int recipientId)
        {
            if (id != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
                return Unauthorized();
            var user = await _repo.GetUser(recipientId);
            if (user == null)
                return BadRequest("User not found");
            var like = await _repo.GetLike(id, recipientId);
            if (like != null)
            {
                _repo.Delete<Like>(like);
                if (await _repo.SaveAll())
                    return Ok();
            }
            else
            {
                like = new Like
                {
                    LikerId = id,
                    LikeeId = recipientId
                };
                _repo.Add<Like>(like);
                if (await _repo.SaveAll())
                    return Ok();
            }
            return BadRequest("Failed to like user");
        }
    }
}