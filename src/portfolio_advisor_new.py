"""
Enhanced Portfolio Advisor for FinSage
Handles financial planning, goal-based investing, and portfolio optimization
"""

import re
from datetime import datetime
from typing import Dict, List, Optional

class EnhancedPortfolioAdvisor:
    """Advanced financial planning and portfolio optimization advisor"""
    
    def __init__(self):
        # Risk profiles with detailed allocations
        self.risk_profiles = {
            'conservative': {
                'name': 'Conservative (Low Risk)',
                'stocks': 20,
                'mutual_funds': 20,
                'debt': 50,
                'gold': 10,
                'expected_return': 0.07,  # 7%
                'volatility': 'Low',
                'description': 'Focus on capital preservation with modest growth'
            },
            'moderate': {
                'name': 'Moderate (Medium Risk)',
                'stocks': 40,
                'mutual_funds': 30,
                'debt': 20,
                'gold': 10,
                'expected_return': 0.11,  # 11%
                'volatility': 'Medium',
                'description': 'Balanced approach with steady growth potential'
            },
            'aggressive': {
                'name': 'Aggressive (High Risk)',
                'stocks': 60,
                'mutual_funds': 25,
                'debt': 10,
                'gold': 5,
                'expected_return': 0.15,  # 15%
                'volatility': 'High',
                'description': 'Maximum growth potential with higher volatility'
            }
        }
        
        # Detailed investment suggestions by risk profile
        self.investment_suggestions = {
            'conservative': {
                'stocks': [
                    "ITC Ltd. (ITC.NS) - Defensive FMCG stock",
                    "Power Grid Corp (POWERGRID.NS) - Stable PSU dividend payer",
                    "Hindustan Unilever (HINDUNILVR.NS) - Consumer staples leader"
                ],
                'mutual_funds': [
                    "SBI Balanced Advantage Fund - Dynamic asset allocation",
                    "HDFC Hybrid Debt Fund - Balanced with debt focus",
                    "ICICI Prudential Regular Savings Fund - Conservative hybrid"
                ],
                'debt': [
                    "PPF (Public Provident Fund) - Tax-free government backed",
                    "Senior Citizens Savings Scheme - If applicable",
                    "Corporate Bond Funds - High-quality AAA rated bonds"
                ],
                'gold': [
                    "Sovereign Gold Bonds (SGB) - Government-backed with interest",
                    "Gold ETFs - Nippon India Gold BeES, HDFC Gold ETF",
                    "Digital Gold - Through authorized platforms"
                ]
            },
            'moderate': {
                'stocks': [
                    "Reliance Industries (RELIANCE.NS) - Diversified conglomerate",
                    "TCS (TCS.NS) - IT sector leader",
                    "HDFC Bank (HDFCBANK.NS) - Banking sector leader"
                ],
                'mutual_funds': [
                    "Mirae Asset Large Cap Fund - Bluechip focused",
                    "Nippon India Growth Fund - Mid-cap opportunities",
                    "Parag Parikh Flexi Cap Fund - International diversification"
                ],
                'debt': [
                    "Dynamic Bond Funds - Adapt to interest rate changes",
                    "Target Maturity ETFs - Low cost, predictable returns",
                    "Floater Funds - Benefit from rising rates"
                ],
                'gold': [
                    "Gold ETFs - For liquidity and ease of trading",
                    "Gold Savings Schemes - From reputed jewellers",
                    "Physical Gold - Limited to 10-15% of portfolio"
                ]
            },
            'aggressive': {
                'stocks': [
                    "Infosys (INFY.NS) - IT growth story",
                    "Bajaj Finance (BAJFINANCE.NS) - NBFC leader",
                    "Tata Motors (TATAMOTORS.NS) - Auto & EV play"
                ],
                'mutual_funds': [
                    "Quant Small Cap Fund - High growth potential",
                    "Motilal Oswal Midcap Fund - Mid-cap focused",
                    "Axis Small Cap Fund - Small-cap opportunities"
                ],
                'debt': [
                    "Credit Risk Funds - Higher yield opportunities",
                    "Short Term Debt Funds - For liquidity with better returns",
                    "Bank Fixed Deposits - For stability"
                ],
                'gold': [
                    "Gold ETFs - For tactical allocation",
                    "Gold Mining Stocks - Leveraged to gold prices"
                ]
            }
        }
        
        # Store conversation context for follow-up questions
        self.conversation_context = {}

    def parse_financial_planning_query(self, query: str) -> Dict:
        """
        Parse natural language query to extract financial planning parameters
        """
        query_lower = query.lower()
        
        # Extract age (only if it's not part of "years" time horizon)
        age_patterns = [
            r'(\d+)\s*(?:years? old|yo|yr old)',
            r'age\s*(?:is)?\s*(\d+)',
            r'(\d+)\s*years?\s*old'
        ]
        age = None
        for pattern in age_patterns:
            match = re.search(pattern, query_lower)
            if match:
                age = int(match.group(1))
                break
        
        # Extract salary
        salary_patterns = [
            r'(?:₹|Rs\.?|rupees?)\s*(\d+[\d,]*)',
            r'salary\s*(?:is)?\s*(\d+[\d,]*)',
            r'earn\s*(?:₹|Rs\.?)?\s*(\d+[\d,]*)',
            r'(\d+[\d,]*)\s*(?:salary|income)'
        ]
        salary = None
        for pattern in salary_patterns:
            match = re.search(pattern, query_lower)
            if match:
                salary = int(match.group(1).replace(',', ''))
                break
        
        # Extract monthly investment amount
        investment_patterns = [
            r'(?:invest|save|put)\s*(?:₹|Rs\.?)?\s*(\d+[\d,]*)\s*(?:monthly|per month|pm)',
            r'(?:₹|Rs\.?)\s*(\d+[\d,]*)\s*(?:monthly|per month)',
            r'(\d+[\d,]*)\s*(?:rupees?)\s*(?:monthly|per month)',
            r'invest\s*(\d+[\d,]*)'
        ]
        monthly_investment = None
        for pattern in investment_patterns:
            match = re.search(pattern, query_lower)
            if match:
                monthly_investment = int(match.group(1).replace(',', ''))
                break
        
        # Extract time horizon (years) - CRITICAL: Don't confuse with age
        # Look for "in X years", "for X years", "after X years", etc.
        years_patterns = [
            r'in\s*(\d+)\s*years?',  # "in 10 years"
            r'for\s*(\d+)\s*years?',  # "for 10 years"
            r'after\s*(\d+)\s*years?',  # "after 10 years"
            r'(\d+)\s*years?\s*(?:from now|time horizon)',  # "10 years from now"
            r'plan\s*(?:for|in)\s*(\d+)\s*years?'  # "plan for 10 years"
        ]
        years = None
        for pattern in years_patterns:
            match = re.search(pattern, query_lower)
            if match:
                years = int(match.group(1))
                break
        
        # If no explicit years found, look for time phrases
        if not years:
            time_phrases = {
                'ten years': 10, '10 years': 10,
                'five years': 5, '5 years': 5,
                'fifteen years': 15, '15 years': 15,
                'twenty years': 20, '20 years': 20,
                'twenty-five years': 25, '25 years': 25,
                'thirty years': 30, '30 years': 30
            }
            for phrase, value in time_phrases.items():
                if phrase in query_lower:
                    years = value
                    break
        
        # Extract goal
        goal = None
        goal_keywords = {
            'house': 'buy a house',
            'home': 'buy a house',
            'property': 'buy a house',
            'car': 'buy a car',
            'vehicle': 'buy a car',
            'retire': 'retirement',
            'retirement': 'retirement',
            'education': 'education fund',
            'child education': 'child education',
            'wedding': 'wedding/marriage',
            'marriage': 'wedding/marriage',
            'vacation': 'vacation/travel',
            'travel': 'vacation/travel'
        }
        
        for keyword, goal_name in goal_keywords.items():
            if keyword in query_lower:
                goal = goal_name
                break
        
        # Extract risk level
        risk_level = 'moderate'  # default
        if any(word in query_lower for word in ['low risk', 'conservative', 'safe', 'capital preservation']):
            risk_level = 'conservative'
        elif any(word in query_lower for word in ['high risk', 'aggressive', 'growth', 'high return']):
            risk_level = 'aggressive'
        
        return {
            'age': age,
            'salary': salary,
            'monthly_investment': monthly_investment,
            'years': years,
            'goal': goal,
            'risk_level': risk_level
        }

    def format_indian_currency(self, amount: float) -> str:
        """Format amount in Indian currency format"""
        if amount >= 10000000:  # 1 crore
            return f"₹{amount/10000000:.2f} Crore"
        elif amount >= 100000:  # 1 lakh
            return f"₹{amount/100000:.2f} Lakhs"
        else:
            return f"₹{amount:,.2f}"

    def calculate_sip_future_value(self, monthly_investment: float, years: int, expected_return: float) -> float:
        """
        Calculate future value of monthly SIP investments
        """
        monthly_rate = expected_return / 12
        months = years * 12
        
        # Future value of annuity due (investing at beginning of month)
        fv = monthly_investment * ((1 + monthly_rate) ** months - 1) / monthly_rate * (1 + monthly_rate)
        return fv

    def generate_detailed_financial_plan(self, user_data: Dict) -> Dict:
        """
        Generate comprehensive financial plan with actionable recommendations
        """
        try:
            age = user_data.get('age')
            salary = user_data.get('salary')
            monthly_investment = user_data.get('monthly_investment')
            years = user_data.get('years')
            goal = user_data.get('goal', 'financial goal')
            risk_level = user_data.get('risk_level', 'moderate')
            
            # Validate inputs
            missing_fields = []
            if not age:
                missing_fields.append('age')
            if not monthly_investment:
                missing_fields.append('monthly investment amount')
            if not years:
                missing_fields.append('time horizon (how many years)')
            
            if missing_fields:
                return {
                    'success': False,
                    'error': 'Missing required information',
                    'missing_fields': missing_fields,
                    'message': f"Please provide: {', '.join(missing_fields)}"
                }
            
            # Get risk profile
            risk_profile = self.risk_profiles[risk_level]
            expected_return = risk_profile['expected_return']
            
            # Calculate future value
            future_value = self.calculate_sip_future_value(monthly_investment, years, expected_return)
            future_value_formatted = self.format_indian_currency(future_value)
            
            # Calculate monthly allocation breakdown
            monthly_breakdown = {
                'stocks': monthly_investment * (risk_profile['stocks'] / 100),
                'mutual_funds': monthly_investment * (risk_profile['mutual_funds'] / 100),
                'debt': monthly_investment * (risk_profile['debt'] / 100),
                'gold': monthly_investment * (risk_profile['gold'] / 100)
            }
            
            # Get investment suggestions
            suggestions = self.investment_suggestions[risk_level]
            
            # Calculate goal amounts for different scenarios
            goal_amounts = {
                'buy a house': 5000000,  # ₹50 Lakhs
                'buy a car': 1000000,     # ₹10 Lakhs
                'retirement': 10000000,   # ₹1 Crore
                'education fund': 2000000, # ₹20 Lakhs
                'child education': 2500000, # ₹25 Lakhs
                'wedding/marriage': 1500000, # ₹15 Lakhs
                'vacation/travel': 500000   # ₹5 Lakhs
            }
            target_amount = goal_amounts.get(goal, 3000000)
            
            # Generate personalized recommendations
            recommendations = self.generate_personalized_recommendations(
                age, salary, monthly_investment, future_value, years, risk_level, goal, target_amount
            )
            
            return {
                'success': True,
                'age': age,
                'salary': salary,
                'monthly_investment': monthly_investment,
                'time_horizon': years,
                'goal': goal,
                'target_amount': target_amount,
                'target_amount_formatted': self.format_indian_currency(target_amount),
                'risk_profile': risk_profile['name'],
                'portfolio_allocation': {
                    'stocks': f"{risk_profile['stocks']}%",
                    'mutual_funds': f"{risk_profile['mutual_funds']}%",
                    'debt': f"{risk_profile['debt']}%",
                    'gold': f"{risk_profile['gold']}%"
                },
                'monthly_breakdown': {
                    'stocks': self.format_indian_currency(monthly_breakdown['stocks']),
                    'mutual_funds': self.format_indian_currency(monthly_breakdown['mutual_funds']),
                    'debt': self.format_indian_currency(monthly_breakdown['debt']),
                    'gold': self.format_indian_currency(monthly_breakdown['gold'])
                },
                'future_value': future_value,
                'future_value_formatted': future_value_formatted,
                'expected_return': f"{expected_return * 100:.1f}%",
                'investment_suggestions': suggestions,
                'recommendations': recommendations,
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': f'Could not analyze your financial plan: {str(e)}'
            }

    def generate_personalized_recommendations(self, age, salary, monthly_investment, future_value, years, risk_level, goal, target_amount):
        """Generate personalized investment recommendations"""
        recommendations = []
        
        # Age-based advice
        if age:
            if age < 30:
                recommendations.append(f"🎯 **At {age}, you have a fantastic {years}-year investment horizon - perfect for wealth creation!**")
                recommendations.append("💪 Consider allocating more to equities to maximize long-term growth")
            elif age < 45:
                recommendations.append(f"📊 **At {age}, balance growth with stability. Your {years}-year horizon allows for a mix of equity and debt.**")
                recommendations.append("⚖️ Consider increasing debt allocation as you approach major financial goals")
            else:
                recommendations.append(f"🛡️ **At {age}, focus on capital preservation while maintaining some growth. Review your {years}-year plan carefully.**")
                recommendations.append("🏦 Prioritize debt instruments and ensure adequate insurance coverage")
        
        # Investment strategy
        recommendations.append(f"📈 **SIP Strategy**: Invest ₹{monthly_investment:,.0f} monthly via SIP to build wealth systematically")
        
        if risk_level == 'conservative':
            recommendations.append("🏦 **Focus on debt instruments and balanced funds for stability**")
            recommendations.append("💰 Keep emergency fund of 6-12 months of expenses")
        elif risk_level == 'moderate':
            recommendations.append("⚖️ **Balance your portfolio with 40% direct stocks and 30% mutual funds**")
            recommendations.append("📅 Review and rebalance portfolio every 6-12 months")
        else:
            recommendations.append("🚀 **High risk can yield high returns, but be prepared for market volatility**")
            recommendations.append("📊 Diversify across sectors to manage risk effectively")
        
        # Goal-specific advice
        if goal:
            recommendations.append(f"🏠 **With {self.format_indian_currency(future_value)} in {years} years, you can achieve your goal of {goal}**")
            
            if future_value >= target_amount:
                recommendations.append(f"✅ **Great news! Your projected wealth of {self.format_indian_currency(future_value)} exceeds your goal amount of {self.format_indian_currency(target_amount)}**")
            else:
                shortfall = target_amount - future_value
                recommendations.append(f"⚠️ **To reach your goal of {self.format_indian_currency(target_amount)}, you need an additional {self.format_indian_currency(shortfall)}**")
                recommendations.append(f"💡 **Consider increasing monthly investment by ₹{int(shortfall / (years * 12)):,.0f} or extending time horizon**")
        
        # Tax-saving advice
        recommendations.append("💰 **Tax Planning**: Consider tax-saving options under Section 80C (ELSS funds, PPF, etc.)")
        
        # Emergency fund
        if salary:
            emergency_needed = salary * 6
            recommendations.append(f"🛡️ **Emergency Fund**: Build {self.format_indian_currency(emergency_needed)} (6 months of salary) in liquid funds")
        
        # Insurance advice
        if salary:
            insurance_needed = salary * 12 * 10  # 10x annual income
            recommendations.append(f"🛡️ **Insurance**: Consider term insurance of {self.format_indian_currency(insurance_needed)} to protect your family")
        
        return recommendations

    def format_plan_response(self, plan_data: Dict) -> str:
        """Format financial plan into a beautiful, readable response"""
        if not plan_data.get('success', False):
            missing = plan_data.get('missing_fields', [])
            if missing:
                missing_text = '\n'.join([f"• {field}" for field in missing])
                return f"""## 📋 Let me help you create a personalized financial plan!

I need a few more details to give you the best recommendations:

{missing_text}

**Please reply with the missing information.**

*Example: "I'm 25 years old, can invest ₹15,000 monthly for 10 years to buy a house with medium risk"*

Or if you'd like, just tell me what you have so far and I'll help fill in the gaps! 💡"""
            return f"❌ {plan_data.get('message', 'Could not create financial plan. Please try again.')}"
        
        # Build response
        response = f"""## 📊 **Your Personalized Financial Plan**

**👤 Your Profile:**
• **Age**: {plan_data['age']} years
• **Monthly Investment**: ₹{plan_data['monthly_investment']:,.0f}
• **Time Horizon**: {plan_data['time_horizon']} years
• **Goal**: {plan_data['goal']}
• **Risk Profile**: {plan_data['risk_profile']}

---

### 📈 **Recommended Portfolio Allocation**

| Category | Allocation | Monthly Amount |
|----------|------------|----------------|
| **Stocks** | {plan_data['portfolio_allocation']['stocks']} | {plan_data['monthly_breakdown']['stocks']} |
| **Mutual Funds** | {plan_data['portfolio_allocation']['mutual_funds']} | {plan_data['monthly_breakdown']['mutual_funds']} |
| **Debt Instruments** | {plan_data['portfolio_allocation']['debt']} | {plan_data['monthly_breakdown']['debt']} |
| **Gold** | {plan_data['portfolio_allocation']['gold']} | {plan_data['monthly_breakdown']['gold']} |

---

### 💰 **Projected Wealth**

**Future Value after {plan_data['time_horizon']} years:**
**{plan_data['future_value_formatted']}**

*Based on expected return of {plan_data['expected_return']}*

**Goal Target**: {plan_data.get('target_amount_formatted', 'Not specified')}

---

### 🎯 **Investment Suggestions**

**Stocks:**
{chr(10).join(['• ' + stock for stock in plan_data['investment_suggestions']['stocks']])}

**Mutual Funds:**
{chr(10).join(['• ' + fund for fund in plan_data['investment_suggestions']['mutual_funds']])}

**Debt Options:**
{chr(10).join(['• ' + debt for debt in plan_data['investment_suggestions']['debt']])}

**Gold:**
{chr(10).join(['• ' + gold for gold in plan_data['investment_suggestions']['gold']])}

---

### 📋 **Actionable Recommendations**

{chr(10).join(['• ' + rec for rec in plan_data['recommendations']])}

---

### 💡 **Next Steps**

1. **Start Your SIP**: Open an account with a reputed mutual fund house
2. **Open a Demat Account**: For direct stock investments (Zerodha, Groww, etc.)
3. **Set Up Auto-debit**: Automate your monthly investments
4. **Track Progress**: Review your portfolio every 6 months
5. **Increase Investments**: Boost your SIP amount when you get salary hikes

---

*📅 Plan Generated: {plan_data['timestamp']}*

**⚠️ Disclaimer**: This is a recommendation based on the information provided. Actual returns may vary. Please consult a certified financial advisor before making investment decisions. Past performance doesn't guarantee future results.

---

**💬 Want to adjust your plan?** You can ask me:
- "What if I invest ₹20,000 instead?"
- "Show me with high risk instead"
- "What if I want to retire in 20 years?"

I'm here to help you optimize your financial plan! 🚀"""
        
        return response

    def get_follow_up_questions(self, plan_data: Dict) -> str:
        """Generate follow-up questions for the user"""
        if not plan_data.get('success'):
            return "Please provide your age, monthly investment amount, and time horizon to get started!"
        
        return f"""**💡 Based on your plan, here are some questions to consider:**

1. Would you like to see how increasing your investment affects your goal?
2. Want to compare different risk levels?
3. Should we look at specific mutual funds or stocks?
4. Need help with tax-saving investment options?

Just let me know what you'd like to explore! 🚀"""