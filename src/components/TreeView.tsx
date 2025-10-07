import { useMemo, useEffect } from 'react';
import ReactFlow, {
    type Node,
    MiniMap,
    Controls,
    Background,
    ReactFlowProvider,
    useNodesState,
    useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import useFamilyStore from '../store/useFamilyStore';
import { buildGenerationMap, calculateHierarchicalLayout, createFamilyNodesAndEdges } from '../utils/helpers';
import MemberNode from './MemberNode';
import JunctionNode from './JunctionNode';

const nodeTypes = {
    memberNode: MemberNode,
    junctionNode: JunctionNode,
};

const TreeView: React.FC = () => {
    const { members, layoutVersion } = useFamilyStore();

    const { nodes, edges } = useMemo(() => {
        if (members.length === 0) {
            return { nodes: [], edges: [] };
        }

        const generationMap = buildGenerationMap(members);

        // Get hierarchical positions for all members
        const memberPositions = calculateHierarchicalLayout(members, generationMap);

        // Create member nodes using hierarchical positions
        const memberNodes: Node[] = members.map((member) => {
            const position = memberPositions.get(member.id) || { x: 0, y: 0 };
            return {
                id: member.id,
                type: 'memberNode',
                data: {
                    member,
                    label: member.name
                },
                position,
            };
        });

        // Create junction nodes and edges
        const { junctionNodes, edges } = createFamilyNodesAndEdges(members, generationMap);

        // Combine all nodes
        const allNodes = [...memberNodes, ...junctionNodes];

        return { nodes: allNodes, edges };
    }, [members, layoutVersion]); // Include layoutVersion to trigger recalculation

    const [flowNodes, setNodes, onNodesChange] = useNodesState(nodes);
    const [flowEdges, setEdges, onEdgesChange] = useEdgesState(edges);

    // Update nodes when members change
    useEffect(() => {
        setNodes(nodes);
        setEdges(edges);
    }, [nodes, edges, setNodes, setEdges]);

    if (members.length === 0) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                    <p className="text-xl text-gray-500 mb-2">No family members yet</p>
                    <p className="text-gray-400">Add your first family member to get started!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Family Tree Visualization */}
            <div className="w-full h-[600px] border border-gray-200 rounded-lg">
                <ReactFlowProvider>
                    <ReactFlow
                        nodes={flowNodes}
                        edges={flowEdges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes}
                        fitView
                        className="bg-gray-50"
                    >
                        <MiniMap
                            nodeColor="#3b82f6"
                            className="bg-white border border-gray-200"
                        />
                        <Controls className="bg-white border border-gray-200" />
                        <Background color="#e2e8f0" gap={16} />
                    </ReactFlow>
                </ReactFlowProvider>
            </div>
        </div>
    );
};

export default TreeView;