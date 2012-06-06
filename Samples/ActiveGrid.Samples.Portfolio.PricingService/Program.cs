using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net;
using System.Xml.Linq;
using System.Threading;
using SignalR.Client.Hubs;
using ActiveGrid.Client;
using ActiveGrid.Models;

namespace ActiveGrid.Samples.Portfolio.PricingService
{
    class Program
    {
        private static List<string> _tickers = new List<string>();

        static void Main(string[] args)
        {
            ActiveGridConnection connection = new ActiveGridConnection("http://localhost:5432/");
            
            bool cont = true;

            Task lookupPrices = Task.Factory.StartNew(() =>
            {
                while (true)
                {
                    foreach (var t in _tickers)
                    {
                        Task.Factory.StartNew((ticker) =>
                        {
                            string url = string.Format("http://www.google.com/ig/api?stock={0}", ticker);
                            WebClient webclient = new WebClient();
                            string response = webclient.DownloadString(url);

                            XDocument xdoc = XDocument.Parse(response);
                            XElement last = xdoc.Element("xml_api_reply").Element("finance").Element("last");
                            decimal price = decimal.Parse(last.Attribute("data").Value);
                            var updates = new GridUpdates();
                            updates.action = GridActionType.update;
                            updates.match = new { Ticker = ticker };
                            updates.item = new { Price = price };
                            connection.UpdateGrid(updates);
                        }, t);
                    }
                    Thread.Sleep(15000);
                }
            });

            while (cont)
            {
                Console.WriteLine("Enter a new ticker:");

                string input = Console.ReadLine();

                if (input.ToLower() == "exit")
                {
                    cont = false;
                }
                else if (input.ToLower() == "list")
                {
                    foreach (var ticker in _tickers)
                    {
                        Console.WriteLine(string.Format("Maintaining price for: {0}", ticker));
                    }
                }
                else
                {
                    if (_tickers.Where(t => t == input).Count() != 0)
                    {
                        continue;
                    }

                    _tickers.Add(input.Trim());
                }
            }
        }
    }
}
