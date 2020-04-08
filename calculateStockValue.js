"use strict";

/*

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/


const https = require("https");
const fs = require("fs");


/*
 * Helper extension methods
 */
Array.prototype.sum = function (prop) {
    var total = 0;
    for (var i = 0, _len = this.length; i < _len; i++) {
        total += this[i][prop];
    }
    return total;
}

class PortfolioDisplayItem {
	constructor(ticker, quantity, currentValue) {
		this.ticker = ticker;
        this.quantity = quantity;
        this.currentPrice = null;
        this.high = null;
        this.low = null;
        this.currentValue = currentValue;
    }
    sayHello() {
        console.log("Hello, my name is " + this.ticker + ", I have quantity: " + this.quantity
            + " and current price: " + this.currentPrice
            + " and high: " + this.high
            + " and low: " + this.low
            + " and current Value: " + this.currentValue);
    }
    displayObjects() {
        return {
            "Ticker" : this.ticker,
            "Quantity" : this.quantity,
            "Current Price" : PortfolioDisplayItem.toPrettyMoney(this.currentPrice),
            "High" : PortfolioDisplayItem.toPrettyMoney(this.high),
            "Low": PortfolioDisplayItem.toPrettyMoney(this.low),
            "Current Value" : PortfolioDisplayItem.toPrettyMoney(this.currentValue)
        };
    }
    static toPrettyMoney(value) {
        if (!value)
            return value;
        else
            return new Intl.NumberFormat("en-US",
                { style: "currency", currency: "USD" }
            ).format(value);
    }
}

class Portfolio {
    constructor(stocks) {
        this.stocks = stocks;

        var currentTotal = stocks.sum("currentValue");

        stocks.push(new PortfolioDisplayItem("Total", null, currentTotal));
    }
    get displayItems() {
        return this.stocks;
    }
}

const url = "financialmodelingprep.com";
const startDate = "2019-01-01";
const today = new Date().toISOString().slice(0, 10);

class StockApiConsumer {
    static requestCurrentPriceForTicker(ticker) {
        return new Promise(resolve => {
            resolve(this.placeApiRequest("/api/v3/stock/real-time-price/" + ticker));
        });
    }
    static requestHistoricalDailyPriceForTicker(ticker) {
        return new Promise(resolve => {
            resolve(this.placeApiRequest("/api/v3/historical-price-full/" + ticker + "?from=" + startDate + "&to=" + today ));
        });
    }
    static placeApiRequest(path) {
        return new Promise(resolve => {
            var options = {
                host: url,
                port: 443,
                path: path,
                method: "GET"
            };

            var chunks = "";

            https.request(options, function (res) {
                res.setEncoding("utf8");
                res.on("data", function (chunk) {
                    chunks += chunk;
                });
                res.on("end",
                    function() {
                        const result = JSON.parse(chunks);
                        resolve(result);
                    });
            }).end();
        });
    }
}

class StockController {
    constructor(stocksToRetrieve) {
        this.stocksToRetrieve = stocksToRetrieve;
    }
    calculateStockValue(callback) {
        var self = this;
        
        const promises = self.stocksToRetrieve.map((stock) => {
            return self.initializeStockProperties(stock, self);
        });

        Promise.all(promises).then(function() { callback(self); });
    }
    async initializeStockProperties(stock, self) {
        let currentPrice = await StockApiConsumer.requestCurrentPriceForTicker(stock.ticker);

        stock.currentPrice = currentPrice.price;

        stock.currentValue = stock.currentPrice * stock.quantity;

        let historicalResult = await StockApiConsumer.requestHistoricalDailyPriceForTicker(stock.ticker);

        stock.historicalData = historicalResult;

        self.findMinAndMaxFromHistoricalData(stock);

        stock.sayHello();
    }
    findMinAndMaxFromHistoricalData(stock) {
        var lowest = Number.POSITIVE_INFINITY;
        var highest = Number.NEGATIVE_INFINITY;
        var tmp;
        var historicalData = stock.historicalData.historical;
        for (var i = historicalData.length - 1; i >= 0; i--) {
            tmp = historicalData[i];
            if (tmp.low < lowest) lowest = tmp.low;
            if (tmp.high > highest) highest = tmp.high;
        }
        stock.high = highest;
        stock.low = lowest;
    }
    outputDataToCSV(self) {
        var portfolio = new Portfolio(self.stocksToRetrieve);

        //function* values(obj) {
        //    for (let prop of Object.keys(obj)) // own properties, you might use
        //    // for (let prop in obj)
        //        yield obj[prop];
        //}
        //let arr = Array.from(values(portfolio.displayItems));

        var displayArray = [];

        portfolio.displayItems.forEach((item) => {
            displayArray.push(item.displayObjects());
        });

        CsvUtils.jsonArrayToCsv(displayArray, "testStockOutput.csv");
    }
}



class CsvUtils {
    static jsonArrayToCsv(jsonObjects, fileName) {
        const stringToReplaceComas = "!!!!";

        var csvRows = [];

        var tokenHeaders = Object.keys(jsonObjects[0]).join(",");

        csvRows.push(tokenHeaders);

        jsonObjects.forEach(function (singleRow) {
            for (let [key, value] of Object.entries(singleRow)) {
                if (value !== null && value) {
                    if ((value + "").indexOf(",") > -1)
                        singleRow[key] = "\"" + value + "\"";
                }
            }

            csvRows.push(Object.values(singleRow).join(","));
        });

        let csv = `${csvRows.join('\n').replace(/,/g, ',')}`;

        fs.writeFile(fileName, csv, "utf8", function (err) {
            if (err) {
                 console.log("Some error occured - file either not saved or corrupted file saved.");
            } else {
                console.log("It's saved!");
            }
        });
    }
}

/*
 * Entry point, arguments processed here or defaults are used
 */
(function () {
	var myArgs = process.argv.slice(2);

    var stocksToRetrieve = [];

    if (myArgs === undefined || myArgs.length === 0) {
        stocksToRetrieve = [
            new PortfolioDisplayItem("AMZN", 42),
            new PortfolioDisplayItem("MSFT", 1337),
            new PortfolioDisplayItem("TWTR", 69105)
        ];
	} else if (myArgs.length % 2 === 0) {
        for (var i = 0; i < myArgs.length; i += 2) {
			stocksToRetrieve.push(new PortfolioDisplayItem(myArgs[i], myArgs[i + 1]));
		}
	}

    if (stocksToRetrieve.length > 0) {
        var controller = new StockController(stocksToRetrieve);
        controller.calculateStockValue(controller.outputDataToCSV);
    }
})();


// Public
module.exports = StockController;