using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using SignalRGridColumnValue.Models;

namespace ActiveGrid.Samples.Portfolio
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }

        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

            routes.MapRoute(
                name: "Default",
                url: "{controller}/{action}/{id}",
                defaults: new { controller = "Holdings", action = "Index", id = UrlParameter.Optional }
            );
        }

        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            RegisterGlobalFilters(GlobalFilters.Filters);
            RegisterRoutes(RouteTable.Routes);

            BundleTable.Bundles.RegisterTemplateBundles();

            //inject some sample data
            Holdings.Data = new List<Holding>();
            Holdings.Data.Add(new Holding { HoldingId = 1, AccountNumber = "1234567", Ticker = "GOOG", LotId = 1, AcquisitionDate = new DateTime(2002, 1, 14), Quantity = 100, Price = 610.34M });
            Holdings.Data.Add(new Holding { HoldingId = 2, AccountNumber = "1234567", Ticker = "GOOG", LotId = 2, AcquisitionDate = new DateTime(2005, 5, 20), Quantity = 200, Price = 610.34M });
            Holdings.Data.Add(new Holding { HoldingId = 3, AccountNumber = "1234567", Ticker = "GOOG", LotId = 3, AcquisitionDate = new DateTime(2010, 2, 12), Quantity = 300, Price = 610.34M });
            Holdings.Data.Add(new Holding { HoldingId = 4, AccountNumber = "1234567", Ticker = "AAPL", LotId = 1, AcquisitionDate = new DateTime(2003, 4, 19), Quantity = 50, Price = 569.48M });
            Holdings.Data.Add(new Holding { HoldingId = 5, AccountNumber = "1234567", Ticker = "AAPL", LotId = 2, AcquisitionDate = new DateTime(2007, 8, 1), Quantity = 100, Price = 569.48M });
            Holdings.Data.Add(new Holding { HoldingId = 6, AccountNumber = "1234567", Ticker = "MSFT", LotId = 1, AcquisitionDate = new DateTime(2000, 9, 22), Quantity = 100, Price = 30.65M });
            Holdings.Data.Add(new Holding { HoldingId = 7, AccountNumber = "1234567", Ticker = "MSFT", LotId = 2, AcquisitionDate = new DateTime(2002, 3, 3), Quantity = 300, Price = 30.65M });
            Holdings.Data.Add(new Holding { HoldingId = 8, AccountNumber = "1234567", Ticker = "MSFT", LotId = 3, AcquisitionDate = new DateTime(2009, 3, 6), Quantity = 200, Price = 30.65M });
        }
    }
}