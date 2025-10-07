import type { FamilyMember } from '../store/useFamilyStore';

// Layout configuration constants
const LAYOUT_CONFIG = {
  generationSpacing: 200, // Vertical spacing between generations
  nodeSpacing: 180, // Horizontal spacing between nodes
  siblingGroupSpacing: 100, // Extra spacing between sibling groups
  coupleSpacing: 280, // Fixed spacing between married couples to accommodate "married" text
  spouseOffset: 70, // Legacy offset (kept for compatibility)
  minSpaceForParents: 380 // Minimum space for parent couples with marriage text
} as const;

// Generate unique IDs for family members
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Export family tree data as JSON file
export const exportTree = (data: FamilyMember[], filename = 'familyTree.json'): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Import family tree data from JSON file
export const importTree = (file: File): Promise<FamilyMember[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const imported = JSON.parse(result);
          resolve(imported);
        } else {
          reject(new Error('Failed to read file'));
        }
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Enhanced hierarchical positioning for family tree nodes
export const calculateNodePosition = (
  member: FamilyMember,
  allMembers: FamilyMember[],
  generationMap: Map<string, number>
): { x: number; y: number } => {
  return calculateHierarchicalLayout(allMembers, generationMap).get(member.id) || { x: 0, y: 0 };
};

// Advanced hierarchical layout algorithm with bottom-up sibling grouping
export const calculateHierarchicalLayout = (
  allMembers: FamilyMember[],
  generationMap: Map<string, number>
): Map<string, { x: number; y: number }> => {
  const positions = new Map<string, { x: number; y: number }>();

  // Group members by generation
  const generationGroups = new Map<number, FamilyMember[]>();
  allMembers.forEach((member) => {
    const generation = generationMap.get(member.id) || 0;
    if (!generationGroups.has(generation)) {
      generationGroups.set(generation, []);
    }
    generationGroups.get(generation)!.push(member);
  });

  // Sort generations from bottom (youngest) to top (oldest) for bottom-up layout
  const sortedGenerations = Array.from(generationGroups.keys()).sort((a, b) => b - a);

  // First pass: Layout bottom generation (youngest - highest generation number)
  if (sortedGenerations.length > 0) {
    const bottomGeneration = sortedGenerations[0];
    const bottomMembers = generationGroups.get(bottomGeneration)!;

    // Group bottom generation members by their parents (sibling groups)
    const siblingGroups = groupSiblings(bottomMembers);

    let currentX = 100;
    const y = bottomGeneration * LAYOUT_CONFIG.generationSpacing + 100;

    // Layout each sibling group
    siblingGroups.forEach((siblings, groupIndex) => {
      if (groupIndex > 0) {
        currentX += LAYOUT_CONFIG.siblingGroupSpacing;
      }

      // Position siblings in a group together
      siblings.forEach((sibling, siblingIndex) => {
        positions.set(sibling.id, {
          x: currentX + siblingIndex * LAYOUT_CONFIG.nodeSpacing,
          y
        });
      });

      // Calculate space needed for parents above this sibling group
      // Single parent needs ~160px, couple needs ~280px + node width for "married" text
      const siblingGroupWidth = siblings.length * LAYOUT_CONFIG.nodeSpacing;

      currentX += Math.max(siblingGroupWidth, LAYOUT_CONFIG.minSpaceForParents);
    });
  }

  // Second pass: Layout parent generations bottom-up, positioning above their children
  for (let i = 1; i < sortedGenerations.length; i++) {
    const generation = sortedGenerations[i];
    const membersInGeneration = generationGroups.get(generation)!;
    const y = generation * LAYOUT_CONFIG.generationSpacing + 100;

    // Group members by their children (who are already positioned)
    const parentChildGroups = groupParentsByChildren(membersInGeneration, allMembers, positions);

    // Position each parent group with consistent spacing for married couples
    parentChildGroups.forEach(({ parents, childrenCenterX }) => {
      if (parents.length === 1) {
        // Single parent - center above children
        positions.set(parents[0].id, { x: childrenCenterX, y });
      } else if (parents.length === 2) {
        // Married couple - give them consistent spacing regardless of children count
        const [parent1, parent2] = parents;

        positions.set(parent1.id, { x: childrenCenterX - LAYOUT_CONFIG.coupleSpacing / 2, y });
        positions.set(parent2.id, { x: childrenCenterX + LAYOUT_CONFIG.coupleSpacing / 2, y });
      }
    });

    // Handle parents without positioned children (orphaned in this generation)
    const positionedParents = new Set(parentChildGroups.flatMap((group) => group.parents.map((p) => p.id)));

    const orphanedParents = membersInGeneration.filter((m) => !positionedParents.has(m.id));
    if (orphanedParents.length > 0) {
      // Position orphaned parents to the right of positioned ones
      const maxX = Math.max(...Array.from(positions.values()).map((pos) => pos.x));
      let orphanX = maxX + LAYOUT_CONFIG.nodeSpacing * 2;

      // Group orphaned parents by spouse relationships
      const orphanGroups = createFamilyGroups(orphanedParents, allMembers);
      orphanGroups.forEach((group) => {
        if (group.length === 1) {
          positions.set(group[0].id, { x: orphanX, y });
          orphanX += LAYOUT_CONFIG.nodeSpacing;
        } else if (group.length === 2) {
          positions.set(group[0].id, { x: orphanX - LAYOUT_CONFIG.spouseOffset / 2, y });
          positions.set(group[1].id, { x: orphanX + LAYOUT_CONFIG.spouseOffset / 2, y });
          orphanX += LAYOUT_CONFIG.nodeSpacing;
        }
      });
    }
  }

  return positions;
};

