/**
 * SAP Mock Service
 *
 * Simulates SAP CRM API services for development and testing
 */

export interface SAPLead {
  leadId: string
  companyName: string
  contactName: string
  email: string
  phone: string
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted'
  source: string
  priority: 'low' | 'medium' | 'high'
  estimatedValue: number
  createdAt: Date
  updatedAt: Date
}

export interface SAPCustomer {
  customerId: string
  companyName: string
  industry: string
  contactName: string
  email: string
  phone: string
  address: string
  annualRevenue: number
  accountManager: string
  status: 'active' | 'inactive' | 'prospect'
  createdAt: Date
  lastInteraction: Date
}

/**
 * Simulates creating a lead in SAP
 * Returns deterministic sample data
 */
export function sapCreateLeadMock(leadData: {
  companyName: string
  contactName?: string
  email?: string
  phone?: string
  source?: string
}): SAPLead {
  const leadId = 'LEAD-' + Date.now().toString().substring(5) + Math.random().toString(36).substring(2, 5).toUpperCase()

  return {
    leadId,
    companyName: leadData.companyName,
    contactName: leadData.contactName || 'Unknown Contact',
    email: leadData.email || '',
    phone: leadData.phone || '',
    status: 'new',
    source: leadData.source || 'voice_call',
    priority: 'medium',
    estimatedValue: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

/**
 * Simulates fetching a customer from SAP by name or ID
 * Returns deterministic sample data
 */
export function sapGetCustomerMock(query: string): SAPCustomer | null {
  // Mock database of customers
  const mockCustomers: SAPCustomer[] = [
    {
      customerId: 'CUST-001',
      companyName: 'Acme Corporation',
      industry: 'Manufacturing',
      contactName: 'John Smith',
      email: 'john.smith@acme.com',
      phone: '+1-555-0101',
      address: '123 Business Ave, San Francisco, CA 94105',
      annualRevenue: 2500000, // High value customer (> $500k)
      accountManager: 'Sarah Johnson',
      status: 'active',
      createdAt: new Date('2023-01-15'),
      lastInteraction: new Date('2024-11-01'),
    },
    {
      customerId: 'CUST-002',
      companyName: 'TechStart Inc',
      industry: 'Technology',
      contactName: 'Emily Chen',
      email: 'emily@techstart.io',
      phone: '+1-555-0202',
      address: '456 Innovation Blvd, Austin, TX 78701',
      annualRevenue: 1800000, // High value customer (> $500k)
      accountManager: 'Michael Brown',
      status: 'active',
      createdAt: new Date('2023-03-20'),
      lastInteraction: new Date('2024-10-28'),
    },
    {
      customerId: 'CUST-003',
      companyName: 'Global Logistics Ltd',
      industry: 'Logistics',
      contactName: 'Robert Martinez',
      email: 'r.martinez@globallogistics.com',
      phone: '+1-555-0303',
      address: '789 Commerce St, Chicago, IL 60601',
      annualRevenue: 3200000, // High value customer (> $500k)
      accountManager: 'Sarah Johnson',
      status: 'active',
      createdAt: new Date('2022-11-10'),
      lastInteraction: new Date('2024-11-05'),
    },
    {
      customerId: 'CUST-004',
      companyName: 'SmallBiz Solutions',
      industry: 'Consulting',
      contactName: 'Lisa Anderson',
      email: 'lisa@smallbiz.com',
      phone: '+1-555-0404',
      address: '321 Startup Lane, Portland, OR 97201',
      annualRevenue: 250000, // Standard customer (< $500k)
      accountManager: 'Tom Wilson',
      status: 'active',
      createdAt: new Date('2024-02-10'),
      lastInteraction: new Date('2024-11-03'),
    },
  ]

  // Search by company name or customer ID
  const lowerQuery = query.toLowerCase()
  const customer = mockCustomers.find(
    (c) =>
      c.companyName.toLowerCase().includes(lowerQuery) ||
      c.customerId.toLowerCase() === lowerQuery ||
      c.contactName.toLowerCase().includes(lowerQuery)
  )

  return customer || null
}

/**
 * Simulates updating a lead in SAP
 */
export function sapUpdateLeadMock(leadId: string, updates: Partial<SAPLead>): SAPLead {
  return {
    leadId,
    companyName: updates.companyName || 'Updated Company',
    contactName: updates.contactName || 'Updated Contact',
    email: updates.email || '',
    phone: updates.phone || '',
    status: updates.status || 'contacted',
    source: updates.source || 'voice_call',
    priority: updates.priority || 'medium',
    estimatedValue: updates.estimatedValue || 0,
    createdAt: updates.createdAt || new Date(),
    updatedAt: new Date(),
  }
}

/**
 * Simulates converting a lead to a customer
 */
export function sapConvertLeadMock(leadId: string): SAPCustomer {
  const customerId = 'CUST-' + Date.now().toString().substring(5)

  return {
    customerId,
    companyName: 'Converted Company',
    industry: 'General',
    contactName: 'Converted Contact',
    email: 'contact@converted.com',
    phone: '+1-555-0000',
    address: '123 Main St, City, State 12345',
    annualRevenue: 0,
    accountManager: 'Auto-assigned',
    status: 'active',
    createdAt: new Date(),
    lastInteraction: new Date(),
  }
}

/**
 * Simulates getting lead analytics
 */
export function sapGetLeadAnalyticsMock() {
  return {
    totalLeads: 147,
    newLeads: 23,
    qualifiedLeads: 45,
    convertedLeads: 31,
    conversionRate: 0.21,
    averageValue: 125000,
    topSources: [
      { source: 'voice_call', count: 52 },
      { source: 'web_form', count: 38 },
      { source: 'referral', count: 29 },
      { source: 'email', count: 28 },
    ],
  }
}
