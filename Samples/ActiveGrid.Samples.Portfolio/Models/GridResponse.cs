using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SignalRGridColumnValue.Models
{
    public class GridResponse<T>
    {
        // Use Javascript convension as this object's sole purpose is to be serialized into the properly formatted json to the grid.
        public int totalRows { get; set; }
        public IEnumerable<T> data { get; set; }
    }
}