// Group siblings by their common parents
function groupSiblings(members: FamilyMember[]): FamilyMember[][] {
  const siblingGroups: FamilyMember[][] = [];
  const processed = new Set<string>();

  members.forEach((member) => {
    if (processed.has(member.id)) return;

    // Find all siblings (members with same parents)
    const siblings = members.filter((other) => {
      if (processed.has(other.id)) return false;

      // Same parents means same father and mother (or at least one parent in common)
      const sameParents =
        ((member.relations.fatherId && member.relations.fatherId === other.relations.fatherId) ||
          (member.relations.motherId && member.relations.motherId === other.relations.motherId)) &&
        member.relations.fatherId === other.relations.fatherId &&
        member.relations.motherId === other.relations.motherId;

      return sameParents;
    });

    if (siblings.length > 0) {
      // Sort siblings by birth year (oldest first), then by birth date, then by name
      siblings.sort((a, b) => {
        // Extract birth years for comparison
        const getYear = (birthDate?: string): number => {
          if (!birthDate) return 9999; // Put members without birth dates at the end

          // Try to extract year from various date formats
          const year = birthDate.match(/\d{4}/)?.[0];
          return year ? parseInt(year, 10) : 9999;
        };

        const yearA = getYear(a.birthDate);
        const yearB = getYear(b.birthDate);

        // Sort by year first (oldest first)
        if (yearA !== yearB) {
          return yearA - yearB;
        }

        // If years are the same, sort by full birth date
        if (a.birthDate && b.birthDate) {
          return a.birthDate.localeCompare(b.birthDate);
        }

        // If birth dates are missing, sort by name
        return a.name.localeCompare(b.name);
      });

      siblingGroups.push(siblings);
      siblings.forEach((sibling) => processed.add(sibling.id));
    } else {
      // No siblings found, this is a single child
      siblingGroups.push([member]);
      processed.add(member.id);
    }
  });

  return siblingGroups;
}

// Group parents by their children and calculate center position above children
function groupParentsByChildren(
  parents: FamilyMember[],
  allMembers: FamilyMember[],
  childPositions: Map<string, { x: number; y: number }>
): Array<{ parents: FamilyMember[]; childrenCenterX: number }> {
  const parentGroups: Array<{ parents: FamilyMember[]; childrenCenterX: number }> = [];
  const processed = new Set<string>();

  parents.forEach((parent) => {
    if (processed.has(parent.id)) return;

    // Find all children of this parent that are positioned
    const children = allMembers.filter(
      (child) =>
        (child.relations.fatherId === parent.id || child.relations.motherId === parent.id) &&
        childPositions.has(child.id)
    );

    if (children.length === 0) return; // No positioned children

    // Get spouse if exists and in same generation
    const spouse = parent.relations.spouseId ? parents.find((p) => p.id === parent.relations.spouseId) : null;

    const groupParents = spouse && !processed.has(spouse.id) ? [parent, spouse] : [parent];

    // Calculate center X position of children
    const childrenXPositions = children.map((child) => childPositions.get(child.id)!.x);
    const childrenCenterX = childrenXPositions.reduce((sum, x) => sum + x, 0) / childrenXPositions.length;

    parentGroups.push({ parents: groupParents, childrenCenterX });

    groupParents.forEach((p) => processed.add(p.id));
  });

  return parentGroups;
} // Create family groups (spouses together, singles separate)
function createFamilyGroups(members: FamilyMember[], allMembers: FamilyMember[]): FamilyMember[][] {
  const processed = new Set<string>();
  const familyGroups: FamilyMember[][] = [];

  members.forEach((member) => {
    if (processed.has(member.id)) return;

    const familyGroup: FamilyMember[] = [member];
    processed.add(member.id);

    // Add spouse if exists and in same generation
    if (member.relations.spouseId) {
      const spouse = allMembers.find((m) => m.id === member.relations.spouseId);
      if (spouse && members.includes(spouse) && !processed.has(spouse.id)) {
        familyGroup.push(spouse);
        processed.add(spouse.id);
      }
    }

    // Sort family group (male first, then female, for consistency)
    familyGroup.sort((a, b) => {
      if (a.gender === 'male' && b.gender !== 'male') return -1;
      if (b.gender === 'male' && a.gender !== 'male') return 1;
      return a.name.localeCompare(b.name);
    });

    familyGroups.push(familyGroup);
  });

  // Sort family groups to maintain consistent ordering
  familyGroups.sort((a, b) => {
    // Sort by the first member's name in each group
    return a[0].name.localeCompare(b[0].name);
  });

  return familyGroups;
}

