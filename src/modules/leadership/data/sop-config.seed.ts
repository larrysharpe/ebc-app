import type { MinistryCategory } from '@/modules/ministries/types';

import type { SopConfigStore, SopSectionId } from '../types';

const SECTIONS: SopConfigStore['sections'] = [
  {
    id: 'purpose',
    label: 'Purpose',
    hint: 'Why does this procedure or ministry exist? Tie it to Ebenezer’s mission in one or two sentences.',
    placeholder:
      'e.g. Ensure every nursing home visit reflects Christ’s love with consistent preparation and follow-up.',
    required: true,
  },
  {
    id: 'scope',
    label: 'Scope',
    hint: 'CLC §II — What and who this SOP covers, and what it does not (boundaries vs other ministries).',
    placeholder:
      'e.g. Covers Youth Ministry gatherings for ages under 19 in the FLC. Does not cover Vacation Bible School (see VBS SOP).',
    required: false,
    charterOnly: true,
  },
  {
    id: 'structure',
    label: 'Ministry structure',
    hint: 'CLC §III — Roles and duties. Prefer roles over names; keep the Personnel tab as the live roster.',
    placeholder:
      'Director — overall program and volunteer placement\nAdvisors — classroom support and two-adult coverage\nVolunteers — check-in, activities, dismissal',
    required: false,
    charterOnly: true,
  },
  {
    id: 'membership',
    label: 'Membership requirements',
    hint: 'CLC §IV — Who may hold ministry positions. Active EBC membership is the church standard.',
    placeholder:
      'All ministry positions are limited to active members of Ebenezer Baptist Church unless the Pastor grants an exception.',
    required: false,
    charterOnly: true,
  },
  {
    id: 'meetings',
    label: 'Ministry meetings',
    hint: 'CLC §V — Type, frequency, location, and time. Communicate schedule changes at least 24 hours in advance.',
    placeholder:
      'Type: Team planning\nFrequency: Monthly (first Tuesday)\nLocation: FLC Room A\nTime: 7:00 PM\nChanges: Notify team at least 24 hours ahead.',
    required: false,
    charterOnly: true,
  },
  {
    id: 'whenToUse',
    label: 'When to use',
    hint: 'What triggers this SOP? Name events, schedules, or situations.',
    placeholder:
      'e.g. Every 3rd Sunday visit to Belmont Bay Rehab, or any new outreach event with 5+ volunteers.',
    required: true,
  },
  {
    id: 'responsible',
    label: 'Who is responsible',
    hint: 'Primary owner and backup. Use roles, not only names.',
    placeholder:
      'e.g. Missionary ministry lead (primary) · Deacon liaison (backup) · Pastor for prayer requests',
    required: true,
  },
  {
    id: 'before',
    label: 'Before you start',
    hint: 'Prep checklist — supplies, confirmations, permissions, room bookings.',
    placeholder:
      '1. Confirm headcount with facility 48 hours ahead\n2. Assign song leader and scripture reader',
    required: false,
  },
  {
    id: 'steps',
    label: 'Step-by-step procedure',
    hint: 'CLC §VI — Number each step. Start with a verb. Name the responsible role when helpful.',
    placeholder:
      '1. Arrive 20 minutes early and check in at front desk (Lead volunteer)\n2. Greet residents by name when possible (All volunteers)',
    required: true,
  },
  {
    id: 'after',
    label: 'After / follow-up',
    hint: 'Cleanup, logging, thank-yous, and handoffs to other teams.',
    placeholder:
      '1. Log attendance in EBC APP\n2. Note prayer requests for pastoral team (confidential)',
    required: false,
  },
  {
    id: 'safety',
    label: 'Safety & compliance',
    hint: 'Two-adult rule, photo policy, minors, emergencies. Required for youth and outreach.',
    placeholder:
      'e.g. Two approved adults with minors at all times. Emergency: call 911, then church office.',
    required: false,
  },
  {
    id: 'contacts',
    label: 'Contacts & escalation',
    hint: 'Who to call when something goes wrong or needs approval.',
    placeholder: 'Church office: (703) 494-2669 · Pastor on-call: [TBD]',
    required: false,
  },
];

const CATEGORY_DEFAULTS: Record<MinistryCategory, string> = {
  outreach: 'outreach_visit',
  fellowship: 'youth_event',
  education: 'youth_event',
  service: 'worship_av',
  leadership: 'meeting_facilitation',
  capital: 'general',
};

const MEMBERSHIP_PREFILL =
  'All ministry positions are strictly limited to active members of Ebenezer Baptist Church, to maintain spiritual and organizational alignment. Exceptions require Pastor approval.';

