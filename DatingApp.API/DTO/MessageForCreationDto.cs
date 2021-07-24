using System;

namespace DatingApp.API.DTO
{
    public class MessageForCreationDto
    {
        public int SenderId { get; set; }
        public string SenderUserName { get; set; }
        public int RecipientId { get; set; }
        public string RecipientUserName { get; set; }
        public DateTime MessageSent { get; set; }
        public string Content { get; set; }
        public MessageForCreationDto()
        {
            MessageSent = DateTime.UtcNow;
        }
    }
    public class MessageForCreationDtoR
    {
        public int SenderId { get; set; }
        public string SenderUserName { get; set; }
        public int RecipientId { get; set; }
        public string RecipientUserName { get; set; }
        public DateTime MessageSent { get; set; }
        public string Content { get; set; }
        public MessageForCreationDtoR()
        {
            MessageSent = DateTime.UtcNow;
        }
    }
}