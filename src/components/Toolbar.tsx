import { useRef } from 'react';
import useFamilyStore from '../store/useFamilyStore';
import { exportTree, importTree } from '../utils/helpers';

const Toolbar: React.FC = () => {
    const { members, exportMembers, importMembers } = useFamilyStore();
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

    return (
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">🌳 Family Tree Builder</h1>
                    <p className="text-sm text-gray-600">
                        {members.length} family member{members.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="flex gap-2">
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
