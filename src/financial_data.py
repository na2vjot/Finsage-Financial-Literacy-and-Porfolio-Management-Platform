import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import json
import re

class FinancialDataFetcher:
    def __init__(self):
        # Indian stock symbols mapping
        self.indian_stocks = {
            'reliance': 'RELIANCE.NS',
            'tcs': 'TCS.NS',
            'infosys': 'INFY.NS',
            'hdfc bank': 'HDFCBANK.NS',
            'icici bank': 'ICICIBANK.NS',
            'sbi': 'SBIN.NS',
            'lt': 'LT.NS',
            'hul': 'HINDUNILVR.NS',
            'itc': 'ITC.NS',
            'asian paints': 'ASIANPAINT.NS',
            'nifty': '^NSEI',
            'sensex': '^BSESN',
            'bank nifty': '^NSEBANK'
        }
        
        # Commodities and currencies
        self.commodities = {
            'gold': 'GC=F',
            'silver': 'SI=F',
            'crude oil': 'CL=F'
        }
        
        self.currencies = {
            'usd to inr': 'INR=X',
            'eur to inr': 'EURINR=X',
            'gbp to inr': 'GBPINR=X',
            'jpy to inr': 'JPYINR=X'
        }

    def detect_query_type(self, query):
        """Detect what type of financial data is being requested"""
        query_lower = query.lower()
        
        # Check for stock queries
        for stock_name, stock_symbol in self.indian_stocks.items():
            if stock_name in query_lower:
                return 'stock', stock_symbol, stock_name
        
        # Check for commodity queries
        for commodity_name, commodity_symbol in self.commodities.items():
            if commodity_name in query_lower:
                return 'commodity', commodity_symbol, commodity_name
        
        # Check for currency queries
        for currency_name, currency_symbol in self.currencies.items():
            if currency_name in query_lower:
                return 'currency', currency_symbol, currency_name
        
        # Check for general market queries
        if any(word in query_lower for word in ['market', 'nifty', 'sensex', 'stock market', 'share market']):
            return 'market_overview', None, None
            
        return None, None, None

    def get_usd_to_inr_rate(self):
        """Get current USD to INR rate for conversions"""
        try:
            ticker = yf.Ticker('INR=X')
            hist = ticker.history(period='1d')
            if not hist.empty:
                return hist['Close'].iloc[-1]
        except:
            pass
        return 83.0  # Fallback rate

    def get_stock_data(self, symbol, period='1d'):
        """Get stock data for a given symbol"""
        try:
            ticker = yf.Ticker(symbol)
            
            # Get current data
            info = ticker.info
            hist = ticker.history(period=period)
            
            if hist.empty:
                return None
            
            current_price = hist['Close'].iloc[-1]
            previous_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
            change = current_price - previous_close
            change_percent = (change / previous_close) * 100
            
            data = {
                'symbol': symbol,
                'current_price': round(current_price, 2),
                'previous_close': round(previous_close, 2),
                'change': round(change, 2),
                'change_percent': round(change_percent, 2),
                'currency': info.get('currency', 'INR'),
                'name': info.get('longName', ''),
                'market_cap': info.get('marketCap', 'N/A'),
                'volume': hist['Volume'].iloc[-1] if 'Volume' in hist.columns else 'N/A',
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            return data
            
        except Exception as e:
            print(f"Error fetching stock data for {symbol}: {e}")
            return None

    def get_commodity_data(self, symbol):
        """Get commodity data with proper Indian pricing"""
        try:
            if symbol == 'GC=F':  # Gold
                # Get international gold price
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period='2d')
                
                if hist.empty:
                    return None
                
                current_price = hist['Close'].iloc[-1]
                previous_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
                change = current_price - previous_close
                change_percent = (change / previous_close) * 100
                
                # Get USD to INR rate for conversion
                usd_to_inr = self.get_usd_to_inr_rate()
                
                # Calculate Indian gold price (per 10 grams, not per ounce)
                # 1 ounce = 31.1035 grams, so price per gram then multiply by 10
                gold_per_gram_usd = current_price / 31.1035
                gold_per_10_grams_inr = gold_per_gram_usd * usd_to_inr * 10
                
                # Add Indian market premium (typically 10-15% over international price)
                indian_market_premium = 1.12  # 12% premium for making charges, GST, etc.
                final_indian_price = gold_per_10_grams_inr * indian_market_premium
                
                data = {
                    'name': 'Gold',
                    'international_price': current_price,
                    'previous_close': previous_close,
                    'change': change,
                    'change_percent': change_percent,
                    'currency': 'USD',
                    'indian_price_per_10g': final_indian_price,
                    'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }
                
                return data
                
            else:
                # Handle other commodities (silver, crude) similarly
                return self.get_basic_commodity_data(symbol)
                
        except Exception as e:
            print(f"Error fetching commodity data for {symbol}: {e}")
            return None

    def get_basic_commodity_data(self, symbol):
        """Fallback method for other commodities"""
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period='2d')
            
            if hist.empty:
                return None
            
            current_price = hist['Close'].iloc[-1]
            previous_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
            change = current_price - previous_close
            change_percent = (change / previous_close) * 100
            
            commodity_names = {
                'GC=F': 'Gold',
                'SI=F': 'Silver', 
                'CL=F': 'Crude Oil'
            }
            
            usd_to_inr = self.get_usd_to_inr_rate()
            current_inr = current_price * usd_to_inr if usd_to_inr else None
            
            data = {
                'name': commodity_names.get(symbol, symbol),
                'current_price': current_price,
                'previous_close': previous_close,
                'change': change,
                'change_percent': change_percent,
                'currency': 'USD',
                'current_inr': current_inr,
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            return data
            
        except Exception as e:
            print(f"Error in basic commodity data: {e}")
            return None

    def get_currency_data(self, symbol):
        """Get currency exchange rate data"""
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period='1d')
            
            if hist.empty:
                return None
            
            current_rate = hist['Close'].iloc[-1]
            previous_rate = hist['Close'].iloc[-2] if len(hist) > 1 else current_rate
            change = current_rate - previous_rate
            change_percent = (change / previous_rate) * 100
            
            currency_pairs = {
                'INR=X': 'USD/INR',
                'EURINR=X': 'EUR/INR',
                'GBPINR=X': 'GBP/INR',
                'JPYINR=X': 'JPY/INR'
            }
            
            data = {
                'pair': currency_pairs.get(symbol, symbol),
                'current_rate': round(current_rate, 4),
                'previous_rate': round(previous_rate, 4),
                'change': round(change, 4),
                'change_percent': round(change_percent, 4),
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            return data
            
        except Exception as e:
            print(f"Error fetching currency data for {symbol}: {e}")
            return None

    def get_market_overview(self):
        """Get overall market overview (Nifty, Sensex)"""
        try:
            nifty_data = self.get_stock_data('^NSEI')
            sensex_data = self.get_stock_data('^BSESN')
            bank_nifty_data = self.get_stock_data('^NSEBANK')
            
            overview = {
                'nifty_50': nifty_data,
                'sensex': sensex_data,
                'bank_nifty': bank_nifty_data,
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            return overview
            
        except Exception as e:
            print(f"Error fetching market overview: {e}")
            return None

    def format_stock_response(self, data):
        """Format stock data into a readable response"""
        if not data:
            return "Sorry, I couldn't fetch the stock data at the moment."
        
        trend = "📈" if data['change'] >= 0 else "📉"
        
        response = f"""
**{data.get('name', data['symbol'])}** ({data['symbol']})
💰 **Current Price**: {data['current_price']} {data['currency']}
📊 **Previous Close**: {data['previous_close']} {data['currency']}
{trend} **Change**: {data['change']} ({data['change_percent']}%)
🕒 **Last Updated**: {data['timestamp']}
"""
        return response

    def format_commodity_response(self, data):
        """Format commodity data with proper Indian pricing"""
        if not data:
            return "❌ Sorry, I couldn't fetch the commodity data at the moment."
        
        trend = "📈" if data['change'] >= 0 else "📉"
        change_emoji = "🟢" if data['change'] >= 0 else "🔴"
        
        # For gold, show Indian price prominently
        if data['name'].lower() == 'gold' and 'indian_price_per_10g' in data:
            response = f"""{change_emoji} **Gold Prices** 💰

🇮🇳 **Indian Price (24K, 10g)**: ₹{data['indian_price_per_10g']:,.0f}
💵 **International Price**: ${data['international_price']:,.2f}/oz
📊 **Previous Close**: ${data['previous_close']:,.2f}/oz
{trend} **Change**: ${data['change']:,.2f} ({data['change_percent']:.2f}%)

🕒 **Updated**: {data['timestamp']}

*Indian prices include making charges & taxes • Prices for 24K purity*"""
        
        else:
            # For other commodities, use original format
            inr_info = ""
            if data.get('current_inr'):
                inr_info = f"🇮🇳 **Approx. Indian Price**: ₹{data['current_inr']:,.0f}\n"
            
            response = f"""{change_emoji} **{data['name']}**

💰 **International Price**: ${data['current_price']:,.2f}
📊 **Previous Close**: ${data['previous_close']:,.2f}
{trend} **Change**: ${data['change']:,.2f} ({data['change_percent']:.2f}%)

{inr_info}🕒 **Updated**: {data['timestamp']}

*International prices in USD*"""
        
        return response

    def format_currency_response(self, data):
        """Format currency data into a readable response"""
        if not data:
            return "Sorry, I couldn't fetch the currency data at the moment."
        
        trend = "📈" if data['change'] >= 0 else "📉"
        
        response = f"""
**{data['pair']}**
💱 **Current Rate**: {data['current_rate']}
📊 **Previous Rate**: {data['previous_rate']}
{trend} **Change**: {data['change']} ({data['change_percent']}%)
🕒 **Last Updated**: {data['timestamp']}
"""
        return response

    def format_market_overview(self, data):
        """Format market overview into a readable response"""
        if not data:
            return "Sorry, I couldn't fetch market data at the moment."
        
        response = "**📊 Indian Market Overview**\n\n"
        
        for index_name, index_data in data.items():
            if index_name == 'timestamp':
                continue
                
            if index_data:
                trend = "📈" if index_data['change'] >= 0 else "📉"
                response += f"""**{index_name.replace('_', ' ').title()}**
💰 **Current**: {index_data['current_price']}
{trend} **Change**: {index_data['change']} ({index_data['change_percent']}%)

"""
        
        response += f"🕒 **Last Updated**: {data['timestamp']}"
        return response

    def process_financial_query(self, query):
        """Main method to process financial queries"""
        query_type, symbol, name = self.detect_query_type(query)
        
        if not query_type:
            return None
        
        if query_type == 'stock':
            data = self.get_stock_data(symbol)
            return self.format_stock_response(data)
        
        elif query_type == 'commodity':
            data = self.get_commodity_data(symbol)
            return self.format_commodity_response(data)
        
        elif query_type == 'currency':
            data = self.get_currency_data(symbol)
            return self.format_currency_response(data)
        
        elif query_type == 'market_overview':
            data = self.get_market_overview()
            return self.format_market_overview(data)
        
        return None

# Example usage
if __name__ == "__main__":
    fetcher = FinancialDataFetcher()
    
    # Test queries
    test_queries = [
        "What is Reliance share price?",
        "Show me gold price",
        "USD to INR rate",
        "How is stock market today?",
        "Nifty 50 current price"
    ]
    
    for query in test_queries:
        print(f"Query: {query}")
        result = fetcher.process_financial_query(query)
        print(f"Result: {result}\n{'-'*50}")