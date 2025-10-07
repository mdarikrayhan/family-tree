import { useRef } from 'react';
import useFamilyStore from '../store/useFamilyStore';
import { exportTree, importTree } from '../utils/helpers';

interface ToolbarProps {
    onAddMember: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAddMember }) => {
    const { members, exportMembers, importMembers, addMember } = useFamilyStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const data = exportMembers();
        exportTree(data);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const importedData = await importTree(file);
            if (confirm('This will replace all current family data. Are you sure?')) {
                importMembers(importedData);
                alert('Family tree imported successfully!');
            }
        } catch (error) {
            alert('Failed to import family tree. Please check the file format.');
        }

        // Reset the input
        event.target.value = '';
    };

    const handleAddSampleData = () => {
        if (members.length > 0 && !confirm('This will add sample data to your existing tree. Continue?')) {
            return;
        }

        // Create sample family data
        const grandpa = {
            id: 'gp1',
            name: 'John Smith Sr.',
            gender: 'male' as const,
            birthDate: '1930-01-01',
            relations: {
                spouseId: 'gm1',
                childrenIds: ['f1', 'u1']
            }
        };

        const grandma = {
            id: 'gm1',
            name: 'Mary Smith',
            gender: 'female' as const,
            birthDate: '1932-03-15',
            relations: {
                spouseId: 'gp1',
                childrenIds: ['f1', 'u1']
            }
        };

        const father = {
            id: 'f1',
            name: 'John Smith Jr.',
            gender: 'male' as const,
            birthDate: '1955-07-20',
            relations: {
                fatherId: 'gp1',
                motherId: 'gm1',
                spouseId: 'm1',
                childrenIds: ['c1', 'c2']
            }
        };

        const mother = {
            id: 'm1',
            name: 'Jane Smith',
            gender: 'female' as const,
            birthDate: '1957-11-10',
            relations: {
                spouseId: 'f1',
                childrenIds: ['c1', 'c2']
            }
        };

        const uncle = {
            id: 'u1',
            name: 'Bob Smith',
            gender: 'male' as const,
            birthDate: '1960-04-05',
            relations: {
                fatherId: 'gp1',
                motherId: 'gm1',
                childrenIds: ['c3']
            }
        };

        const child1 = {
            id: 'c1',
            name: 'Alice Smith',
            gender: 'female' as const,
            birthDate: '1985-02-14',
            relations: {
                fatherId: 'f1',
                motherId: 'm1',
                childrenIds: []
            }
        };

        const child2 = {
            id: 'c2',
            name: 'Tom Smith',
            gender: 'male' as const,
            birthDate: '1988-09-22',
            relations: {
                fatherId: 'f1',
                motherId: 'm1',
                childrenIds: []
            }
        };

        const cousin = {
            id: 'c3',
            name: 'Emma Smith',
            gender: 'female' as const,
            birthDate: '1990-12-03',
            relations: {
                fatherId: 'u1',
                childrenIds: []
            }
        };

        // Add all sample members
        [grandpa, grandma, father, mother, uncle, child1, child2, cousin].forEach(member => {
            addMember(member);
        });

        alert('Sample family tree added successfully!');
    };

    return (
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">🌳 Family Tree Builder</h1>
                    <p className="text-sm text-gray-600">
                        {members.length} family member{members.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={onAddMember}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                        + Add Member
                    </button>

                    <button
                        onClick={handleExport}
                        disabled={members.length === 0}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        📤 Export
                    </button>

                    <button
                        onClick={handleImportClick}
                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                    >
                        📥 Import
                    </button>

                    <button
                        onClick={handleAddSampleData}
                        className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    >
                        🎯 Sample Data
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImport}
                        accept=".json"
                        className="hidden"
                    />
                </div>
            </div>
        </div>
    );
};

export default Toolbar;