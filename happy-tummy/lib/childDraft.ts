export type ChildDraft = {
  name?: string;
  dob?: string;
  gender?: string;
  weight?: number | null;
  allergies?: boolean | null;
  earlyBorn?: boolean | null;
  deliveryMethod?: number | null;
  enviChange?: number | null;
};

const draft: ChildDraft = {};

export function setChildDraft(update: ChildDraft) {
  Object.assign(draft, update);
}

export function getChildDraft(): ChildDraft {
  return { ...draft };
}

export function resetChildDraft() {
  Object.keys(draft).forEach((key) => {
    delete (draft as Record<string, unknown>)[key];
  });
}
