# Complete FinSage Syllabus Structure
SYLLABUS = {
    "basics": {
        "title": "Financial Basics",
        "description": "Essential concepts for financial literacy beginners",
        "level": 1,
        "modules": [
            {"id": "what-is-money", "title": "What is Money", "file": "basics/01-what-is-money.md", "duration": "5 min"},
            {"id": "needs-vs-wants", "title": "Needs vs Wants", "file": "basics/02-needs-vs-wants.md", "duration": "8 min"},
            {"id": "intro-to-banking", "title": "Introduction to Banking", "file": "basics/03-intro-to-banking.md", "duration": "10 min"},
            {"id": "saving-vs-investing", "title": "Saving vs Investing", "file": "basics/04-saving-vs-investing.md", "duration": "12 min"},
            {"id": "what-is-interest", "title": "What is Interest", "file": "basics/05-what-is-interest.md", "duration": "7 min"},
            {"id": "why-financial-literacy", "title": "Why Financial Literacy", "file": "basics/06-why-financial-literacy.md", "duration": "6 min"}
        ]
    },
    "personal-finance": {
        "title": "Personal Finance Fundamentals",
        "description": "Essential life skills for everyone",
        "level": 2,
        "modules": [
            {
                "id": "budgeting",
                "title": "Budgeting",
                "submodules": [
                    {"id": "creating-first-budget", "title": "Creating First Budget", "file": "personal-finance/budgeting/creating-first-budget.md", "duration": "15 min"},
                    {"id": "50-30-20-rule", "title": "50/30/20 Rule", "file": "personal-finance/budgeting/50-30-20-rule.md", "duration": "10 min"},
                    {"id": "tracking-expenses", "title": "Tracking Expenses", "file": "personal-finance/budgeting/tracking-expenses.md", "duration": "12 min"}
                ]
            },
            {
                "id": "banking",
                "title": "Banking",
                "submodules": [
                    {"id": "types-of-accounts", "title": "Types of Bank Accounts", "file": "personal-finance/banking/types-of-bank-accounts.md", "duration": "8 min"},
                    {"id": "debit-cards", "title": "Understanding Debit Cards", "file": "personal-finance/banking/understanding-debit-cards.md", "duration": "6 min"},
                    {"id": "digital-banking", "title": "Digital Banking Safety", "file": "personal-finance/banking/digital-banking-safety.md", "duration": "10 min"}
                ]
            },
            {
                "id": "debt-management",
                "title": "Debt Management",
                "submodules": [
                    {"id": "good-debt-vs-bad-debt", "title": "Good Debt vs Bad Debt", "file": "personal-finance/debt-management/good-debt-vs-bad-debt.md", "duration": "8 min"},
                    {"id": "credit-cards-responsibly", "title": "Using Credit Cards Responsibly", "file": "personal-finance/debt-management/credit-cards-responsibly.md", "duration": "10 min"},
                    {"id": "getting-out-of-debt", "title": "Getting Out of Debt", "file": "personal-finance/debt-management/getting-out-of-debt.md", "duration": "15 min"}
                ]
            },
            {
                "id": "emergency-fund",
                "title": "Emergency Fund",
                "submodules": [
                    {"id": "why-emergency-fund", "title": "Why Emergency Fund", "file": "personal-finance/emergency-fund/why-emergency-fund.md", "duration": "7 min"},
                    {"id": "how-much-to-save", "title": "How Much to Save", "file": "personal-finance/emergency-fund/how-much-to-save.md", "duration": "8 min"}
                ]
            }
        ]
    },
    "investments": {
        "title": "Investment Instruments",
        "description": "Beginner to Intermediate investment options",
        "level": 3,
        "modules": [
            {
                "id": "safe-options",
                "title": "Safe Investment Options",
                "submodules": [
                    {"id": "savings-accounts", "title": "Savings Accounts", "file": "investments/safe-options/savings-accounts.md", "duration": "5 min"},
                    {"id": "fixed-deposits", "title": "Fixed Deposits", "file": "investments/safe-options/fixed-deposits.md", "duration": "8 min"},
                    {"id": "recurring-deposits", "title": "Recurring Deposits", "file": "investments/safe-options/recurring-deposits.md", "duration": "8 min"},
                    {"id": "post-office-schemes", "title": "Post Office Schemes", "file": "investments/safe-options/post-office-schemes.md", "duration": "10 min"}
                ]
            },
            {
                "id": "mutual-funds",
                "title": "Mutual Funds",
                "submodules": [
                    {"id": "what-are-mutual-funds", "title": "What are Mutual Funds", "file": "investments/mutual-funds/what-are-mutual-funds.md", "duration": "12 min"},
                    {"id": "types-equity-debt-hybrid", "title": "Types: Equity, Debt, Hybrid", "file": "investments/mutual-funds/types-equity-debt-hybrid.md", "duration": "15 min"},
                    {"id": "sip-vs-lump-sum", "title": "SIP vs Lump Sum", "file": "investments/mutual-funds/sip-vs-lump-sum.md", "duration": "10 min"},
                    {"id": "how-to-choose-mf", "title": "How to Choose Mutual Funds", "file": "investments/mutual-funds/how-to-choose-mf.md", "duration": "12 min"}
                ]
            },
            {
                "id": "stock-market",
                "title": "Stock Market",
                "submodules": [
                    {"id": "stocks-basics", "title": "Stocks Basics", "file": "investments/stock-market/stocks-basics.md", "duration": "15 min"},
                    {"id": "how-stock-market-works", "title": "How Stock Market Works", "file": "investments/stock-market/how-stock-market-works.md", "duration": "20 min"},
                    {"id": "beginners-guide", "title": "Beginners Guide", "file": "investments/stock-market/beginners-guide.md", "duration": "18 min"}
                ]
            },
            {
                "id": "other-options",
                "title": "Other Investment Options",
                "submodules": [
                    {"id": "gold-investment", "title": "Gold Investment", "file": "investments/other-options/gold-investment.md", "duration": "10 min"},
                    {"id": "real-estate-basics", "title": "Real Estate Basics", "file": "investments/other-options/real-estate-basics.md", "duration": "15 min"},
                    {"id": "crypto-awareness", "title": "Cryptocurrency Awareness", "file": "investments/other-options/crypto-awareness.md", "duration": "12 min"}
                ]
            }
        ]
    },
    "life-stages": {
        "title": "Life Stage Specific Content",
        "description": "Content tailored to specific demographics",
        "level": 4,
        "modules": [
            {
                "id": "students",
                "title": "For Students & Young Adults",
                "submodules": [
                    {"id": "financial-habits-early", "title": "Financial Habits Early", "file": "life-stages/students/financial-habits-early.md", "duration": "10 min"},
                    {"id": "part-time-job-money", "title": "Part-time Job Money", "file": "life-stages/students/part-time-job-money.md", "duration": "8 min"},
                    {"id": "education-loan-guide", "title": "Education Loan Guide", "file": "life-stages/students/education-loan-guide.md", "duration": "12 min"},
                    {"id": "starting-first-job", "title": "Starting First Job", "file": "life-stages/students/starting-first-job.md", "duration": "15 min"}
                ]
            },
            {
                "id": "professionals",
                "title": "For Working Professionals",
                "submodules": [
                    {"id": "salary-breakup-understanding", "title": "Salary Breakup Understanding", "file": "life-stages/professionals/salary-breakup-understanding.md", "duration": "10 min"},
                    {"id": "increasing-savings-rate", "title": "Increasing Savings Rate", "file": "life-stages/professionals/increasing-savings-rate.md", "duration": "12 min"},
                    {"id": "career-break-planning", "title": "Career Break Planning", "file": "life-stages/professionals/career-break-planning.md", "duration": "8 min"},
                    {"id": "side-income-ideas", "title": "Side Income Ideas", "file": "life-stages/professionals/side-income-ideas.md", "duration": "15 min"}
                ]
            },
            {
                "id": "homemakers",
                "title": "For Homemakers/Housewives",
                "submodules": [
                    {"id": "household-budgeting", "title": "Household Budgeting", "file": "life-stages/homemakers/household-budgeting.md", "duration": "12 min"},
                    {"id": "saving-on-groceries", "title": "Saving on Groceries", "file": "life-stages/homemakers/saving-on-groceries.md", "duration": "8 min"},
                    {"id": "managing-family-finances", "title": "Managing Family Finances", "file": "life-stages/homemakers/managing-family-finances.md", "duration": "15 min"},
                    {"id": "small-home-business", "title": "Small Home Business", "file": "life-stages/homemakers/small-home-business.md", "duration": "10 min"},
                    {"id": "financial-independence", "title": "Financial Independence", "file": "life-stages/homemakers/financial-independence.md", "duration": "12 min"}
                ]
            },
            {
                "id": "seniors",
                "title": "For Senior Citizens",
                "submodules": [
                    {"id": "retirement-planning", "title": "Retirement Planning", "file": "life-stages/seniors/retirement-planning.md", "duration": "15 min"},
                    {"id": "senior-citizen-schemes", "title": "Senior Citizen Schemes", "file": "life-stages/seniors/senior-citizen-schemes.md", "duration": "10 min"},
                    {"id": "health-insurance-importance", "title": "Health Insurance Importance", "file": "life-stages/seniors/health-insurance-importance.md", "duration": "8 min"},
                    {"id": "reverse-mortgage", "title": "Reverse Mortgage", "file": "life-stages/seniors/reverse-mortgage.md", "duration": "12 min"},
                    {"id": "estate-planning-basics", "title": "Estate Planning Basics", "file": "life-stages/seniors/estate-planning-basics.md", "duration": "15 min"}
                ]
            }
        ]
    },
    "advanced": {
        "title": "Advanced Financial Planning",
        "description": "Sophisticated financial strategies",
        "level": 5,
        "modules": [
            {
                "id": "tax-planning",
                "title": "Tax Planning",
                "submodules": [
                    {"id": "income-tax-slabs", "title": "Income Tax Slabs", "file": "advanced/tax-planning/income-tax-slabs.md", "duration": "10 min"},
                    {"id": "tax-saving-instruments", "title": "Tax Saving Instruments", "file": "advanced/tax-planning/tax-saving-instruments.md", "duration": "15 min"},
                    {"id": "advance-tax-planning", "title": "Advance Tax Planning", "file": "advanced/tax-planning/advance-tax-planning.md", "duration": "12 min"}
                ]
            },
            {
                "id": "retirement-planning",
                "title": "Retirement Planning",
                "submodules": [
                    {"id": "calculating-retirement-corpus", "title": "Calculating Retirement Corpus", "file": "advanced/retirement-planning/calculating-retirement-corpus.md", "duration": "15 min"},
                    {"id": "nps-explained", "title": "NPS Explained", "file": "advanced/retirement-planning/nps-explained.md", "duration": "12 min"},
                    {"id": "pension-plans", "title": "Pension Plans", "file": "advanced/retirement-planning/pension-plans.md", "duration": "10 min"},
                    {"id": "retirement-income", "title": "Retirement Income", "file": "advanced/retirement-planning/retirement-income.md", "duration": "12 min"}
                ]
            },
            {
                "id": "insurance",
                "title": "Insurance",
                "submodules": [
                    {"id": "life-insurance-need", "title": "Life Insurance Need", "file": "advanced/insurance/life-insurance-need.md", "duration": "10 min"},
                    {"id": "health-insurance", "title": "Health Insurance", "file": "advanced/insurance/health-insurance.md", "duration": "12 min"},
                    {"id": "term-insurance-vs-ulip", "title": "Term Insurance vs ULIP", "file": "advanced/insurance/term-insurance-vs-ulip.md", "duration": "8 min"},
                    {"id": "insurance-mistakes", "title": "Insurance Mistakes", "file": "advanced/insurance/insurance-mistakes.md", "duration": "8 min"}
                ]
            },
            {
                "id": "goal-planning",
                "title": "Goal Planning",
                "submodules": [
                    {"id": "buying-house", "title": "Buying House", "file": "advanced/goal-planning/buying-house.md", "duration": "20 min"},
                    {"id": "children-education", "title": "Children Education", "file": "advanced/goal-planning/children-education.md", "duration": "15 min"},
                    {"id": "marriage-planning", "title": "Marriage Planning", "file": "advanced/goal-planning/marriage-planning.md", "duration": "12 min"},
                    {"id": "vacation-funding", "title": "Vacation Funding", "file": "advanced/goal-planning/vacation-funding.md", "duration": "8 min"}
                ]
            }
        ]
    },
    "behavioral": {
        "title": "Behavioral & Psychological Aspects",
        "description": "Understanding the mental side of money",
        "level": 6,
        "modules": [
            {"id": "common-money-mistakes", "title": "Common Money Mistakes", "file": "behavioral/common-money-mistakes.md", "duration": "10 min"},
            {"id": "emotional-spending", "title": "Emotional Spending", "file": "behavioral/emotional-spending.md", "duration": "8 min"},
            {"id": "overcoming-fear-investing", "title": "Overcoming Fear of Investing", "file": "behavioral/overcoming-fear-investing.md", "duration": "12 min"},
            {"id": "financial-peer-pressure", "title": "Financial Peer Pressure", "file": "behavioral/financial-peer-pressure.md", "duration": "8 min"},
            {"id": "building-wealth-mindset", "title": "Building Wealth Mindset", "file": "behavioral/building-wealth-mindset.md", "duration": "15 min"}
        ]
    }
}

