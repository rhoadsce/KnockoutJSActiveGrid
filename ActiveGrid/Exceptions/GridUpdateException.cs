using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ActiveGrid.Exceptions
{
    public class GridUpdateException : Exception
    {
        public GridUpdateException(string message, Exception ex) : base(message, ex)
        {
        }
    }
}
