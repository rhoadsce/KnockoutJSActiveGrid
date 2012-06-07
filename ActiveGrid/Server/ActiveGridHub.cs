using SignalR.Hubs;

namespace ActiveGrid.Server
{
    [HubName("activeGridHub")]
    public class ActiveGridHub : Hub
    {
        public void UpdateGrid(dynamic updates)
        {
            Clients.broadcast(updates);
        }
    }
}
