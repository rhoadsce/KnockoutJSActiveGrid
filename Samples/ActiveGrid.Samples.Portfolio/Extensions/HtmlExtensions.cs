using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ActiveGrid.Samples.Portfolio.Extensions
{
    public static class HtmlExtensions
    {
        public static bool IsDebug(this HtmlHelper htmlHelper)
        {
#if DEBUG
            return true;
#endif
            return false;
        }
    }
}