using ActiveGrid.Exceptions;
using ActiveGrid.Models;
using SignalR.Client.Hubs;

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
