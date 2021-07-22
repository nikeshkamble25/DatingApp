using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.DTO;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace DatingApp.API.SignalR
{
    [Authorize]
    public class MessageHub : Hub
    {
        private readonly IDatingRepository _messageRepository;
        private readonly IMapper _mapper;
        private readonly IAuthRepository _authRepository;

        public MessageHub(IDatingRepository messageRepository,
            IMapper mapper,
            IAuthRepository authRepository)
        {
            this._messageRepository = messageRepository;
            this._mapper = mapper;
            this._authRepository = authRepository;
        }
        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var otherUser = httpContext.Request.Query["user"].ToString();
            var groupName = GetGroupName(Context.User.Identity.Name, otherUser);
            var messages = await _messageRepository.GetMessageThread(Context.User.Identity.Name, otherUser);
            var messageThread = _mapper.Map<IEnumerable<MessageToReturnDto>>(messages);
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await AddToGroup(groupName);
            await Clients.Group(groupName).SendAsync("ReceiveMessageThread", messageThread);
        }
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await RemoveFromMessageGroup();
            await base.OnDisconnectedAsync(exception);
        }
        public async Task SendMessage(MessageForCreationDto messageForCreationDto)
        {
            var userName = Context.User.Identity.Name;
            var sender = await _authRepository.GetUser(messageForCreationDto.SenderId);
            if (sender == null)
                throw new HubException("Could not find user");
            messageForCreationDto.SenderId = sender.Id;
            messageForCreationDto.SenderUserName = Context.User.Identity.Name;
            var recipient = await _authRepository.GetUser(messageForCreationDto.RecipientId);
            if (recipient == null)
                throw new HubException("Could not find user");
            messageForCreationDto.RecipientUserName = recipient.UserName;
            var message = _mapper.Map<Message>(messageForCreationDto);
            _messageRepository.Add(message);
            var groupName = GetGroupName(sender.UserName, recipient.UserName);
            var group = await _messageRepository.GetMessageGroup(groupName);
            if (group.Connections.Any(x=>x.Username == recipient.UserName))
            {
                message.IsRead = true;
                message.DateRead = DateTime.UtcNow;                
            }
            if (await _messageRepository.SaveAll())
            {
                var messageReturn = _mapper.Map<MessageToReturnDto>(message);
                await Clients.Group(groupName).SendAsync("NewMessage", messageReturn);
            }
        }
        private string GetGroupName(string caller, string other)
        {
            var stringCompare = string.CompareOrdinal(caller, other) < 0;
            return stringCompare ? $"{caller}-{other}" : $"{other}-{caller}";
        }
        private async Task<bool> AddToGroup(string groupName)
        {
            var group = await _messageRepository.GetMessageGroup(groupName);
            var connection = new Connection(this.Context.ConnectionId, this.Context.User.Identity.Name);
            if (group==null)
            {
                group = new Group(groupName);
                _messageRepository.AddGroup(group);
            }
            group.Connections.Add(connection);
            return await _messageRepository.SaveAll();
        }
        private async Task RemoveFromMessageGroup()
        {
            var connection = await _messageRepository.GetConnection(this.Context.ConnectionId);
            _messageRepository.RemoveConnection(connection);
            await _messageRepository.SaveAll();
        }
    }
}