def get_all_modules():
    """Get flat list of all modules"""
    modules = []
    for section_key, section_data in SYLLABUS.items():
        for module in section_data["modules"]:
            if "submodules" in module:
                for submodule in module["submodules"]:
                    modules.append({
                        "section": section_key,
                        "section_title": section_data["title"],
                        "module": module["title"],
                        "submodule": submodule["title"],
                        "id": submodule["id"],
                        "file": submodule["file"],
                        "duration": submodule["duration"],
                        "level": section_data["level"]
                    })
            else:
                modules.append({
                    "section": section_key,
                    "section_title": section_data["title"],
                    "module": "General",
                    "submodule": module["title"],
                    "id": module["id"],
                    "file": module["file"],
                    "duration": module["duration"],
                    "level": section_data["level"]
                })
    return modules

def get_content_by_file(file_path):
    """Get content for a specific file"""
    try:
        # Handle different file path formats
        if not file_path.startswith('financial corpus/'):
            full_path = f"financial corpus/{file_path}"
        else:
            full_path = file_path
            
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return content
    except FileNotFoundError:
        # Create a helpful error message with the path we tried
        return f"""# Content Not Found

The content for `{file_path}` is not yet available.

**Path attempted**: `{full_path}`

**This might mean**:
- The file hasn't been created yet
- The file path in the syllabus data needs to be updated
- The file is in a different location

**Available content files are being added progressively**. Check back soon or contact an administrator if this is an important topic you'd like to see.

---

*This is a placeholder for the actual content that will be available soon.*"""
    except Exception as e:
        return f"""# Error Loading Content

An error occurred while loading `{file_path}`:

**Error**: {str(e)}

**Path attempted**: `{full_path}`

Please try again later or contact support if this issue persists.

---

*Technical details have been logged for troubleshooting.*"""
