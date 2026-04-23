export type MemberName =
  | 'Lance'
  | 'Ricky'
  | 'Jacob'
  | 'William'
  | 'Carlos'
  | 'Daniel'
  | 'Logan'

export type Member = {
  name: MemberName
  color: string
}

export type PodcastLink = {
  label: string
  href: string
}

export type PodcastEpisode = {
  id: string
  title: string
  description: string
  date: string
  links: PodcastLink[]
  people?: MemberName[]
}

export type ChallengePost = {
  id: string
  title: string
  weekLabel: string
  author: MemberName
  description: string
  initialRanking?: MemberName[]
  answers?: Partial<Record<MemberName, string>>
  notes?: Partial<Record<MemberName, string>>
  /** If set, a bar chart of ROI % (y) vs member (x) is shown for this post. */
  returnPercentages?: Partial<Record<MemberName, number | null>>
}

