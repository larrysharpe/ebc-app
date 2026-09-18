import { CHURCH } from '@/lib/church';

import type { LegalDocument } from '@/modules/legal/features/legal-document/legal-document.types';

import {
  LEGAL_GIVING_EMAIL,
  LEGAL_PRAYER_EMAIL,
  LEGAL_PRIVACY_CONTACT_EMAIL,
} from './legal-routes.constants';

export const LEGAL_LAST_UPDATED = '2026-09-01';

export const PRIVACY_POLICY: LegalDocument = {
  slug: 'privacy',
  title: 'Privacy policy',
  lastUpdated: LEGAL_LAST_UPDATED,
  intro: `${CHURCH.name} (“EBC,” “the church,” “we”) uses EBC APP to help staff and ministry leaders serve the congregation. This page explains what we collect, who can see it, and how to ask questions. It is church policy for this app — not a claim that every state privacy law automatically applies.`,
  sections: [
    {
      id: 'who',
      heading: 'Who we are',
      paragraphs: [
        `${CHURCH.name} of ${CHURCH.location}.`,
        `Office: ${CHURCH.address} · ${CHURCH.phone} · ${LEGAL_PRIVACY_CONTACT_EMAIL}.`,
        'Ebenezer is responsible for how this app uses church information. Some tasks use other companies on our behalf (see Third parties).',
      ],
    },
    {
      id: 'what-we-collect',
      heading: 'What we collect',
      paragraphs: [
        'We collect only what is needed for a church job: welcoming people, coordinating ministries, planning worship, and caring for families.',
      ],
      bullets: [
        'Name, email, phone, birthday (to know who is a child or youth), household, and membership status',
        'Ministry, choir, and volunteer roles',
        'Visitor name, visit date, optional contact, how they heard about us, and staff follow-up notes',
        'Sign-in account, roles, and notification preferences',
        'Ministry plans, events, and other operational records you enter while using the app',
      ],
    },
    {
      id: 'what-we-do-not-collect',
      heading: 'What we do not collect in this app',
      paragraphs: [
        'EBC APP is not a giving processor and not a counseling file.',
      ],
      bullets: [
        'Tithes, offering amounts, or donor history — those stay in Realm',
        'Credit cards or bank account numbers',
        'Social Security numbers (background checks, if required, stay with that vendor)',
        'Your phone contacts or precise GPS location',
        'Advertising or tracking IDs',
        'Pastoral counseling notes, abuse reports, or confidential discipline files',
      ],
    },
    {
      id: 'why',
      heading: 'Why we collect it',
      paragraphs: [
        'So the office can keep an accurate directory, so assigned leaders can reach their teams, so we can welcome guests, and so worship and ministry work can be planned. We do not use church information to sell products or build advertising profiles.',
      ],
    },
    {
      id: 'who-can-see',
      heading: 'Who can see it',
      paragraphs: [
        'Access is need-to-know. A volunteer or ministry leader sees their assignment — not the whole church file. A platform administrator who creates accounts does not automatically see prayer, pastoral care, or giving.',
        'Trustees handle property and finance stewardship. They do not receive pastoral-care records through this app.',
      ],
    },
    {
      id: 'children',
      heading: 'Children and youth',
      paragraphs: [
        'Children under 13 may be listed as people in a household so Sunday School, choir, or youth leaders can serve them. They do not get an EBC APP login. A parent or guardian is the account holder and the contact.',
        'Youth ages 13–17 may receive a limited account (for example choir, band, or volunteer) only if church leadership issues one. Prefer a parent-managed email when possible.',
        'Do not post photos or video of EBC children on public channels without consent.',
      ],
    },
    {
      id: 'prayer',
      heading: 'Prayer requests',
      paragraphs: [
        `Prayer needs sent from this app go by email to ${LEGAL_PRAYER_EMAIL}. They are not stored in EBC APP today and are not posted to the congregation.`,
        'Share only what you are willing for the pastoral care team to read. Do not include someone else’s private situation without their permission.',
        'If we later keep prayer requests in the app, you will choose who may see each request. Public will not be the default.',
      ],
    },
    {
      id: 'giving',
      heading: 'Giving',
      paragraphs: [
        `Online gifts are processed through Realm and the church website. Questions: ${LEGAL_GIVING_EMAIL}. Realm has its own privacy practices. EBC APP only points you there — it does not keep your giving history.`,
      ],
    },
    {
      id: 'third-parties',
      heading: 'Third parties',
      paragraphs: [
        'We may use other services to run the church. Those companies may process information we send them. We do not sell your information to them for their own marketing.',
      ],
      bullets: [
        'Realm (ACS Technologies) — giving and related stewardship',
        'Email or text tools the church office uses to send church messages',
        'The company that hosts this app and its database (when production hosting is chosen)',
        'YouTube and Facebook when the church streams or posts public worship — those platforms have their own terms',
      ],
    },
    {
      id: 'no-sale',
      heading: 'We do not sell your information',
      paragraphs: [
        'EBC will not sell names, emails, phones, ministry involvement, prayer requests, or giving information. We do not send that information to advertising networks.',
      ],
    },
    {
      id: 'your-choices',
      heading: 'Your choices',
      paragraphs: [
        `Ask the church office (${LEGAL_PRIVACY_CONTACT_EMAIL} or ${CHURCH.phone}) to review or correct your directory information.`,
        'You may ask us to delete information we no longer need. Some records must be kept (for example membership history, or giving records in Realm, or records we are legally required to retain).',
        'Signed-in users can change notification preferences in the account menu.',
      ],
    },
    {
      id: 'safety',
      heading: 'When we cannot keep something private',
      paragraphs: [
        'We treat prayer and pastoral concerns with care. We cannot promise secrecy if a child or vulnerable adult may be abused, if someone is in immediate danger, or if the law requires us to report or share a record.',
        'If you or someone you love is in crisis, call 988 or 911. You may also contact the church office during office hours.',
      ],
    },
    {
      id: 'how-long',
      heading: 'How long we keep it',
      paragraphs: [
        'We keep records only as long as they are needed for ministry, membership, or legal duties. Exact time limits are still being set with church leadership. We do not keep extra copies “just in case.”',
      ],
    },
    {
      id: 'security',
      heading: 'How we protect it',
      paragraphs: [
        'Sign-in is required for church work in this app. Roles are checked on the server. Giving amounts, passwords, and other sensitive details are not written to ordinary app logs. We use encrypted connections in staging and production.',
      ],
    },
    {
      id: 'changes',
      heading: 'Changes',
      paragraphs: [
        'If this policy changes in a meaningful way, we will update the date at the top of this page. Continued use of EBC APP after that date means the updated policy applies.',
      ],
    },
    {
      id: 'contact',
      heading: 'Questions',
      paragraphs: [
        `Church office: ${LEGAL_PRIVACY_CONTACT_EMAIL} · ${CHURCH.phone} · ${CHURCH.address}.`,
        'This page describes how Ebenezer uses EBC APP. It is not legal advice. Church counsel should review it before a public production launch.',
      ],
    },
  ],
};

