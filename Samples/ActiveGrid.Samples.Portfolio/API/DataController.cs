using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web.Http;
using SignalRGridColumnValue.Models;
using System.Reflection;
using System.Linq.Expressions;
using SignalRGridColumnValue.Extensions;
using System.Web.Script.Serialization;

namespace SignalRGridColumnValue.API.Controllers
{
    public class DataController : ApiController
    {
        // GET /api/<controller>
        public GridResponse<Holding> Get()
        {
            GridResponse<Holding> result = new GridResponse<Holding>();

            result.data = Holdings.Data.AsQueryable();
            result.totalPages = 0;
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
                    if (pageSize > 0)
                    {
                        int totalPages = totalRows/pageSize;
                        if (totalRows % pageSize != 0)
                            totalPages++;
                        result.totalPages = totalPages;
                    }
                }
            }

            return result;
        }
    }
}