var my = my || {};

$(function () {
    my.viewModel = (function () {
        var grid = new ko.activeGrid({
            dataUrl: '/api/data',
            columns: [
                { headerCaption: "Id", propertyName: "HoldingId", hidden: true },
                { headerCaption: "Acct", propertyName: "AccountNumber" },
                { headerCaption: "Asset", propertyName: "Ticker", sortDirection: "asc" },
                { headerCaption: "Lot", propertyName: "LotId" },
                { headerCaption: "Acq Date", propertyName: "AcquisitionDate", dataType: 'datetime' },
                { headerCaption: "Qty", propertyName: "Quantity", dataType: 'numeric', align: 'right' },
                { headerCaption: "Price", propertyName: "Price", dataType: 'numeric', align: 'right' },
                { headerCaption: "Total", propertyName: "Total", dataType: 'numeric', isComputed: true, align: 'right' }
            ],
            keyColumnNames: ['HoldingId'],
            clientCallbackName: 'broadcast',
            pageSize: 15,
            width: '500px',
            paging: 'server',
            itemConstructor: function () {
                var self = this;
                self.HoldingId = ko.observable();
                self.AccountNumber = ko.observable();
                self.Ticker = ko.observable();
                self.LotId = ko.observable();
                self.AcquisitionDate = ko.observable();
                self.Quantity = ko.observable();
                self.Price = ko.observable();
                self.Total = ko.computed(function () {
                    return (self.Quantity() * self.Price()).toFixed(2);
                });
            }
        });
        var addGenericRow = function () {
            var item = new grid.Item();
            item.HoldingId(0);
            item.AccountNumber('321');
            item.Ticker('PG');
            item.LotId(1);
            item.AcquisitionDate((new Date()).toFormattedDateString('mm/dd/yyyy'));
            item.Quantity(75);
            item.Price(64.11);

            var row = new grid.Row(grid.data().length, item);

            grid.data.push(row);
        };

        return {
            grid: grid,
            addGenericRow: addGenericRow
        };
    })();

    ko.applyBindings(my.viewModel);
});