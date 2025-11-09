import { describe, it, expect } from 'vitest'
import { sapGetCustomerMock, sapCreateLeadMock } from './sapMock'

describe('SAP Mock Service', () => {
  describe('sapGetCustomerMock', () => {
    it('should return customer data for known companies', async () => {
      const result = await sapGetCustomerMock('Acme Corporation')

      expect(result).toBeDefined()
      expect(result.found).toBe(true)
      expect(result.customer).toBeDefined()
      expect(result.customer?.companyName).toBe('Acme Corporation')
    })

    it('should return not found for unknown companies', async () => {
      const result = await sapGetCustomerMock('Unknown Corp')

      expect(result).toBeDefined()
      expect(result.found).toBe(false)
      expect(result.customer).toBeUndefined()
    })

    it('should include customer metadata', async () => {
      const result = await sapGetCustomerMock('TechStart Inc')

      expect(result.customer).toBeDefined()
      expect(result.customer?.customerId).toBeDefined()
      expect(result.customer?.tier).toBeDefined()
      expect(result.customer?.accountValue).toBeGreaterThan(0)
    })

    it('should handle case-insensitive company names', async () => {
      const result1 = await sapGetCustomerMock('ACME CORPORATION')
      const result2 = await sapGetCustomerMock('acme corporation')

      expect(result1.found).toBe(true)
      expect(result2.found).toBe(true)
    })
  })

  describe('sapCreateLeadMock', () => {
    it('should create a new lead', async () => {
      const leadData = {
        companyName: 'NewCo Inc',
        contactName: 'John Doe',
        email: 'john@newco.com',
        phone: '+1234567890',
      }

      const result = await sapCreateLeadMock(leadData)

      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.leadId).toBeDefined()
      expect(result.leadId).toContain('LEAD-')
    })

    it('should include lead metadata', async () => {
      const leadData = {
        companyName: 'Test Corp',
        contactName: 'Jane Smith',
        email: 'jane@test.com',
      }

      const result = await sapCreateLeadMock(leadData)

      expect(result.lead).toBeDefined()
      expect(result.lead?.status).toBe('new')
      expect(result.lead?.source).toBe('voice')
      expect(result.lead?.createdAt).toBeDefined()
    })

    it('should simulate realistic delay', async () => {
      const start = Date.now()
      await sapCreateLeadMock({
        companyName: 'Test',
        contactName: 'Test',
      })
      const elapsed = Date.now() - start

      expect(elapsed).toBeGreaterThanOrEqual(400)
    })
  })
})
