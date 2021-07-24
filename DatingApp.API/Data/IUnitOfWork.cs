using System.Threading.Tasks;

namespace DatingApp.API.Data
{
    public interface IUnitOfWork
    {
        IAuthRepository AuthRepository { get; }
        IDatingRepository DatingRepository { get; }
        Task<bool> Complete();
        bool HasChanges();
    }
}