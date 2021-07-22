namespace DatingApp.API.Models
{
    public class Connection
    {
        public Connection()
        {
        }

        public Connection(string connectionId, string userame)
        {
            ConnectionId = connectionId;
            Username = userame;
        }

        public string ConnectionId { get; set; }
        public string Username { get; set; }
    }
}