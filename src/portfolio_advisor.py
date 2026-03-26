"""
Portfolio Advisor Module for FinSage
Handles financial planning and portfolio optimization
"""

import numpy as np
import pandas as pd
from pypfopt import expected_returns, risk_models, EfficientFrontier
from pypfopt.discrete_allocation import DiscreteAllocation, get_latest_prices
import yfinance as yf

class PortfolioAdvisor:
    """Financial planning and portfolio optimization advisor"""
    
    def __init__(self):
        self.risk_profiles = {
            'low': {
                'stocks': 30,
                'mutual_funds': 20,
                'debt': 50,
                'expected_return': 0.08  # 8%
            },
            'medium': {
                'stocks': 50,
                'mutual_funds': 30,
                'debt': 20,
                'expected_return': 0.12  # 12%
            },
            'high': {
                'stocks': 70,
                'mutual_funds': 20,
                'debt': 10,
                'expected_return': 0.15  # 15%
            }
        }
        
        # Sample mutual funds for SIP recommendations
        self.suggested_investments = {
            'low': [
                "ICICI Prudential Balanced Advantage Fund",
                "SBI Magnum Gilt Fund",
                "HDFC Corporate Bond Fund"
            ],
            'medium': [
                "Nippon India Large Cap Fund",
                "Mirae Asset Large Cap Fund",
                "HDFC Balanced Advantage Fund"
            ],
            'high': [
                "SBI Small Cap Fund",
                "Axis Bluechip Fund",
                "Motilal Oswal Midcap Fund"
            ]
        }
    
    def calculate_future_value(self, monthly_investment, years, expected_return):
        """
        Calculate future value of monthly investments
        Formula: FV = P * [(1+r)^n - 1] / r * (1+r)
        """
        monthly_rate = expected_return / 12
        months = years * 12
        
        # Future value of annuity due (investing at beginning of month)
        fv = monthly_investment * ((1 + monthly_rate) ** months - 1) / monthly_rate * (1 + monthly_rate)
        return fv
    
    def analyze_user_goal(self, user_data):
        """
        Analyze user's financial goal and provide recommendations
        """
        try:
            age = user_data.get('age')
            salary = user_data.get('salary')
            monthly_investment = user_data.get('monthly_investment')
            years = user_data.get('years')
            risk_level = user_data.get('risk_level', 'medium')
            
            # Validate inputs
            if not all([age, salary, monthly_investment, years]):
                return {
                    'success': False,
                    'error': 'Missing required information',
                    'message': 'Please provide age, salary, monthly investment, and time horizon'
                }
            
            # Get risk profile
            risk_profile = self.risk_profiles.get(risk_level, self.risk_profiles['medium'])
            expected_return = risk_profile['expected_return']
            
            # Calculate future value
            future_value = self.calculate_future_value(monthly_investment, years, expected_return)
            
            # Format future value in lakhs/crores
            future_value_formatted = self.format_currency(future_value)
            
            # Get suggested investments
            suggestions = self.suggested_investments[risk_level]
            
            # Calculate monthly breakdown
            monthly_breakdown = {
                'stocks': monthly_investment * (risk_profile['stocks'] / 100),
                'mutual_funds': monthly_investment * (risk_profile['mutual_funds'] / 100),
                'debt': monthly_investment * (risk_profile['debt'] / 100)
            }
            
            return {
                'success': True,
                'age': age,
                'salary': salary,
                'monthly_investment': monthly_investment,
                'time_horizon': years,
                'risk_level': risk_level,
                'portfolio_allocation': {
                    'stocks': f"{risk_profile['stocks']}%",
                    'mutual_funds': f"{risk_profile['mutual_funds']}%",
                    'debt': f"{risk_profile['debt']}%"
                },
                'monthly_breakdown': {
                    'stocks': monthly_breakdown['stocks'],
                    'mutual_funds': monthly_breakdown['mutual_funds'],
                    'debt': monthly_breakdown['debt']
                },
                'future_value': future_value,
                'future_value_formatted': future_value_formatted,
                'expected_return': f"{expected_return * 100:.1f}%",
                'suggested_investments': suggestions,
                'recommendations': self.generate_recommendations(risk_level, future_value, years)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Could not analyze your financial plan'
            }
    
    def format_currency(self, amount):
        """Format amount in Indian currency format"""
        if amount >= 10000000:  # 1 crore
            return f"₹{amount/10000000:.1f} Crore"
        elif amount >= 100000:  # 1 lakh
            return f"₹{amount/100000:.1f} Lakhs"
        else:
            return f"₹{amount:,.0f}"
    
    def generate_recommendations(self, risk_level, future_value, years):
        """Generate personalized recommendations"""
        recommendations = []
        
        # General advice
        recommendations.append("✅ Start a Systematic Investment Plan (SIP) to build wealth consistently")
        
        if risk_level == 'low':
            recommendations.append("✅ Focus on debt instruments and balanced funds for stability")
            recommendations.append("✅ Keep emergency fund of 6 months expenses")
        elif risk_level == 'medium':
            recommendations.append("✅ Balance your portfolio with 50% equities and 30% mutual funds")
            recommendations.append("✅ Review portfolio every 6 months")
        else:
            recommendations.append("✅ High risk can yield high returns, but be prepared for volatility")
            recommendations.append("✅ Diversify across sectors to manage risk")
        
        # Goal-specific advice
        recommendations.append(f"✅ With {self.format_currency(future_value)} in {years} years, you can use it as down payment for a house")
        recommendations.append("✅ Increase investment amount as salary grows")
        
        return recommendations
    
    def optimize_portfolio_with_stocks(self, tickers, risk_level='medium'):
        """
        Advanced portfolio optimization using PyPortfolioOpt
        """
        try:
            # Download historical data
            data = yf.download(tickers, period="2y")['Adj Close']
            data = data.dropna(axis=1, how='all')
            
            # Calculate expected returns and covariance matrix
            mu = expected_returns.mean_historical_return(data)
            S = risk_models.sample_cov(data)
            
            # Create efficient frontier
            ef = EfficientFrontier(mu, S)
            
            # Optimize based on risk level
            if risk_level == 'low':
                weights = ef.min_volatility()
            elif risk_level == 'high':
                weights = ef.max_sharpe()
            else:
                weights = ef.efficient_return(0.12)  # Target 12% return
            
            cleaned_weights = ef.clean_weights()
            
            # Format weights
            formatted_weights = {ticker: f"{weight*100:.1f}%" for ticker, weight in cleaned_weights.items()}
            
            return {
                'success': True,
                'weights': formatted_weights,
                'expected_annual_return': f"{ef.portfolio_performance()[0]*100:.1f}%",
                'annual_volatility': f"{ef.portfolio_performance()[1]*100:.1f}%",
                'sharpe_ratio': f"{ef.portfolio_performance()[2]:.2f}"
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Could not optimize portfolio with stocks'
            }

    def parse_user_query(self, query):
        """
        Parse natural language query to extract financial planning parameters
        """
        import re
        
        # Extract age (looking for numbers followed by "years old" or "yr")
        age_match = re.search(r'(\d+)\s*(?:years? old|yr|yo)', query.lower())
        age = int(age_match.group(1)) if age_match else None
        
        # Extract salary (looking for numbers with ₹ or Rs)
        salary_match = re.search(r'(?:₹|Rs\.?)\s*(\d+[\d,]*)', query)
        if salary_match:
            salary = int(salary_match.group(1).replace(',', ''))
        else:
            salary_match = re.search(r'(\d+[\d,]*)\s*(?:salary|income|earn)', query.lower())
            salary = int(salary_match.group(1).replace(',', '')) if salary_match else None
        
        # Extract investment amount
        invest_match = re.search(r'(?:invest|save|put)\s*(?:₹|Rs\.?)?\s*(\d+[\d,]*)', query.lower())
        monthly_investment = int(invest_match.group(1).replace(',', '')) if invest_match else None
        
        # Extract time horizon
        years_match = re.search(r'(\d+)\s*(?:years?|yrs?|year)', query.lower())
        years = int(years_match.group(1)) if years_match else None
        
        # Extract risk level
        if 'low risk' in query.lower() or 'safe' in query.lower():
            risk_level = 'low'
        elif 'high risk' in query.lower() or 'aggressive' in query.lower():
            risk_level = 'high'
        else:
            risk_level = 'medium'
        
        # Extract goal
        goal = None
        if 'house' in query.lower() or 'home' in query.lower():
            goal = 'buy a house'
        elif 'retire' in query.lower():
            goal = 'retirement'
        elif 'car' in query.lower():
            goal = 'buy a car'
        elif 'education' in query.lower():
            goal = 'education'
        
        return {
            'age': age,
            'salary': salary,
            'monthly_investment': monthly_investment,
            'years': years,
            'risk_level': risk_level,
            'goal': goal
        }