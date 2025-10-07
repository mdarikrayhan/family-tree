import useFamilyStore from '../store/useFamilyStore';

interface TreeControlsProps {
    onAddMember: () => void;
}

const TreeControls: React.FC<TreeControlsProps> = ({ onAddMember }) => {
    const { members, addMember, clearAllData, triggerLayoutReset } = useFamilyStore();

    const handleAddSampleData = () => {
        if (members.length > 0 && !confirm('This will add sample data to your existing tree. Continue?')) {
            return;
        }

        // Create sample family data with multiple children to test age sorting
        const grandpa = {
            id: 'gp1',
            name: 'John Smith Sr.',
            gender: 'male' as const,
            birthDate: '1930-01-01',
            relations: {
                spouseId: 'gm1',
                childrenIds: ['f1', 'u1', 'a1']
            }
        };

        const grandma = {
            id: 'gm1',
            name: 'Mary Smith',
            gender: 'female' as const,
            birthDate: '1932-03-15',
            relations: {
                spouseId: 'gp1',
                childrenIds: ['f1', 'u1', 'a1']
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
                childrenIds: ['c1', 'c2', 'c3', 'c4', 'c5']
            }
        };

        const mother = {
            id: 'm1',
            name: 'Jane Smith',
            gender: 'female' as const,
            birthDate: '1957-11-10',
            relations: {
                spouseId: 'f1',
                childrenIds: ['c1', 'c2', 'c3', 'c4', 'c5']
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
                childrenIds: ['cousin1', 'cousin2']
            }
        };

        const aunt = {
            id: 'a1',
            name: 'Susan Smith',
            gender: 'female' as const,
            birthDate: '1952-12-10',
            relations: {
                fatherId: 'gp1',
                motherId: 'gm1',
                childrenIds: []
            }
        };

        // Multiple children with different birth years to test sorting (should appear oldest to youngest)
        const child1 = {
            id: 'c1',
            name: 'Alice Smith',
            gender: 'female' as const,
            birthDate: '1980-02-14',
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
            birthDate: '1985-09-22',
            relations: {
                fatherId: 'f1',
                motherId: 'm1',
                childrenIds: []
            }
        };

        const child3 = {
            id: 'c3',
            name: 'Sarah Smith',
            gender: 'female' as const,
            birthDate: '1982-06-15',
            relations: {
                fatherId: 'f1',
                motherId: 'm1',
                childrenIds: []
            }
        };

        const child4 = {
            id: 'c4',
            name: 'Mike Smith',
            gender: 'male' as const,
            birthDate: '1978-11-30',
            relations: {
                fatherId: 'f1',
                motherId: 'm1',
                childrenIds: []
            }
        };

        const child5 = {
            id: 'c5',
            name: 'Lisa Smith',
            gender: 'female' as const,
            birthDate: '1990-03-08',
            relations: {
                fatherId: 'f1',
                motherId: 'm1',
                childrenIds: []
            }
        };

        // Uncle's children (cousins) with different birth years
        const cousin1 = {
            id: 'cousin1',
            name: 'David Smith',
            gender: 'male' as const,
            birthDate: '1995-07-12',
            relations: {
                fatherId: 'u1',
                childrenIds: []
            }
        };

        const cousin2 = {
            id: 'cousin2',
            name: 'Emily Smith',
            gender: 'female' as const,
            birthDate: '1992-04-20',
            relations: {
                fatherId: 'u1',
                childrenIds: []
            }
        };

        // Add all sample members
        [grandpa, grandma, father, mother, uncle, aunt, child1, child2, child3, child4, child5, cousin1, cousin2].forEach(member => {
            addMember(member);
        });

        alert('Sample family tree added successfully!');
    };

    const handleClearAllData = () => {
        if (members.length === 0) {
            alert('No data to clear!');
            return;
        }

        const confirmed = confirm(
            `Are you sure you want to delete ALL family data?\n\n` +
            `This will permanently remove ${members.length} family member${members.length !== 1 ? 's' : ''} ` +
            `from local storage. This action cannot be undone.`
        );

        if (confirmed) {
            clearAllData();
            alert('All family data has been cleared successfully!');
        }
    };

    return (
        <div className="mb-4 flex justify-center">
            <div className="flex flex-wrap gap-2 bg-gray-50 p-3 rounded-lg border">
                <button
                    onClick={onAddMember}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                    + Add Member
                </button>

                <button
                    onClick={handleAddSampleData}
                    className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                >
                    🎯 Sample Data
                </button>

                <button
                    onClick={handleClearAllData}
                    disabled={members.length === 0}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    title={members.length === 0 ? "No data to clear" : `Clear all ${members.length} family members`}
                >
                    🗑️ Clear All
                </button>

                <button
                    onClick={triggerLayoutReset}
                    disabled={members.length === 0}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    title="Reset layout to default positioning"
                >
                    🔄 Reset Layout
                </button>
            </div>
        </div>
    );
};

export default TreeControls;