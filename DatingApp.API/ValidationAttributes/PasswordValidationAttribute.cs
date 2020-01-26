using System.ComponentModel.DataAnnotations;

namespace DatingApp.API.ValidationAttributes
{
    public class PasswordValidation1Attribute : ValidationAttribute
    {
        public PasswordValidation1Attribute()
        {

        }
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            string password = value.ToString();
            //Logic to checl complex password
            //return new  ValidationResult();
            return ValidationResult.Success;
        }
    }
    
    public class PasswordValidation2Attribute : ValidationAttribute
    {
        public PasswordValidation2Attribute()
        {

        }
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            string password = value.ToString();
            //Logic to checl complex password
            return ValidationResult.Success;
        }
    }
}