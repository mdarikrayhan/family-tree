import { useState, useEffect } from 'react';
import useFamilyStore, { type FamilyMember } from '../store/useFamilyStore';
import { generateId } from '../utils/helpers';

interface MemberFormProps {
    editingMember?: FamilyMember;
    onClose: () => void;
    onSave?: () => void;
}

const MemberForm: React.FC<MemberFormProps> = ({ editingMember, onClose, onSave }) => {
    const { members, addMember, updateMember } = useFamilyStore();

    const [formData, setFormData] = useState({
        name: '',
        gender: 'male' as 'male' | 'female' | 'other',
        birthDate: '',
        deathDate: '',
        fatherId: '',
        motherId: '',
        spouseId: '',
    });

    useEffect(() => {
        if (editingMember) {
            setFormData({
                name: editingMember.name,
                gender: editingMember.gender,
                birthDate: editingMember.birthDate || '',
                deathDate: editingMember.deathDate || '',
                fatherId: editingMember.relations.fatherId || '',
                motherId: editingMember.relations.motherId || '',
                spouseId: editingMember.relations.spouseId || '',
            });
        }
    }, [editingMember]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert('Name is required');
            return;
        }

        const memberData: Omit<FamilyMember, 'id'> = {
            name: formData.name.trim(),
            gender: formData.gender,
            birthDate: formData.birthDate || undefined,
            deathDate: formData.deathDate || undefined,
            relations: {
                fatherId: formData.fatherId || undefined,
                motherId: formData.motherId || undefined,
                spouseId: formData.spouseId || undefined,
                childrenIds: editingMember?.relations.childrenIds || [],
            },
        };



        if (editingMember) {
            // Handle spouse relationship updates
            const oldSpouseId = editingMember.relations.spouseId;
            const newSpouseId = formData.spouseId;

            updateMember(editingMember.id, memberData);

            // Update old spouse to remove relationship
            if (oldSpouseId && oldSpouseId !== newSpouseId) {
                const oldSpouse = members.find(m => m.id === oldSpouseId);
                if (oldSpouse) {
                    updateMember(oldSpouseId, {
                        relations: {
                            ...oldSpouse.relations,
                            spouseId: undefined
                        }
                    });
                }
            }

            // Update new spouse to add relationship
            if (newSpouseId && newSpouseId !== oldSpouseId) {
                const newSpouse = members.find(m => m.id === newSpouseId);
                if (newSpouse) {
                    updateMember(newSpouseId, {
                        relations: {
                            ...newSpouse.relations,
                            spouseId: editingMember.id
                        }
                    });
                }
            }
        } else {
            const newMember: FamilyMember = {
                ...memberData,
                id: generateId(),
            };
            addMember(newMember);

            // Add this member as a child to parents if specified
            if (formData.fatherId) {
                const father = members.find(m => m.id === formData.fatherId);
                if (father && !father.relations.childrenIds.includes(newMember.id)) {

                    updateMember(formData.fatherId, {
                        relations: {
                            ...father.relations,
                            childrenIds: [...father.relations.childrenIds, newMember.id]
                        }
                    });
                }
            }

            if (formData.motherId) {
                const mother = members.find(m => m.id === formData.motherId);
                if (mother && !mother.relations.childrenIds.includes(newMember.id)) {

                    updateMember(formData.motherId, {
                        relations: {
                            ...mother.relations,
                            childrenIds: [...mother.relations.childrenIds, newMember.id]
                        }
                    });
                }
            }

            // Update spouse relationship bidirectionally
            if (formData.spouseId) {
                const spouse = members.find(m => m.id === formData.spouseId);
                if (spouse) {
                    updateMember(formData.spouseId, {
                        relations: {
                            ...spouse.relations,
                            spouseId: newMember.id
                        }
                    });
                }
            }
        }

        onSave?.();
        onClose();
    };

    const availableParents = members.filter(m =>
        m.id !== editingMember?.id &&
        !editingMember?.relations.childrenIds.includes(m.id)
    );

    const availableSpouses = members.filter(m =>
        m.id !== editingMember?.id &&
        m.id !== formData.fatherId &&
        m.id !== formData.motherId
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {editingMember ? 'Edit Family Member' : 'Add Family Member'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                                Gender
                            </label>
                            <select
                                id="gender"
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                                Birth Date
                            </label>
                            <input
                                type="date"
                                id="birthDate"
                                value={formData.birthDate}
                                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="deathDate" className="block text-sm font-medium text-gray-700 mb-1">
                                Death Date
                            </label>
                            <input
                                type="date"
                                id="deathDate"
                                value={formData.deathDate}
                                onChange={(e) => setFormData({ ...formData, deathDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="father" className="block text-sm font-medium text-gray-700 mb-1">
                                Father
                            </label>
                            <select
                                id="father"
                                value={formData.fatherId}
                                onChange={(e) => setFormData({ ...formData, fatherId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Father</option>
                                {availableParents.filter(m => m.gender === 'male').map(member => (
                                    <option key={member.id} value={member.id}>{member.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="mother" className="block text-sm font-medium text-gray-700 mb-1">
                                Mother
                            </label>
                            <select
                                id="mother"
                                value={formData.motherId}
                                onChange={(e) => setFormData({ ...formData, motherId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Mother</option>
                                {availableParents.filter(m => m.gender === 'female').map(member => (
                                    <option key={member.id} value={member.id}>{member.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="spouse" className="block text-sm font-medium text-gray-700 mb-1">
                                Spouse
                            </label>
                            <select
                                id="spouse"
                                value={formData.spouseId}
                                onChange={(e) => setFormData({ ...formData, spouseId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Spouse</option>
                                {availableSpouses.map(member => (
                                    <option key={member.id} value={member.id}>{member.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {editingMember ? 'Update' : 'Add'} Member
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MemberForm;