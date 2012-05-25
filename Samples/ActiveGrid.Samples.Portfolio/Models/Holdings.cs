using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SignalRGridColumnValue.Models
{
    public static class Holdings
    {
        public static List<Holding> Data;
    }

    public class Holding
    {
        public int HoldingId { get; set; }
        public string AccountNumber { get; set; }
        public string Ticker { get; set; }
        public int LotId { get; set; }
        public DateTime AcquisitionDate { get; set; }
        public decimal Quantity { get; set; }
        public decimal Price { get; set; }
    }
}
