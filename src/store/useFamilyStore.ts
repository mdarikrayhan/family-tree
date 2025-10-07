import { create } from 'zustand';

export interface FamilyMember {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  birthDate?: string;
  deathDate?: string;
  relations: {
    fatherId?: string;
    motherId?: string;
    spouseId?: string;
    childrenIds: string[];
  };
}

interface FamilyStore {
  members: FamilyMember[];
  layoutVersion: number; // Track layout changes to trigger re-rendering
  resetTrigger: number; // Track reset button clicks
  addMember: (member: FamilyMember) => void;
  updateMember: (id: string, updatedData: Partial<FamilyMember>) => void;
  deleteMember: (id: string) => void;
  importMembers: (members: FamilyMember[]) => void;
  exportMembers: () => FamilyMember[];
  triggerLayoutReset: () => void; // Force layout recalculation
}

const useFamilyStore = create<FamilyStore>((set, get) => ({
  members: JSON.parse(localStorage.getItem('familyTree') || '[]'),
  layoutVersion: 0,
  resetTrigger: 0,

  addMember: (member) =>
    set((state) => {
      const updated = [...state.members, member];
      localStorage.setItem('familyTree', JSON.stringify(updated));
      return {
        members: updated,
        layoutVersion: state.layoutVersion + 1 // Trigger layout recalculation
      };
    }),

  updateMember: (id, updatedData) =>
    set((state) => {
      const updated = state.members.map((m) => (m.id === id ? { ...m, ...updatedData } : m));
      localStorage.setItem('familyTree', JSON.stringify(updated));
      return {
        members: updated,
        layoutVersion: state.layoutVersion + 1 // Trigger layout recalculation
      };
    }),

  deleteMember: (id) =>
    set((state) => {
      // Remove the member and clean up all references to them
      const updated = state.members
        .filter((m) => m.id !== id)
        .map((m) => ({
          ...m,
          relations: {
            ...m.relations,
            fatherId: m.relations.fatherId === id ? undefined : m.relations.fatherId,
            motherId: m.relations.motherId === id ? undefined : m.relations.motherId,
            spouseId: m.relations.spouseId === id ? undefined : m.relations.spouseId,
            childrenIds: m.relations.childrenIds.filter((childId) => childId !== id)
          }
        }));
      localStorage.setItem('familyTree', JSON.stringify(updated));
      return {
        members: updated,
        layoutVersion: state.layoutVersion + 1 // Trigger layout recalculation
      };
    }),

  importMembers: (members) =>
    set(() => {
      localStorage.setItem('familyTree', JSON.stringify(members));
      return {
        members,
        layoutVersion: Date.now() // Force layout recalculation with unique version
      };
    }),

  exportMembers: () => get().members,

  triggerLayoutReset: () =>
    set((state) => ({
      layoutVersion: state.layoutVersion + 1, // Force layout recalculation
      resetTrigger: state.resetTrigger + 1 // Force position reset
    }))
}));

export default useFamilyStore;
