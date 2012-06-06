using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ActiveGrid.Models
{
    public class GridUpdates
    {
        //Javascript convention
        public GridActionType action { get; set; }
        public dynamic match { get; set; }
        public dynamic item { get; set; }
    }
}
