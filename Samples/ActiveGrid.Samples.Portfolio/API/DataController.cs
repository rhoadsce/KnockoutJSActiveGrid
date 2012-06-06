using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web.Http;
using System.Reflection;
using System.Linq.Expressions;
using SignalRGridColumnValue.Extensions;
using System.Web.Script.Serialization;
using ActiveGrid.Models;
using SignalRGridColumnValue.Models;
using ActiveGrid.Client;

namespace SignalRGridColumnValue.API.Controllers
{
    public class DataController : ApiController
    {
        // GET /api/<controller>
        public GridData<Holding> Get()
        {
            GridData<Holding> result = new GridData<Holding>();

            result.data = Holdings.Data.AsQueryable();
            result.totalRows = 0;
            var totalRows = result.data.Count();

            string paging = this.Request.RequestUri.ParseQueryString()["paging"];
            
            if (!string.IsNullOrEmpty(this.Request.RequestUri.ParseQueryString()["sortproperty"]))
            {
                string sortProperty = this.Request.RequestUri.ParseQueryString()["sortProperty"];
                string sortDirection = this.Request.RequestUri.ParseQueryString()["sortDirection"];

                if (sortDirection.ToLower() == "desc")
                {
                    result.data = result.data.AsQueryable().OrderByDescending(sortProperty);
                }
                else
                {
                    result.data = result.data.AsQueryable().OrderBy(sortProperty);
                }
            }

            if (paging.ToLower() == "server")
            {
                int page = 0;
                int pageSize = 0;

                if (int.TryParse(this.Request.RequestUri.ParseQueryString()["page"], out page) &&
                    int.TryParse(this.Request.RequestUri.ParseQueryString()["pageSize"], out pageSize))
                {
                    result.data = result.data.Skip(page * pageSize).Take(pageSize);
                    result.totalRows = totalRows;
                }
            }

            return result;
        }

        // POST /api/<controller>
        public void Post(Holding holding)
        {
            holding.HoldingId = Holdings.Data.Max(h => h.HoldingId);
            Holdings.Data.Add(holding);

            GridUpdates updates = new GridUpdates();
            updates.action = GridActionType.create;
            updates.match = "";
            updates.item = holding;

            string url = string.Format("{0}://{1}:{2}", this.Request.RequestUri.Scheme, this.Request.RequestUri.Host, this.Request.RequestUri.Port);
            ActiveGridConnection connection = new ActiveGridConnection(url);
            connection.UpdateGrid(updates);
        }
    }
}