export const TERMS_OF_USE: LegalDocument = {
  slug: 'terms',
  title: 'Terms of use',
  lastUpdated: LEGAL_LAST_UPDATED,
  intro: `These terms cover EBC APP, the staff and ministry tool for ${CHURCH.name}. By signing in, you agree to use the app for church work and to handle people’s information with care.`,
  sections: [
    {
      id: 'who-may-use',
      heading: 'Who may use this app',
      paragraphs: [
        'Accounts are issued by church leadership. This is not a public social network and not open sign-up.',
        'You must be at least 13. Children under 13 are listed through a parent or guardian’s household — they do not sign in.',
        'Youth 13–17 may use a limited account only if leadership creates one.',
      ],
    },
    {
      id: 'church-purpose',
      heading: 'Church purposes only',
      paragraphs: [
        'Use EBC APP for Ebenezer ministry, worship planning, and care — not for personal mailing lists, political campaigning, or outside business.',
      ],
    },
    {
      id: 'need-to-know',
      heading: 'Need-to-know',
      paragraphs: [
        'Look up only what your role requires. Do not copy the directory, visitor notes, or prayer information into personal email, social media, or a private spreadsheet.',
        'If you leave a role, stop using that information. The church may turn off your account when your assignment ends.',
      ],
    },
    {
      id: 'children-media',
      heading: 'Children and photos',
      paragraphs: [
        'Do not publish photos or video of EBC children without consent. Follow the church communications rules.',
      ],
    },
    {
      id: 'prayer-care',
      heading: 'Prayer and pastoral care',
      paragraphs: [
        'Treat prayer requests and care notes as confidential. Do not forward them beyond the people who need to pray or follow up.',
        'This app is not the place to store counseling notes or legal matters.',
      ],
    },
    {
      id: 'giving',
      heading: 'Giving',
      paragraphs: [
        'Gifts are made through Realm or the church website. Do not enter card or bank numbers into EBC APP.',
      ],
    },
    {
      id: 'accounts',
      heading: 'Your account',
      paragraphs: [
        'Keep your password to yourself. Do not share a login. Tell the office if you think someone else used your account.',
        'The church may suspend access if these terms are broken or if it is needed to protect people or church records.',
      ],
    },
    {
      id: 'acceptable-use',
      heading: 'Acceptable use',
      paragraphs: [
        'Do not try to access another person’s account, scrape the app, or upload harmful files. Do not put information in the app in order to harm or embarrass someone.',
      ],
    },
    {
      id: 'availability',
      heading: 'Availability',
      paragraphs: [
        'We work to keep the app available. We do not promise it will always be up. Worship, pastoral care, and giving can continue through the church office, website, and Realm if the app is down.',
      ],
    },
    {
      id: 'law',
      heading: 'Location',
      paragraphs: [
        `${CHURCH.name} is in ${CHURCH.location}. These terms are meant for church use in Virginia.`,
      ],
    },
    {
      id: 'contact',
      heading: 'Questions',
      paragraphs: [
        `Church office: ${LEGAL_PRIVACY_CONTACT_EMAIL} · ${CHURCH.phone}.`,
      ],
    },
  ],
};

export const LEGAL_DOCUMENTS: readonly LegalDocument[] = [PRIVACY_POLICY, TERMS_OF_USE];
