using System.ComponentModel.DataAnnotations;
using DatingApp.API.ValidationAttributes;

namespace DatingApp.API.DTO
{
    public class UserRegisterDto
    {
        [Required]
        public string Username { get; set; }
        [Required]
        [StringLength(50, MinimumLength = 6, ErrorMessage = "You must specify password")]
        public string Password { get; set; }
    }
}