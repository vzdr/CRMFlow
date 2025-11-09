import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workflowApiService } from '../services/workflowApiService';
import toast from 'react-hot-toast';
import './TemplatesPage.css';

const TEMPLATE_CATEGORIES = {
  all: 'All Templates',
  sales: 'Sales & CRM',
  support: 'Customer Support',
  ecommerce: 'E-Commerce',
  hr: 'HR & Recruiting',
  general: 'General Business'
};

const TemplatesPage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cloningId, setCloningId] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await workflowApiService.getTemplates();
      setTemplates(data);
    } catch (error) {
      toast.error('Failed to load templates');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloneTemplate = async (templateId) => {
    try {
      setCloningId(templateId);
      const workflow = await workflowApiService.cloneTemplate(templateId);
      toast.success('Template cloned successfully!');
      navigate(`/editor/${workflow.id}`);
    } catch (error) {
      toast.error('Failed to clone template');
      console.error(error);
    } finally {
      setCloningId(null);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="templates-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="templates-page">
      <header className="templates-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <div className="header-title">
            <h1>Template Library</h1>
            <p>Choose a pre-built workflow to get started instantly</p>
          </div>
        </div>
      </header>

      <div className="templates-content">
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
        {filteredTemplates.length === 0 ? (
          <div className="empty-state">
            <h3>No templates found</h3>
            <p>
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'No templates available yet'}
            </p>
          </div>
        ) : (
          <div className="template-grid">
            {filteredTemplates.map(template => (
              <div key={template.id} className="template-card">
                {template.isPopular && (
                  <div className="popular-badge">Popular</div>
                )}

                <h3 className="template-name">{template.name}</h3>

                <p className="template-description">
                  {template.description || 'Pre-built workflow template'}
                </p>

                <div className="template-meta">
                  <span className="template-nodes">
                    {template._count?.nodes || 0} nodes
                  </span>
                  {template.category && (
                    <span className="template-category-badge">
                      {TEMPLATE_CATEGORIES[template.category] || template.category}
                    </span>
                  )}
                </div>

                <button
                  className="use-template-btn"
                  onClick={() => handleCloneTemplate(template.id)}
                  disabled={cloningId === template.id}
                >
                  {cloningId === template.id ? 'Cloning...' : 'Use Template →'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesPage;
