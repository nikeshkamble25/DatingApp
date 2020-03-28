using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DatingApp.API.DTO;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Data
{
    public class DatingRepository : IDatingRepository
    {
        private readonly DataContext _context;

        public DatingRepository(DataContext context)
        {
            this._context = context;
        }
        public void Add<T>(T entity) where T : class
        {
            this._context.Add(entity);
        }

        public void Delete<T>(T entity) where T : class
        {
            this._context.Remove(entity);
        }

        public async Task<User> GetUser(int id)
        {
            var user = await _context.Users.Include(p => p.Photos).FirstOrDefaultAsync(u => u.Id == id);
            return user;
        }

        public async Task<PagedList<User>> GetUsers(UserParams userParams)
        {
            var userQuery = _context.Users.Include(p => p.Photos)
            .Include(p => p.Likees)
            .Include(p => p.Likers)
            .OrderByDescending(obj => obj.LastActive)
            .AsQueryable();
            userQuery = userQuery.Where(u => u.Id != userParams.UserId).AsQueryable();
            userQuery = userQuery.Where(u => u.Gender == userParams.Gender).AsQueryable();
            if (userParams.Likers)
            {
                var userLikers = await this.GetUserLikes(userParams.UserId, userParams.Likers);
                userQuery = userQuery.Where(u => userLikers.Contains(u.Id));
            }
            if (userParams.Likees)
            {
                var userLikees = await this.GetUserLikes(userParams.UserId, userParams.Likers);
                userQuery = userQuery.Where(u => userLikees.Contains(u.Id));

                var test = userQuery.ToList();
            }
            if (userParams.MinAge != 18 || userParams.MaxAge != 99)
            {
                var minDateOfBirth = DateTime.Today.AddYears(-userParams.MaxAge - 1);
                var maxDateOfBirth = DateTime.Today.AddYears(-userParams.MinAge);
                userQuery = userQuery.Where(u => u.DateOfBirth >= minDateOfBirth && u.DateOfBirth <= maxDateOfBirth);
            }
            if (!string.IsNullOrEmpty(userParams.Orderby))
            {
                switch (userParams.Orderby)
                {
                    case "created":
                        userQuery = userQuery.OrderByDescending(u => u.Created);
                        break;
                    default:
                        userQuery = userQuery.OrderByDescending(u => u.LastActive);
                        break;
                }
            }
            var users = await PagedList<User>.CreateAsync(userQuery, userParams.PageNumber, userParams.PageSize);
            return users;
        }
        private async Task<IEnumerable<int>> GetUserLikes(int id, bool likers)
        {
            var user = await _context.Users
            .Include(x => x.Likers)
            .Include(x => x.Likees)
            .FirstOrDefaultAsync(u => u.Id == id);
            if (likers)
                return user.Likers.Where(u => u.LikeeId == id).Select(i => i.LikerId);
            else
            {
                return user.Likees.Where(u => u.LikerId == id).Select(i => i.LikeeId);
            }
        }

        public async Task<bool> SaveAll()
        {
            return await _context.SaveChangesAsync() > 0;
        }
        public async Task<Photo> GetPhoto(int id)
        {
            var photo = await _context.Photos.FirstOrDefaultAsync(photo => photo.Id == id);
            return photo;
        }

        public async Task<Photo> GetMainPhotoForUser(int userId)
        {
            return await _context.Photos.Where(u => u.UserId == userId).FirstOrDefaultAsync(x => x.IsMain);
        }

        public async Task<Like> GetLike(int userId, int recipientId)
        {
            return await _context.Likes
            .FirstOrDefaultAsync(u => u.LikerId == userId && u.LikeeId == recipientId);
        }

        public async Task<Message> GetMessage(int id)
        {
            return await _context.Messages.FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<PagedList<Message>> GetMessageForUser(MessageParams messageParams)
        {
            var messages = _context.Messages
                             .Include(u => u.Sender).ThenInclude(p => p.Photos)
                             .Include(u => u.Recipient).ThenInclude(p => p.Photos)
                             .AsQueryable();
            switch (messageParams.MessageContainer)
            {
                case "Inbox":
                    messages = messages.Where(u => u.RecipientId == messageParams.UserId
                    && !u.RecipientDeleted);
                    break;
                case "Outbox":
                    messages = messages.Where(u => u.SenderId == messageParams.UserId
                    && !u.SenderDeleted);
                    break;
                default:
                    messages = messages.Where(u => u.RecipientId == messageParams.UserId
                    && !u.IsRead && !u.RecipientDeleted);
                    break;
            }
            messages = messages.OrderByDescending(d => d.MessageSent);
            return await PagedList<Message>.CreateAsync(messages, messageParams.PageNumber, messageParams.PageSize);

        }

        public async Task<IEnumerable<Message>> GetMessageThread(int userId, int recipientId)
        {
            var messages = await _context.Messages
                           .Include(u => u.Sender).ThenInclude(p => p.Photos)
                           .Include(u => u.Recipient).ThenInclude(p => p.Photos)
                           .Where(m => m.RecipientId == userId && m.SenderId == recipientId && !m.RecipientDeleted
                           || m.RecipientId == recipientId && m.SenderId == userId && !m.SenderDeleted)
                           .OrderByDescending(m => m.MessageSent)
                           .ToListAsync();
            return messages;
        }
    }
}