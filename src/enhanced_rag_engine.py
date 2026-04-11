import os
import re
from typing import List, Dict, Any
import yfinance as yf
from datetime import datetime
import sys
sys.path.append(os.path.dirname(__file__))

# Import the new portfolio advisor
from portfolio_advisor_new import EnhancedPortfolioAdvisor

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("Note: openai package not installed. Install with: pip install openai")

class FinancialDataFetcher:
    def __init__(self):
        # Indian stock symbols mapping - expanded list for recommendations
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
            'bank nifty': '^NSEBANK',
            'hdfc': 'HDFC.NS',
            'kotak bank': 'KOTAKBANK.NS',
            'axis bank': 'AXISBANK.NS',
            'bajaj finance': 'BAJFINANCE.NS',
            'wipro': 'WIPRO.NS',
            'bharti airtel': 'BHARTIARTL.NS',
            'maruti': 'MARUTI.NS',
            'sun pharma': 'SUNPHARMA.NS',
            'tata motors': 'TATAMOTORS.NS',
            'tata steel': 'TATASTEEL.NS',
            'hindalco': 'HINDALCO.NS',
            'jsw steel': 'JSWSTEEL.NS',
            'coal india': 'COALINDIA.NS',
            'ongc': 'ONGC.NS',
            'ioc': 'IOC.NS',
            'bhel': 'BHEL.NS',
            'power grid': 'POWERGRID.NS',
            'ntpc': 'NTPC.NS',
            'yes bank': 'YESBANK.NS',
            'vedanta': 'VEDL.NS',
            'gail': 'GAIL.NS',
            'cipla': 'CIPLA.NS',
            'dr reddys': 'DRREDDY.NS',
            'bajaj auto': 'BAJAJ-AUTO.NS',
            'm&m': 'M&M.NS',
            'hero motocorp': 'HEROMOTOCO.NS',
            'eicher motors': 'EICHERMOT.NS',
            'britannia': 'BRITANNIA.NS',
            'nestle': 'NESTLEIND.NS',
            'hcl tech': 'HCLTECH.NS',
            'tech mahindra': 'TECHM.NS'
        }
        
        # Low to medium price stocks for recommendations
        self.affordable_stocks = {
            'sbi': 'SBIN.NS',
            'tata steel': 'TATASTEEL.NS',
            'vedanta': 'VEDL.NS',
            'ongc': 'ONGC.NS',
            'ioc': 'IOC.NS',
            'coal india': 'COALINDIA.NS',
            'power grid': 'POWERGRID.NS',
            'ntpc': 'NTPC.NS',
            'bhel': 'BHEL.NS',
            'yes bank': 'YESBANK.NS',
            'gail': 'GAIL.NS',
            'hindalco': 'HINDALCO.NS',
            'jsw steel': 'JSWSTEEL.NS'
        }
        
        # Commodities in Indian markets
        self.commodities = {
            'gold': 'GC=F',
            'silver': 'SI=F',
            'crude oil': 'CL=F',
            'crude': 'CL=F'
        }
        
        self.currencies = {
            'usd to inr': 'INR=X',
            'usd inr': 'INR=X',
            'dollar to rupee': 'INR=X',
            'eur to inr': 'EURINR=X',
            'euro to rupee': 'EURINR=X',
            'gbp to inr': 'GBPINR=X',
            'pound to rupee': 'GBPINR=X',
            'jpy to inr': 'JPYINR=X',
            'yen to rupee': 'JPYINR=X'
        }

    def detect_query_type(self, query):
        """Detect what type of financial data is being requested"""
        query_lower = query.lower()
        
        # Skip comparison detection for this method as it's handled separately
        comparison_keywords = ['compare', 'vs', 'versus', 'comparison', 'which is better', 'difference between']
        if any(keyword in query_lower for keyword in comparison_keywords):
            return None, None, None
        
        # Check for stock recommendation queries
        recommendation_patterns = [
            'stocks under', 'shares under', 'stocks below', 'shares below',
            'stocks within', 'shares within', 'recommend stocks', 'good stocks under',
            'best stocks under', 'affordable stocks', 'cheap stocks', 'low price stocks'
        ]
        if any(pattern in query_lower for pattern in recommendation_patterns):
            return 'stock_recommendation', None, None
        
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
        market_words = ['market', 'nifty', 'sensex', 'stock market', 'share market', 'market today', 'bse', 'nse']
        if any(word in query_lower for word in market_words):
            return 'market_overview', None, None
            
        return None, None, None

    def detect_comparison_query(self, query):
        """Detect if query is asking to compare two stocks"""
        query_lower = query.lower()
        
        comparison_keywords = ['compare', 'vs', 'versus', 'comparison', 'which is better', 'difference between']
        
        if any(keyword in query_lower for keyword in comparison_keywords):
            # Extract stock names
            found_stocks = []
            for stock_name, stock_symbol in self.indian_stocks.items():
                if stock_name in query_lower:
                    found_stocks.append((stock_name, stock_symbol))
            
            if len(found_stocks) >= 2:
                return found_stocks[0], found_stocks[1]
        
        return None, None

    def extract_price_from_query(self, query):
        """Extract price limit from recommendation query"""
        query_lower = query.lower()
        
        # Patterns to match price
        patterns = [
            r'under\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            r'below\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            r'within\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            r'less than\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            r'upto\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)',
            r'₹\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*and below',
            r'₹\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*or less'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, query_lower)
            if match:
                price_str = match.group(1).replace(',', '')
                try:
                    return float(price_str)
                except ValueError:
                    continue
        
        # Default price limits if not specified
        if 'under' in query_lower or 'below' in query_lower:
            return 500.0  # Default to ₹500 if not specified
        
        return None

    def get_stocks_by_price_range(self, max_price, min_price=0):
        """Get stocks within specified price range with real-time data"""
        try:
            matching_stocks = []
            
            # Check affordable stocks first
            for stock_name, stock_symbol in self.affordable_stocks.items():
                stock_data = self.get_stock_data(stock_symbol, '1d')
                if stock_data and min_price <= stock_data['current_price'] <= max_price:
                    # Get additional info for better recommendations
                    ticker = yf.Ticker(stock_symbol)
                    info = ticker.info
                    
                    stock_data.update({
                        'sector': info.get('sector', 'N/A'),
                        'pe_ratio': info.get('trailingPE', 'N/A'),
                        'dividend_yield': info.get('dividendYield', 'N/A'),
                        'volume': info.get('volume', 'N/A'),
                        'market_cap_full': info.get('marketCap', 'N/A')
                    })
                    matching_stocks.append(stock_data)
            
            # Sort by current price (low to high)
            matching_stocks.sort(key=lambda x: x['current_price'])
            
            return matching_stocks[:10]  # Return top 10 matches
            
        except Exception as e:
            print(f"Error getting stocks by price range: {e}")
            return []

    def get_stock_comparison(self, symbol1, symbol2, period='6mo'):
        """Compare two stocks with historical data"""
        try:
            # Get current data for both stocks
            stock1_data = self.get_stock_data(symbol1, '1d')
            stock2_data = self.get_stock_data(symbol2, '1d')
            
            # Get 6-month historical data
            ticker1 = yf.Ticker(symbol1)
            ticker2 = yf.Ticker(symbol2)
            
            hist1 = ticker1.history(period=period)
            hist2 = ticker2.history(period=period)
            
            if hist1.empty or hist2.empty:
                return None
            
            # Calculate 6-month growth
            start_price1 = hist1['Close'].iloc[0]
            end_price1 = hist1['Close'].iloc[-1]
            growth1 = ((end_price1 - start_price1) / start_price1) * 100
            
            start_price2 = hist2['Close'].iloc[0]
            end_price2 = hist2['Close'].iloc[-1]
            growth2 = ((end_price2 - start_price2) / start_price2) * 100
            
            # Calculate additional metrics
            volatility1 = hist1['Close'].pct_change().std() * 100
            volatility2 = hist2['Close'].pct_change().std() * 100
            
            comparison_data = {
                'stock1': {
                    'current_data': stock1_data,
                    'six_month_growth': growth1,
                    'start_price': start_price1,
                    'end_price': end_price1,
                    'volatility': volatility1,
                    'six_month_high': hist1['Close'].max(),
                    'six_month_low': hist1['Close'].min()
                },
                'stock2': {
                    'current_data': stock2_data,
                    'six_month_growth': growth2,
                    'start_price': start_price2,
                    'end_price': end_price2,
                    'volatility': volatility2,
                    'six_month_high': hist2['Close'].max(),
                    'six_month_low': hist2['Close'].min()
                },
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            return comparison_data
            
        except Exception as e:
            print(f"Error comparing stocks {symbol1} vs {symbol2}: {e}")
            return None

    def get_stock_data(self, symbol, period='2d'):
        """Get stock data for Indian stocks"""
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period)
            
            if hist.empty:
                return None
            
            current_price = hist['Close'].iloc[-1]
            previous_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
            change = current_price - previous_close
            change_percent = (change / previous_close) * 100
            
            # Get additional info
            info = ticker.info
            
            # Convert market cap to Indian format (Lakh Crore)
            market_cap = info.get('marketCap')
            if market_cap:
                market_cap_inr = market_cap / 1e13  # Convert to Lakh Crore
                market_cap_str = f"₹{market_cap_inr:.2f} Lakh Cr"
            else:
                market_cap_str = "N/A"
            
            data = {
                'symbol': symbol,
                'current_price': current_price,
                'previous_close': previous_close,
                'change': change,
                'change_percent': change_percent,
                'currency': 'INR',
                'name': info.get('longName', symbol.replace('.NS', '')),
                'market_cap': market_cap_str,
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            return data
            
        except Exception as e:
            print(f"Error fetching stock data for {symbol}: {e}")
            return None

    def get_commodity_data(self, symbol):
        """Get commodity data in Indian context"""
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
                'GC=F': 'Gold (International)',
                'SI=F': 'Silver (International)',
                'CL=F': 'Crude Oil (International)'
            }
            
            # Convert to approximate Indian prices for context
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
            print(f"Error fetching commodity data for {symbol}: {e}")
            return None

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

    def get_currency_data(self, symbol):
        """Get currency exchange rate data"""
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period='2d')
            
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
                'current_rate': current_rate,
                'previous_rate': previous_rate,
                'change': change,
                'change_percent': change_percent,
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            return data
            
        except Exception as e:
            print(f"Error fetching currency data for {symbol}: {e}")
            return None

    def get_market_overview(self):
        """Get overall Indian market overview"""
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

    def format_indian_number(self, number):
        """Format number in Indian numbering system"""
        if number is None:
            return "N/A"
        
        number = float(number)
        if number >= 1e7:  # Crores
            return f"₹{number/1e7:.2f} Cr"
        elif number >= 1e5:  # Lakhs
            return f"₹{number/1e5:.2f} L"
        else:
            return f"₹{number:,.2f}"

    def format_stock_recommendation(self, stocks, max_price):
        """Format stock recommendations into readable response"""
        if not stocks:
            return f"❌ No stocks found under ₹{max_price:,.0f} in my current database. Try increasing the price limit or check back later for updated data."
        
        response = f"""**📊 STOCKS UNDER ₹{max_price:,.0f} - REAL-TIME PRICES**

Here are some stocks currently trading below ₹{max_price:,.0f}:

"""
        
        for i, stock in enumerate(stocks, 1):
            trend = "📈" if stock['change'] >= 0 else "📉"
            change_emoji = "🟢" if stock['change'] >= 0 else "🔴"
            
            response += f"""**{i}. {stock['name']}** {change_emoji}
💰 **Current Price**: {self.format_indian_number(stock['current_price'])}
{trend} **Change**: {self.format_indian_number(stock['change'])} ({stock['change_percent']:.2f}%)
🏢 **Market Cap**: {stock.get('market_cap', 'N/A')}

"""
        
        response += f"""
**💡 INVESTMENT CONSIDERATIONS:**

• **Diversification**: Consider spreading investments across sectors
• **Research**: Always check company fundamentals before investing
• **Risk Assessment**: Lower-priced stocks can be more volatile
• **Long-term View**: Consider your investment horizon

**📈 Sectors Represented:** {', '.join(set(stock.get('sector', 'N/A') for stock in stocks if stock.get('sector') != 'N/A'))}

🕒 **Real-time Data Updated**: {stocks[0]['timestamp'] if stocks else 'N/A'}

*⚠️ Disclaimer: This is not investment advice. Stock prices change rapidly. Always conduct your own research and consider consulting a financial advisor before making investment decisions. Past performance is not indicative of future results.*"""

        return response

    def format_stock_comparison(self, comparison_data):
        """Format stock comparison into readable response"""
        if not comparison_data:
            return "❌ Sorry, I couldn't fetch the comparison data at the moment."
        
        stock1 = comparison_data['stock1']
        stock2 = comparison_data['stock2']
        
        # Determine better performer
        growth_diff = abs(stock1['six_month_growth'] - stock2['six_month_growth'])
        
        if stock1['six_month_growth'] > stock2['six_month_growth']:
            better_performer = f"🏆 **{stock1['current_data']['name']}** has outperformed by {growth_diff:.2f}% over 6 months"
            winner_emoji = "🥇"
            loser_emoji = "🥈"
        else:
            better_performer = f"🏆 **{stock2['current_data']['name']}** has outperformed by {growth_diff:.2f}% over 6 months"
            winner_emoji = "🥇"
            loser_emoji = "🥈"
        
        response = f"""**📊 STOCK COMPARISON REPORT**

{winner_emoji} **{stock1['current_data']['name']}**
💰 **Current Price**: {self.format_indian_number(stock1['current_data']['current_price'])}
📈 **6-Month Growth**: {stock1['six_month_growth']:+.2f}%
📊 **Price Range**: {self.format_indian_number(stock1['six_month_low'])} - {self.format_indian_number(stock1['six_month_high'])}
📉 **Volatility**: {stock1['volatility']:.2f}%

{loser_emoji} **{stock2['current_data']['name']}**
💰 **Current Price**: {self.format_indian_number(stock2['current_data']['current_price'])}
📈 **6-Month Growth**: {stock2['six_month_growth']:+.2f}%
📊 **Price Range**: {self.format_indian_number(stock2['six_month_low'])} - {self.format_indian_number(stock2['six_month_high'])}
📉 **Volatility**: {stock2['volatility']:.2f}%

{better_performer}

📋 **Summary**:
• Both stocks show real-time pricing data
• 6-month growth calculated from historical performance
• Volatility indicates price fluctuation risk

🕒 **Data Updated**: {comparison_data['timestamp']}

*⚠️ Disclaimer: Past performance is not indicative of future results. Always conduct your own research before investing.*"""

        return response

    def format_stock_response(self, data):
        """Format stock data into a readable response"""
        if not data:
            return "❌ Sorry, I couldn't fetch the stock data at the moment. Please try again later."
        
        trend = "📈" if data['change'] >= 0 else "📉"
        change_emoji = "🟢" if data['change'] >= 0 else "🔴"
        
        response = f"""{change_emoji} **{data['name']}** ({data['symbol']})

💰 **Current Price**: {self.format_indian_number(data['current_price'])}
📊 **Previous Close**: {self.format_indian_number(data['previous_close'])}
{trend} **Change**: {self.format_indian_number(data['change'])} ({data['change_percent']:.2f}%)

🏢 **Market Cap**: {data.get('market_cap', 'N/A')}
🕒 **Updated**: {data['timestamp']}

*Data from NSE/BSE • Prices in Indian Rupees*"""
        return response

    def format_commodity_response(self, data):
        """Format commodity data into a readable response"""
        if not data:
            return "❌ Sorry, I couldn't fetch the commodity data at the moment."
        
        trend = "📈" if data['change'] >= 0 else "📉"
        change_emoji = "🟢" if data['change'] >= 0 else "🔴"
        
        inr_info = ""
        if data.get('current_inr'):
            inr_info = f"🇮🇳 **Approx. Indian Price**: ₹{data['current_inr']:,.0f}/oz\n"
        
        response = f"""{change_emoji} **{data['name']}**

💰 **International Price**: ${data['current_price']:,.2f}/oz
📊 **Previous Close**: ${data['previous_close']:,.2f}/oz
{trend} **Change**: ${data['change']:,.2f} ({data['change_percent']:.2f}%)

{inr_info}🕒 **Updated**: {data['timestamp']}

*International commodity prices in USD*"""
        return response

    def format_currency_response(self, data):
        """Format currency data into a readable response"""
        if not data:
            return "❌ Sorry, I couldn't fetch the currency data at the moment."
        
        trend = "📈" if data['change'] >= 0 else "📉"
        change_emoji = "🟢" if data['change'] >= 0 else "🔴"
        
        response = f"""{change_emoji} **{data['pair']}**

💱 **Current Rate**: {data['current_rate']:.4f}
📊 **Previous Rate**: {data['previous_rate']:.4f}
{trend} **Change**: {data['change']:.4f} ({data['change_percent']:.2f}%)

🕒 **Updated**: {data['timestamp']}

*Forex rates - Indian Rupee perspective*"""
        return response

    def format_market_overview(self, data):
        """Format market overview into a readable response"""
        if not data:
            return "❌ Sorry, I couldn't fetch market data at the moment. Indian markets are open 9:15 AM - 3:30 PM IST (Monday-Friday)."
        
        response = "**📊 Indian Stock Market Overview**\n\n"
        
        valid_data = False
        for index_name, index_data in data.items():
            if index_name == 'timestamp':
                continue
                
            if index_data:
                valid_data = True
                trend = "📈" if index_data['change'] >= 0 else "📉"
                change_emoji = "🟢" if index_data['change'] >= 0 else "🔴"
                response += f"""{change_emoji} **{index_name.replace('_', ' ').title()}**
💰 **Current**: {self.format_indian_number(index_data['current_price'])}
{trend} **Change**: {self.format_indian_number(index_data['change'])} ({index_data['change_percent']:.2f}%)

"""
        
        if not valid_data:
            return "❌ Unable to fetch current market data. Markets might be closed (9:15 AM - 3:30 PM IST, Weekdays)."
        
        response += f"🕒 **Last Updated**: {data['timestamp']}"
        response += "\n\n*NSE/BSE Market Hours: 9:15 AM - 3:30 PM IST (Monday-Friday)*"
        return response

    def process_financial_query(self, query):
        """Main method to process financial queries"""
        # First check if it's a comparison query
        stock1, stock2 = self.detect_comparison_query(query)
        if stock1 and stock2:
            comparison_data = self.get_stock_comparison(stock1[1], stock2[1])
            if comparison_data:
                return self.format_stock_comparison(comparison_data)
        
        # Then check for stock recommendation queries
        query_type, symbol, name = self.detect_query_type(query)
        
        if query_type == 'stock_recommendation':
            max_price = self.extract_price_from_query(query)
            if max_price:
                stocks = self.get_stocks_by_price_range(max_price)
                return self.format_stock_recommendation(stocks, max_price)
            else:
                return "❌ Please specify a price limit. For example: 'stocks under ₹500' or 'shares below ₹1000'"
        
        elif query_type == 'stock':
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


