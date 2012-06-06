using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SignalR.Hubs;

namespace ActiveGrid.Server.Helpers
{
    public static class ActiveGrid
    {
        public static void PushUpdates(string action, dynamic match, dynamic data)
        {
            var updates = new { action = action, match = match, item = data };
            var hubContext = SignalR.GlobalHost.ConnectionManager.GetHubContext("activeGridHub");
            hubContext.Clients.broadcast(updates);
        }
    }
}
