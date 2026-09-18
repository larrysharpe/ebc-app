import type { MinistrySop } from '../types';

const SOURCE = 'ebenezerbc.org';
const STAMP = '2026-07-03';

function sop(id: string, title: string, content: string): MinistrySop {
  return {
    id,
    title,
    content,
    updatedAt: `${STAMP}T12:00:00.000Z`,
    updatedBy: SOURCE,
    kind: 'task',
    status: 'approved',
    version: '1.0',
    templateId: 'general',
    approvedBy: SOURCE,
    approvedAt: `${STAMP}T12:00:00.000Z`,
    effectiveDate: STAMP,
  };
}

/** SOPs derived from public website content — website-reference.md scan 2026-07-03 */
export const WEBSITE_SOPS_BY_SLUG: Record<string, MinistrySop[]> = {
  'youth-ministry': [
    sop(
      'sop-web-youth-1',
      'Youth ministry gathering (under 19)',
      `## Purpose

Provide spiritual growth, mentoring, and activities for young people under 19, aligned with Ebenezer's mission of putting the family back together.

## When to use

Any scheduled Youth Ministry activity, class, or outreach listed on [ebenezerbc.org](https://ebenezerbc.org/connect/fellowship-ministries/youth-ministry) or announced by the youth director.

## Who is responsible

Youth Director **Keyonia Waters** (primary) · Youth advisors (per website roster) · Two approved adult volunteers minimum at every event with minors.

## Before you start

1. Confirm room reservation in Family Life Center or Chapel area if needed.
2. Verify lesson plan and materials with youth director.
3. Prepare sign-in sheet with emergency contacts for visitors.
4. Review two-adult policy with all volunteers serving that day.

## Step-by-step procedure

1. Arrive 30 minutes early to set up and pray with the team.
2. Greet each student and parent at the check-in point.
3. Collect or verify emergency contact for first-time visitors.
4. Open with prayer and brief welcome tied to the week's theme.
5. Run program per director's plan (Bible study, discussion, activity).
6. Dismiss only to authorized guardians — no student leaves alone.
7. Debrief with volunteers and note attendance for the director.

## After / follow-up

1. Log attendance and visitor names for follow-up within 48 hours.
2. Email parents of new visitors a welcome note from the church.
3. Report safety incidents or pastoral concerns to youth director immediately.

## Safety & compliance

Two approved adults in every room with minors at all times. Never transport a minor without written parent permission on file. Follow church child-protection policy. No photos of minors posted publicly without parent release.

## Contacts & escalation

Youth Director: Keyonia Waters · Church office: (703) 494-2669 · churchadmin@ebenezerbc.org · Prayer requests: prayerrequests@ebenezerbc.org`,
    ),
    sop(
      'sop-web-youth-2',
      'Vacation Bible School (VBS) evening session',
      `## Purpose

Execute a safe, welcoming VBS session that introduces children to God through the published curriculum (e.g. church announcements such as *Rainforest Falls: Exploring the Nature of God*, 6–9 PM sessions).

## When to use

Each evening of VBS week, typically 6:00–9:00 PM as announced on the church calendar and homepage.

## Who is responsible

VBS director (assigned per year) · Youth Ministry · COUNT ME IN volunteers matched to children's ministry.

## Before you start

1. Confirm volunteer roster and background-check status per church policy.
2. Stage FLC classrooms by age group; verify bathroom escort pairs.
3. Print name tags and allergy notes from registration.
4. Brief volunteers on emergency exits and reunification plan.

## Step-by-step procedure

1. Open check-in tables at 5:45 PM at FLC entrance.
2. Match each child to guardian pick-up tag or wristband system.
3. Escort groups to stations (craft, music, Bible story, recreation).
4. Rotate stations on schedule; maintain two adults per group.
5. Close with worship rally and parent pick-up only at check-in desk.
6. Account for every child before releasing the building.

## After / follow-up

1. Sanitize classrooms and store supplies.
2. Send thank-you to volunteers via countmein@ebenezerbc.org list.
3. Capture visitor cards for membership follow-up.

## Safety & compliance

No child released to anyone not on the authorized pick-up list. First aid kit at check-in. Call 911 for medical emergency, then notify church office.

## Contacts & escalation

Church office: (703) 494-2669 · COUNT ME IN: countmein@ebenezerbc.org`,
    ),
  ],

  'missionary-ministry': [
    sop(
      'sop-web-mis-1',
      'Belmont Bay nursing home visit (3rd Sunday)',
      `## Purpose

Share Christ's love through worship, prayer, and fellowship at Belmont Bay Rehabilitation Center — a core rhythm of the Annie B. Rose Missionary Ministry.

## When to use

Every **3rd Sunday at 2:00 PM** (per website and missionary ministry page), unless cancelled via church announcements.

## Who is responsible

Missionary Ministry lead · Worship team assignee · Deacon liaison for prayer requests when needed.

## Before you start

1. Confirm visit with facility staff 48 hours ahead and note headcount.
2. Assign song leader, scripture reader, and greeter.
3. Prepare visitor log and EBC business cards or welcome materials.
4. Coordinate transportation and arrival time (aim 1:45 PM).

## Step-by-step procedure

1. Check in at the facility front desk and follow their visitation rules.
2. Gather the team briefly for prayer before entering the common area.
3. Greet residents and staff; introduce Ebenezer Baptist Church.
4. Lead one or two songs, scripture, and a brief encouraging word.
5. Offer individual prayer as appropriate and without pressuring participation.
6. Thank the activities director before departure.

## After / follow-up

1. Log attendance and resident count in ministry records.
2. Route pastoral prayer requests through prayerrequests@ebenezerbc.org — handle discreetly.
3. Confirm next month's date on the missionary calendar.

## Safety & compliance

Follow facility health policies (masking, illness) as posted. No photography without facility approval. Respect HIPAA — do not discuss resident medical details outside the visit.

## Contacts & escalation

Church office: (703) 494-2669 · Prayer: prayerrequests@ebenezerbc.org`,
    ),
    sop(
      'sop-web-mis-2',
      'Community food drive',
      `## Purpose

Collect food and resources for families in need through the Missionary Ministry food pantry and seasonal drives announced on [ebenezerbc.org](https://ebenezerbc.org/connect/outreach-ministries/missionary-ministry).

## When to use

When the church announces an ongoing or special food drive (homepage announcements reference Missionary Ministry food drives).

## Who is responsible

Missionary Ministry chair · Trustee liaison for supply purchases if needed · COUNT ME IN volunteers for sorting.

## Before you start

1. Publish drive dates on church calendar and announcements page.
2. Arrange collection bins in FLC and church lobby.
3. Confirm storage area and refrigeration needs with trustees.
4. Recruit volunteers for sort/pack shift.

## Step-by-step procedure

1. Open collection points before first Sunday of the drive.
2. Sort donations daily for expired items — discard unsafe goods.
3. Inventory high-need items (canned protein, grains, baby formula if accepted).
4. Pack bags per pantry distribution guidelines.
5. Coordinate delivery to partner agencies or on-site pickup days.
6. Thank congregation via announcements when drive closes.

## After / follow-up

1. Report pounds/items collected to leadership.
2. Restock pantry shelves and update needs list for next drive.
3. Log volunteer hours through COUNT ME IN.

## Safety & compliance

Wear gloves when sorting. No home-canned goods unless policy allows. Report pest or spoilage issues to trustees.

## Contacts & escalation

countmein@ebenezerbc.org · Church office: (703) 494-2669`,
    ),
    sop(
      'sop-web-mis-3',
      'Seasonal outreach (Thanksgiving baskets & Un-Trim-A-Tree)',
      `## Purpose

Deliver holiday hope through Thanksgiving baskets and the Un-Trim-A-Tree program described on the missionary ministry website.

## When to use

Thanksgiving season and Christmas/Un-Trim-A-Tree campaign windows each year as announced.

## Who is responsible

Missionary Ministry · Finance/trustee approval for fund expenditures · Volunteer drivers and packers.

## Before you start

1. Publish signup for families to sponsor or receive baskets.
2. Confirm budget and shopping list with trustee treasurer.
3. Schedule packing day in FLC kitchen or gym.
4. Collect delivery addresses and dietary restrictions.

## Step-by-step procedure

1. Shop or receive donated goods per approved list.
2. Pack baskets with checklist (meal, sides, prayer card).
3. Label deliveries with discreet addressing for dignity.
4. Deliver on assigned routes in teams of two.
5. Pray with families when welcomed; do not force conversation.
6. For Un-Trim-A-Tree, follow gift collection and distribution rules announced that year.

## After / follow-up

1. Confirm all assigned families served.
2. Send thank-you to donors via church communications.
3. Document lessons learned for next season.

## Safety & compliance

Two adults per delivery vehicle when minors participate. No entering homes alone. Follow safe food handling in FLC commercial kitchen guidelines.

## Contacts & escalation

Trustee Treasurer: Tru. Deborah Maddux (via church office) · churchadmin@ebenezerbc.org`,
    ),
  ],

  'media-ministry': [
    sop(
      'sop-web-med-1',
      'Sunday worship — sound, livestream & Facebook',
      `## Purpose

Deliver clear worship audio and video to the Chapel congregation and online audience via [YouTube @EBCWoodbridgeVA](https://www.youtube.com/@EBCWoodbridgeVA) and Facebook, per Media Ministry scope on the website.

## When to use

Every **Sunday worship at 10:00 AM** (arrive by 9:30 AM; service typically concludes by noon). Chapel entrance while sanctuary is under construction.

## Who is responsible

Media Ministry lead · Sound operator · Livestream operator · Backup volunteer each Sunday.

## Before you start

1. Arrive 90 minutes before service; unlock AV closet per church policy.
2. Power on sound board; test pastor, music, and reader wireless mics.
3. Open YouTube livestream dashboard and Facebook live if scheduled.
4. Sync slides/scripture display with worship leader set list.
5. Confirm AI transcription tools if used (per website Media Ministry note).

## Step-by-step procedure

1. Run sound check with musicians at 9:30 AM.
2. Start livestream 10 minutes before 10:00 AM call to worship.
3. Monitor levels during hymns, prayers, and sermon — adjust gain as needed.
4. Watch chat for technical issues; assign someone to respond or flag lead.
5. Record sermon segment for archives and website sermon library.
6. End stream after benediction and post-service announcements.

## After / follow-up

1. Power down board and secure equipment.
2. Verify recording uploaded or scheduled on YouTube.
3. Log issues (mic drop, slide failure) in Media Ministry notebook.
4. Send clip link to Communications Ministry if pastor approves social post.

## Safety & compliance

Tape or mark cable runs in aisles. No blocking Chapel exits. Escalate electrical issues to trustees — do not DIY wiring.

## Contacts & escalation

mediaministry@ebenezerbc.org · Church office: (703) 494-2669`,
    ),
  ],

  'sunday-school': [
    sop(
      'sop-web-ss-1',
      'Sunday School session (1st & 4th Sundays)',
      `## Purpose

Provide Bible-based teaching for all ages through Christian Education / Sunday School, 8:30–9:30 AM on the **1st and 4th Sundays** per [worship times](https://ebenezerbc.org/about/times).

## When to use

1st and 4th Sunday mornings, 8:30–9:30 AM, in Family Life Center classrooms.

## Who is responsible

Christian Education coordinator (TBD on roster) · Teachers per age group · COUNT ME IN classroom helpers.

## Before you start

1. Confirm teacher and helper attendance by Thursday.
2. Prepare lesson from church curriculum or [Christian Education catalog](https://ebenezerbc.org/connect/christian-education).
3. Set up classroom with attendance sheet and name tags.
4. For children's classes: two adults confirmed before doors open.

## Step-by-step procedure

1. Open FLC classrooms at 8:15 AM.
2. Register attendees and welcome visitors to sign guest sheet.
3. Teach lesson per plan — scripture, discussion, application.
4. Close class at 9:25 AM so attendees can transition to 10:00 AM worship in Chapel.
5. Escort children to parents or designated worship seating per family plan.

## After / follow-up

1. Submit attendance to church office or EBC APP when live.
2. Follow up with visitors within one week.
3. Report supply needs to Christian Education lead.

## Safety & compliance

Two-adult rule in all children's rooms. Check FLC gym schedule for conflicting events.

## Contacts & escalation

churchadmin@ebenezerbc.org · (703) 494-2669`,
    ),
  ],

  'wednesday-bible-study': [
    sop(
      'sop-web-bs-1',
      'Wednesday Zoom Bible Study (7:00 PM)',
      `## Purpose

Mid-week teaching and discipleship via Zoom, Wednesdays at **7:00 PM**, as listed on [worship times](https://ebenezerbc.org/about/times) and Christian Education.

## When to use

Every Wednesday at 7:00 PM unless cancelled on church announcements or PWCS weekday weather policy.

## Who is responsible

Teaching pastor or assigned teacher · Zoom host from Media Ministry or church office.

## Before you start

1. Confirm Zoom link is published on website/resources and emailed to list.
2. Host opens room at 6:50 PM; test screen share and audio.
3. Prepare scripture and discussion questions.
4. Assign someone to monitor chat for prayer requests.

## Step-by-step procedure

1. Welcome attendees; state mission moment (*Putting the Family Back Together*).
2. Open in prayer.
3. Teach scripture segment (follow [Bible Study series](https://ebenezerbc.org/resources/bible-study-series) when applicable).
4. Facilitate discussion; mute side conversations as needed.
5. Collect prayer requests — route sensitive items to prayerrequests@ebenezerbc.org.
6. Close with prayer by 8:30 PM target.

## After / follow-up

1. Save chat prayer list for deacon/deaconess follow-up as appropriate.
2. Upload recording to resources if church policy allows.
3. Post next week's passage on announcements page.

## Safety & compliance

Use church-approved Zoom account; enable waiting room. Do not record without announcing to attendees.

## Contacts & escalation

prayerrequests@ebenezerbc.org · churchadmin@ebenezerbc.org`,
    ),
    sop(
      'sop-web-bs-2',
      'Wednesday noon day prayer (Zoom)',
      `## Purpose

Midday prayer gathering Wednesdays at **12:00 PM** via Zoom per church worship schedule.

## When to use

Every Wednesday at noon.

## Who is responsible

Prayer ministry coordinator or rotating leader · Zoom host.

## Before you start

1. Confirm Zoom link distributed via church email list.
2. Prepare prayer focus (sick, missions, families, nation).

## Step-by-step procedure

1. Open Zoom at 11:55 AM.
2. Welcome participants and read brief scripture on prayer.
3. Invite shared prayer requests; keep confidences.
4. Close within 30 minutes.

## After / follow-up

1. Email pastoral team confidential requests only through prayerrequests@ebenezerbc.org.

## Contacts & escalation

prayerrequests@ebenezerbc.org`,
    ),
  ],

  'womens-ministry': [
    sop(
      'sop-web-womens-1',
      'Monthly fellowship (4th Tuesday)',
      `## Purpose

Fellowship, Bible study, and service for women through Fruit of the Spirit small groups and monthly gathering per [Women's Ministry](https://ebenezerbc.org/connect/fellowship-ministries/womens-ministry).

## When to use

**4th Tuesday** monthly fellowship and related Fruit of the Spirit group meetings.

## Who is responsible

Women's Ministry leadership · Host team · COUNT ME IN for hospitality setup.

## Before you start

1. Confirm FLC room or classroom reservation.
2. Publish topic and signup link on website (online signup referenced on New to EBC page).
3. Prepare refreshments per kitchen policy.
4. Print attendance and visitor cards.

## Step-by-step procedure

1. Decorate and set seating 45 minutes early.
2. Welcome each woman at the door; introduce visitors to a hostess.
3. Open with icebreaker and prayer.
4. Lead Bible study or guest speaker per plan.
5. Announce service projects and next month's date.
6. Clean FLC space; restore furniture layout.

## After / follow-up

1. Contact visitors within 48 hours.
2. Update Fruit of the Spirit group rosters.
3. Submit event photos to media ministry for approval before posting.

## Contacts & escalation

churchadmin@ebenezerbc.org · (703) 494-2669`,
    ),
  ],

  'mountain-men': [
    sop(
      'sop-web-mm-1',
      "Annual men's retreat (3rd week of September)",
      `## Purpose

"Iron Sharpening Iron" — spiritual and brotherhood retreat for Mountain Men Ministry, typically **third week of September** per website.

## When to use

Annual retreat week and preparatory meetings leading up to it.

## Who is responsible

Mountain Men leadership · Trustee approval for facility/camp contract · COUNT ME IN for logistics volunteers.

## Before you start

1. Secure retreat location and dates; publish on church calendar.
2. Open registration with medical release forms.
3. Assign teaching sessions and worship leader.
4. Confirm transportation carpools and room assignments.

## Step-by-step procedure

1. Check in participants; collect forms and payments per trustee policy.
2. Review schedule, safety rules, and emergency contacts first night.
3. Run sessions, small groups, and accountability pairs per retreat plan.
4. Close with communion or prayer commissioning Sunday if applicable.
5. Depart site cleaner than found; complete facility checklist.

## After / follow-up

1. Send thank-you and photos (approved) to participants.
2. Harvest testimonies for church announcements with permission.
3. Debrief with pastor on pastoral care follow-ups needed.

## Safety & compliance

Collect emergency contacts and allergies. Two leaders awake for overnight security. No alcohol on church-sponsored retreat unless policy explicitly allows (default: none).

## Contacts & escalation

Church office: (703) 494-2669 · Trustee Chair: Tru. Curt Odom`,
    ),
  ],

  'golden-eagles': [
    sop(
      'sop-web-ge-1',
      'Senior noon prayer and lunch (Wednesdays)',
      `## Purpose

Spiritual, physical, and emotional care for senior members through Wednesday **noon prayer and lunch**, plus seasonal events (ice cream social, fall dinner) per [Senior Citizen Ministry](https://ebenezerbc.org/connect/fellowship-ministries/senior-citizen-ministry).

## When to use

Wednesdays at noon; seasonal events as announced.

## Who is responsible

Golden Eagles leadership · Kitchen/hospitality volunteers · Deacon/deaconess for homebound follow-up.

## Before you start

1. Confirm FLC dining area or classroom.
2. Prepare simple meal or coordinate potluck assignments.
3. Arrange rides for members needing transportation (COUNT ME IN).

## Step-by-step procedure

1. Greet seniors at entrance; assist with seating and mobility as needed.
2. Open with prayer and brief devotion.
3. Serve lunch; accommodate dietary needs noted on signup.
4. Facilitate fellowship and prayer requests.
5. Dismiss with information on next seasonal event.

## After / follow-up

1. Contact absent regular attendees by phone.
2. Route nursing home or homebound visit requests to missionary or deaconess ministries.

## Safety & compliance

Clear walkways; mark wet floors. Know location of AED in FLC. Two volunteers assist anyone using stairs.

## Contacts & escalation

churchadmin@ebenezerbc.org · (703) 494-2669`,
    ),
  ],

  jamm: [
    sop(
      'sop-web-jamm-1',
      "JAMM mentoring session (Joseph's Army)",
      `## Purpose

Mentor boys from elementary through high school to become godly young men, per [JAMM Ministry](https://ebenezerbc.org/connect/fellowship-ministries/jamm-ministry) on the website.

## When to use

Scheduled JAMM meetings, outings, and mentoring sessions.

## Who is responsible

JAMM ministry lead · Mentor pairs · Parent communication lead.

## Before you start

1. Confirm mentor background checks current.
2. Send parents schedule and permission slips for off-site events.
3. Prepare lesson or activity tied to scripture and character.

## Step-by-step procedure

1. Check in each young man; verify guardian pickup plan.
2. Open with scripture and accountability question.
3. Run activity (skill, service project, or study).
4. Debrief virtues (integrity, service, respect).
5. Release only to authorized adults.

## After / follow-up

1. Email parents a one-sentence summary of the session.
2. Flag behavioral or pastoral concerns to youth director and pastor.

## Safety & compliance

Two mentors present always. No one-on-one off-site mentoring. Follow church youth protection policy.

## Contacts & escalation

Youth Director: Keyonia Waters · Church office: (703) 494-2669`,
    ),
  ],

  'deacon-ministry': [
    sop(
      'sop-web-dec-1',
      'Sunday worship support & pastoral care',
      `## Purpose

Deacons serve evangelism, stewardship, discipleship, worship support, pastoral care, and community outreach per [Deacon Ministry](https://ebenezerbc.org/connect/church-leadership/deacon-ministry). Chair: **Dea. Octavis Jones**; Vice Chair: **Dea. Charles Turner**.

## When to use

Every Sunday worship; communion Sundays; member crisis calls; weather closure decisions.

## Who is responsible

Deacon Chair · Vice Chair · Assigned deacon of the month · Pastor Rev. Dr. Charles A. Lundy.

## Before you start

1. Confirm deacon roster for Sunday (usher liaison, offering, communion).
2. Review prayer request list from prayerrequests@ebenezerbc.org.
3. On inclement weather Sundays: join 6 AM call with Pastor and Trustee Chair per [weather policy](https://ebenezerbc.org/other/weather-policy).

## Step-by-step procedure

1. Arrive early to Chapel; pray with pastor and worship team.
2. Assist with communion preparation and serving as scheduled.
3. Watch for visitors needing prayer or connection to pastor.
4. Receive prayer requests from ushers; respond or assign follow-up.
5. Stay for post-service huddle when pastor requests.

## After / follow-up

1. Complete home or hospital visits within 72 hours of request.
2. Log visits for pastoral records (confidential).
3. Communicate weather cancellation via FOX 5, ABC 7, WJLA 8, WUSA 9, voicemail, email if called.

## Safety & compliance

Maintain confidentiality for pastoral matters. Two deacons visit hospitalized members when possible.

## Contacts & escalation

deaconministry@ebenezer.org · (703) 494-2669 · Pastor via church office`,
    ),
  ],

  'deaconess-ministry': [
    sop(
      'sop-web-dess-1',
      'Communion, baptism & member support',
      `## Purpose

Deaconesses support pastor and deacons in ordinances, baptisms, communion, visitations, and member support. Chair: **Deaconess Ella Wilson Fahie**; Vice Chair: **Deaconess Phyllis Aggrey**.

## When to use

Communion preparation, baptism Sundays, sick/shut-in visits, women's pastoral care needs.

## Who is responsible

Deaconess Chair · Assigned deaconess team · Pastor for doctrine and ordinance approval.

## Before you start

1. Confirm ordinance elements prepared per church tradition.
2. Coordinate attire and supplies for baptism candidates.
3. Review visit list from pastor or deacon ministry.

## Step-by-step procedure

1. Prepare communion table before service; cover elements until ordained moment.
2. Assist candidates and families during baptism rehearsal and service.
3. Conduct visitations in pairs; pray and listen without gossiping details.
4. Report safety or abuse concerns immediately to pastor — do not investigate alone.

## After / follow-up

1. Send meal or card from deaconess ministry within one week of hospitalization when appropriate.
2. Update pastor on members needing extended care.

## Safety & compliance

Two deaconesses on every home visit. Follow mandated reporting laws for child/elder safety.

## Contacts & escalation

Church office: (703) 494-2669 · prayerrequests@ebenezerbc.org`,
    ),
  ],

  'trustee-ministry': [
    sop(
      'sop-web-tru-1',
      'Mail-in giving & property stewardship',
      `## Purpose

Trustees steward property, finances, and assets. Chair **Tru. Curt Odom**; Treasurer **Tru. Deborah Maddux**. Mail giving: **C/O Trustees, 13020 Telegraph Rd** (no cash by mail) per [give page](https://ebenezerbc.org/other/give).

## When to use

Processing mailed contributions; property work orders; major expenditures; Sunday weather decisions with pastor and deacon chair.

## Who is responsible

Trustee Chair · Treasurer · Secretary Tru. Rina Harris for minutes.

## Before you start

1. Open mail with two trustees present when handling checks.
2. Log deposits for Realm/finance team per church policy.
3. For weather: monitor forecasts Saturday night for Sunday 6 AM decision.

## Step-by-step procedure

1. Endorse and record mail-in gifts; deliver to finance for Realm entry.
2. Review contractor quotes for facility projects (sanctuary/Nehemiah Phase III).
3. Approve expenditures per board thresholds (document in minutes).
4. Join pastor and deacon chair call for worship cancellation; document decision time.

## After / follow-up

1. File minutes and deposit receipts.
2. Update Nehemiah Project debt paydown report as needed.

## Contacts & escalation

churchadmin@ebenezerbc.org · Facility Usage Manager: (703) 307-0207`,
    ),
  ],

  'count-me-in': [
    sop(
      'sop-web-cmi-1',
      'COUNT ME IN volunteer placement',
      `## Purpose

Church-wide volunteer recruitment and placement per [COUNT ME IN](https://ebenezerbc.org/connect/count-me-in-volunteer-program). Coordinators **Deborah Eure** and **Charlie Parker**; email **countmein@ebenezerbc.org**.

## When to use

When forms arrive in FLC boxes, email, or website inquiry; ongoing volunteer needs from ministries.

## Who is responsible

COUNT ME IN coordinators · Ministry leaders receiving placements.

## Before you start

1. Collect paper forms from FLC and church office daily.
2. Enter skills, availability, and background-check status in tracker.
3. Match urgent needs (usher, media, VBS) first.

## Step-by-step procedure

1. Acknowledge volunteer within 3 business days.
2. Interview briefly for gifts and interests.
3. Introduce volunteer to ministry leader by email and in-person handshake Sunday.
4. Confirm start date and training (e.g., usher meeting 2nd Thursday 7 PM).
5. Follow up at 30 days for fit and joy.

## After / follow-up

1. Thank volunteers on Volunteer Appreciation moments.
2. Re-route struggling placements without shame.

## Contacts & escalation

countmein@ebenezerbc.org · churchadmin@ebenezerbc.org`,
    ),
  ],

  'usher-greeter': [
    sop(
      'sop-web-ush-1',
      'Sunday guest welcome (Chapel entrance)',
      `## Purpose

Welcome members and guests at the Chapel entrance per [New to EBC](https://ebenezerbc.org/about/new-to-ebc) and [Usher Ministry](https://ebenezerbc.org/connect/usher-ministry) led by **Altamese Dangerfield**.

## When to use

Every Sunday worship (10:00 AM, Chapel while sanctuary under construction). Parking near FLC and Chapel.

## Who is responsible

Usher/Greeter director · Door greeters · Seating ushers · Safety usher.

## Before you start

1. Arrive 45 minutes early; review weather and attendance expectations.
2. Place greeters at Chapel entrance; ushers inside for seating.
3. Stock bulletins, fans, and visitor welcome packets.
4. Brief team on VIP accessibility needs and nursery routing.

## Step-by-step procedure

1. Greet warmly: "Welcome to Ebenezer!"
2. Direct parking and Chapel entrance (not sanctuary construction zone).
3. Escort guests to seating; introduce first-time visitors to pastor after service when possible.
4. Receive offering; ensure communion flow orderly.
5. Offer prayer request cards; connect urgent needs to deacon on duty.
6. Guide dismissal safely; watch aisles during benediction.

## After / follow-up

1. Count attendance for church records.
2. Deliver visitor cards to church office Monday morning.
3. Email prayer requests to prayerrequests@ebenezerbc.org same day.

## Safety & compliance

Clear aisles for fire exit. Report medical emergencies to 911 then church office. No dress-code policing — "concerned with Christ in you, not clothes on you."

## Contacts & escalation

Usher director: Altamese Dangerfield · deaconministry@ebenezer.org · (703) 494-2669`,
    ),
    sop(
      'sop-web-ush-2',
      'Usher board meeting (2nd Thursday)',
      `## Purpose

Monthly usher board planning at **2nd Thursday, 7:00 PM** per website.

## When to use

2nd Thursday each month, 7:00 PM, typically Family Life Center.

## Who is responsible

Altamese Dangerfield · Usher board officers.

## Before you start

1. Reserve FLC room; publish agenda (Usher's Day 3rd Sunday in May, Car Show 2nd Saturday in July).

## Step-by-step procedure

1. Open with prayer.
2. Review upcoming Sundays and special events (Homecoming first Sunday in October, etc.).
3. Assign roles and train new ushers.
4. Discuss safety drills and weather policy reminders.

## After / follow-up

1. Email roster to mediaministry@ebenezerbc.org for livestream seating needs.

## Contacts & escalation

churchadmin@ebenezerbc.org`,
    ),
  ],

  'nehemiah-project': [
    sop(
      'sop-web-neh-1',
      'Nehemiah Project capital campaign communication',
      `## Purpose

Communicate building fund progress for Phase III sanctuary completion since the [Nehemiah Project](https://ebenezerbc.org/connect/nehemiah-project-ministry) began in 1995 (Phases I–II: land + FLC; Phase III: sanctuary + Chapel inaugural September 5, 2021).

## When to use

Quarterly updates, pledge drives, and major donor touchpoints.

## Who is responsible

Nehemiah leadership · Trustee board · Pastor for vision casting.

## Before you start

1. Obtain accurate debt/paydown figures from trustee treasurer.
2. Align message with pastor's vision (*Putting the Family Back Together*, family life center history).

## Step-by-step procedure

1. Draft update for announcements page and bulletin.
2. Present testimony or construction photo with trustee approval.
3. Invite giving via [ebenezerbc.org/give](https://ebenezerbc.org/other/give), Realm, Cash App $EBCWOODBRIDGEVA, or mail to Trustees.
4. Thank donors by name only with permission.

## After / follow-up

1. Log questions for trustee Q&A.
2. Schedule site tours for major givers when safe.

## Contacts & escalation

Trustee Treasurer: Tru. Deborah Maddux · onlinegiving@ebenezerbc.org`,
    ),
  ],

  'communications-ministry': [
    sop(
      'sop-web-comms-1',
      'Weekly Discover → Execute → Evaluate cycle',
      `## Purpose

Run Communications with **AI at the forefront**: Discover what to say, Execute multi-channel drafts for human approval, Evaluate the week so the next Discover improves — one consistent church voice across website, bulletin, in-service, email, and social.

## When to use

Every week before Sunday worship (and for mid-week weather or emergency notices).

## Who is responsible

Communications lead (owns the loop) · AI cycle steward · Announcements editor · Bulletin editor · Social publisher · Church office (website publish) · Pastor for doctrine-sensitive items.

## Before you start

1. Confirm Cursor / AI is available in EBC APP (or fall back to rule-based Discover templates).
2. Collect ministry promo requests submitted by the weekly deadline — they merge into Discover.
3. Confirm linked events on the church calendar.
4. Flag items that need pastor approval (doctrine, crisis, politics, major vision).
5. Request Media assets only when slides or social graphics are required.
6. Never paste prayer requests, member contact info, or giving amounts into AI prompts.

## Step-by-step procedure

### Discover

1. Open Communications Discover inbox in EBC APP.
2. Review AI-ranked opportunities (events, worship window, gaps, community, announcements).
3. Accept, snooze, or dismiss each item with a reason when dismissing.

### Execute

1. For each accepted opportunity, generate or refresh the AI channel package (website · bulletin · in-service · email · social + Media hand-off note).
2. Edit drafts for accuracy and brand voice; apply channel checklist.
3. Communications lead approves ordinary copy; route sensitive items to pastor.
4. Hand approved bulletin/in-service copy to production; hand website copy to church office.
5. Hand social-ready copy and Media assets to social publisher — human clicks publish/schedule.
6. Confirm each checked channel is live before Sunday.

### Evaluate

1. Run or open the weekly Communications scorecard (coverage, on-time, channel completeness, pillar balance).
2. Note priorities for next Discover (e.g. under-posted teaching pillar).
3. Archive announcements past end display date.

## After / follow-up

1. Log missed deadlines or conflicting ministry requests for the next cycle.
2. Notify Media of any slide changes after Friday freeze (if applicable).
3. Confirm Evaluate priorities appear in the next Discover refresh.

## Safety & compliance

AI proposes; humans dispose — **no auto-publish**. Do not publish prayer request details without deacon/pastor guidance. Follow photo consent before posting identifiable members or children. No PII in model prompts.

## Contacts & escalation

Communications lead (roster) · churchadmin@ebenezerbc.org · Pastor for crisis messaging · mediaministry@ebenezerbc.org for AV assets`,
    ),
    sop(
      'sop-web-comms-2',
      'Social post from Execute package',
      `## Purpose

Turn an AI Execute social channel (or approved announcement) into a public social post without changing the message or brand voice.

## When to use

When Discover Accept includes social, the weekly channel checklist includes social, or Evaluate / content suggestions flag a calendar event.

## Who is responsible

Social publisher · Communications lead (approval) · Media Ministry (assets) · Pastor when doctrine-sensitive.

## Before you start

1. Confirm Execute package / announcement status is approved.
2. Pull stills/clips from Media library or Sunday recording — do not use unapproved member photos.
3. Check platform connection health (Facebook, YouTube, Instagram as available).
4. Use AI caption as starting draft only — edit before schedule.

## Step-by-step procedure

1. Open social caption from Execute package (or regenerate AI rewrite); shorten for platform limits.
2. Attach Media-approved image or clip; add worship or event link to ebenezerbc.org.
3. Select platforms and schedule (typically Thursday–Saturday for Sunday worship).
4. Get Communications lead sign-off; escalate to pastor if required.
5. Publish or schedule with an explicit human click; save public URL in the post log.
6. Ensure the publish feeds the weekly Evaluate scorecard.

## After / follow-up

1. Monitor comments for pastoral or technical issues; escalate abuse to pastor/office.
2. If livestream fails, coordinate with Media — do not invent alternate messaging.

## Safety & compliance

No auto-post without human review. Respect copyright on music clips. No partisan endorsement without pastor approval. No PII in AI caption prompts.

## Contacts & escalation

Communications lead · mediaministry@ebenezerbc.org · Pastor`,
    ),
    sop(
      'sop-web-comms-3',
      'Weekly Evaluate scorecard review',
      `## Purpose

Close the AI loop: review what Communications Discovered and Executed, learn from gaps, and set priorities for the next Discover run.

## When to use

After Sunday channels are confirmed live (or end of week for mid-week-only work).

## Who is responsible

Communications lead · AI cycle steward · Brand steward (voice flags).

## Before you start

1. Confirm Execute items for the week are marked published or explicitly deferred.
2. Pull Evaluate scorecard in EBC APP (rule-based metrics even if AI narrative is unavailable).

## Step-by-step procedure

1. Review coverage — accepted vs dismissed Discover opportunities.
2. Review on-time and channel completeness — which checked channels actually shipped.
3. Review pillar balance and quiet streaks.
4. Note brand-voice flags; correct next week's Execute prompts or templates.
5. Set 1–3 priorities that must influence next Discover ranking.
6. Share a short summary with pastor only when doctrine or crisis messaging was involved.

## After / follow-up

1. Confirm next Discover refresh reflects Evaluate priorities.
2. Do not use scorecards to shame volunteers — improve the system and cadence.

## Safety & compliance

Evaluate metrics must be aggregates only — no audience PII, no giving data, no prayer content.

## Contacts & escalation

Communications lead · Pastor (sensitive weeks only)`,
    ),
  ],
};

export function mergeWebsiteSops(
  existing: MinistrySop[],
  slug: string,
): MinistrySop[] {
  const website = WEBSITE_SOPS_BY_SLUG[slug] ?? [];
  if (website.length === 0) return existing;

  const merged = [...existing];
  const ids = new Set(existing.map((s) => s.id));
  const titles = new Set(existing.map((s) => s.title.toLowerCase()));

  for (const sop of website) {
    if (ids.has(sop.id)) continue;
    if (titles.has(sop.title.toLowerCase())) continue;
    merged.push(sop);
    ids.add(sop.id);
    titles.add(sop.title.toLowerCase());
  }

  return merged;
}
