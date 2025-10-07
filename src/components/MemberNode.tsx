import { Handle, Position } from 'reactflow';
import type { FamilyMember } from '../store/useFamilyStore';
import useFamilyStore from '../store/useFamilyStore';

interface MemberNodeProps {
    data: {
        member: FamilyMember;
        label: string;
    };
}

const MemberNode: React.FC<MemberNodeProps> = ({ data }) => {
    const { member } = data;
    const { members } = useFamilyStore();

    const getGenderColor = (gender: string) => {
        switch (gender) {
            case 'male':
                return 'bg-blue-100 border-blue-300';
            case 'female':
                return 'bg-pink-100 border-pink-300';
            default:
                return 'bg-gray-100 border-gray-300';
        }
    };

    const getGenderIcon = (gender: string) => {
        switch (gender) {
            case 'male':
                return '♂';
            case 'female':
                return '♀';
            default:
                return '⚥';
        }
    };

    const spouse = member.relations.spouseId ?
        members.find(m => m.id === member.relations.spouseId) : null;

    return (
        <div className={`px-4 py-3 shadow-md rounded-md border-2 min-w-32 ${getGenderColor(member.gender)}`}>
            {/* Handles for parent-child relationships (top-bottom) */}
            <Handle type="target" position={Position.Top} id="parent" className="opacity-0" />
            <Handle type="source" position={Position.Bottom} id="child" className="opacity-0" />

            {/* Handles for spouse relationships (left-right) */}
            <Handle type="target" position={Position.Left} id="spouse-left" className="opacity-0" />
            <Handle type="source" position={Position.Right} id="spouse-right" className="opacity-0" />

            <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-lg font-semibold text-gray-800">
                        {member.name}
                    </span>
                    <span className="text-sm text-gray-600">
                        {getGenderIcon(member.gender)}
                    </span>
                </div>

                {member.birthDate && (
                    <div className="text-xs text-gray-600">
                        Born: {new Date(member.birthDate).getFullYear()}
                    </div>
                )}

                {member.deathDate && (
                    <div className="text-xs text-red-600">
                        Died: {new Date(member.deathDate).getFullYear()}
                    </div>
                )}

                {spouse && (
                    <div className="text-xs text-purple-600 font-medium mt-1">
                        💑 {spouse.name}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberNode;