import Link from 'next/link';
import { Suspense } from 'react';

import type { ChurchEvent } from '@/modules/events';
import type { SopConfigStore } from '@/modules/leadership/types';
import {
  DocumentsPanel,
  MediaPanel,
} from '@/modules/ministries/features/ministry-media-library';
import type { Ministry, MinistryMediaAsset, MinistryTab } from '@/modules/ministries/types';
import { MINISTRY_CATEGORIES } from '@/modules/ministries/types';
import type { VoiceCoachPreference } from '@/modules/preferences';

import { CalendarPanel } from './components/CalendarPanel';
import { DutiesPanel } from './components/DutiesPanel';
import { MinistryTabNav } from './components/MinistryTabNav';
import { PlanPanel } from './components/PlanPanel';
import { PersonnelPanel } from './components/PersonnelPanel';
import { SopPanel } from './components/SopPanel';

export type MinistryDetailProps = {
  ministry: Ministry;
  activeTab: MinistryTab;
  sopConfig: SopConfigStore;
  churchEvents?: ChurchEvent[];
  mediaAssets?: MinistryMediaAsset[];
  documentAssets?: MinistryMediaAsset[];
  canManage?: boolean;
  canApprove?: boolean;
  canApproveEvents?: boolean;
  voiceCoachPreference?: VoiceCoachPreference;
};

export function MinistryDetail({
  ministry,
  activeTab,
  sopConfig,
  churchEvents = [],
  mediaAssets = [],
  documentAssets = [],
  canManage = false,
  canApprove = false,
  canApproveEvents = false,
  voiceCoachPreference = 'ask',
}: MinistryDetailProps) {
  const category = MINISTRY_CATEGORIES[ministry.category];

  return (
    <div>

      <header className="border-b border-slate-200 pb-0">
          <Suspense fallback={<div className="h-10 min-w-[12rem]" />}>
            <MinistryTabNav slug={ministry.slug} />
          </Suspense>
      </header>

      <div className="pt-2">
        {activeTab === 'overview' ? (
          <PlanPanel ministry={ministry} canManage={canManage} />
        ) : null}
        {activeTab === 'personnel' ? (
          <PersonnelPanel ministry={ministry} canManage={canManage} />
        ) : null}
        {activeTab === 'duties' ? (
          <DutiesPanel ministry={ministry} canManage={canManage} />
        ) : null}
        {activeTab === 'calendar' ? (
          <CalendarPanel
            ministry={ministry}
            churchEvents={churchEvents}
            canManage={canManage}
            canApproveEvents={canApproveEvents}
            voiceCoachPreference={voiceCoachPreference}
          />
        ) : null}
        {activeTab === 'sops' ? (
          <SopPanel
            ministry={ministry}
            sopConfig={sopConfig}
            canManage={canManage}
            canApprove={canApprove}
          />
        ) : null}
        {activeTab === 'media' ? (
          <MediaPanel ministry={ministry} assets={mediaAssets} canManage={canManage} />
        ) : null}
        {activeTab === 'documents' ? (
          <DocumentsPanel
            ministry={ministry}
            assets={documentAssets}
            canManage={canManage}
          />
        ) : null}
      </div>
    </div>
  );
}
