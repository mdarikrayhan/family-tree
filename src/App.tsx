import { useState } from 'react';
import './App.css';
import Toolbar from './components/Toolbar';
import TreeView from './components/TreeView';
import TreeControls from './components/TreeControls';
import MemberForm from './components/MemberForm';
import MemberCard from './components/MemberCard';
import useFamilyStore, { type FamilyMember } from './store/useFamilyStore';

function App() {
  const { members, resetTrigger } = useFamilyStore();
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | undefined>();
  const [currentView, setCurrentView] = useState<'tree' | 'list'>('tree');

  const handleAddMember = () => {
    setEditingMember(undefined);
    setShowForm(true);
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMember(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toolbar />

      <div className="max-w-7xl mx-auto p-6">
        {/* View Toggle */}
        <div className="mb-6">
          <div className="flex bg-white rounded-lg border border-gray-200 p-1 w-fit">
            <button
              onClick={() => setCurrentView('tree')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${currentView === 'tree'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              🌳 Tree View
            </button>
            <button
              onClick={() => setCurrentView('list')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${currentView === 'list'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              📋 List View
            </button>
          </div>
        </div>

        {/* Main Content */}
        {currentView === 'tree' ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Family Tree</h2>
            <TreeControls onAddMember={handleAddMember} />
            <TreeView key={resetTrigger} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Family Members</h2>
              {members.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-500 mb-2">No family members yet</p>
                  <p className="text-gray-400 mb-4">Add your first family member to get started!</p>
                  <button
                    onClick={handleAddMember}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
                  >
                    + Add First Member
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      onEdit={handleEditMember}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Member Form Modal */}
      {showForm && (
        <MemberForm
          editingMember={editingMember}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

export default App;
