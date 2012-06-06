using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

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
