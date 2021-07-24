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
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IHubContext<PresenceHub> _presenceHub;
        private readonly PresenceTracker _presenceTracker;

        public MessageHub(IUnitOfWork unitOfWork,
            IMapper mapper,
            IHubContext<PresenceHub> presenceHub,
            PresenceTracker presenceTracker)
        {
            this._unitOfWork = unitOfWork;
            this._mapper = mapper;
            this._presenceHub = presenceHub;
            this._presenceTracker = presenceTracker;
        }
        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var otherUser = httpContext.Request.Query["user"].ToString();
            var groupName = GetGroupName(Context.User.Identity.Name, otherUser);
            var messages = await this._unitOfWork.DatingRepository.GetMessageThread(Context.User.Identity.Name, otherUser);
            var messageThread = _mapper.Map<IEnumerable<MessageToReturnDto>>(messages);
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            var group = await AddToGroup(groupName);
            await Clients.Group(groupName).SendAsync("UpdatedGroup", group);
            if(this._unitOfWork.HasChanges()) await this._unitOfWork.Complete();
            await Clients.Caller.SendAsync("ReceiveMessageThread", messageThread);
        }
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var group = await RemoveFromMessageGroup();
            await Clients.Group(group.Name).SendAsync("UpdatedGroup", group);
            await base.OnDisconnectedAsync(exception);
        }
        public async Task SendMessage(MessageForCreationDto messageForCreationDto)
        {
            var userName = Context.User.Identity.Name;
            var sender = await this._unitOfWork.AuthRepository.GetUser(messageForCreationDto.SenderId);
            if (sender == null)
                throw new HubException("Could not find user");
            messageForCreationDto.SenderId = sender.Id;
            messageForCreationDto.SenderUserName = Context.User.Identity.Name;
            var recipient = await this._unitOfWork.AuthRepository.GetUser(messageForCreationDto.RecipientId);
            if (recipient == null)
                throw new HubException("Could not find user");
            messageForCreationDto.RecipientUserName = recipient.UserName;
            var message = _mapper.Map<Message>(messageForCreationDto);
            this._unitOfWork.DatingRepository.Add(message);
            var groupName = GetGroupName(sender.UserName, recipient.UserName);
            var group = await this._unitOfWork.DatingRepository.GetMessageGroup(groupName);
            if (group.Connections.Any(x => x.Username == recipient.UserName))
            {
                message.IsRead = true;
                message.DateRead = DateTime.UtcNow;
            }
            else
            {
                var connections = await _presenceTracker.GetConnectionForUsers(recipient.UserName);
                if (connections != null)
                {
                    await _presenceHub.Clients.Clients(connections).SendAsync("NewMessageReceived",
                    new { userName = sender.UserName, knownAs = sender.KnownAs });
                }
            }
            if (await this._unitOfWork.Complete())
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
        private async Task<Group> AddToGroup(string groupName)
        {
            var group = await this._unitOfWork.DatingRepository.GetMessageGroup(groupName);
            var connection = new Connection(this.Context.ConnectionId, this.Context.User.Identity.Name);
            if (group == null)
            {
                group = new Group(groupName);
                this._unitOfWork.DatingRepository.AddGroup(group);
            }
            group.Connections.Add(connection);
            if (await this._unitOfWork.Complete())
                return group;
            throw new HubException("Failed to join group");
        }
        private async Task<Group> RemoveFromMessageGroup()
        {
            var groupConnection = await this._unitOfWork.DatingRepository.GetGroupForConnection(this.Context.ConnectionId);
            var connection = groupConnection.Connections.FirstOrDefault(x => x.ConnectionId == Context.ConnectionId);
            this._unitOfWork.DatingRepository.RemoveConnection(connection);
            if (await this._unitOfWork.Complete()) return groupConnection;
            throw new HubException("Failed to remove group");
        }
    }
}