// Build generation map for family members
export const buildGenerationMap = (members: FamilyMember[]): Map<string, number> => {
  const generationMap = new Map<string, number>();
  const visited = new Set<string>();

  if (members.length === 0) return generationMap;

  // Find root members (those without parents)
  const roots = members.filter((m) => !m.relations.fatherId && !m.relations.motherId);

  // If no roots found, pick any member as root (could be a disconnected tree)
  if (roots.length === 0) {
    // Find the oldest member by birth date or just pick the first one
    const oldestMember = members.reduce((oldest, current) => {
      if (!oldest) return current;
      if (!current.birthDate && !oldest.birthDate) return oldest;
      if (!current.birthDate) return oldest;
      if (!oldest.birthDate) return current;
      return current.birthDate < oldest.birthDate ? current : oldest;
    });
    roots.push(oldestMember);
  }

  // Process each root and their descendants
  roots.forEach((root, rootIndex) => {
    const queue: { id: string; generation: number }[] = [{ id: root.id, generation: rootIndex * 10 }]; // Separate roots by 10 generations

    while (queue.length > 0) {
      const { id, generation } = queue.shift()!;

      if (visited.has(id)) {
        // If we've seen this member before, update to the minimum generation
        const existingGeneration = generationMap.get(id) || 0;
        if (generation < existingGeneration) {
          generationMap.set(id, generation);
        }
        continue;
      }

      visited.add(id);
      generationMap.set(id, generation);

      const member = members.find((m) => m.id === id);
      if (member) {
        // Add spouse to same generation
        if (member.relations.spouseId && !visited.has(member.relations.spouseId)) {
          queue.push({ id: member.relations.spouseId, generation });
        }

        // Add children to next generation
        member.relations.childrenIds.forEach((childId) => {
          const child = members.find((m) => m.id === childId);
          if (child) {
            queue.push({ id: childId, generation: generation + 1 });
          }
        });

        // Also process parents (in case of circular references or missing root detection)
        if (member.relations.fatherId && !visited.has(member.relations.fatherId)) {
          const father = members.find((m) => m.id === member.relations.fatherId);
          if (father) {
            queue.push({ id: member.relations.fatherId, generation: generation - 1 });
          }
        }
        if (member.relations.motherId && !visited.has(member.relations.motherId)) {
          const mother = members.find((m) => m.id === member.relations.motherId);
          if (mother) {
            queue.push({ id: member.relations.motherId, generation: generation - 1 });
          }
        }
      }
    }
  });

  // Handle any remaining orphaned members
  members.forEach((member) => {
    if (!generationMap.has(member.id)) {
      generationMap.set(member.id, 0);
    }
  });

  // Normalize generations to start from 0
  const minGeneration = Math.min(...Array.from(generationMap.values()));
  if (minGeneration < 0) {
    generationMap.forEach((generation, id) => {
      generationMap.set(id, generation - minGeneration);
    });
  }

  return generationMap;
};

