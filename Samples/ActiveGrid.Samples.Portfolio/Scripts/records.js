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

        return {
            grid: grid
        };
    })();

    ko.applyBindings(my.viewModel);
});