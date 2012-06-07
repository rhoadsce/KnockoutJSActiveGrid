
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
