using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
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
