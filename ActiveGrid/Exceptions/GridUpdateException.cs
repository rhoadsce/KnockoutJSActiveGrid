using System;

namespace ActiveGrid.Exceptions
{
    public class GridUpdateException : Exception
    {
        public GridUpdateException(string message, Exception ex) : base(message, ex)
        {
        }
    }
}
