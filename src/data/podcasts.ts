import type { PodcastEpisode } from '../types'

export const PODCAST_EPISODES: PodcastEpisode[] = [
  {
    id: 'ep-3',
    title: 'E3 - Episode 4, 5, 6',
    description:
      'The lads yarn about capital punishment, d4vd and david',
    date: '07/05',
    people: ['Daniel', 'Lance', 'Carlos', 'Ricky'],
    links: [
      { label: 'Listen', href: 'https://youtu.be/z5kUWf-Af9M' },
    ],
  },
  {
    id: 'ep-2',
    title: 'E2 - Long Island Ice Tea',
    description:
      'The guys chat Universal Basic Income, Faker and last meals.',
    date: '22/04',
    people: ['Daniel', 'Lance', 'Carlos', 'Ricky'],
    links: [
      { label: 'Listen', href: 'https://youtu.be/y-Ou_BPFv6c' },
    ],
  },
  {
    id: 'ep-1',
    title: 'E1 - Pilot',
    description:
      'First episode of the series, the guys chat AI and productivity.',
    date: '16/04',
    people: ['Daniel', 'Lance', 'Carlos'],
    links: [
      { label: 'Listen', href: 'https://youtu.be/4nEjkKfRR4I' },
    ],
  },
]
