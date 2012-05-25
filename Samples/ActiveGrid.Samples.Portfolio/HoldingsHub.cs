using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using SignalR.Hubs;

namespace SignalRGridColumnValue
{
    [HubName("holdings")]
    public class HoldingsHub : Hub
    {
        public void UpdatePrice(dynamic updates)
        {
            Clients.broadcast(updates);
        }
    }
}