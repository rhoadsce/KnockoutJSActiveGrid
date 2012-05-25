using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net;
using System.Xml.Linq;
using System.Threading;
using SignalR.Client.Hubs;

namespace ActiveGrid.Samples.Portfolio.PricingService
{
    class Program
    {
        private static List<string> _tickers = new List<string>();

        static void Main(string[] args)
        {
            var connection = new HubConnection("http://localhost:5432/");
            var hub = connection.CreateProxy("holdings");

            hub.On("receive", data =>
            {
                var match = data.match;
            });

            connection.Start().ContinueWith(task =>
            {
                if (task.IsFaulted)
                {
                    Console.WriteLine("Failed to start: {0}", task.Exception.GetBaseException());
                }
                else
                {
                    Console.WriteLine("Success! Connected with client connection id {0}", connection.ConnectionId);
                    // Do more stuff here
                }
            }).Wait();

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
                            var updates = new { match = new { Ticker = ticker }, update = new { Price = price } };
                            hub.Invoke("UpdatePrice", updates).ContinueWith(task =>
                            {
                                if (task.IsFaulted)
                                {
                                    Console.WriteLine("There was an error calling updatePrice for {0}: {1}", ticker, task.Exception.GetBaseException());
                                }
                                else
                                {
                                    Console.WriteLine("Price found for {0}: {1}", ticker, price.ToString());
                                }
                            });
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
