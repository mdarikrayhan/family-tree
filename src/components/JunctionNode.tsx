import { Handle, Position } from 'reactflow';

interface JunctionNodeProps {
    data: {
        label: string;
    };
}

const JunctionNode: React.FC<JunctionNodeProps> = () => {
    return (
        <div className="relative w-4 h-4">
            {/* Handles for connecting parents and children */}
            <Handle type="target" position={Position.Top} id="from-parents" className="opacity-0" />
            <Handle type="source" position={Position.Bottom} id="to-children" className="opacity-0" />

            {/* Visual junction point */}
            <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
        </div>
    );
};

export default JunctionNode;