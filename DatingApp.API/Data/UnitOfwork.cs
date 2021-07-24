using System.Threading.Tasks;
using AutoMapper;

namespace DatingApp.API.Data
{
    public class UnitOfwork : IUnitOfWork
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        public UnitOfwork(DataContext context, IMapper mapper)
        {
            this._context = context;
            this._mapper = mapper;
        }
        public IAuthRepository AuthRepository => new AuthRepository(_context);
        public IDatingRepository DatingRepository => new DatingRepository(_context, _mapper);
        public async Task<bool> Complete()
        {
            return await _context.SaveChangesAsync() > 0;
        }
        public bool HasChanges()
        {
            return _context.ChangeTracker.HasChanges();
        }
    }
}