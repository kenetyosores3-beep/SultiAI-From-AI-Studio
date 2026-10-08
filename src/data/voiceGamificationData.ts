export interface VoiceChallenge {
  id: string;
  phraseBisaya: string;
  phraseEnglish: string;
  phoneticGuide: string;
  contextTip: string;
  dialectNuance: string;
  recommendedTone: string;
}

export interface VoiceBadge {
  id: string;
  name: string;
  nameBisaya: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  icon: string;
  description: string;
  descriptionBisaya: string;
  criteria: string;
  xpReward: number;
  gemsReward: number;
}

export interface VoiceLevel {
  id: number;
  title: string;
  titleBisaya: string;
  subtitle: string;
  badge: VoiceBadge;
  accentColor: string;
  bgGradient: string;
  minAccuracy: number;
  challenges: VoiceChallenge[];
}

export interface VoiceUserProgress {
  unlockedLevel: number;
  completedLevels: number[];
  completedChallenges: string[];
  earnedBadges: string[];
  totalVoiceXp: number;
  highestAccuracy: number;
}

export const INITIAL_VOICE_PROGRESS: VoiceUserProgress = {
  unlockedLevel: 1,
  completedLevels: [],
  completedChallenges: [],
  earnedBadges: [],
  totalVoiceXp: 0,
  highestAccuracy: 88,
};

