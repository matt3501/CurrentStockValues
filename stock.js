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




class Stock {
  constructor(ticker, quantity) {
    this.ticker = ticker;
    this.quantity = quantity;
  }
  sayHello() {
    console.log('Hello, my name is ' + this.ticker + ', I have ID: ' + this.quantity);
  }
  initializeStockProperties() {
    this.currentPrice = 0.0;
    this.high = 0.0;
    this.low = 0.0;
    this.currentValue = 0.0;
  }
}

module.exports = Stock;
