import type { FamilyMember } from '../store/useFamilyStore';
import useFamilyStore from '../store/useFamilyStore';

interface MemberCardProps {
    member: FamilyMember;
    onEdit: (member: FamilyMember) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, onEdit }) => {
    const { members, deleteMember } = useFamilyStore();

    const getRelationName = (id: string | undefined) => {
        if (!id) return 'Unknown';
        const person = members.find(m => m.id === id);
        return person ? person.name : 'Unknown';
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${member.name}? This will remove all their relationships.`)) {
            deleteMember(member.id);
        }
    };

    const getGenderColor = (gender: string) => {
        switch (gender) {
            case 'male':
                return 'border-l-blue-500';
            case 'female':
                return 'border-l-pink-500';
            default:
                return 'border-l-gray-500';
        }
    };

    return (
        <div className={`bg-white rounded-lg shadow-md border-l-4 ${getGenderColor(member.gender)} p-4`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{member.gender}</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onEdit(member)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        Edit
                    </button>
                    <button
                        onClick={handleDelete}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                        Delete
                    </button>
                </div>
            </div>

            <div className="space-y-2 text-sm">
                {member.birthDate && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">Born:</span>
                        <span>{new Date(member.birthDate).toLocaleDateString()}</span>
                    </div>
                )}

                {member.deathDate && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">Died:</span>
                        <span>{new Date(member.deathDate).toLocaleDateString()}</span>
                    </div>
                )}

                {member.relations.fatherId && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">Father:</span>
                        <span>{getRelationName(member.relations.fatherId)}</span>
                    </div>
                )}

                {member.relations.motherId && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">Mother:</span>
                        <span>{getRelationName(member.relations.motherId)}</span>
                    </div>
                )}

                {member.relations.spouseId && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">Spouse:</span>
                        <span>{getRelationName(member.relations.spouseId)}</span>
                    </div>
                )}

                {member.relations.childrenIds.length > 0 && (
                    <div>
                        <span className="text-gray-600">Children:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                            {member.relations.childrenIds.map(childId => (
                                <span
                                    key={childId}
                                    className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                                >
                                    {getRelationName(childId)}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberCard;