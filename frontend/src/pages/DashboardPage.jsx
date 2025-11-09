import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { workflowApiService } from '../services/workflowApiService';
import toast from 'react-hot-toast';
import './DashboardPage.css';

const DashboardPage = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updated'); // 'updated' or 'name'
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await workflowApiService.getWorkflows();
      setWorkflows(data);
    } catch (error) {
      toast.error('Failed to load workflows');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = async () => {
    try {
      const workflow = await workflowApiService.createWorkflow();
      toast.success('Workflow created');
      navigate(`/editor/${workflow.id}`);
    } catch (error) {
      toast.error('Failed to create workflow');
    }
  };

  const handleDeleteWorkflow = async (workflowId, e) => {
    e.stopPropagation();

    if (!confirm('Delete this workflow?')) {
      return;
    }

    try {
      await workflowApiService.deleteWorkflow(workflowId);
      toast.success('Workflow deleted');
      loadWorkflows();
    } catch (error) {
      toast.error('Failed to delete workflow');
    }
  };

  const handleOpenWorkflow = (workflowId) => {
    navigate(`/editor/${workflowId}`);
  };

  // Filter and sort workflows
  const filteredWorkflows = workflows
    .filter((w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    });

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>CRMFlow</h1>
          <p>Welcome, {user?.email}</p>
        </div>
        <div className="header-right">
          <button className="header-btn" onClick={() => navigate('/templates')}>
            Templates
          </button>
          <button className="header-btn" onClick={() => navigate('/settings')}>
            Settings
          </button>
          <button className="header-btn logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="dashboard-toolbar">
          <div className="toolbar-left">
            <h2>My Workflows</h2>
            <span className="workflow-count">{workflows.length} workflows</span>
          </div>
          <div className="toolbar-right">
            <input
              type="text"
              placeholder="Search workflows..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="updated">Last Updated</option>
              <option value="name">Name</option>
            </select>
            <button className="create-workflow-btn" onClick={handleCreateWorkflow}>
              + New Workflow
            </button>
          </div>
        </div>

        {/* Workflows Grid */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading workflows...</p>
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="empty-state">
            <h3>No workflows yet</h3>
            <p>Create your first workflow to get started</p>
            <button className="create-workflow-btn" onClick={handleCreateWorkflow}>
              + Create Workflow
            </button>
          </div>
        ) : (
          <div className="workflows-grid">
            {filteredWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                className="workflow-card"
                onClick={() => handleOpenWorkflow(workflow.id)}
              >
                <div className="card-header">
                  <h3>{workflow.name}</h3>
                  <button
                    className="delete-btn"
                    onClick={(e) => handleDeleteWorkflow(workflow.id, e)}
                    title="Delete workflow"
                  >
                    ×
                  </button>
                </div>
                <div className="card-stats">
                  <span>{workflow._count?.nodes || 0} nodes</span>
                  <span>{workflow._count?.edges || 0} edges</span>
                </div>
                <div className="card-footer">
                  <span className="last-updated">
                    Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
