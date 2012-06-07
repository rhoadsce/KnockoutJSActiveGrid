using System;

namespace ActiveGrid.Exceptions
{
    public class GridConnectionException : Exception
    {
        public GridConnectionException(string message, Exception ex)
            : base(message, ex)
        {
        }
    }
}
