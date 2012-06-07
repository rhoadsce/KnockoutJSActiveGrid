using System.Collections.Generic;

namespace ActiveGrid.Models
{
    public class GridData<T>
    {
        // Use Javascript convension as this object's sole purpose is to be serialized into the properly formatted json to the grid.
        public int totalRows { get; set; }
        public IEnumerable<T> data { get; set; }
    }
}