class FinancialRAGEngine:
    def __init__(self, vector_db, api_key=None):
        self.vector_db = vector_db
        self.financial_fetcher = FinancialDataFetcher()
        self.portfolio_advisor = EnhancedPortfolioAdvisor()
        
        # Store last financial plan for follow-up questions
        self.last_plan = None
        self.last_parsed_data = None
        
        if OPENAI_AVAILABLE:
            self.client = OpenAI(
                base_url="https://api.groq.com/openai/v1",
                api_key=api_key or os.getenv('GROQ_API_KEY')
            )
        else:
            self.client = None
            
        self.conversation_history = []
        self.available_models = [
            "llama-3.1-8b-instant",
            "llama-3.1-70b-versatile", 
            "mixtral-8x7b-32768",
            "llama3-8b-8192"
        ]

    def extract_content_from_result(self, result):
        """Safely extract content from search result regardless of structure"""
        if isinstance(result, dict):
            # Try different possible content locations
            if 'content' in result:
                return result['content']
            elif 'document' in result and isinstance(result['document'], dict) and 'content' in result['document']:
                return result['document']['content']
            elif 'page_content' in result:
                return result['page_content']
        
        # If it's a string or other type, return as is
        return str(result) if result else ""

    def clean_text(self, text):
        """Clean text by removing markdown formatting"""
        if not text:
            return text
            
        text = re.sub(r'[*_`#\[\]]', '', text)
        text = re.sub(r'[-*•]\s*\[\s*[x ]?\s*\]', '', text)
        text = re.sub(r'^[-*•]\s*', '', text, flags=re.MULTILINE)
        text = re.sub(r'\n\s*\n', '\n\n', text)
        text = text.strip()
        
        return text

    def detect_follow_up_query(self, query: str) -> bool:
        """Detect if this is a follow-up to the last financial plan"""
        query_lower = query.lower()
        
        if not self.last_parsed_data:
            return False
            
        # Keywords that indicate a follow-up/modification
        follow_up_keywords = [
            'instead', 'what if', 'different', 'change', 'modify',
            'adjust', 'instead of', 'what about', 'how about',
            'rather than', 'if i', 'what happens if', 'suppose'
        ]
        
        # Time modification keywords
        time_keywords = ['years', 'year', 'time', 'horizon', 'shorter', 'longer']
        
        # Amount modification keywords
        amount_keywords = ['more', 'less', 'increase', 'decrease', 'higher', 'lower']
        
        # Risk modification keywords
        risk_keywords = ['risk', 'conservative', 'aggressive', 'moderate', 'safe']
        
        if any(keyword in query_lower for keyword in follow_up_keywords):
            return True
        if any(keyword in query_lower for keyword in time_keywords):
            return True
        if any(keyword in query_lower for keyword in amount_keywords):
            return True
        if any(keyword in query_lower for keyword in risk_keywords):
            return True
            
        return False

    def modify_plan_based_on_follow_up(self, query: str) -> Dict:
        """Modify the last plan based on follow-up query"""
        if not self.last_parsed_data:
            return None
            
        query_lower = query.lower()
        modified_data = self.last_parsed_data.copy()
        
        # Check for time horizon modification
        if 'years' in query_lower or 'year' in query_lower:
            # Look for numbers in the query
            numbers = re.findall(r'\d+', query_lower)
            for num in numbers:
                num_int = int(num)
                if 1 <= num_int <= 50:  # Reasonable time horizon
                    modified_data['years'] = num_int
                    break
        
        # Check for risk level modification
        if 'low risk' in query_lower or 'conservative' in query_lower or 'safe' in query_lower:
            modified_data['risk_level'] = 'conservative'
        elif 'high risk' in query_lower or 'aggressive' in query_lower:
            modified_data['risk_level'] = 'aggressive'
        elif 'medium' in query_lower or 'moderate' in query_lower:
            modified_data['risk_level'] = 'moderate'
        
        # Check for investment amount modification
        if 'invest' in query_lower or 'save' in query_lower:
            numbers = re.findall(r'\d+', query_lower)
            for num in numbers:
                num_int = int(num)
                if 1000 <= num_int <= 1000000:  # Reasonable investment amount
                    modified_data['monthly_investment'] = num_int
                    break
        
        return modified_data

    def generate_response(self, query):
        """Main method to generate responses with enhanced capabilities"""
        
        # Add to conversation history
        self.add_to_conversation_history("user", query)
        
        # Check if this is a follow-up to the last financial plan
        if self.detect_follow_up_query(query) and self.last_parsed_data:
            modified_data = self.modify_plan_based_on_follow_up(query)
            if modified_data:
                # Generate new plan with modified data
                plan_result = self.portfolio_advisor.generate_detailed_financial_plan(modified_data)
                
                if plan_result.get('success'):
                    plan_response = self.portfolio_advisor.format_plan_response(plan_result)
                    self.last_plan = plan_result
                    self.last_parsed_data = modified_data
                    
                    response_data = {
                        'answer': plan_response,
                        'sources': [],
                        'data_type': 'financial_plan_updated'
                    }
                    self.add_to_conversation_history("assistant", plan_response)
                    return response_data
        
        # Check for financial planning queries
        parsed_plan = self.portfolio_advisor.parse_financial_planning_query(query)
        
        # Check if this is a financial planning query (has age or monthly investment or years)
        has_planning_data = parsed_plan.get('age') or parsed_plan.get('monthly_investment') or parsed_plan.get('years')
        
        if has_planning_data:
            # Generate financial plan
            plan_result = self.portfolio_advisor.generate_detailed_financial_plan(parsed_plan)
            
            if plan_result.get('success'):
                plan_response = self.portfolio_advisor.format_plan_response(plan_result)
                
                # Store for follow-up questions
                self.last_plan = plan_result
                self.last_parsed_data = parsed_plan
                
                response_data = {
                    'answer': plan_response,
                    'sources': [],
                    'data_type': 'financial_plan'
                }
                self.add_to_conversation_history("assistant", plan_response)
                return response_data
            elif plan_result.get('missing_fields'):
                # Ask for missing information
                missing = plan_result['missing_fields']
                missing_text = '\n'.join([f'• {field}' for field in missing])
                
                # Check if we have some data to suggest
                if parsed_plan.get('age') and parsed_plan.get('monthly_investment'):
                    missing_text = f"• time horizon (how many years)"
                
                response_data = {
                    'answer': f"## 📋 Let me help you create a personalized financial plan!\n\nI need a few more details to give you the best recommendations:\n\n{missing_text}\n\n**Please reply with the missing information.**\n\n*Example: \"I'm {parsed_plan.get('age') or 25} years old, can invest ₹{parsed_plan.get('monthly_investment') or 15000} monthly for 10 years to buy a house with medium risk\"*\n\nOr if you'd like, just tell me what you have so far and I'll help fill in the gaps! 💡",
                    'sources': [],
                    'data_type': 'info'
                }
                self.add_to_conversation_history("assistant", response_data['answer'])
                return response_data
        
        # Then check for stock comparison query
        stock1, stock2 = self.financial_fetcher.detect_comparison_query(query)
        if stock1 and stock2:
            comparison_data = self.financial_fetcher.get_stock_comparison(stock1[1], stock2[1])
            if comparison_data:
                comparison_response = self.financial_fetcher.format_stock_comparison(comparison_data)
                response_data = {
                    'answer': comparison_response,
                    'sources': [],
                    'data_type': 'stock_comparison'
                }
                self.add_to_conversation_history("assistant", comparison_response)
                return response_data
        
        # Then check for regular financial data queries
        financial_response = self.financial_fetcher.process_financial_query(query)
        
        if financial_response:
            response_data = {
                'answer': financial_response,
                'sources': [],
                'data_type': 'live_financial_data'
            }
            self.add_to_conversation_history("assistant", financial_response)
            return response_data
        
        # If no OpenAI client, return financial data focus message
        if not self.client:
            fallback_response = "I can help you with real-time Indian market data! Ask me about:\n\n• Nifty 50, Sensex, Bank Nifty\n• Reliance, TCS, Infosys share prices\n• USD to INR exchange rates\n• Gold and commodity prices\n• Stock comparisons (e.g., 'Compare Reliance and TCS')\n• Stock recommendations (e.g., 'Stocks under ₹500')\n• Financial planning (e.g., 'I'm 25, can invest ₹10000 monthly for 10 years')\n\nTry: 'Reliance share price' or 'Compare TCS vs Infosys' or 'Stocks under ₹1000'"
            
            response_data = {
                'answer': fallback_response,
                'sources': [],
                'data_type': 'info'
            }
            self.add_to_conversation_history("assistant", fallback_response)
            return response_data
        
        # Use RAG for general knowledge with enhanced prompting
        try:
            search_results = self.vector_db.search(query, n_results=3)
            
            context_parts = []
            for i, result in enumerate(search_results):
                content = self.extract_content_from_result(result)
                if content:
                    content = self.clean_text(content)
                    context_parts.append(f"Source {i+1}:\n{content}")
            
            context = "\n\n".join(context_parts) if context_parts else "No relevant financial documents found."

            # Enhanced system prompt with context awareness
            # Detect language mode from query prefix
            language_instruction = ""
            actual_query = query
            if query.startswith("तुम एक हिंदी वित्तीय सलाहकार"):
                language_instruction = "\n\n**LANGUAGE:** You MUST reply ONLY in Hindi (हिंदी). No English at all."
            else:
                language_instruction = "\n\n**LANGUAGE:** You MUST reply ONLY in English. Do not use Hindi or any other language even if previous messages were in Hindi."

            system_prompt = """You are FinSage, a friendly and conversational financial expert assistant and advisor. Always be polite, responsive, and maintain a natural conversational flow.

**CRITICAL GUIDELINES:**

1. **CONVERSATIONAL MEMORY:** Remember previous interactions. If the user is following up on a previous plan, acknowledge it and provide the updated calculation.

2. **LIVE DATA HANDLING:** If user asks about current stock prices, market data, commodities, or currencies, provide live data directly based on indian market.

3. **FINANCIAL PLANNING:** When users share age, investment amount, and goals:
   - Create personalized financial plans
   - Suggest portfolio allocations based on risk profile
   - Calculate projected wealth
   - Provide actionable recommendations

4. **FOLLOW-UP QUESTIONS:** If a user asks "what if" questions, modify the previous plan accordingly:
   - "What if I want it in 8 years?" -> Adjust time horizon
   - "What about high risk?" -> Change risk profile
   - "If I invest more?" -> Adjust investment amount

5. **FINANCIAL KNOWLEDGE:** For financial concepts, use the provided context to give comprehensive, accurate answers.

**Always maintain:** Professional yet approachable polite tone, personalized responses, and genuine helpfulness within financial expertise boundaries.""" + language_instruction

            # Build conversation history context
            history_context = ""
            if len(self.conversation_history) > 2:
                recent_history = self.conversation_history[-4:-1]
                history_context = "\n\nRecent Conversation Context:\n"
                for msg in recent_history:
                    if msg['role'] == 'user':
                        history_context += f"User: {msg['content']}\n"
                    else:
                        history_context += f"Assistant: {msg['content']}\n"

            # Strip Hindi wrapper to get clean user message for the prompt
            if query.startswith("तुम एक हिंदी वित्तीय सलाहकार"):
                import re
                match = re.search(r'उपयोगकर्ता का संदेश: "(.+)"$', query, re.DOTALL)
                actual_query = match.group(1) if match else query

            prompt = f"""CONTEXT FROM FINANCIAL DOCUMENTS:
{context}
{history_context}

USER QUESTION: {actual_query}

Please provide a helpful, conversational response following the guidelines above."""

            # Try available models
            for model in self.available_models:
                try:
                    response = self.client.chat.completions.create(
                        model=model,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=0.7,
                        max_tokens=800
                    )
                    
                    answer = response.choices[0].message.content
                    answer = self.clean_text(answer)
                    
                    # Extract sources safely
                    sources = []
                    for result in search_results:
                        source_content = self.extract_content_from_result(result)
                        if source_content:
                            sources.append({
                                'content': source_content[:200] + '...' if len(source_content) > 200 else source_content
                            })
                    
                    response_data = {
                        'answer': answer,
                        'sources': sources,
                        'data_type': 'rag_knowledge'
                    }
                    
                    self.add_to_conversation_history("assistant", answer)
                    return response_data
                    
                except Exception as model_error:
                    print(f"Model {model} failed, trying next...")
                    continue
            
            # Fallback if all models fail
            fallback_answer = "I can help you with live Indian market data, stock comparisons, and financial planning! Ask about Nifty, Sensex, specific stock prices, compare stocks, or get personalized financial plans."
            response_data = {
                'answer': fallback_answer,
                'sources': [],
                'data_type': 'info'
            }
            self.add_to_conversation_history("assistant", fallback_answer)
            return response_data
            
        except Exception as e:
            print(f"Error in RAG processing: {e}")
            error_response = "I can help you with real-time Indian market data, financial planning, and stock recommendations! Try asking about stock prices, market indices, or create a financial plan."
            response_data = {
                'answer': error_response,
                'sources': [],
                'data_type': 'info'
            }
            self.add_to_conversation_history("assistant", error_response)
            return response_data

    def add_to_conversation_history(self, role, content):
        """Add a message to conversation history"""
        self.conversation_history.append({
            'role': role,
            'content': content,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
        
        # Keep only last 20 conversations to prevent memory issues
        if len(self.conversation_history) > 20:
            self.conversation_history = self.conversation_history[-20:]

    def get_conversation_history(self):
        """Get the conversation history"""
        return self.conversation_history

    def clear_conversation_history(self):
        """Clear the conversation history"""
        self.conversation_history = []
        self.last_plan = None
        self.last_parsed_data = None
        return "Conversation history cleared."