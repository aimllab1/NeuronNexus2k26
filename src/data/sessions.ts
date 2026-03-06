export interface Session {
  id: string;
  title: string;
  speaker: string;
  time: string;
  description: string;
  type: 'technical' | 'non-technical';
}

export const sessions: Session[] = [
  // Technical Events
  {
    id: 't1',
    title: 'Concept Expo',
    speaker: 'Incharge: Narkis Banu',
    time: '',
    description: 'Present your innovative ideas and technical concepts with clarity and impact.',
    type: 'technical',
  },
  {
    id: 't2',
    title: 'Proto Fest',
    speaker: 'Incharge: Pushparaj',
    time: '',
    description: 'Showcase your working prototype and explain your implementation approach.',
    type: 'technical',
  },
  {
    id: 't3',
    title: 'Code Rush',
    speaker: 'Incharge: Hariharan',
    time: '',
    description: 'Find and fix code issues quickly through practical debugging challenges.',
    type: 'technical',
  },
  {
    id: 't4',
    title: 'App Architects',
    speaker: 'Incharge: Lokeswaran',
    time: '',
    description: 'Build a functional application and demonstrate your problem-solving skills.',
    type: 'technical',
  },
  {
    id: 't5',
    title: 'Brain Rush',
    speaker: 'Incharge: Gopinath',
    time: '',
    description: 'Solve rapid-fire technical and logic challenges under time pressure.',
    type: 'technical',
  },

  // Non-Technical Events
  {
    id: 'nt1',
    title: 'E-sports',
    speaker: 'Coordinator: Jeevanantham',
    time: '',
    description: 'Free Fire squad game and CS rounds for competitive team gameplay.',
    type: 'non-technical',
  },
  {
    id: 'nt2',
    title: 'Sonic Nexus',
    speaker: 'Coordinator: Janani',
    time: '',
    description: 'Observe and identify audio and bass-based clues to determine the right names.',
    type: 'non-technical',
  },
  {
    id: 'nt3',
    title: 'CID',
    speaker: 'Coordinator: Karthika',
    time: '',
    description: 'Identify crimes and criminals using clue-based investigation rounds.',
    type: 'non-technical',
  },
  {
    id: 'nt4',
    title: 'Auction Battle',
    speaker: 'Coordinator: Syed Rashid',
    time: '',
    description: 'IPL auction-style battle format with the first 10 teams only.',
    type: 'non-technical',
  },
  {
    id: 'nt5',
    title: 'Crown Mate',
    speaker: 'Incharge: Vishwa',
    time: '',
    description: 'Play chess and outsmart opponents through strategic moves.',
    type: 'non-technical',
  },
];
