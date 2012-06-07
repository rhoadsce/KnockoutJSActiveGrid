// TODO: fill in the holes in the support for dates.

(function () {
    //Private constructor for column definitions
    var column = function (columnDefinition) {
        var self = this;
        self.headerCaption = columnDefinition.headerCaption || "";
        self.propertyName = columnDefinition.propertyName || null;
        self.isComputed = columnDefinition.isComputed || false;
        self.hidden = columnDefinition.hidden || false;
        self.dataType = columnDefinition.dataType || '';
        self.precision = columnDefinition.precision || 2;
        self.align = columnDefinition.align || '';
        self.sortDirection = columnDefinition.sortDirection || 'none';
        self.datetimeFormat = columnDefinition.datetimeFormat || '';

        if (self.align === '') {
            if (self.dataType === 'numeric' || self.dataType === 'datetime') {
                self.align = 'right';
            } else {
                self.align = 'left';
            }
        }
    };

    // TODO: finish this formatter
    Date.prototype.toFormattedDateString = function (format) {
        var day = this.getDate();
        var month = this.getMonth() + 1;
        var fourDigitYear = this.getFullYear();

        format = format.replace('yyyy', fourDigitYear);
        format = format.replace('mm', month);
        format = format.replace('dd', day);

        return format;
    };

    ko.activeGrid = function (configuration) {
        var self = this;

        // Basic properties for the grid
        self.currentPage = ko.observable(0);
        self.totalRows = ko.observable(0);
        self.pageSize = ko.observable(configuration.pageSize || 25);
        self.currentPageSize = ko.computed({
            read: function () {
                return self.pageSize();
            },
            write: function (value) {
                if (self.paging === 'server') {
                    self.pauseDataLoad = true;
                    self.data.removeAll();
                    self.pauseDataLoad = false;
                }
                self.pageSize(value);
            },
            owner: self
        });
        self.pageSizeOptions = ko.observableArray(configuration.pageSizeOptions || [5, 10, 25, 50]);
        self.width = configuration.width || '';
        self.hubName = configuration.hubName || 'activeGridHub';
        self.paging = configuration.paging || 'client'; // can be 'client' or 'server'
        self.pauseDataLoad = false;
        // Ensure that the pageSize passed is in the list of pageSizeOptions. If it isn't, add it.
        if ($.inArray(self.pageSize(), ko.utils.unwrapObservable(self.pageSizeOptions)) === -1) {
            self.pageSizeOptions.push(self.pageSize());
            self.pageSizeOptions.sort(function (left, right) { return left - right; });
        }

        // Create the list of columns
        self.columns = [];
        for (var c = 0; c < configuration.columns.length; c++) {
            self.columns.push(new column(configuration.columns[c]));
        }
        // List of property names considered "key" columns
        self.keyColumnNames = configuration.keyColumnNames || ['id'];
        // List of columns that will be visible to the user
        self.visibleColumns = function () {
            var result = [];
            for (var i = 0; i < self.columns.length; i++) {
                if (!self.columns[i].hidden) {
                    result.push(self.columns[i]);
                }
            }
            return result;
        };
        // Get the current sort column
        self.sortColumn = function () {
            for (var i = 0; i < self.columns.length; i++) {
                if (self.columns[i].sortDirection !== 'none') {
                    return self.columns[i];
                }
            }
            return null;
        };

        // If an item constructor has not been passed in, create one with each property as an observable
        // Note: If an item constructor IS passed in, its properties MUST be either computed or observable
        self.Item = configuration.itemConstructor || function () {
            //loop over the column definitions to create a constructor
            for (var i = 0; i < self.columns.length; i++) {
                this[self.columns[i].propertyName] = ko.observable();
            }
        };
        self.PopulateItem = function (data) {
            var item = new self.Item();
            for (var j = 0; j < self.columns.length; j++) {
                if (!self.columns[j].isComputed) {
                    if (self.columns[j].dataType === 'datetime') {
                        var rowValue = data[self.columns[j].propertyName];
                        var datetime = new Date(parseInt(rowValue.substr(6)));
                        item[self.columns[j].propertyName](datetime.toFormattedDateString('mm/dd/yyyy'));
                    } else {
                        item[self.columns[j].propertyName](data[self.columns[j].propertyName]);
                    }
                }
            }
            return item;
        };
        self.Row = function (row, item) {
            this.rowNumber = row;
            this.item = item;
        };

        // initialize an observable array for the data
        self.data = ko.observableArray([]);
        // location of the data
        self.dataUrl = configuration.dataUrl;
        // load/reload data
        self.loadData = function () {
            if (self.pauseDataLoad) {
                return;
            }

            var baseUrl = self.dataUrl;
            if (baseUrl.indexOf('?') !== -1) {
                baseUrl = baseUrl + '&';
            } else {
                baseUrl = baseUrl + '?';
            }

            if (self.paging === 'server') {
                var sortColumn = self.sortColumn();

                if (sortColumn !== null) {
                    baseUrl = baseUrl + 'sortProperty=' + sortColumn.propertyName + '&sortDirection=' + sortColumn.sortDirection;
                } else {
                    baseUrl = baseUrl + 'sortProperty=&sortDirection=';
                }

                baseUrl = baseUrl + '&page=' + self.currentPage() + '&pageSize=' + self.pageSize() + '&paging=server';
            } else {
                baseUrl = baseUrl + 'sortProperty=&sortDirection=&page=&pageSize=&paging=client';
            }


            $.ajax({
                url: baseUrl,
                type: 'GET',
                success: function (response) {
                    /*
                    The response must be in the following format:
                    {
                    "TotalRows":totalRows
                    "Data":[
                    {"property1":"stringValue","property2":numbericValue,...},
                    {"property1":"stringValue","property2":numbericValue,...}
                    ]
                    }
                    */
                    var rows = response.data;
                    var startIndex = self.currentPage() * self.pageSize();
                    var i, j;
                    for (i = 0; i < rows.length; i++) {
                        var item = self.PopulateItem(rows[i]);
                        // Create a new row, passing in a row number and the item
                        var row = new self.Row(startIndex + i, item);
                        // Add the new row to the data
                        self.data.push(row);
                    }
                    self.data.sort(function (left, right) {
                        return left.rowNumber - right.rowNumber;
                    });
                    self.totalRows(response.totalRows);

                    // determine data types of columns, if they weren't supplied
                    for (i = 0; i < self.columns.length; i++) {
                        if (self.columns[i].dataType !== '') {
                            continue;
                        }
                        var type = 'numeric';
                        for (j = 0; j < self.data().length; j++) {
                            if (isNaN(self.data()[j].item[self.columns[i].propertyName]())) {
                                type = 'string';
                                break;
                            }
                        }
                        self.columns[i].dataType = type;
                    }
                }
            });

        };

        var clientSideSort = function (propertyName, sortColumn, currentSortDirection) {
            self.data.sort(function (left, right) {
                if (left.item[propertyName]() === right.item[propertyName]()) {
                    return 0;
                }

                if (currentSortDirection === 'none' || currentSortDirection === 'desc') {
                    // Currently not sorted or currently sorted ascending
                    if (sortColumn.dataType === 'numeric') {
                        return left.item[propertyName]() - right.item[propertyName]();
                    } else if (sortColumn.dataType === 'datetime') {
                        if (new Date(left.item[propertyName]()) < new Date(right.item[propertyName]())) {
                            return -1;
                        } else {
                            return 1;
                        }
                    } else {
                        if (left.item[propertyName]() < right.item[propertyName]()) {
                            return -1;
                        } else {
                            return 1;
                        }
                    }
                } else {
                    // Currently sorted descending
                    if (sortColumn.dataType === 'numeric') {
                        return right.item[propertyName]() - left.item[propertyName]();
                    } else if (sortColumn.dataType === 'datetime') {
                        if (new Date(left.item[propertyName]()) > new Date(right.item[propertyName]())) {
                            return -1;
                        } else {
                            return 1;
                        }
                    } else {
                        if (left.item[propertyName]() > right.item[propertyName]()) {
                            return -1;
                        } else {
                            return 1;
                        }
                    }
                }
            });
            // Set the column list to reflect the current sort for the grid
            sortColumn.sortDirection = (currentSortDirection === 'desc' || currentSortDirection === 'none') ? 'asc' : 'desc';
            for (var i = 0; i < self.columns.length; i++) {
                if (self.columns[i] !== sortColumn) {
                    self.columns[i].sortDirection = 'none';
                }
            }
        };

        // Sort the data in the grid
        self.sort = function (propertyName/*, data, event*/) {
            var sortColumn = {};
            // Get the selected column and it's current sort direction
            var i;
            for (i = 0; i < self.columns.length; i++) {
                if (self.columns[i].propertyName === propertyName) {
                    sortColumn = self.columns[i];
                    break;
                }
            }

            var currentSortDirection = sortColumn.sortDirection;

            if (self.paging === 'client') {
                // *** Client side paging ***//
                // Do the sorting locally
                clientSideSort(propertyName, sortColumn, currentSortDirection);
            }
            else {
                //*** Server side paging ***//
                // If the user changed the sort column, invalidate the visited pages and the data for the current page then get refresh data
                self.pauseDataLoad = true;

                self.data.removeAll();

                self.pauseDataLoad = false;
                // Set the column list to reflect the current sort for the grid
                sortColumn.sortDirection = (currentSortDirection === 'desc' || currentSortDirection === 'none') ? 'asc' : 'desc';
                for (i = 0; i < self.columns.length; i++) {
                    if (self.columns[i] !== sortColumn) {
                        self.columns[i].sortDirection = 'none';
                    }
                }

                self.loadData();
            }
        };

        // Last page number
        self.lastPage = function () {
            if (self.pageSize() === 0) {
                return 0;
            }
            if (self.totalRows() > self.data().length) {
                return Math.ceil(self.totalRows() / self.pageSize());
            }
            return Math.ceil(self.data().length / self.pageSize());
        };
        self.visitedPages = ko.computed(function () {
            var result = [];
            for (var i = 0; i < self.data().length; i++) {
                var page = Math.floor(self.data()[i].rowNumber / self.pageSize());
                if ($.inArray(page, result) === -1) {
                    result.push(page);
                }
            }
            return result;
        });
        // Get a list of items on the current page.
        self.itemsOnCurrentPage = ko.computed(function () {
            var startIndex = self.pageSize() * self.currentPage();
            var endIndex = startIndex + self.pageSize();
            var currentPage = self.currentPage();

            if (startIndex >= self.data().length && currentPage === self.lastPage() && currentPage > 0) {
                self.currentPage(currentPage - 1);
            }

            if (self.paging === 'client') {
                return self.data.slice(startIndex, endIndex);
            }

            // If the grid is paged server side, may need to load more data for the new page.
            // Maintain a list of visited pages so we don't load data for an already visited page.
            if (self.paging === 'server' && $.inArray(self.currentPage(), self.visitedPages()) === -1) {
                self.loadData();
            }

            // Use the rowNumber property on each row to determine if it should be return based on the current page
            var result = [];
            for (var i = 0; i < self.data().length; i++) {
                if (self.data()[i].rowNumber >= startIndex && self.data()[i].rowNumber < endIndex) {
                    result.push(self.data()[i]);
                }
                else if (i >= endIndex) {
                    break;
                }
            }
            return result;
        });

        self.setCurrentPage = function (page) {
            if (page >= 0 && page < self.lastPage()) {
                self.currentPage(page);
            }
        };

        //Function to match and return a row (observable) in the list (observable) given a row (not observable) of data
        self.getRowFromList = configuration.getRowFromList || function (list, row) {
            var maxIndex = ko.utils.unwrapObservable(list).length;
            for (var i = 0; i < maxIndex; i++) {
                var match = true;
                for (var j = 0; j < self.keyColumnNames.length; j++) {
                    if (list()[i][self.keyColumnNames[j]]() !== row[self.keyColumnNames[j]]) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    return list()[i];
                }
            }
            return null;
        };

        //Integration with SignalR
        self.connection = $.connection[self.hubName];

        //Name of the client side function called by the hub
        self.clientCallbackName = configuration.clientCallbackName || 'receive';

        self.rowCreateHandler = configuration.rowCreateHandler || function (updates) {
            var item = self.PopulateItem(updates.item);
            var row = new self.Row(self.data().length, item);
            self.data.push(row);
        };

        //Handler to determine if a row needs updated and then applying those updates
        self.rowUpdateHandler = configuration.rowUpdateHandler || function (row, updates) {
            var isMatch = true;
            var property;
            for (property in updates.match) {
                if (row[property]() != updates.match[property]) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) {
                for (property in updates.item) {
                    row[property](updates.item[property]);
                }
            }
        };

        //Allow the client to name use whatever function name they'd like
        self.connection[self.clientCallbackName] = (function (updates) {
            /*
                updates.action values correspond to the GridActionType enum
                create = 0
                delete = 1
                update = 2
            */
            if (updates.action === 0) {
                self.rowCreateHandler(updates);
            }
            else if (updates.action === 2) {
                for (var i = 0; i < self.data().length; i++) {
                    self.rowUpdateHandler(self.data()[i].item, updates);
                }
            }
        });

        // Get data
        if (self.paging === 'client') {
            self.loadData();
        }

        // Start the SignalR hub
        $.connection.hub.start();
    };

    // Create a template engine object and add the grid and pager templates to it
    var templateEngine = new ko.jqueryTmplTemplateEngine();
    templateEngine.addTemplate("ko_activeGrid_grid", "\
                    <table class=\"activegrid-table\" width=\"100%\">\
                        <thead>\
                            <tr class=\"activegrid-header-row\">\
                                {{each(i, columnDefinition) visibleColumns()}}\
                                    <th data-bind=\"click: function(data, event) { sort(columnDefinition.propertyName, data, event); }\" class=\"activegrid-header-cell\">\
                                        <div class=\"activegrid-header-value\">${ columnDefinition.headerCaption }</div>\
                                    </th>\
                                {{/each}}\
                            </tr>\
                        </thead>\
                        <tbody>\
                            {{each(i, row) itemsOnCurrentPage()}}\
                                <tr class=\"${ i%2 === 1 ? 'activegrid-data-row-odd' : 'activegrid-data-row-even' }\">\
                                    {{each(j, columnDefinition) visibleColumns()}}\
                                        <td class=\"activegrid-data-cell\">\
                                            <div class=\"activegrid-cell-value\" style=\"text-align: ${ columnDefinition.align };\">\
                                                ${ typeof columnDefinition.propertyName == 'function' ? columnDefinition.propertyName(row.item) : row.item[columnDefinition.propertyName] }\
                                            </div>\
                                        </td>\
                                    {{/each}}\
                                </tr>\
                            {{/each}}\
                        </tbody>\
                    </table>");
    templateEngine.addTemplate("ko_activeGrid_pageLinks", "\
                    <div class=\"activegrid-pager-container\">\
                        <div class=\"activegrid-pager-label\">Page size: <select data-bind=\"options: pageSizeOptions, value: currentPageSize\"></select></div>\
                        <div class=\"activegrid-pager-button\" data-bind=\"click: function() { setCurrentPage(lastPage() - 1) }\">Last</div>\
                        <div class=\"activegrid-pager-button\" data-bind=\"click: function() { setCurrentPage(currentPage() + 1) }\">Next</div>\
                        <div class=\"activegrid-pager-button\" data-bind=\"click: function() { setCurrentPage(currentPage() - 1) }\">Previous</div>\
                        <div class=\"activegrid-pager-button\" data-bind=\"click: function() { setCurrentPage(0) }\">First</div>\
                        <div class=\"clear\"></div>\
                    </div>");

    // Create the "activeGrid" knockout binding
    ko.bindingHandlers.activeGrid = {
        update: function (element, valueAccessor/*, allBindingsAccessor*/) {
            var viewModel = valueAccessor();

            // Clear everything in the container
            while (element.firstChild) {
                ko.removeNode(element.firstChild);
            }

            if (viewModel.width !== '') {
                $(element).css('width', viewModel.width);
            }

            // Create the grid container and render the grid in it
            $(element).append('<div id="gridContainer"></div>');
            var gridContainer = $(element).children('#gridContainer');
            ko.renderTemplate("ko_activeGrid_grid", viewModel, { templateEngine: templateEngine }, gridContainer, "replaceNode");

            // Create the pager container and render the pager in it
            $(element).append('<div id="gridPagerContainer"></div>');
            var pageLinksContainer = $(element).children('#gridPagerContainer');
            ko.renderTemplate("ko_activeGrid_pageLinks", viewModel, { templateEngine: templateEngine }, pageLinksContainer, "replaceNode");
        }
    };
})();