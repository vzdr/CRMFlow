import React, { useState } from 'react';
import './TemplateLibrary.css';

const TEMPLATE_CATEGORIES = {
  all: 'All Templates',
  sales: 'Sales & CRM',
  support: 'Customer Support',
  ecommerce: 'E-Commerce',
  hr: 'HR & Recruiting',
  general: 'General Business'
};

const TEMPLATES = [
  {
    id: 'pizza-delivery',
    name: 'Pizza Delivery Order',
    category: 'ecommerce',
    description: 'Complete order-taking workflow with Stripe payment processing',
    nodes: 9,
    popular: true
  },
  {
    id: 'support-routing',
    name: 'Support Ticket Routing',
    category: 'support',
    description: 'Route tickets based on urgency and assign to appropriate teams',
    nodes: 7
  },
  {
    id: 'sales-qualification',
    name: 'Lead Qualification',
    category: 'sales',
    description: 'Score leads with AI and create Salesforce opportunities',
    nodes: 8,
    popular: true
  },
  {
    id: 'candidate-screening',
    name: 'Candidate Screening',
    category: 'hr',
    description: 'Conduct initial interviews and send results to HR system',
    nodes: 9
  },
  {
    id: 'appointment-booking',
    name: 'Appointment Booking',
    category: 'general',
    description: 'Schedule appointments with calendar integration',
    nodes: 6
  },
  {
    id: 'order-status',
    name: 'Order Status Check',
    category: 'ecommerce',
    description: 'Look up order status and provide shipping information',
    nodes: 5
  },
  {
    id: 'feedback-collection',
    name: 'Customer Feedback',
    category: 'support',
    description: 'Collect and analyze customer satisfaction feedback',
    nodes: 6
  },
  {
    id: 'lead-nurture',
    name: 'Lead Nurturing',
    category: 'sales',
    description: 'Multi-touch lead nurturing with email sequences',
    nodes: 7
  },
  {
    id: 'onboarding',
    name: 'Client Onboarding',
    category: 'general',
    description: 'Welcome new clients and collect required information',
    nodes: 8
  },
  {
    id: 'refund-request',
    name: 'Refund Processing',
    category: 'ecommerce',
    description: 'Handle refund requests with verification and approval',
    nodes: 7
  },
  {
    id: 'escalation',
    name: 'Issue Escalation',
    category: 'support',
    description: 'Escalate complex issues to senior support staff',
    nodes: 6
  },
  {
    id: 'interview-scheduler',
    name: 'Interview Scheduler',
    category: 'hr',
    description: 'Coordinate interview times with candidates and teams',
    nodes: 7
  }
];

const TemplateLibrary = ({ onSelectTemplate, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTemplateClick = (template) => {
    onSelectTemplate(template.id);
  };

  return (
    <div className="template-library-overlay">
      <div className="template-library">
        {/* Header */}
        <div className="template-header">
          <div className="header-content">
            <h2>Template Library</h2>
            <p>Choose a pre-built workflow to get started instantly</p>
          </div>
          <button className="close-library-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Search and Filter */}
        <div className="template-controls">
          <input
            type="text"
            className="template-search"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="category-filter">
            {Object.entries(TEMPLATE_CATEGORIES).map(([key, label]) => (
              <button
                key={key}
                className={`category-btn ${selectedCategory === key ? 'active' : ''}`}
                onClick={() => setSelectedCategory(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="template-grid">
          {filteredTemplates.length === 0 ? (
            <div className="no-templates">
              <p>No templates found matching your criteria</p>
            </div>
          ) : (
            filteredTemplates.map(template => (
              <div
                key={template.id}
                className="template-card"
                onClick={() => handleTemplateClick(template)}
              >
                {template.popular && (
                  <div className="popular-badge">Popular</div>
                )}

                <h3 className="template-name">{template.name}</h3>

                <p className="template-description">{template.description}</p>

                <div className="template-meta">
                  <span className="template-nodes">
                    {template.nodes} nodes
                  </span>
                  <span className="template-category-badge">
                    {TEMPLATE_CATEGORIES[template.category]}
                  </span>
                </div>

                <button className="use-template-btn">
                  Use Template →
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateLibrary;
