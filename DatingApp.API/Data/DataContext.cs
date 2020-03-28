using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {

        }
        public DbSet<Value> Values { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Photo> Photos { get; set; }
        public DbSet<Like> Likes { get; set; }
        public DbSet<Message> Messages { get; set; }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<Like>()
            .HasKey(k => new { k.LikerId, k.LikeeId });
            
            builder.Entity<Like>()
            .HasOne(k => k.Likee)
            .WithMany(k => k.Likers)
            .HasForeignKey(u => u.LikeeId)
            .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Like>()
            .HasOne(k => k.Liker)
            .WithMany(k => k.Likees)
            .HasForeignKey(u => u.LikerId)
            .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Message>()
            .HasOne(o=>o.Sender)
            .WithMany(m=>m.MessagesSent)
            .OnDelete(DeleteBehavior.Restrict);
            
            builder.Entity<Message>()
            .HasOne(o=>o.Recipient)
            .WithMany(m=>m.MessagesRecieved)
            .OnDelete(DeleteBehavior.Restrict);
        }
    }
}