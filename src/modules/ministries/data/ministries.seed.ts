import type { Ministry } from '../types';
import {
  COMMUNICATIONS_DUTY_CATALOG_SEED,
  MEDIA_DUTY_CATALOG_SEED,
} from '../constants/ministry.constants';
import { mergeWebsiteSops } from './website-sops';

type MinistrySeedBase = Omit<Ministry, 'dutyCatalog' | 'sops'> & {
  sops: Ministry['sops'];
};

const MINISTRIES_BASE: MinistrySeedBase[] = [
  {
    id: 'min-youth',
    slug: 'youth-ministry',
    name: 'Youth Ministry',
    category: 'fellowship',
    description:
      'Spiritual growth, mentoring, and activities for young people under 19.',
    websiteUrl: 'https://ebenezerbc.org/connect/fellowship-ministries/youth-ministry',
    meetingSummary: 'Regular activities — confirm with director',
    personnel: [
      {
        id: 'p-youth-1',
        name: 'Keyonia Waters',
        role: 'director',
        title: 'Youth Director',
        email: 'youth@ebenezerbc.org',
      },
    ],
    events: [
      {
        id: 'e-youth-1',
        title: 'Youth Bible Study',
        startAt: '2026-07-09T18:30:00',
        endAt: '2026-07-09T20:00:00',
        location: 'Family Life Center',
        recurring: 'Weekly — Thursdays',
      },
    ],
    sops: [],
  },
  {
    id: 'min-missionary',
    slug: 'missionary-ministry',
    name: 'Missionary Ministry (Annie B. Rose)',
    category: 'outreach',
    description:
      'Community service — food pantry, shelters, nursing home visits, and seasonal drives.',
    websiteUrl: 'https://ebenezerbc.org/connect/outreach-ministries/missionary-ministry',
    meetingSummary: 'Belmont Bay Rehab — 3rd Sunday @ 2 PM',
    personnel: [
      {
        id: 'p-mis-1',
        name: 'Missionary Ministry Lead',
        role: 'chair',
        title: 'Chair',
      },
    ],
    events: [
      {
        id: 'e-mis-1',
        title: 'Belmont Bay Rehabilitation Center visit',
        startAt: '2026-07-20T14:00:00',
        endAt: '2026-07-20T16:00:00',
        location: 'Belmont Bay Rehab',
        recurring: '3rd Sunday monthly',
      },
      {
        id: 'e-mis-2',
        title: 'Community food drive',
        startAt: '2026-08-15T10:00:00',
        location: 'Church parking lot',
        notes: 'Coordinate with trustees for supplies',
      },
    ],
    sops: [],
  },
  {
    id: 'min-media',
    slug: 'media-ministry',
    name: 'Media Ministry',
    category: 'service',
    description:
      'Sound, livestream, in-service slides and camera, digital sign, graphics, and photo/video support for worship and church events.',
    websiteUrl: 'https://ebenezerbc.org/connect/media-ministry',
    meetingSummary: 'Sunday worship support',
    contactEmail: 'mediaministry@ebenezerbc.org',
    personnel: [
      {
        id: 'p-med-willie',
        personId: 'person-willie-mccarter',
        name: 'Willie McCarter',
        role: 'director',
        duties: ['media_lead', 'slides', 'camera', 'sound'],
      },
      {
        id: 'p-med-larry',
        personId: 'person-larry-sharpe',
        name: 'Larry Sharpe',
        role: 'member',
        duties: [
          'slides',
          'camera',
          'sound',
          'digital_sign_operator',
          'digital_sign_creative',
        ],
      },
      {
        id: 'p-med-robert',
        personId: 'person-robert-tbd',
        name: 'Robert (TBD)',
        role: 'member',
        duties: ['slides', 'camera', 'sound'],
      },
      {
        id: 'p-med-joshua',
        personId: 'person-joshua-brown',
        name: 'Joshua Brown',
        role: 'member',
        duties: ['slides', 'camera', 'sound'],
      },
      {
        id: 'p-med-jackson',
        personId: 'person-jackson-chandler',
        name: 'Jackson Chandler',
        role: 'member',
        duties: ['slides', 'camera'],
      },
      {
        id: 'p-med-cory',
        personId: 'person-cory-davis',
        name: 'Cory Davis',
        role: 'member',
        duties: ['slides', 'camera', 'streaming'],
      },
      {
        id: 'p-med-diego',
        personId: 'person-diego-haynesworth',
        name: 'Diego Haynesworth',
        role: 'member',
        duties: ['slides', 'camera', 'streaming'],
      },
      {
        id: 'p-med-sherman',
        personId: 'person-sherman-miller',
        name: 'Sherman Miller',
        role: 'member',
        duties: ['camera', 'streaming'],
      },
      {
        id: 'p-med-sherman-jr',
        personId: 'person-sherman-miller-jr',
        name: 'Sherman Miller Jr',
        role: 'member',
        duties: ['camera', 'streaming'],
      },
      {
        id: 'p-med-photo-open',
        name: 'Photographer',
        role: 'volunteer',
        duties: ['photographer'],
        title: 'Open role',
        isOpenRole: true,
      },
      {
        id: 'p-med-video-open',
        name: 'Videographer',
        role: 'volunteer',
        duties: ['videographer'],
        title: 'Open role',
        isOpenRole: true,
      },
    ],
    events: [
      {
        id: 'e-med-1',
        title: 'Sunday worship — AV & livestream',
        startAt: '2026-07-06T09:30:00',
        endAt: '2026-07-06T12:00:00',
        location: 'Chapel',
        recurring: 'Every Sunday',
      },
    ],
    sops: [],
  },
  {
    id: 'min-sunday-school',
    slug: 'sunday-school',
    name: 'Sunday School',
    category: 'education',
    description: 'Biblical teaching for all ages.',
    meetingSummary: '1st & 4th Sundays, 8:30 AM',
    personnel: [],
    events: [
      {
        id: 'e-ss-1',
        title: 'Sunday School',
        startAt: '2026-07-06T08:30:00',
        endAt: '2026-07-06T09:15:00',
        location: 'Family Life Center',
        recurring: '1st & 4th Sundays',
      },
    ],
    sops: [],
  },
  {
    id: 'min-bible-study',
    slug: 'wednesday-bible-study',
    name: 'Wednesday Bible Study',
    category: 'education',
    description: 'Mid-week teaching and prayer via Zoom.',
    meetingSummary: 'Wednesdays, 7:00 PM (Zoom)',
    personnel: [],
    events: [
      {
        id: 'e-bs-1',
        title: 'Prayer & Bible Study',
        startAt: '2026-07-09T19:00:00',
        endAt: '2026-07-09T20:30:00',
        location: 'Zoom',
        recurring: 'Weekly — Wednesdays',
      },
    ],
    sops: [],
  },
  {
    id: 'min-womens',
    slug: 'womens-ministry',
    name: "Women's Ministry (Fruit of the Spirit)",
    category: 'fellowship',
    description: 'Fellowship, Bible study, and service for women.',
    meetingSummary: '4th Tuesday monthly fellowship',
    personnel: [],
    events: [],
    sops: [],
  },
  {
    id: 'min-mountain-men',
    slug: 'mountain-men',
    name: 'Mountain Men',
    category: 'fellowship',
    description: 'Iron Sharpens Iron — small groups and annual retreat.',
    meetingSummary: 'Annual retreat ~3rd week September',
    personnel: [],
    events: [],
    sops: [],
  },
  {
    id: 'min-golden-eagles',
    slug: 'golden-eagles',
    name: 'Golden Eagles',
    category: 'fellowship',
    description: 'Fellowship, prayer, and lunch for seniors (Senior Citizen Ministry).',
    meetingSummary: 'Wed noon prayer + lunch',
    personnel: [],
    events: [],
    sops: [],
  },
  {
    id: 'min-jamm',
    slug: 'jamm',
    name: "JAMM (Joseph's Army)",
    category: 'fellowship',
    description: 'Mentoring godly young men — elementary through high school.',
    websiteUrl: 'https://ebenezerbc.org/connect/fellowship-ministries/jamm-ministry',
    personnel: [],
    events: [],
    sops: [],
  },
  {
    id: 'min-deacon',
    slug: 'deacon-ministry',
    name: 'Deacon Ministry',
    category: 'leadership',
    description: 'Evangelism, stewardship, discipleship; worship support and pastoral care.',
    personnel: [
      {
        id: 'p-dec-1',
        name: 'Dea. Octavis Jones',
        role: 'chair',
        title: 'Chair',
        email: 'deaconministry@ebenezer.org',
      },
      {
        id: 'p-dec-2',
        name: 'Dea. Charles Turner',
        role: 'vice_chair',
        title: 'Vice Chair',
      },
    ],
    events: [],
    sops: [],
  },
  {
    id: 'min-deaconess',
    slug: 'deaconess-ministry',
    name: 'Deaconess Ministry',
    category: 'leadership',
    description: 'Support pastor and deacons in ordinances, visitations, and member support.',
    personnel: [
      {
        id: 'p-dess-1',
        name: 'Deaconess Ella Wilson Fahie',
        role: 'chair',
        title: 'Chair',
      },
      {
        id: 'p-dess-2',
        name: 'Deaconess Phyllis Aggrey',
        role: 'vice_chair',
        title: 'Vice Chair',
      },
    ],
    events: [],
    sops: [],
  },
  {
    id: 'min-trustee',
    slug: 'trustee-ministry',
    name: 'Trustee Ministry',
    category: 'leadership',
    description: 'Property, finances, assets, and operational stewardship.',
    personnel: [
      {
        id: 'p-tru-1',
        name: 'Tru. Curt Odom',
        role: 'chair',
        title: 'Chair',
      },
      {
        id: 'p-tru-2',
        name: 'Tru. Deborah Maddux',
        role: 'director',
        title: 'Treasurer',
      },
    ],
    events: [],
    sops: [],
  },
  {
    id: 'min-communications',
    slug: 'communications-ministry',
    name: 'Communications Ministry',
    category: 'service',
    description:
      'Proposed: one church voice for announcements, bulletin, website notes, and public messaging. Not AV — partners with Media. Affirm with leadership before treating as established.',
    meetingSummary: 'Weekly announcement cycle',
    personnel: [
      {
        id: 'p-comms-lead',
        name: 'Communications Lead (TBD)',
        role: 'director',
        title: 'Communications Lead',
        duties: ['communications_lead', 'ai_cycle'],
      },
    ],
    events: [
      {
        id: 'e-comms-1',
        title: 'Weekly announcement deadline',
        startAt: '2026-07-14T12:00:00',
        location: 'Church office / EBC APP',
        recurring: 'Weekly — confirm weekday with leadership',
        notes: 'Intake closes for Sunday bulletin and in-service cues',
      },
    ],
    sops: [],
  },
  {
    id: 'min-count-me-in',
    slug: 'count-me-in',
    name: 'COUNT ME IN',
    category: 'service',
    description: 'Church-wide volunteer recruitment and placement.',
    personnel: [
      {
        id: 'p-cmi-1',
        name: 'Deborah Eure',
        role: 'director',
      },
      {
        id: 'p-cmi-2',
        name: 'Charlie Parker',
        role: 'advisor',
      },
    ],
    events: [],
    sops: [],
  },
  {
    id: 'min-usher',
    slug: 'usher-greeter',
    name: 'Usher / Greeter Ministry',
    category: 'service',
    description: 'Welcome, seating, and safety for worship services.',
    meetingSummary: '2nd Thursday meetings, 7 PM',
    personnel: [
      {
        id: 'p-ush-1',
        name: 'Altamese Dangerfield',
        role: 'director',
      },
    ],
    events: [
      {
        id: 'e-ush-1',
        title: 'Usher board meeting',
        startAt: '2026-07-10T19:00:00',
        location: 'Family Life Center',
        recurring: '2nd Thursday monthly',
      },
    ],
    sops: [],
  },
  {
    id: 'min-nehemiah',
    slug: 'nehemiah-project',
    name: 'Nehemiah Project',
    category: 'capital',
    description: 'Capital building campaign — sanctuary and Family Life Center.',
    meetingSummary: 'Ongoing since 1995',
    personnel: [],
    events: [],
    sops: [],
  },
];

function dutyCatalogForSlug(slug: string): Ministry['dutyCatalog'] {
  if (slug === 'media-ministry') return MEDIA_DUTY_CATALOG_SEED;
  if (slug === 'communications-ministry') return COMMUNICATIONS_DUTY_CATALOG_SEED;
  return [];
}

export const MINISTRIES_SEED: Ministry[] = MINISTRIES_BASE.map((ministry) => ({
  ...ministry,
  dutyCatalog: dutyCatalogForSlug(ministry.slug),
  sops: mergeWebsiteSops(ministry.sops, ministry.slug),
}));