export const SOP_CONFIG_SEED: SopConfigStore = {
  sections: SECTIONS,
  categoryDefaults: CATEGORY_DEFAULTS,
  minQualityScore: 70,
  updatedAt: new Date().toISOString(),
  templates: [
    {
      id: 'ministry_charter',
      label: 'Ministry charter (CLC)',
      description:
        'Church-standard operating manual: purpose, scope, structure, membership, meetings, procedures, and review.',
      categories: ['education', 'fellowship', 'leadership', 'service', 'capital', 'outreach'],
      suggestedTitle: 'Ministry operating charter',
      kind: 'charter',
      prefill: {
        membership: MEMBERSHIP_PREFILL,
        whenToUse:
          'Use this charter as the ministry operating manual. Review at least annually and whenever leadership, policy, or meeting rhythms change.',
        responsible:
          'Ministry Leader (primary) · Ministry advisors (backup) · Pastor / Joint Board for charter amendments',
        meetings:
          'Type: [team / planning / prayer]\nFrequency: [e.g. monthly]\nLocation: [building / room]\nTime: [e.g. 7:00 PM]\nSchedule changes: communicate at least 24 hours in advance.',
        steps:
          '1. Confirm ministry purpose and scope with Pastor or designee (Ministry Leader)\n2. Keep Personnel tab current with roles and duties (Ministry Leader)\n3. Run recurring programs per task SOPs linked from this charter (Assigned leads)\n4. Submit charter amendments for Joint Board / leadership approval before publishing (Ministry Leader)',
        after:
          '1. Log major decisions and leadership changes\n2. Schedule next annual review (target: 12 months from effective date)\n3. Notify team when an approved version is published',
        contacts:
          'Church office: (703) 494-2669 · Ministry Leader: [name] · Pastor / Board Chair for charter approval',
      },
      enabled: true,
    },
    {
      id: 'general',
      label: 'General procedure',
      description: 'Flexible template for any recurring ministry task.',
      categories: ['education', 'fellowship', 'leadership', 'service', 'capital', 'outreach'],
      suggestedTitle: 'Ministry procedure',
      kind: 'task',
      prefill: {},
      enabled: true,
    },
    {
      id: 'outreach_visit',
      label: 'Outreach visit',
      description: 'Community service, nursing homes, food drives, tabling.',
      categories: ['outreach'],
      suggestedTitle: 'Community outreach visit',
      kind: 'task',
      prefill: {
        before:
          '1. Confirm date/time with host site\n2. Verify volunteer list (minimum 2 adults)\n3. Prepare materials: visitor log, Bibles, cards',
        steps:
          '1. Check in with site coordinator\n2. Follow site rules for photography and visitation\n3. Conduct planned program (prayer, scripture, fellowship)\n4. Thank site staff before leaving',
        safety:
          'Follow facility health and visitation policies. No photos without approval. Report incidents to ministry lead immediately.',
      },
      enabled: true,
    },
    {
      id: 'youth_event',
      label: 'Youth & children event',
      description: 'Check-in, safety, and two-adult policies for minors.',
      categories: ['fellowship', 'education'],
      suggestedTitle: 'Youth event procedure',
      kind: 'task',
      prefill: {
        before:
          '1. Two approved adults confirmed for the room\n2. Sign-in sheet and emergency contacts ready\n3. Parent pickup policy reviewed with team',
        steps:
          '1. Greet each student at check-in\n2. Match name tag to guardian on file for visitors\n3. Run program per lesson plan\n4. Release students only to authorized guardians',
        safety:
          'Two-adult rule at all times. Never alone with one minor. Background checks required per church policy. Emergency: 911, then youth director and church office.',
      },
      enabled: true,
    },
    {
      id: 'worship_av',
      label: 'Worship & AV',
      description: 'Sunday setup, livestream, sound, and teardown.',
      categories: ['service'],
      suggestedTitle: 'Sunday worship AV checklist',
      kind: 'task',
      prefill: {
        before:
          '1. Arrive 90 minutes before service\n2. Power on sound board and test wireless mics\n3. Open YouTube livestream dashboard',
        steps:
          '1. Sound check with musicians (9:30 AM)\n2. Start livestream 10 minutes before service\n3. Monitor levels and slides during worship\n4. End stream and save recording after dismissal',
        after: '1. Power down equipment\n2. Note any issues in Media Ministry log\n3. Upload archive if needed',
      },
      enabled: true,
    },
    {
      id: 'volunteer_onboarding',
      label: 'Volunteer onboarding',
      description: 'Welcoming and placing new volunteers in the ministry.',
      categories: ['service', 'outreach', 'fellowship'],
      suggestedTitle: 'New volunteer onboarding',
      kind: 'task',
      prefill: {
        purpose: 'Place new volunteers quickly while protecting members and ministry standards.',
        steps:
          '1. Receive form from COUNT ME IN or ministry lead\n2. Welcome call within 7 days\n3. Introduce to ministry leader and first assignment\n4. Log placement in EBC APP',
      },
      enabled: true,
    },
    {
      id: 'meeting_facilitation',
      label: 'Meeting facilitation',
      description: 'Board, team, or recurring ministry meetings.',
      categories: ['leadership', 'fellowship', 'service'],
      suggestedTitle: 'Ministry team meeting',
      kind: 'task',
      prefill: {
        before: '1. Send agenda 48 hours ahead\n2. Book room via facilities\n3. Prepare handouts or slides',
        steps:
          '1. Open with prayer\n2. Review prior action items\n3. Discuss agenda items with time limits\n4. Record decisions and assign owners with due dates',
        after: '1. Distribute minutes within 72 hours\n2. Add action items to trustee or ministry tracker',
      },
      enabled: true,
    },
  ],
};

export const ALL_SECTION_IDS: SopSectionId[] = [
  'purpose',
  'scope',
  'structure',
  'membership',
  'meetings',
  'whenToUse',
  'responsible',
  'before',
  'steps',
  'after',
  'safety',
  'contacts',
];

export const ALL_CATEGORIES: MinistryCategory[] = [
  'education',
  'fellowship',
  'outreach',
  'leadership',
  'service',
  'capital',
];
