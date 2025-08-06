
import { nanoid } from "nanoid";

// Farmer customer data
const farmerCustomers = [
  {
    id: `cust-101`,
    name: "Ramesh Patel",
    age: 45,
    gender: "M",
    marital_status: "Married",
    profession: "Farming",
    income_bracket: "5-10L",
    annual_income: 750000,
    city: "Indore",
    state: "Madhya Pradesh",
    dependents_count: 3,
    health_conditions: JSON.stringify({
      diabetes: false,
      hypertension: true,
      heart_disease: false,
      back_problems: true,
      allergies: true
    }),
    financial_goals: JSON.stringify([
      "Child Education",
      "Agricultural Equipment Purchase",
      "Retirement Planning",
      "Crop Insurance"
    ]),
    risk_appetite: "Low",
    lifestyle: "Active",
    existing_policies: JSON.stringify([
      {
        provider: "National Insurance Company",
        type: "Crop Insurance",
        premium: 25000,
        coverage: "5,00,000",
        term: "Annual"
      },
      {
        provider: "LIC",
        type: "Term",
        premium: 15000,
        coverage: "10,00,000",
        term: "20 years"
      }
    ]),
    lead_source: "Agricultural Bank Reference",
    last_login: new Date().toISOString(),
    phone: "+919876543210",
    email: "ramesh.patel.farmer@example.com"
  },
  {
    id: `cust-102`,
    name: "Sunita Devi",
    age: 32,
    gender: "F",
    marital_status: "Single",
    profession: "Farming",
    income_bracket: "5-10L",
    annual_income: 680000,
    city: "Nashik",
    state: "Maharashtra",
    dependents_count: 2,
    health_conditions: JSON.stringify({
      diabetes: false,
      hypertension: false,
      heart_disease: false,
      respiratory_issues: true,
      skin_allergies: true
    }),
    financial_goals: JSON.stringify([
      "Land Expansion",
      "Modern Farming Equipment",
      "Health Insurance",
      "Emergency Fund"
    ]),
    risk_appetite: "Low",
    lifestyle: "Active",
    existing_policies: JSON.stringify([
      {
        provider: "ICICI Lombard",
        type: "Crop Insurance",
        premium: 18000,
        coverage: "3,50,000",
        term: "Annual"
      }
    ]),
    lead_source: "Local Agent",
    last_login: new Date().toISOString(),
    phone: "+919876543211",
    email: "sunita.devi.farmer@example.com"
  },  
  {
    id: `cust-103`,
    name: "Amit Sharma",
    age: 42,
    gender: "M",
    marital_status: "Married",
    profession: "IT Manager",
    income_bracket: "15-20L",
    annual_income: 1800000,
    city: "Pune",
    state: "Maharashtra",
    dependents_count: 2,
    health_conditions: JSON.stringify({
      diabetes: false,
      hypertension: false,
      heart_disease: false,
      back_problems: true,
      allergies: false
    }),
    financial_goals: JSON.stringify([
      "Retirement Corpus",
      "Child Education",
      "Emergency Fund",
      "Health Cover",
      "Will & Nominations",
      "Term Cover"
    ]),
    risk_appetite: "Medium",
    lifestyle: "Urban Active",
    existing_policies: JSON.stringify([
      {
        provider: "LIC",
        type: "Term",
        premium: 25000,
        coverage: "1,00,00,000",
        term: "25 years"
      },
      {
        provider: "Star Health",
        type: "Health",
        premium: 18000,
        coverage: "10,00,000",
        term: "Annual"
      }
    ]),
    lead_source: "Bank RM",
    last_login: new Date().toISOString(),
    phone: "+919898765432",
    email: "amit.sharma@example.com"
  },
  {
    id: `cust-104`,
    name: "Neha Sinha",
    age: 40,
    gender: "F",
    marital_status: "Divorced",
    profession: "Marketing Consultant",
    income_bracket: "10-15L",
    annual_income: 1200000,
    city: "Gurgaon",
    state: "Haryana",
    dependents_count: 1,
    health_conditions: JSON.stringify({
      diabetes: false,
      hypertension: true,
      heart_disease: false,
      thyroid: true
    }),
    financial_goals: JSON.stringify([
      "Retirement Corpus",
      "Child Fund",
      "Term Cover",
      "Updated Will",
      "Health Cover",
      "Emergency Fund"
    ]),
    risk_appetite: "Medium",
    lifestyle: "Urban",
    existing_policies: JSON.stringify([
      {
        provider: "HDFC Life",
        type: "Term",
        premium: 22000,
        coverage: "80,00,000",
        term: "20 years"
      },
      {
        provider: "Niva Bupa",
        type: "Health",
        premium: 16000,
        coverage: "7,00,000",
        term: "Annual"
      }
    ]),
    lead_source: "Referral",
    last_login: new Date().toISOString(),
    phone: "+919812345678",
    email: "neha.sinha@example.com"
  },
  {
    id: `cust-105`,
    name: "Sunita Devi",
    age: 35,
    gender: "F",
    marital_status: "Married",
    profession: "Tailor (MSME Owner)",
    income_bracket: "3-5L",
    annual_income: 420000,
    city: "Patna",
    state: "Bihar",
    dependents_count: 2,
    health_conditions: JSON.stringify({
      diabetes: false,
      hypertension: false,
      heart_disease: false
    }),
    financial_goals: JSON.stringify([
      "Business Expansion",
      "Health Cover",
      "Working Capital Protection",
      "Emergency Fund",
      "Term Cover",
      "Succession Plan"
    ]),
    risk_appetite: "Low",
    lifestyle: "Semi-urban",
    existing_policies: JSON.stringify([
      {
        provider: "PMJJBY",
        type: "Term",
        premium: 330,
        coverage: "2,00,000",
        term: "Annual"
      }
    ]),
    lead_source: "Local Udyog Centre",
    last_login: new Date().toISOString(),
    phone: "+919876543299",
    email: "sunitadevi.msme@example.com"
  },
  {
    id: `cust-106`,
    name: "Dr. Arvind Kumar",
    age: 38,
    gender: "M",
    marital_status: "Married",
    profession: "Govt School Teacher",
    income_bracket: "5-10L",
    annual_income: 780000,
    city: "Lucknow",
    state: "Uttar Pradesh",
    dependents_count: 2,
    health_conditions: JSON.stringify({
      diabetes: false,
      hypertension: false
    }),
    financial_goals: JSON.stringify([
      "Pension Planning",
      "Health Insurance",
      "Term Cover",
      "Emergency Fund",
      "Child Education",
      "Will & Nominations"
    ]),
    risk_appetite: "Low",
    lifestyle: "Moderate",
    existing_policies: JSON.stringify([
      {
        provider: "CGHS",
        type: "Health",
        premium: 0,
        coverage: "Central Govt Scheme",
        term: "Continuous"
      }
    ]),
    lead_source: "Govt Employee Welfare Portal",
    last_login: new Date().toISOString(),
    phone: "+919876543266",
    email: "arvind.kumar.teacher@example.com"
  },
  {
    id: `cust-107`,
    name: "Rajiv Malhotra",
    age: 55,
    gender: "M",
    marital_status: "Married",
    profession: "Entrepreneur",
    income_bracket: "50L+",
    annual_income: 9500000,
    city: "Mumbai",
    state: "Maharashtra",
    dependents_count: 3,
    health_conditions: JSON.stringify({
      diabetes: false,
      hypertension: true
    }),
    financial_goals: JSON.stringify([
      "Family Trust",
      "Global Health Cover",
      "Estate Planning",
      "Asset Insurance",
      "Term/Liquidity Cover",
      "Family Office Setup"
    ]),
    risk_appetite: "Medium",
    lifestyle: "Luxury",
    existing_policies: JSON.stringify([
      {
        provider: "Tata AIA",
        type: "ULIP",
        premium: 100000,
        coverage: "Market Linked",
        term: "Ongoing"
      },
      {
        provider: "Max Bupa",
        type: "Global Health",
        premium: 75000,
        coverage: "2 Cr INR equivalent",
        term: "Annual"
      }
    ]),
    lead_source: "Private Wealth Desk",
    last_login: new Date().toISOString(),
    phone: "+919812345600",
    email: "rajiv.malhotra.hni@example.com"
  }

];


async function addFarmersToDatabase() {
  const isDev = process.env.NODE_ENV !== "production"; // or use your own logic
  const port = isDev ? 3000 : 5000;
  const host = isDev ? "http://139.59.92.85" : "http://139.59.92.85"; // Use real prod domain
  const baseUrl = `${host}:${port}/api/customers`;

  try {
    console.log("Adding farmer customers to database...");

    for (const farmer of farmerCustomers) {
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(farmer),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Added farmer: ${farmer.name} (ID: ${result.id})`);
      } else {
        console.error(`❌ Failed to add farmer: ${farmer.name}`);
        console.error("Response:", await response.text());
      }
    }

    console.log("Farmer customers added successfully!");
  } catch (error) {
    console.error("Error adding farmers:", error);
  }
}

// Run the function
addFarmersToDatabase();

// Execute - node add-farmers.js
// Ensure you have the nanoid package installed: npm install nanoid
