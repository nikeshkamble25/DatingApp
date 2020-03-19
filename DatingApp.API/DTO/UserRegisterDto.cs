using System;
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
         [Required]
        public string Gender { get; set; }
         [Required]
        public string KnownAs { get; set; }
         [Required]
        public DateTime DateOfBirth { get; set; }
         [Required]
        public string City { get; set; }
         [Required]
        public string Country { get; set; }
         [Required]
        public DateTime Created { get; set; }
         [Required]
        public DateTime LastActive { get; set; }        
        public UserRegisterDto()
        {
            Created = DateTime.Now;
            LastActive = DateTime.Now;
        }
    }
}