using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SignalR.Client.Hubs;
using ActiveGrid.Models;
using ActiveGrid.Exceptions;

namespace ActiveGrid.Client
{
    public class ActiveGridConnection : HubConnection
    {
        public ActiveGridConnection(string url) : base(url)
        {
            this.Start().ContinueWith(task =>
            {
                if (task.IsFaulted)
                {
                    throw new GridConnectionException("Grid connection failed to start. See inner exception for details.", task.Exception.GetBaseException());
                }
            }).Wait();
        }

        public void UpdateGrid(GridUpdates updates)
        {
            var hub = this.CreateProxy("activeGridHub");
            hub.Invoke("UpdateGrid", updates).ContinueWith(task =>
            {
                if (task.IsFaulted)
                {
                    throw new GridUpdateException("There was an error calling updateGrid. See inner exception for details.", task.Exception.GetBaseException());
                }
            });
        }
    }
}