// Create junction nodes and edges for family relationships
export const createFamilyNodesAndEdges = (members: FamilyMember[], generationMap: Map<string, number>) => {
  const edges: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    type: string;
    style: object;
    label?: string;
    animated?: boolean;
  }> = [];

  const junctionNodes: Array<{
    id: string;
    type: string;
    data: { label: string };
    position: { x: number; y: number };
  }> = [];

  const edgeIds = new Set<string>();

  // Get the hierarchical layout for all members
  const memberPositions = calculateHierarchicalLayout(members, generationMap);

  // Group children by their parent pairs
  const parentPairToChildren = new Map<string, string[]>();

  members.forEach((member) => {
    const fatherId = member.relations.fatherId;
    const motherId = member.relations.motherId;

    if (fatherId || motherId) {
      // Create a consistent key for parent pairs
      const parentPairKey = [fatherId, motherId].filter(Boolean).sort().join('-');

      if (!parentPairToChildren.has(parentPairKey)) {
        parentPairToChildren.set(parentPairKey, []);
      }
      parentPairToChildren.get(parentPairKey)!.push(member.id);
    }
  });

  // Create junction nodes and edges for parent-child relationships
  // LOGIC:
  // - Single parents: Direct connection to children (no junction needed)
  // - Married couples: Junction node at center between spouses (mother.x - 140px from 280px spacing)
  parentPairToChildren.forEach((childrenIds, parentPairKey) => {
    if (childrenIds.length === 0) return;

    const parentIds = parentPairKey.split('-');
    const father = parentIds[0] ? members.find((m) => m.id === parentIds[0]) : null;
    const mother = parentIds[1] ? members.find((m) => m.id === parentIds[1]) : null;

    // Only create junction for married couples (both parents exist)
    if (father && mother) {
      const junctionId = `junction-${parentPairKey}`;
      const fatherPos = memberPositions.get(father.id);
      const motherPos = memberPositions.get(mother.id);

      // Safety check: ensure we have valid positions
      if (!fatherPos || !motherPos) {
        console.error(`Missing parent positions for junction ${junctionId}:`, {
          father: father.name,
          fatherPos,
          mother: mother.name,
          motherPos
        });
        return;
      }

      // Simple center calculation: use the same spacing as couple positioning
      // For married couples with 280px spacing, center is at mother.x - 140
      const junctionX = Math.max(motherPos.x, fatherPos.x) - 65;

      // Vertical: Halfway between parent bottom edge and child top edge
      const firstChildPos = memberPositions.get(childrenIds[0]);
      if (!firstChildPos) {
        console.error(`Missing child position for junction ${junctionId}, child: ${childrenIds[0]}`);
        return;
      }

      // Calculate actual edges of nodes
      const nodeHeight = 80; // Approximate height of a member node (estimate based on content)
      const parentBottomY = fatherPos.y + nodeHeight; // Bottom edge of parent node
      const childTopY = firstChildPos.y; // Top edge of child node (React Flow position is top-left)
      const junctionY = (parentBottomY + childTopY) / 2; // Exactly between bottom of parent and top of child

      // Create junction node
      junctionNodes.push({
        id: junctionId,
        type: 'junctionNode',
        data: { label: 'junction' },
        position: { x: junctionX, y: junctionY }
      });

      // Connect parents to junction
      if (father) {
        edges.push({
          id: `parent-${father.id}-${junctionId}`,
          source: father.id,
          target: junctionId,
          sourceHandle: 'child',
          targetHandle: 'from-parents',
          type: 'straight',
          style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '0' }
        });
      }

      if (mother) {
        edges.push({
          id: `parent-${mother.id}-${junctionId}`,
          source: mother.id,
          target: junctionId,
          sourceHandle: 'child',
          targetHandle: 'from-parents',
          type: 'straight',
          style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '0' }
        });
      }

      // Connect junction to children
      childrenIds.forEach((childId) => {
        edges.push({
          id: `junction-${junctionId}-${childId}`,
          source: junctionId,
          target: childId,
          sourceHandle: 'to-children',
          targetHandle: 'parent',
          type: 'straight',
          style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '0' }
        });
      });
    } else {
      // Single parent: Direct connection to children (no junction needed)
      const singleParent = father || mother;
      if (singleParent) {
        childrenIds.forEach((childId) => {
          edges.push({
            id: `parent-${singleParent.id}-${childId}`,
            source: singleParent.id,
            target: childId,
            sourceHandle: 'child',
            targetHandle: 'parent',
            type: 'smoothstep',
            style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '0' }
          });
        });
      }
    }
  });

  // Create spouse relationships (unchanged)
  members.forEach((member) => {
    if (member.relations.spouseId && member.id < member.relations.spouseId) {
      const spouse = members.find((m) => m.id === member.relations.spouseId);
      if (spouse) {
        const edgeId = `spouse-${member.id}-${member.relations.spouseId}`;
        if (!edgeIds.has(edgeId)) {
          edges.push({
            id: edgeId,
            source: member.id,
            target: member.relations.spouseId,
            sourceHandle: 'spouse-right',
            targetHandle: 'spouse-left',
            type: 'straight',
            style: {
              stroke: '#ec4899',
              strokeWidth: 2,
              strokeDasharray: '5,5'
            },
            label: 'married',
            animated: true
          });
          edgeIds.add(edgeId);
        }
      }
    }
  });

  return { junctionNodes, edges };
};

// Legacy function for backward compatibility
export const createFamilyEdges = (members: FamilyMember[]) => {
  const generationMap = buildGenerationMap(members);
  const { edges } = createFamilyNodesAndEdges(members, generationMap);
  return edges;
};
