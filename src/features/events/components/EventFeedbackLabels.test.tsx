import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { EventRatingSection } from '@/features/events/components/EventRatingSection';
import { EventReviewSection } from '@/features/events/components/EventReviewSection';
import { EventReview } from '@/features/events/types';

jest.mock('@/features/catalogs/hooks/useCatalogs', () => ({
  useCatalogs: () => ({
    data: { client_sources: [] },
  }),
}));

const review: EventReview = {
  event_id: 'event-1',
  url: 'https://example.test/review/token',
  share_message: 'Mesaj',
  submitted_at: '2026-09-23T10:00:00Z',
  reviewer_name: 'Maria Popescu',
  source: 'recomandare',
  source_details: null,
  entertainers_rating: 5,
  entertainers_comment: null,
  improvement_suggestion: null,
  website_consent: true,
};

function getRenderedText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(getRenderedText).join('');
  }

  if (value && typeof value === 'object' && 'children' in value) {
    return getRenderedText((value as { children?: unknown }).children);
  }

  return '';
}

test('diferențiază recenzia lăsată de recenzia primită', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <>
        <EventRatingSection rating={4} notes={null} />
        <EventReviewSection
          review={review}
          loading={false}
          sending={false}
          onSend={jest.fn()}
        />
      </>,
    );
  });

  const text = getRenderedText(renderer?.toJSON());

  expect(text).toContain('Recenzie lăsată');
  expect(text).toContain('Nota 4/5');
  expect(text.indexOf('Recenzie lăsată')).toBeLessThan(text.indexOf('Nota 4/5'));
  expect(text).toContain('Recenzie primită');
  expect(text).not.toContain('Recenzie client');

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
});
