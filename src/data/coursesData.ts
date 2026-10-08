export interface CourseRoadmapStep {
  id: string;
  stepNumber: string;
  title: string;
  titleBisaya: string;
  description: string;
  lessonsCount: number;
  moduleId?: string;
  isAssessment?: boolean;
  isCertificate?: boolean;
}

export interface CourseData {
  id: string;
  title: string;
  titleBisaya: string;
  subtitle: string;
  description: string;
  level: 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced';
  tag: string;
  accentColor: string;
  progressPercent: number;
  totalLessons: number;
  completedLessonsCount: number;
  estimatedHours: string;
  roadmapSteps: CourseRoadmapStep[];
}

export const COURSES: CourseData[] = [
  {
    id: 'course_beginner',
    title: 'Beginner Bisaya',
    titleBisaya: 'Panugod nga Bisaya',
    subtitle: 'Build your confidence in everyday Cebuano & Davao Bisaya.',
    description: 'Master essential greetings, polite forms of address, asking for help, and basic questions with confidence.',
    level: 'Beginner',
    tag: 'Core Foundation',
    accentColor: 'teal',
    progressPercent: 72,
    totalLessons: 10,
    completedLessonsCount: 7,
    estimatedHours: '4.5 hrs',
    roadmapSteps: [
      {
        id: 'step_beg_1',
        stepNumber: '01',
        title: 'Foundations & Greetings',
        titleBisaya: 'Mga Pangumusta ug Pamatasan',
        description: 'Morning, afternoon, and evening greetings, asking "Kumusta ka?", and respectful polite address.',
        lessonsCount: 2,
        moduleId: 'mod_1',
      },
      {
        id: 'step_beg_2',
        stepNumber: '02',
        title: 'Everyday Life & Commute',
        titleBisaya: 'Sakay sa Jeepney ug Pagbiyahe',
        description: 'Passing fares inside jeepneys, saying "Lugar lang!", asking fare prices, and basic directions.',
        lessonsCount: 2,
        moduleId: 'mod_2',
      },
      {
        id: 'step_beg_3',
        stepNumber: '03',
        title: 'Real Conversations & Market',
        titleBisaya: 'Pamalit sa Merkado ug Carenderia',
        description: 'Inquiring about fruit prices, polite "Hangyo" bargaining etiquette, and ordering rice & viands.',
        lessonsCount: 2,
        moduleId: 'mod_3',
      },
      {
        id: 'step_beg_4',
        stepNumber: '04',
        title: 'Real-World Situations & Directions',
        titleBisaya: 'Pangutana sa Dalan ug Lokasyon',
        description: 'Asking where landmarks, banks, and passenger terminals are located without getting lost.',
        lessonsCount: 2,
      },
      {
        id: 'step_beg_5',
        stepNumber: '05',
        title: 'Speaking Challenge with SULTI',
        titleBisaya: 'Pagsulay sa Pagsulti Kauban ang AI',
        description: 'Continuous dialogue practice evaluated by Whisper speech recognition.',
        lessonsCount: 2,
      },
      {
        id: 'step_beg_eval',
        stepNumber: '06',
        title: 'Final Assessment',
        titleBisaya: 'Katapusang Pagsusi sa Kaabtik',
        description: 'Comprehensive oral comprehension test to evaluate pronunciation concordance and vocabulary recall.',
        lessonsCount: 1,
        isAssessment: true,
      },
      {
        id: 'step_beg_cert',
        stepNumber: '07',
        title: 'Certificate of Fluency',
        titleBisaya: 'Sertipiko sa Pagkahanas',
        description: 'Official SultiAI Beginner Bisaya Credential accredited with speech concordance metrics.',
        lessonsCount: 0,
        isCertificate: true,
      },
    ],
  },
  {
    id: 'course_everyday',
    title: 'Everyday Bisaya',
    titleBisaya: 'Adlaw-Adlaw nga Bisaya',
    subtitle: 'Practical Visayas & Mindanao daily interactions.',
    description: 'Handle wet markets, pharmacy inquiries, clinic visits, transportation transfers, and friendly neighborhood chitchat.',
    level: 'Elementary',
    tag: 'Survival Fluency',
    accentColor: 'amber',
    progressPercent: 25,
    totalLessons: 12,
    completedLessonsCount: 3,
    estimatedHours: '6.0 hrs',
    roadmapSteps: [
      {
        id: 'step_eve_1',
        stepNumber: '01',
        title: 'Bankerohan Market Bargaining',
        titleBisaya: 'Diskwento sa Merkado Publiko',
        description: 'Bargaining for fish, vegetables, and fruit per kilo with native vendor jargon.',
        lessonsCount: 2,
      },
      {
        id: 'step_eve_2',
        stepNumber: '02',
        title: 'Carenderia & Local Dining',
        titleBisaya: 'Kaon sa Carenderia ug Kapehan',
        description: 'Ordering "sud-an", asking for extra soup ("sabaw"), and settling bills ("pila tanan?").',
        lessonsCount: 2,
      },
      {
        id: 'step_eve_3',
        stepNumber: '03',
        title: 'Habal-habal & Tricycle Routes',
        titleBisaya: 'Pasahe sa Tricycle ug Habal-habal',
        description: 'Negotiating special trips, clarifying landmarks, and asking for safe speeds.',
        lessonsCount: 2,
      },
      {
        id: 'step_eve_4',
        stepNumber: '04',
        title: 'Pharmacy & Health Symptoms',
        titleBisaya: 'Palit Tambal ug Sakit sa Lawas',
        description: 'Explaining headaches, fever, stomach aches, and dosage inquiries in Visayan terms.',
        lessonsCount: 2,
      },
      {
        id: 'step_eve_5',
        stepNumber: '05',
        title: 'Community & Neighborly Chit-Chat',
        titleBisaya: 'Pakighinabi sa mga Silingan',
        description: 'Friendly neighborhood banter, weather commentary, and communal celebrations.',
        lessonsCount: 2,
      },
      {
        id: 'step_eve_eval',
        stepNumber: '06',
        title: 'Everyday Situational Assessment',
        titleBisaya: 'Pagsusi sa Adlaw-adlaw nga Kahanas',
        description: 'Evaluate practical problem solving in simulated Mindanao scenarios.',
        lessonsCount: 1,
        isAssessment: true,
      },
      {
        id: 'step_eve_cert',
        stepNumber: '07',
        title: 'Everyday Bisaya Certificate',
        titleBisaya: 'Sertipiko sa Adlaw-adlaw nga Bisaya',
        description: 'Demonstrated communicative autonomy across everyday social situations.',
        lessonsCount: 0,
        isCertificate: true,
      },
    ],
  },
  {
    id: 'course_conversational',
    title: 'Conversational Bisaya',
    titleBisaya: 'Madasigong Panagsulti',
    subtitle: 'Expressive discourse particles, humor & colloquial banter.',
    description: 'Sound like a genuine local using emotive particles (gud, bitaw, diay, ba, man, kuno), jokes, storytelling, and Mindanao colloquial flow.',
    level: 'Intermediate',
    tag: 'Native Nuance',
    accentColor: 'indigo',
    progressPercent: 10,
    totalLessons: 14,
    completedLessonsCount: 1,
    estimatedHours: '7.5 hrs',
    roadmapSteps: [
      {
        id: 'step_con_1',
        stepNumber: '01',
        title: 'Expressive Particles: Gud, Bitaw, Diay',
        titleBisaya: 'Paggamit sa Gud, Bitaw, ug Diay',
        description: 'Express agreement ("Bitaw no!"), surprise ("Mao diay!"), and emphasis ("Ngano gud?").',
        lessonsCount: 2,
        moduleId: 'mod_4',
      },
      {
        id: 'step_con_2',
        stepNumber: '02',
        title: 'Clarification Particles: Ba, Man, Kuno',
        titleBisaya: 'Pagklaro: Ba, Man, ug Kuno',
        description: 'Soften inquiries and report hearsay without appearing blunt or demanding.',
        lessonsCount: 2,
      },
      {
        id: 'step_con_3',
        stepNumber: '03',
        title: 'Storytelling & Humor (Tabi-tabi)',
        titleBisaya: 'Pagsugilon ug Pagpakatawa',
        description: 'Narrating recent trips, shared memories, and teasing friends courteously.',
        lessonsCount: 2,
      },
      {
        id: 'step_con_4',
        stepNumber: '04',
        title: 'Workplace & Campus Camaraderie',
        titleBisaya: 'Panag-uban sa Trabaho ug Eskwela',
        description: 'Professional Visayan meeting etiquette and peer collaborations in Mindanao.',
        lessonsCount: 2,
      },
      {
        id: 'step_con_5',
        stepNumber: '05',
        title: 'Davao Bisaya vs Cebuano Nuances',
        titleBisaya: 'Kalainan sa Davao Bisaya ug Cebuano',
        description: 'Tagalog-Bisaya fusion markers ("Hala ka!", "Gani!", "Basig") vs classical Cebuano.',
        lessonsCount: 2,
      },
      {
        id: 'step_con_eval',
        stepNumber: '06',
        title: 'Conversational Capstone Assessment',
        titleBisaya: 'Katapusang Pagsulay sa Panagsulti',
        description: 'Open-ended dialogue scenario graded for natural pacing and discourse particle usage.',
        lessonsCount: 1,
        isAssessment: true,
      },
      {
        id: 'step_con_cert',
        stepNumber: '07',
        title: 'Conversational Mastery Certificate',
        titleBisaya: 'Sertipiko sa Madasigong Panagsulti',
        description: 'Credential testifying to spontaneous colloquial fluency in Southern Philippines Bisaya.',
        lessonsCount: 0,
        isCertificate: true,
      },
    ],
  },
];