export const VOICE_LEVELS: VoiceLevel[] = [
  {
    id: 1,
    title: 'Level 1: Speech Foundations',
    titleBisaya: 'Antas 1: Sukaranan sa Pagsulti',
    subtitle: 'Warm up your tongue with core Bisaya greetings & polite expressions',
    minAccuracy: 75,
    accentColor: 'emerald',
    bgGradient: 'from-emerald-500 to-teal-600',
    badge: {
      id: 'badge_voice_lv1',
      name: 'Voice Starter',
      nameBisaya: 'Tingog Nagsugod 🥉',
      tier: 'Bronze',
      icon: '🥉',
      description: 'Mastered introductory Bisaya phonemes and daily greetings.',
      descriptionBisaya: 'Nalampos ang unang mga panimbaya ug pagtimbaya sa Bisaya.',
      criteria: 'Pass all 3 Level 1 voice pronunciation drills with ≥75% accuracy',
      xpReward: 60,
      gemsReward: 15,
    },
    challenges: [
      {
        id: 'v_c_1_1',
        phraseBisaya: 'Maayong buntag! Kumusta man ka karon?',
        phraseEnglish: 'Good morning! How are you doing today?',
        phoneticGuide: 'mah-AH-yong BOON-tag! koo-MOOS-tah mahn kah kah-ROHN?',
        contextTip: 'Keep a warm, smiling tone. Bisaya vowels are crisp and open.',
        dialectNuance: 'Davao & Cebu standard greeting across all social settings.',
        recommendedTone: 'Cheerful & welcoming',
      },
      {
        id: 'v_c_1_2',
        phraseBisaya: 'Salamat kaayo, amping pirmi sa biyahe.',
        phraseEnglish: 'Thank you very much, always take care on your trip.',
        phoneticGuide: 'sah-LAH-maht KAH-ah-yoh, ahm-PING PEER-mee sah bee-YAH-heh.',
        contextTip: '"Amping" is a heartfelt Bisaya way to show care and solidarity.',
        dialectNuance: '"Pirmi" means always; universally understood in Mindanao & Visayas.',
        recommendedTone: 'Polite & caring',
      },
      {
        id: 'v_c_1_3',
        phraseBisaya: 'Walay sapayan, higala. Malipayon ko.',
        phraseEnglish: 'You are very welcome, friend. I am happy.',
        phoneticGuide: 'wah-LIE sah-PAH-yahn, hee-GAH-lah. mah-lee-PAH-yohn koh.',
        contextTip: 'Pronounce "walay" without rushing; the glottal stop is gentle.',
        dialectNuance: 'Higala (friend) adds genuine warmth to any interaction.',
        recommendedTone: 'Grateful & cordial',
      },
    ],
  },
  {
    id: 2,
    title: 'Level 2: Palengke Haggler',
    titleBisaya: 'Antas 2: Tawad sa Merkado',
    subtitle: 'Learn the playful, friendly art of asking prices and getting discounts',
    minAccuracy: 80,
    accentColor: 'amber',
    bgGradient: 'from-amber-500 to-orange-600',
    badge: {
      id: 'badge_voice_lv2',
      name: 'Market Negotiator',
      nameBisaya: 'Tawad Master 🥈',
      tier: 'Silver',
      icon: '🥈',
      description: 'Successfully haggled with native cadence and price intonation.',
      descriptionBisaya: 'Nakahangyo sa merkado gamit ang lumad nga tuno sa paghangyo.',
      criteria: 'Pass all 3 Level 2 market dialogue drills with ≥80% accuracy',
      xpReward: 90,
      gemsReward: 20,
    },
    challenges: [
      {
        id: 'v_c_2_1',
        phraseBisaya: 'Tagpila man ni, Nang? Puyde hangyo gamay?',
        phraseEnglish: 'How much is this, ma\'am? May I ask for a small discount?',
        phoneticGuide: 'tag-PEE-lah mahn nee, nahng? POOY-deh HANG-yoh gah-MYE?',
        contextTip: 'Use a gentle rising lilt on "gamay?" to make the request endearing.',
        dialectNuance: '"Nang" is a respectful term of endearment for vendors.',
        recommendedTone: 'Playful & respectful',
      },
      {
        id: 'v_c_2_2',
        phraseBisaya: 'Mahal ra man kaayo, singkwenta na lang beh!',
        phraseEnglish: 'That\'s too expensive, let\'s make it fifty please!',
        phoneticGuide: 'mah-HAHL rah mahn KAH-ah-yoh, seeng-KWEN-tah nah lahng beh!',
        contextTip: 'The particle "beh" softens the counter-offer into a friendly plea.',
        dialectNuance: 'Widely used in Bankerohan Market in Davao City.',
        recommendedTone: 'Persuasive & banter',
      },
      {
        id: 'v_c_2_3',
        phraseBisaya: 'Tulo ka kilo akong kuhaon, tagai ko og pabor.',
        phraseEnglish: 'I will take three kilos, please do me a small favor.',
        phoneticGuide: 'TOO-loh kah KEE-loh AH-kohng koo-HAH-ohn, tah-GAH-ee koh og pah-BOHR.',
        contextTip: '"Pabor" (favor) signals you are buying bulk in exchange for discount.',
        dialectNuance: 'Standard commercial phrasing in Southern Mindanao.',
        recommendedTone: 'Confident & collaborative',
      },
    ],
  },
  {
    id: 3,
    title: 'Level 3: Jeepney & Commuter',
    titleBisaya: 'Antas 3: Kompyuter sa Dalan',
    subtitle: 'Project loud, clear commuter calls to navigate jeepneys and tricycles',
    minAccuracy: 80,
    accentColor: 'blue',
    bgGradient: 'from-blue-500 to-indigo-600',
    badge: {
      id: 'badge_voice_lv3',
      name: 'Street Navigator',
      nameBisaya: 'Hari sa Dalan 🚙',
      tier: 'Gold',
      icon: '🚙',
      description: 'Mastered commuter etiquette, fare passing, and loud stop commands.',
      descriptionBisaya: 'Klaro ug kusog nga nakapanawag sa jeep ug nakatunol sa plete.',
      criteria: 'Pass all 3 Level 3 commute drills with ≥80% accuracy',
      xpReward: 130,
      gemsReward: 25,
    },
    challenges: [
      {
        id: 'v_c_3_1',
        phraseBisaya: 'Lugar lang sa unahan sa may kanto, Manong!',
        phraseEnglish: 'Pull over just ahead near the corner, driver!',
        phoneticGuide: 'loo-GAHR lahng sah oo-NAH-hahn sah mye KAHN-toh, mah-NOHNG!',
        contextTip: 'Project from your chest so the driver hears you over traffic noise.',
        dialectNuance: '"Lugar lang!" is the universal Bisaya equivalent to Tagalog "Para po!"',
        recommendedTone: 'Loud, clear & respectful',
      },
      {
        id: 'v_c_3_2',
        phraseBisaya: 'Palihog ko og tunol sa plete, duha ni kabuok.',
        phraseEnglish: 'Please kindly pass the fare, this is payment for two people.',
        phoneticGuide: 'pah-LEE-hog koh og TOO-nohl sah PLEH-teh, DOO-hah nee kah-BOO-ok.',
        contextTip: '"Palihog" is the gold standard of Bisaya courtesy when asking passengers.',
        dialectNuance: '"Kabuok" counts individual units or people.',
        recommendedTone: 'Courteous & clear',
      },
      {
        id: 'v_c_3_3',
        phraseBisaya: 'Asa man dapit ang sakayan padulong Matina?',
        phraseEnglish: 'Where is the terminal or loading area going towards Matina?',
        phoneticGuide: 'AH-sah mahn DAH-peet ahng sah-KAH-yahn pah-DOO-lohng mah-TEE-nah?',
        contextTip: '"Asa man dapit" pinpoints specific landmark directions.',
        dialectNuance: 'Classic Davao route inquiry (Matina, Bajada, Toril).',
        recommendedTone: 'Inquiring & polite',
      },
    ],
  },
  {
    id: 4,
    title: 'Level 4: Barkada & Banter',
    titleBisaya: 'Antas 4: Chikahan sa Barkada',
    subtitle: 'Flow naturally with native colloquial idioms: "Bitaw", "Lagi", and "Gud"',
    minAccuracy: 85,
    accentColor: 'purple',
    bgGradient: 'from-purple-500 to-pink-600',
    badge: {
      id: 'badge_voice_lv4',
      name: 'Conversationalist Star',
      nameBisaya: 'Chika Champion 🥇',
      tier: 'Platinum',
      icon: '🥇',
      description: 'Acquired natural cadence, emotional particles, and colloquial rhythm.',
      descriptionBisaya: 'Hawod makig-istorya sa barkada gamit ang natural nga mga ekspresyon.',
      criteria: 'Pass all 3 Level 4 social conversation drills with ≥85% accuracy',
      xpReward: 180,
      gemsReward: 35,
    },
    challenges: [
      {
        id: 'v_c_4_1',
        phraseBisaya: 'Bitaw uy, sakto gyud kaayo ka diha!',
        phraseEnglish: 'Indeed, you are completely right about that!',
        phoneticGuide: 'bee-TAW ooy, SAHK-toh jyud KAH-ah-yoh kah DEE-hah!',
        contextTip: '"Bitaw" signifies genuine empathy and agreement with the speaker.',
        dialectNuance: 'Davao speakers often emphasize "gyud" or "dyud" with warmth.',
        recommendedTone: 'Passionate agreement',
      },
      {
        id: 'v_c_4_2',
        phraseBisaya: 'Ayaw kabalaka, kaya ra kaayo na nato!',
        phraseEnglish: 'Do not worry at all, we can definitely accomplish this together!',
        phoneticGuide: 'AH-yaw kah-bah-LAH-kah, KAH-yah rah KAH-ah-yoh nah NAH-toh!',
        contextTip: 'Inflect encouragement and solidarity on "kaya ra".',
        dialectNuance: 'The ultimate Bisaya supportive phrase among friends.',
        recommendedTone: 'Encouraging & optimistic',
      },
      {
        id: 'v_c_4_3',
        phraseBisaya: 'Kaon ta ninyo og kalami, busog na ba mo?',
        phraseEnglish: 'Let us eat delicious food together, are you all full already?',
        phoneticGuide: 'KAH-ohn tah NEEN-yoh og kah-LAH-mee, boo-SOHG nah bah moh?',
        contextTip: 'Hospitality is central to Bisaya culture; sound welcoming.',
        dialectNuance: '"Ta ninyo" invites the whole group into the meal.',
        recommendedTone: 'Hospitality & friendliness',
      },
    ],
  },
  {
    id: 5,
    title: 'Level 5: Master Orator',
    titleBisaya: 'Antas 5: Lumad nga Datu sa Pulong',
    subtitle: 'Achieve deep fluency, poetic imagery, and majestic native eloquence',
    minAccuracy: 90,
    accentColor: 'rose',
    bgGradient: 'from-rose-500 to-red-600',
    badge: {
      id: 'badge_voice_lv5',
      name: 'Master Orator',
      nameBisaya: 'Datu sa Pulong 👑',
      tier: 'Diamond',
      icon: '👑',
      description: 'Attained native orator status with complex sentences and cultural gravitas.',
      descriptionBisaya: 'Gipasidunggan isip Datu sa Pulong tungod sa kahanas sa lumad nga Bisaya.',
      criteria: 'Pass all 3 Level 5 master orator challenges with ≥90% accuracy',
      xpReward: 300,
      gemsReward: 60,
    },
    challenges: [
      {
        id: 'v_c_5_1',
        phraseBisaya: 'Bisag unsaon, kasingkasing gihapon ang mopatigbabaw.',
        phraseEnglish: 'No matter what happens, the heart will always prevail.',
        phoneticGuide: 'BEE-sag oon-SAH-ohn, kah-seeng-KAH-seeng gee-HAH-pohn ahng moh-pah-teeg-BAH-bahw.',
        contextTip: 'Pause slightly after "Bisag unsaon" for poetic cadence.',
        dialectNuance: '"Mopatigbabaw" is a profound classical Bisaya verb for triumph.',
        recommendedTone: 'Deep, poetic & solemn',
      },
      {
        id: 'v_c_5_2',
        phraseBisaya: 'Garbo sa Sugbo ug tibuok Mindanao ang atong pinulongan.',
        phraseEnglish: 'Our language is the proud heritage of Cebu and the whole Mindanao.',
        phoneticGuide: 'GAHR-boh sah SOOG-boh oog tee-BOO-ok meen-dah-NOW ahng AH-tohng pee-noo-LOHNG-ahn.',
        contextTip: 'Deliver with pride and rhythmic assertion.',
        dialectNuance: 'Celebrates both Visayan roots and Mindanao dialect evolution.',
        recommendedTone: 'Proud & patriotic',
      },
      {
        id: 'v_c_5_3',
        phraseBisaya: 'Dili ikabaylo ang tiunay nga panaghigalaay sa mga Bisaya.',
        phraseEnglish: 'The genuine and sincere friendship among Bisaya people is irreplaceable.',
        phoneticGuide: 'DEE-lee ee-kah-BYE-loh ahng tee-OO-nye ngah pah-nag-hee-gah-LAH-aye sah mah-NGAH bee-SAH-yah.',
        contextTip: 'Pronounce "tiunay" (authentic/sincere) with deliberate clarity.',
        dialectNuance: 'High-level rhetorical Bisaya used in leadership and defense speeches.',
        recommendedTone: 'Heartfelt & dignified',
      },
    ],
  },
];

const STORAGE_KEY = 'sultiai_voice_gamification_progress';

export const getStoredVoiceProgress = (): VoiceUserProgress => {
  if (typeof window === 'undefined') return INITIAL_VOICE_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.unlockedLevel === 'number') {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return INITIAL_VOICE_PROGRESS;
};

export const saveVoiceProgress = (progress: VoiceUserProgress): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
};
